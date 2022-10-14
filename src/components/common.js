import { Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const cm1 = {
  scene: new Scene(),
  canvas: document.getElementById("three-canvas"),
  gltfLoader: new GLTFLoader().setPath("./assets/models/"),
};

export const dom = {
  domino: document.getElementById("place-button"),
  floor: document.getElementById("place-floor"),
};
