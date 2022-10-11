import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Domino } from "./Domino";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";

export default function App() {
  // Clock
  const clock = new THREE.Clock();
  // Dom
  const placeButton = document.getElementById("place-button");
  const pushButton = document.getElementById("push-button");
  // Loader
  const gltfLoader = new GLTFLoader().setPath("./assets/models/");
  // Renderer
  const canvas = document.getElementById("three-canvas");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: canvas,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.z = 5;

  // Light
  const ambientLight = new THREE.AmbientLight();
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(ambientLight, directionalLight);

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
    { friction: 0.09, restitution: 0.5 }
  );

  cannonWorld.defaultContactMaterial = defaultContactMaterial;

  const dominos = [];

  const cannonDebugger = new CannonDebugger(scene, cannonWorld);

  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    shape: floorShape,
    material: defaultMaterial,
  });
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
  cannonWorld.addBody(floorBody);

  // Mesh
  const floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: "slategray" })
  );
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  floorMesh.name = "Floor";
  scene.add(floorMesh);

  // XR
  renderer.xr.enabled = true;
  let options = {
    requiredFeatures: ["hit-test"],
    optionalFeatures: ["dom-overlay"],
  };

  options.domOverlay = { root: document.getElementById("content") };
  document.body.appendChild(ARButton.createButton(renderer, options));

  // Hit Test
  let hitTestSource = null;
  let hitTestSourceRequested = false;

  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.01, 0.02, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // Function

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onClickEvent() {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    for (const intersect of intersects) {
      if (intersect.object.parent.cannonBody) {
        intersect.object.parent.cannonBody.applyForce(
          new CANNON.Vec3(0, 0, -100),
          new CANNON.Vec3(0, 0, 0)
        );
      }
    }
  }

  function setSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }

  function animate() {
    renderer.setAnimationLoop(render);
  }

  function render(time, frame) {
    const delta = clock.getDelta();

    controls.update();
    //cannonDebugger.update();
    let cannonStepTime = 1 / 60;
    if (delta < 0.01) cannonStepTime = 1 / 120;
    cannonWorld.step(cannonStepTime, delta, 3);

    dominos.forEach((obj) => {
      if (obj.cannonBody) {
        obj.model.position.copy(obj.cannonBody.position);
        obj.model.quaternion.copy(obj.cannonBody.quaternion);
      }
    });
    HitTest(frame);
    renderer.render(scene, camera);
  }

  function HitTest(frame) {
    if (frame) {
      let referenceSpace = renderer.xr.getReferenceSpace();
      let session = renderer.xr.getSession();

      // Get Session
      if (hitTestSourceRequested === false) {
        session.requestReferenceSpace("viewer").then(function (referenceSpace) {
          session
            .requestHitTestSource({ space: referenceSpace })
            .then(function (source) {
              hitTestSource = source;
            });
        });

        // Exit Session Event
        session.addEventListener("end", () => {
          hitTestSource = null;
          hitTestSourceRequested = false;
          reticle.visible = false;
          document.getElementById("place-button").style.display = "none";
        });

        hitTestSourceRequested = true;
      }
      // If Get Session
      if (hitTestSource) {
        let hitTestResults = frame.getHitTestResults(hitTestSource);

        if (hitTestResults.length) {
          let hit = hitTestResults[0];
          document.getElementById("place-button").style.display = "block";
          reticle.visible = true;
          reticle.matrix.fromArray(
            hit.getPose(referenceSpace).transform.matrix
          );
        } else {
          reticle.visible = false;
          document.getElementById("place-button").style.display = "none";
        }
      }
    }
  }

  // Call Function
  animate();

  // Event
  window.addEventListener("resize", setSize, false);
  placeButton.addEventListener(
    "click",
    () => {
      if (reticle.visible) {
        let domino = new Domino({
          scene: scene,
          gltfLoader: gltfLoader,
          scene: scene,
          reticle: reticle,
          cannonWorld: cannonWorld,
        });
        dominos.push(domino);
      }
    },
    false
  );
  window.addEventListener("click", (e) => {
    pointer.x = (e.clientX / canvas.clientWidth) * 2 - 1;
    pointer.y = -((e.clientY / canvas.clientHeight) * 2 - 1);
    onClickEvent();
  });
}
