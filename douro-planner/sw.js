/* Douro Day Planner service worker. Scope: /douro-planner/. Bump VERSION on every change. */
var VERSION = "ddp-2026-11-13b";
var CORE = [
  "/douro-planner/", "/douro-planner/planner.css", "/douro-planner/planner.js", "/douro-planner/planner-data.js",
  "/douro-planner/manifest.webmanifest", "/douro-planner/img/icon-192.png", "/douro-planner/img/icon-512.png",
  "/douro-planner/img/hero-regua-900.webp", "/douro-planner/img/hero-regua-1600.webp",
  "/img/cards/sao-bento-station-640.webp", "/img/cards/douro-valley-640.webp", "/img/rabelos-gaia-dom-luis-800.webp",
  "/styles.css", "/assistant.css", "/consent.css", "/consent.js", "/menu.js", "/i18n/menu-labels.js", "/page-langs.js",
  "/search.js", "/lang.js", "/favicon.svg", "/fonts/instrument-serif-normal.woff2", "/fonts/dm-sans-normal.woff2"
];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    return Promise.all(CORE.map(function (u) { return c.add(new Request(u, { cache: "reload" })).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("ddp-") === 0 && k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;
  /* Pages: network first, then the cached planner (so it opens offline with any ?d=&n=&p=). */
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(function (res) {
      if (res.ok && url.pathname.indexOf("/douro-planner") === 0) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put("/douro-planner/", copy); }); }
      return res;
    }).catch(function () { return caches.match("/douro-planner/"); }));
    return;
  }
  /* Assets: cache first, refresh in the background. */
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  }));
});
