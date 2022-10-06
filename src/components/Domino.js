export class Domino {
  constructor(info) {
    info.gltfLoader.load(
      "domino.glb",
      (glb) => {
        this.model = glb.scene;
        this.model.scale.set(0.1, 0.1, 0.1);
        this.model.position.setFromMatrixPosition(info.reticle.matrix);
        this.model.visible = true;
        info.scene.add(this.model);
        console.log(this.model);
      },
      undefined,
      (err) => {
        console.log(err);
      }
    );
  }
}
