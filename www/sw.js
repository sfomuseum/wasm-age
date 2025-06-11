const cache_name = 'age-v0.0.13';

const app_files = [
    // HTML
    "./index.html",
    
    // CSS
    "./css/bootstrap.min.css",
    "./css/index.css",
    
    // Javascript dependencies
    "./javascript/sfomuseum.golang.wasm.bundle.js",
    "./javascript/qr.bundle.min.js",    
    "./javascript/offline.application.js",
    
    // Javascript application
    "./javascript/index.js",    

    // WASM
    "./wasm/age.wasm",
    
    // Javascript service workers
    "./sw.js"    
];

self.addEventListener("install", (e) => {

    console.log("SW install event", cache_name);

    e.waitUntil((async () => {
	const cache = await caches.open(cache_name);
	console.log("SW cache files", cache_name, app_files);
	await cache.addAll(app_files);
	console.log("SW cache files added", cache_name);
    })());
});

addEventListener("activate", (event) => {
    console.log("SW activate", cache_name);
});

addEventListener("message", (event) => {
    // event is a MessageEvent object
    console.log(`The service worker sent me a message: ${event.data}`);
  });


self.addEventListener('fetch', (e) => {

    // https://developer.mozilla.org/en-US/docs/Web/API/Cache
    
    e.respondWith((async () => {

	console.debug("fetch", cache_name, e.request.url);
	
	const cache = await caches.open(cache_name);
	const r = await cache.match(e.request);
	
	console.debug(`[Service Worker] Fetching resource: ${e.request.url}`);
	
	if (r) {
	    console.debug("return cache", e.request.url);
	    return r;
	}
	
	const response = await fetch(e.request);
	
	console.debug(`[Service Worker] Caching new resource: ${e.request.url}`);
	cache.put(e.request, response.clone());
	
	return response;
    })());
    
});
