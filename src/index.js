import App from "./components/App.js";
import WebGL from "three/examples/jsm/capabilities/WebGL.js";
window.onload = function () {
  if (WebGL.isWebGLAvailable()) {
    App();
  } else {
    const warning = WebGL.getWebGLErrorMessage();
    document.body.appendChild(warning);
  }
};
