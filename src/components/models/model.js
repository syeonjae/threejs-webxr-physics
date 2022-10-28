import { Body, Box, Vec3 } from "cannon-es";

export class Model {
  constructor(info) {
    this.cannonWorld = info.cannonWorld;
    this.scene = info.scene;
    this.width = info.width || 0.06;
    this.height = info.height || 0.1;
    this.depth = info.depth || 0.02;
    this.reticle = info.reticle || 0;

    this.name = info.name;

    this.modelSrc = info.modelSrc;

    this.x = info.x || 0;
    this.y = info.y || 0.5;
    this.z = info.z || 0;
    this.rotationY = info.rotationY || 0;
    this.index = info.index;

    info.gltfLoader.load(
      this.modelSrc,
      (glb) => {
        this.model = glb.scene;
        this.model.scale.set(0.1, 0.1, 0.1);
        this.model.visible = true;
        this.model.name = `${this.name} ${this.index}`;
        info.scene.add(this.model);
        this.setCannonBody();
      },
      undefined,
      (err) => {
        console.log(err);
      }
    );

    this.setRemover();
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
    this.model.name = `${this.name} ${this.index}`;
    this.model.cannonBody = this.cannonBody;
    this.cannonWorld.addBody(this.cannonBody);
  }

  setRemover() {
    const remover = setTimeout(() => {
      this.cannonWorld.removeBody(this.cannonBody);

      this.scene.remove(this.model);
      clearTimeout(remover);
    }, 5000);
  }
}

export class Domino extends Model {
  constructor(info) {
    info.modelSrc = "domino.glb";
    super(info);
  }
}

export class Robot extends Model {
  constructor(info) {
    info.modelSrc = "robot.glb";
    super(info);
  }
}

export class Soldier extends Model {
  constructor(info) {
    info.modelSrc = "soldier.glb";
    super(info);
  }
}
