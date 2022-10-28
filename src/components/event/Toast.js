// Toast Message
let removeToast;

/**
 *
 * @param {String} s  - display될 문자
 * @param {Number} t - display 시간
 */
export default function Toast(s = "메세지 입력", t = 1) {
  const toast = document.getElementById("toast");

  toast.classList.contains("reveal")
    ? (clearTimeout(removeToast),
      (removeToast = setTimeout(function () {
        document.getElementById("toast").classList.remove("reveal");
      }, t * 1000)))
    : (removeToast = setTimeout(function () {
        document.getElementById("toast").classList.remove("reveal");
      }, t * 1000));
  toast.classList.add("reveal"), (toast.innerText = s);
}
