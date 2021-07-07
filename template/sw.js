self.addEventListener("install", (e) => {
  console.log(`[sw] : installing, ${e}`);
});

self.addEventListener("activate", (e) => {
  console.log(`[sw] : activating, ${e}`);
  return self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // console.log(`[sw] : fetching..`, e);
  e.respondWith(fetch(e.request));
});
