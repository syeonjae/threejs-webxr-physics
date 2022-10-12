import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Domino } from "./Domino";
import * as CANNON from "cannon-es";
import CannonDebugger from "cannon-es-debugger";
import Toast from "./Toast";
import HitTest from "./HitTest";
import Raycaster from "./Raycaster";
import dat from "dat.gui";

export default function App() {
  // Boolean
  const boolObject = {
    isFloorSet: false,
    isDebuggerMode: false,
  };

  // Clock
  const clock = new THREE.Clock();
  // Dom
  const placeButton = document.getElementById("place-button");
  const floorButton = document.getElementById("place-floor");
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

  // Mesh

  // XR
  renderer.xr.enabled = true;
  let options = {
    requiredFeatures: ["hit-test"],
    optionalFeatures: ["dom-overlay"],
  };

  options.domOverlay = { root: document.getElementById("content") };
  document.body.appendChild(ARButton.createButton(renderer, options));

  // Hit Test

  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.01, 0.02, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // Dat GUI
  const gui = new dat.GUI();
  gui.add(boolObject, "isDebuggerMode").name("Physics Debugger");

  // Function
  const raycaster = Raycaster({
    scene: scene,
    camera: camera,
    canvas: canvas,
  });

  function DebuggerMode(isDebuggerMode) {
    if (isDebuggerMode) {
      const floorShape = new CANNON.Plane();
      const floorBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(0, 0, 0),
        shape: floorShape,
        material: defaultContactMaterial,
      });
      floorBody.quaternion.setFromAxisAngle(
        new CANNON.Vec3(-1, 0, 0),
        Math.PI / 2
      );
      cannonWorld.addBody(floorBody);

      let domino = new Domino({
        index: 1,
        scene: scene,
        gltfLoader: gltfLoader,
        scene: scene,
        reticle: reticle,
        cannonWorld: cannonWorld,
        x: 0,
        y: 0,
        z: 0,
      });

      dominos.push(domino);
    }
  }

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
    renderer.render(scene, camera);
  }

  function animate() {
    renderer.setAnimationLoop(render);
  }

  function render(time, frame) {
    controls.update();
    // cannonDebugger.update();
    matchPhysics();
    cannonStep();
    HitTest({
      renderer: renderer,
      isFloorSet: boolObject.isFloorSet,
      reticle: reticle,
      frame: frame,
    });

    renderer.render(scene, camera);
  }

  // Call Function
  animate();
  DebuggerMode(boolObject.isDebuggerMode);

  // Temp
  const floorShape = new CANNON.Plane();
  let floorBody;

  // Event
  window.addEventListener("resize", setSize, false);

  placeButton.addEventListener(
    "click",
    () => {
      let i = 0;
      if (reticle.visible) {
        let domino = new Domino({
          index: i,
          scene: scene,
          gltfLoader: gltfLoader,
          scene: scene,
          reticle: reticle,
          cannonWorld: cannonWorld,
          x: reticle.matrix.elements[12],
          y: floorBody.position.y,
          z: reticle.matrix.elements[14],
        });
        dominos.push(domino);
      }
      i++;
    },
    false
  );

  floorButton.addEventListener("click", () => {
    floorButton.style.display = "none";
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
  });
}
