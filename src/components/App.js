import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { Domino } from "./Domino";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import Toast from "./Toast";
import HitTest from "./HitTest";
import Raycaster from "./Raycaster";
import dat from "dat.gui";
import { cm1, dom } from "./common";

export default function App() {
  // Clock
  const clock = new THREE.Clock();

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: cm1.canvas,
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
  const cannonWorld = new CANNON.World();
  cannonWorld.gravity.set(0, -10, 0);

  cannonWorld.allowSleep = true;
  cannonWorld.broadphase = new CANNON.SAPBroadphase(cannonWorld);

  const defaultMaterial = new CANNON.Material("default");
  const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    { friction: 0.2, restitution: 0.3 }
  );
  cannonWorld.defaultContactMaterial = defaultContactMaterial;

  // Debugger
  const cannonDebugger = new CannonDebugger(cm1.scene, cannonWorld);

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
    canvas: cm1.canvas,
  });

  function matchPhysics() {
    dominos.forEach((obj) => {
      if (obj.cannonBody) {
        obj.model.position.copy(obj.cannonBody.position);
        obj.model.quaternion.copy(obj.cannonBody.quaternion);
      }
    });
  }

  function cannonStep() {
    const delta = clock.getDelta();
    let cannonStepTime = delta < 0.01 ? 1 / 120 : 1 / 60;
    cannonWorld.step(cannonStepTime, delta, 3);
  }

  function setSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(cm1.scene, camera);
  }

  function animate() {
    renderer.setAnimationLoop(render);
  }

  function render(time, frame) {
    controls.update();

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
    dom.floorButton.style.display = "none";

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
    cannonWorld.addBody(floorBody);
  }

  const dominos = [];
  function setXRDomino() {
    let i = 0;
    if (reticle.visible) {
      let domino = new Domino({
        index: i,
        scene: cm1.scene,
        gltfLoader: cm1.gltfLoader,
        reticle: reticle,
        cannonWorld: cannonWorld,
        x: reticle.matrix.elements[12],
        y: floorBody.position.y,
        z: reticle.matrix.elements[14],
      });
      dominos.push(domino);
    }
    i++;
  }

  // Call Function
  animate();

  // Event
  window.addEventListener("resize", setSize, false);
  dom.domino.addEventListener("click", setXRDomino, false);
  dom.floor.addEventListener("click", setXRFloor, false);
}
