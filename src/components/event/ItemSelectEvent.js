import { Vector2 } from "three";
import { cm1, dom, navItem, system } from "../common/common";
import { PreventDragClick } from "./PreventDragClick";

export default function ItemSelect() {
  // Prevent Click
  const preventClick = new PreventDragClick(dom.canvas);

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
    if (system.isMobile) {
      currentPos.y = e.changedTouches[0].clientY;
    } else {
      currentPos.y = e.clientY;
    }

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
    if (system.isMobile) {
      prevPos.y = e.touches[0].clientY;
    } else {
      prevPos.y = e.clientY;
    }
  }

  function open(e) {
    if (system.isMobile) {
      parentDom.style.left = "-2%";

      navItem.isOpen = !navItem.isOpen;

      dom.canvas.addEventListener("touchstart", close, false);

      // 스와이프 이벤트
      parentDom.addEventListener("touchstart", mdown, false);
      parentDom.addEventListener("touchend", mup, false);

      parentDom.removeEventListener("touchstart", open, false);
    }
  }

  function close(e) {
    if (system.isMobile) {
      if (preventClick.mouseMoved) return;
      parentDom.style.left = "-22%";

      navItem.isOpen = !navItem.isOpen;

      parentDom.addEventListener("touchstart", open, false);
      dom.canvas.removeEventListener("touchstart", close, false);
    }
  }

  if (system.isMobile) {
    if (!navItem.isOpen) {
      parentDom.addEventListener("touchstart", open, false);
    }
  } else {
    parentDom.addEventListener("mousedown", mdown, false);
    parentDom.addEventListener("mouseup", mup, false);
  }
}
