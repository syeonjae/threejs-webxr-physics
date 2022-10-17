// Hit-Test
import { cm2 } from "./common";
let hitTestSource = null;
let hitTestSourceRequested = false;

export default function HitTest(args) {
  if (args.frame) {
    let referenceSpace = args.renderer.xr.getReferenceSpace();
    let session = args.renderer.xr.getSession();
    // Get Session
    if (hitTestSourceRequested === false) {
      session.requestReferenceSpace("viewer").then(function (referenceSpace) {
        session
          .requestHitTestSource({ space: referenceSpace })
          .then(function (source) {
            hitTestSource = source;
          });
      });

      // Exit Session Event
      session.addEventListener("end", () => {
        hitTestSource = null;
        hitTestSourceRequested = false;
        args.reticle.visible = false;
        document.getElementById("place-button").style.display = "none";
      });

      hitTestSourceRequested = true;
    }
    // If Get Session
    if (hitTestSource) {
      let hitTestResults = args.frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length) {
        let hit = hitTestResults[0];
        if (cm2.isFloorSet) {
          document.getElementById("place-button").style.display = "block";
        }
        args.reticle.visible = true;
        args.reticle.matrix.fromArray(
          hit.getPose(referenceSpace).transform.matrix
        );
      } else {
        args.reticle.visible = false;
        document.getElementById("place-button").style.display = "none";
      }
    }
  }
}
