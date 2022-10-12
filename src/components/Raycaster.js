// RayCaster
import * as THREE from "three";
import * as CANNON from "cannon-es";
import Toast from "./Toast";
export default function Raycaster(args) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onClickEvnet() {
    raycaster.setFromCamera(pointer, args.camera);
    const intersects = raycaster.intersectObjects(args.scene.children);
    console.log(intersects[0]);
    for (const intersect of intersects) {
      if (intersect.object.parent.cannonBody) {
        Toast("물리 이벤트 발생");
        intersect.object.parent.cannonBody.applyForce(
          new CANNON.Vec3(0, 0, -100),
          new CANNON.Vec3(0, 0, 0)
        );
      }
    }
  }

  window.addEventListener("touchend", (e) => {
    console.log("e.changedTouches", e.changedTouches);
    console.log("e.changedTouches[0].clientX", e.changedTouches[0].clientX);
    console.log("e.changedTouches[0].clientY", e.changedTouches[0].clientY);
    console.log(
      "(e.changedTouches[0].clientX / window.innerWidth) * 2 - 1",
      (e.changedTouches[0].clientX / window.innerWidth) * 2 - 1
    );
    console.log(
      "(e.changedTouches[0].clientX / window.innerWidth) * 2 - 1",
      -(e.changedTouches[0].clientY / window.innerHeight) * 2 + 1
    );
    pointer.x = (e.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
    // pointer.x = (e.clientX / args.canvas.clientWidth) * 2 - 1;
    // pointer.y = -((e.clientY / args.canvas.clientHeight) * 2 - 1);
    // console.log("pointer : ", pointer);
    // console.log("size : ", args.canvas.clientWidth, args.canvas.clientHeight);
    onClickEvnet();
  });
}
