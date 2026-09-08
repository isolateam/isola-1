const form = document.getElementById("uv-form");
const address = document.getElementById("uv-address");
const input = document.querySelector("input");

function rFram() {
  document.getElementById("fram").src = document.getElementById("fram").src;
}

function bFram() {
  document.getElementById("fram").contentWindow.history.back();
}

function fFram() {
  document.getElementById("fram").contentWindow.history.forward();
}

function oFram() {
  if (document.getElementById('fram').src === "/null") {
    error("nope");
  } else {
    window.open(document.getElementById('fram').src, '_blank');
  }
}

var elem = document.documentElement;
var isFullscreen = false;

function fsFram() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
  isFullscreen = true;
}

function cfsFram() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    /* IE11 */
    document.msExitFullscreen();
  }
  isFullscreen = false;
}

function tfsFram() {
  if (isFullscreen) {
    closeFullScreen();
  } else {
    openFullScreen();
  }
}

setTimeout(function () {
  eruda.destroy();
}, 30);

function ntFram() {
  window.open(document.getElementById("fram").src);
}

class crypts {
  static encode(str) {
    return encodeURIComponent(
      str
        .toString()
        .split("")
        .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
        .join("")
    );
  }

  static decode(str) {
    if (str.charAt(str.length - 1) === "/") {
      str = str.slice(0, -1);
    }
    return decodeURIComponent(
      str
        .split("")
        .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
        .join("")
    );
  }
}

function search(input) {
  input = input.trim();
  const searchTemplate = localStorage.getItem("engine") || "https://google.com/search?q=%s";
  try {
    return new URL(input).toString();
  } catch (err) {
    try {
      const url = new URL(`http://${input}`);
      if (url.hostname.includes(".")) {
        return url.toString();
      }
      throw new Error("hostname.invalid");
    } catch (err) {
      return searchTemplate.replace("%s", encodeURIComponent(input));
    }
  }
}

if ("serviceWorker" in navigator) {
  var proxySetting = localStorage.getItem("proxy") || "uv";
  let swConfig = {
    uv: { file: "/uv/sw.js", config: __uv$config },
    dynamic: { file: "/dynamic/sw.js", config: __dynamic$config },
  };
  let { file: swFile, config: swConfigSettings } = swConfig[proxySetting];
  navigator.serviceWorker
    .register(swFile, { scope: swConfigSettings.prefix })
    .then((registration) => {
      console.log('sw.success');
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        let encodedUrl = swConfigSettings.prefix + crypts.encode(search(address.value));
        document.getElementById("fram").src = encodedUrl;
      });
    })
    .catch((error) => {
      console.error('sw.fail');
    });
}

const swConfig = {
  uv: { file: "/uv/sw.js", config: __uv$config },
  dynamic: { file: "/dynamic/sw.js", config: __dynamic$config },
};

function registerSW() {
  if (localStorage.getItem("registerSW") === "true") {
    var proxySetting = localStorage.getItem("proxy") || "uv";
    let { file: swFile, config: swConfigSettings } = swConfig[proxySetting];
    navigator.serviceWorker
      .register(swFile, { scope: swConfigSettings.prefix })
      .then((registration) => {
        console.log('sw.succeed');
      })
      .catch((error) => {
        console.error('sw.fail');
      });
  }
}