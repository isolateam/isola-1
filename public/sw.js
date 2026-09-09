importScripts("/controller/controller.sw.js");

self.addEventListener("activate", event => {
    event.waitUntil(clients.claim());
});

self.addEventListener("fetch", event => {
    if ($scramjetController.shouldRoute(event)) {
        event.respondWith($scramjetController.route(event));
    }
});