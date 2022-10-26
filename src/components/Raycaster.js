// RayCaster
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { cm1, cm2, dom, objects } from "./common";
import { Domino } from "./Domino";
import { PreventDragClick } from "./PreventDragClick";
const preventDragClick = new PreventDragClick(dom.canvas);

let spaceEvent = false;

export default function Raycaster(args) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onClickEvnet() {
    raycaster.setFromCamera(pointer, args.camera);
    const intersects = raycaster.intersectObjects(args.scene.children);
    if (cm2.devMode) {
      if (intersects[0]) {
        if (preventDragClick.mouseMoved) return;
        let domino = new Domino({
          index: 0,
          scene: cm1.scene,
          gltfLoader: cm1.gltfLoader,
          cannonWorld: cm1.world,
          x: intersects[0].point.x,
          y: intersects[0].point.y,
          z: intersects[0].point.z,
        });
        objects.dominos.push(domino);
      }
    } else {
      for (const intersect of intersects) {
        if (intersect.object.parent.cannonBody) {
          intersect.object.parent.cannonBody.applyForce(
            new CANNON.Vec3(0, 0, -100),
            new CANNON.Vec3(0, 0, 0)
          );
        }
      }
    }
  }

  window.addEventListener("touchend", (e) => {
    pointer.x = (e.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
    onClickEvnet();
  });

  window.addEventListener("click", (e) => {
    pointer.x = (e.clientX / args.canvas.clientWidth) * 2 - 1;
    pointer.y = -((e.clientY / args.canvas.clientHeight) * 2 - 1);
    onClickEvnet(e);
  });
}
