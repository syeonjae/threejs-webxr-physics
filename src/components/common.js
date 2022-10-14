import { World } from "cannon-es";
import { Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export const cm1 = {
  scene: new Scene(),
  gltfLoader: new GLTFLoader().setPath("./assets/models/"),
  world: new World(),
};

export const cm2 = {
  devMode: false,
};

export const dom = {
  canvas: document.getElementById("three-canvas"),
  domino: document.getElementById("place-button"),
  floor: document.getElementById("place-floor"),
};

export const objects = {
  dominos: [],
};
