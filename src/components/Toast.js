// Toast Message
let removeToast;

/**
 *
 * @param {String} string  - display될 문자
 * @param {Number} s - display 시간
 */
export default function Toast(string = "메세지 입력", s = 1) {
  const toast = document.getElementById("toast");

  toast.classList.contains("reveal")
    ? (clearTimeout(removeToast),
      (removeToast = setTimeout(function () {
        document.getElementById("toast").classList.remove("reveal");
      }, s * 1000)))
    : (removeToast = setTimeout(function () {
        document.getElementById("toast").classList.remove("reveal");
      }, s * 1000));
  toast.classList.add("reveal"), (toast.innerText = string);
}
