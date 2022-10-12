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
    for (const intersect of intersects) {
      console.log(intersect);
      if (intersect.object.cannonBody) {
        Toast("물리 이벤트 발생");
        intersect.object.parent.applyForce(
          new CANNON.Vec3(0, 0, -100),
          new CANNON.Vec3(0, 0, 0)
        );
      }
    }
  }

  window.addEventListener("click", (e) => {
    pointer.x = (e.clientX / args.canvas.clientWidth) * 2 - 1;
    pointer.y = -((e.clientY / args.canvas.clientHeight) * 2 - 1);
    onClickEvnet();
  });
}
