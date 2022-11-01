export class PreventDragClick {
  constructor(canvas) {
    this.mouseMoved = false;
    let clickStartX, clickStartY, clickStartTime;

    // PC
    canvas.addEventListener("mousedown", (e) => {
      clickStartX = e.clientX;
      clickStartY = e.clientY;
      clickStartTime = Date.now();
    });

    canvas.addEventListener("mouseup", (e) => {
      const xGap = Math.abs(e.clientX - clickStartX);
      const yGap = Math.abs(e.clientY - clickStartY);
      const timeGap = Date.now() - clickStartTime;

      if (xGap > 5 || yGap > 5 || timeGap > 500) {
        this.mouseMoved = true;
      } else {
        this.mouseMoved = false;
      }
    });

    // 모바일
    canvas.addEventListener("touchstart", (e) => {
      // e.touches
      clickStartX = e.touches[0].clientX;
      clickStartY = e.touches[0].clientY;
      clickStartTime = Date.now();
    });

    canvas.addEventListener("touchend", (e) => {
      // e.changeTouches
      const xGap = Math.abs(e.changedTouches[0].clientX - clickStartX);
      const yGap = Math.abs(e.changedTouches[0].clientY - clickStartY);
      const timeGap = Date.now() - clickStartTime;

      if (xGap > 5 || yGap > 5 || timeGap > 300) {
        this.mouseMoved = true;
      } else {
        this.mouseMoved = false;
      }
    });
  }
}
