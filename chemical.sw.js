// Deploy base path of this service worker (e.g. "/" or "/my-repo/").
const chemicalBase = (location.pathname || "/").replace(/[^/]*$/, "") || "/";

const rammerheadEnabled = false;
const scramjetEnabled = false;
const uvEnabled = true;
if (uvEnabled) {
  importScripts(chemicalBase + "uv/uv.bundle.js");
  importScripts(chemicalBase + "uv/uv.config.js");
  importScripts(__uv$config.sw || chemicalBase + "uv/uv.sw.js");
}
if (scramjetEnabled) {
  importScripts(chemicalBase + "scramjet/scramjet.wasm.js");
  importScripts(chemicalBase + "scramjet/scramjet.shared.js");
  importScripts(chemicalBase + "scramjet/scramjet.worker.js");
}

if (navigator.userAgent.includes("Firefox")) {
  Object.defineProperty(globalThis, "crossOriginIsolated", {
    value: true,
    writable: false,
  });
}

let uv, scramjet;

if (uvEnabled) {
  uv = new UVServiceWorker();
}
if (scramjetEnabled) {
  scramjet = new ScramjetServiceWorker();
}

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      if (scramjetEnabled) {
        await scramjet.loadConfig();
      }

      if (uvEnabled && uv.route(event)) {
        return await uv.fetch(event);
      } else if (scramjetEnabled && scramjet.route(event)) {
        return await scramjet.fetch(event);
      }
      return await fetch(event.request);
    })()
  );
});
