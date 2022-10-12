// RayCaster
import * as THREE from "three";
import * as CANNON from "cannon-es";
import Toast from "./Toast";
export default function Raycaster(args) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function onClickEvnet() {
    raycaster.setFromCamera(pointer, args.camera);
    console.log("raycaster", raycaster);
    const intersects = raycaster.intersectObjects(args.scene.children);
    console.log("intersects", intersects);
    for (const intersect of intersects) {
      if (intersect.object.parent.cannonBody) {
        intersect.object.material.color.set(0xff0000);
        Toast("물리 이벤트 발생");
        intersect.object.parent.cannonBody.applyForce(
          new CANNON.Vec3(0, 0, -100),
          new CANNON.Vec3(0, 0, 0)
        );
      }
    }
  }

  window.addEventListener("touchend", (e) => {
    pointer.x = (e.changedTouches[0].clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.changedTouches[0].clientY / window.innerHeight) * 2 + 1;
    console.log("touchend");
    console.log("pointer : ", pointer);
    console.log("size : ", args.canvas.clientWidth, args.canvas.clientHeight);
    onClickEvnet();
  });

  window.addEventListener("click", (e) => {
    // console.log(args.camera);
    // pointer.x = args.canvas.clientWidth / 2;
    // pointer.y = args.canvas.clientHeight / 2;
    pointer.x = (e.clientX / args.canvas.clientWidth) * 2 - 1;
    pointer.y = -((e.clientY / args.canvas.clientHeight) * 2 - 1);
    console.log("click");
    console.log("pointer : ", pointer);
    console.log("size : ", args.canvas.clientWidth, args.canvas.clientHeight);
    onClickEvnet();
  });
}
