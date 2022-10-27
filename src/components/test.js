import { Vector2 } from "three";

export default function test() {
  const parentDom = document.querySelector("#items-wrapper");
  const childDom = document.querySelector("#items");
  const diff = 79;
  // define child DOM Height
  if (childDom.childElementCount < 3) {
    childDom.style.height = `${diff * 3}px`;
  } else {
    childDom.style.height = `${diff * childDom.childElementCount}`;
  }
  const currentPos = new Vector2();
  const prevPos = new Vector2();

  let posY = 0;

  function mup(e) {
    currentPos.y = e.clientY;

    if (Math.abs(currentPos.y - prevPos.y) > 50) {
      // 민감도
      if (currentPos.y > prevPos.y) {
        // 위로 슬라이드
        if (
          // 위 끝점 감지
          Math.abs(
            parentDom.getClientRects()[0].y - childDom.getClientRects()[0].y
          ) <= 10
        ) {
        } else {
          posY += diff;
          childDom.style.top = `${posY}px`;
        }
      } else {
        // 아래로 슬라이드
        if (
          // 아래 끝점 감지
          Math.abs(
            parentDom.getClientRects()[0].bottom -
              childDom.getClientRects()[0].bottom
          ) <= 10
        ) {
        } else {
          posY -= diff;
          childDom.style.top = `${posY}px`;
        }
      }
    }
  }
  function mdown(e) {
    prevPos.y = e.clientY;
  }

  parentDom.addEventListener("mousedown", mdown, false);
  parentDom.addEventListener("mouseup", mup, false);
}
