import { Body, Box, Vec3 } from "cannon-es";
export class Domino {
  constructor(info) {
    this.cannonWorld = info.cannonWorld;
    this.width = info.width || 0.06;
    this.height = info.height || 0.1;
    this.depth = info.depth || 0.02;
    this.reticle = info.reticle || 0;

    this.x = info.x || 0;
    this.y = info.y || 0.5;
    this.z = info.z || 0;
    this.rotationY = info.rotationY || 0;
    this.index = info.index;

    // For Debug

    info.gltfLoader.load(
      "domino.glb",
      (glb) => {
        this.model = glb.scene;
        this.model.scale.set(0.1, 0.1, 0.1);
        this.model.visible = true;
        this.model.name = `도미노 ${this.index}`;
        info.scene.add(this.model);

        this.setCannonBody();
      },
      undefined,
      (err) => {
        console.log(err);
      }
    );
  }

  setCannonBody() {
    this.cannonBody = new Body({
      mass: 5,
      position: new Vec3(this.x, this.y, this.z),
      shape: new Box(new Vec3(this.width / 2, this.height / 2, this.depth / 2)),
    });
    this.cannonBody.quaternion.setFromAxisAngle(
      new Vec3(0, 1, 0),
      this.rotationY
    );
    this.model.name = `Domino ${this.index}`;
    this.model.cannonBody = this.cannonBody;
    this.cannonWorld.addBody(this.cannonBody);
  }
}
