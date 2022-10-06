import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ARButton } from "three/examples/jsm/webxr/ARButton";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Domino } from "./Domino";

export default function App() {
  // Dom
  const placeButton = document.getElementById("place-button");
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
    1,
    1000
  );
  camera.position.z = 5;

  // Light
  const ambientLight = new THREE.AmbientLight();
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(ambientLight, directionalLight);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);

  // Models

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

  // Event
  window.addEventListener("resize", setSize, false);
  placeButton.addEventListener(
    "click",
    () => {
      if (reticle.visible) {
        new Domino({
          scene: scene,
          gltfLoader: gltfLoader,
          scene: scene,
          reticle: reticle,
        });
      }
    },
    false
  );

  // Function
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
}
