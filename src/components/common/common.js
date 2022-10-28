import { World } from "cannon-es";
import { Scene } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import isMobile from "../features/deviceCheck";

export const cm1 = {
  scene: new Scene(),
  gltfLoader: new GLTFLoader().setPath("../../assets/models/"),
  world: new World(),
};

export const cm2 = {
  devMode: false,
  isFloorSet: false,
};

export const dom = {
  canvas: document.getElementById("three-canvas"),
  model: document.getElementById("place-button"),
  parentDomino: document.getElementById("place-button-wrapper"),
  floor: document.getElementById("place-floor"),
  itemsDom: document.querySelectorAll(".item"),
  itemsParentDom: document.querySelector("#items-wrapper"),
};

export const memebers = {
  currentModelName: "",
  currentModel: "",
};

export const system = {
  isMobile: isMobile(),
};

export const navItem = {
  isOpen: false,
};

export const objects = {
  models: [],
};
