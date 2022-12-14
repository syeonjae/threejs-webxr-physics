import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { Domino, Soldier, Robot } from "./models/model";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import Toast from "./event/Toast";
import HitTest from "./event/HitTest";
import Raycaster from "./event/Raycaster";
// import dat from "dat.gui";
import { cm1, cm2, dom, memebers, objects } from "./common/common";
import ItemSelect from "./event/ItemSelectEvent";
import test from "./test/test";

export default function App() {
  // Test Functions
  test();

  dom.parentDomino.style.display = "none";
  // Clock
  const clock = new THREE.Clock();

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: dom.canvas,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.z = 1;

  // Light
  const ambientLight = new THREE.AmbientLight();
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  cm1.scene.add(ambientLight, directionalLight);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);

  // Cannon (Physics)
  cm1.world.gravity.set(0, -10, 0);

  cm1.world.allowSleep = true;
  cm1.world.broadphase = new CANNON.SAPBroadphase(cm1.world);

  const defaultMaterial = new CANNON.Material("default");
  const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    { friction: 0.009, restitution: 0.5 }
  );
  cm1.world.defaultContactMaterial = defaultContactMaterial;

  // dat.GUI
  // const gui = new dat.GUI();
  // gui.add(cm2, "devMode");

  // Debugger
  const cannonDebugger = new CannonDebugger(cm1.scene, cm1.world, {});
  // XR
  renderer.xr.enabled = true;
  let options = {
    requiredFeatures: ["hit-test"],
    optionalFeatures: ["dom-overlay"],
  };

  options.domOverlay = { root: document.getElementById("content") };
  document.body.appendChild(ARButton.createButton(renderer, options));

  // Hit Test Reticle Mesh
  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.01, 0.02, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  cm1.scene.add(reticle);

  // Function
  const raycaster = Raycaster({
    scene: cm1.scene,
    camera: camera,
    canvas: dom.canvas,
  });

  function matchPhysics() {
    objects.models.forEach((obj) => {
      if (obj.cannonBody) {
        obj.model.position.copy(obj.cannonBody.position);
        obj.model.quaternion.copy(obj.cannonBody.quaternion);
      }
    });
  }

  function cannonStep() {
    const delta = clock.getDelta();
    let cannonStepTime = delta < 0.01 ? 1 / 120 : 1 / 60;
    cm1.world.step(cannonStepTime, delta, 3);
  }

  function setSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(cm1.scene, camera);
  }

  //////////////////////////////////////////////////
  //////////////// Draw Function //////////////////
  ////////////////////////////////////////////////

  function animate() {
    renderer.setAnimationLoop(render);
  }

  function render(time, frame) {
    controls.update();

    cannonDebugger.update();

    camera.lookAt(
      new THREE.Vector3(
        reticle.matrix.elements[12],
        reticle.matrix.elements[13],
        reticle.matrix.elements[14]
      )
    );
    camera.updateProjectionMatrix();

    matchPhysics();

    cannonStep();

    HitTest({
      renderer: renderer,
      reticle: reticle,
      frame: frame,
    });

    renderer.render(cm1.scene, camera);
  }
  const floorShape = new CANNON.Plane();
  let floorBody;
  function setXRFloor() {
    Toast("Floor Set");
    dom.floor.style.display = "none";
    dom.parentDomino.style.display = "block";

    floorBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, reticle.matrix.elements[13], 0),
      shape: floorShape,
      material: defaultMaterial,
    });
    floorBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(-1, 0, 0),
      Math.PI / 2
    );
    cm1.world.addBody(floorBody);
    cm2.isFloorSet = true;
  }
  function setXRModel() {
    // ?????? ????????? ?????? ?????????...
    if (cm2.isFloorSet) {
      if (!reticle.visible) {
        switch (memebers.currentModelName) {
          case "domino":
            memebers.currentModel = new Domino({
              scene: cm1.scene,
              gltfLoader: cm1.gltfLoader,
              reticle: reticle,
              cannonWorld: cm1.world,
              x: reticle.matrix.elements[12],
              y: floorBody.position.y,
              z: reticle.matrix.elements[14],
            });
            break;
          case "robot":
            memebers.currentModel = new Robot({
              scene: cm1.scene,
              gltfLoader: cm1.gltfLoader,
              reticle: reticle,
              cannonWorld: cm1.world,
              x: reticle.matrix.elements[12],
              y: floorBody.position.y,
              z: reticle.matrix.elements[14],
            });
            break;
          case "soldier":
            memebers.currentModel = new Soldier({
              scene: cm1.scene,
              gltfLoader: cm1.gltfLoader,
              reticle: reticle,
              cannonWorld: cm1.world,
              x: reticle.matrix.elements[12],
              y: floorBody.position.y,
              z: reticle.matrix.elements[14],
            });
            break;
          default:
            memebers.currentModel = new Domino({
              scene: cm1.scene,
              gltfLoader: cm1.gltfLoader,
              reticle: reticle,
              cannonWorld: cm1.world,
              x: reticle.matrix.elements[12],
              y: floorBody.position.y,
              z: reticle.matrix.elements[14],
            });
            break;
        }
        objects.models.push(memebers.currentModel);
      }
    } else {
      Toast("Floor ????????? ?????? Ground??? ??????????????????.", 2);
    }
  }

  function catchModel() {
    dom.itemsDom.forEach((item) => {
      item.style.opacity = 0.2;
      item.addEventListener("click", () => {
        dom.itemsDom.forEach((item) => {
          item.style.opacity = 0.2;
        });
        item.style.opacity = 1;
        memebers.currentModelName = item.children[0].dataset.name;
      });
    });
    dom.itemsDom[0].style.opacity = 1;
  }

  // Call Function
  animate();
  catchModel();
  ItemSelect();

  // Event
  window.addEventListener("resize", setSize, false);

  dom.model.addEventListener("click", setXRModel, false);

  dom.floor.addEventListener("click", setXRFloor, false);
}
