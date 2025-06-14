/* https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Offline_Service_workers#service_workers_explained */
/* https://github.com/mdn/pwa-examples/blob/main/js13kpwa/sw.js */
/* https://web.dev/learn/pwa/service-workers/ */
/* https://webkit.org/blog/8090/workers-at-your-service/ */

/*
   navigator.serviceWorker.getRegistrations().then(function(registrations) {
   for(let registration of registrations) {
   console.debug("Unregister", registration);
   registration.unregister();
   }
   });
 */

var offline = offline || {};

offline.application = (function(){

    var self = {
	
	init: function(scope){

	    return new Promise((resolve, reject) => {
		
		if (! "serviceWorker" in navigator) {
		    reject("Service workers not available.");
		    return
		}
		
		var sw_uri = scope + "sw.js";
		
		var sw_args = {
		    scope: scope,
		};

		console.log("register service worker", sw_uri, sw_args);
		
		navigator.serviceWorker.register(sw_uri, sw_args).then((registration) => {

		    console.log("sw registered", sw_args);

		    if (navigator.onLine){

			console.debug("update sw registration");
			
			registration.update().then((rsp) => {
			    console.log("sw registration updated");
			    resolve();
			}).catch((err) => {
			    console.warn("failed to update sw registration", err);
			    resolve();
			});
		    }
		    
		    resolve();
		    
		}).catch((err) => {
		    console.error("Failed to register service worker", err);
		    reject(err);
		});
		
	    });
	    
	},

	purge_with_confirmation: function(prefix){

	    return new Promise((resolve, reject) => {
		
		if (! confirm("Are you sure you want to delete all the application caches? This can not be undone.")){
		    resolve();
		    return;
		}

		if (! navigator.onLine){
		    
		    if (! confirm("Are you really sure? You appear to be offline and deleting the application cache will probably cause offline support to stop working until you are online again.")){
			resolve(false)
			return;
		    }
		}
		
		self.purge(prefix).then((rsp) => {
		    resolve(rsp);
		}).catch((err) => {
		    reject(err);
		});
	    });
	},
	
	purge: function(prefix){

	    return new Promise((resolve, reject) => {
		
		caches.keys().then(function (cachesNames) {
		    
                    console.debug("Delete " + document.defaultView.location.origin + " caches");

                    return Promise.all(cachesNames.map(function (cacheName) {
			
			if (! cacheName.startsWith(prefix)){
			    return Promise.resolve();
			}
			
			return caches.delete(cacheName).then(function () {
			    console.debug("Cache with name " + cacheName + " is deleted");
			}); 
                    }))
                
		}).then(function () {
                    console.debug("All " + document.defaultView.location.origin + " caches are deleted");
		    resolve(true);
		}).catch((err) => {
		    console.error("Failed to remove caches, ",err);
		    reject(err);
		});
		
	    });
	},

	add_purge_button: function(el){

	    var purge_el = document.createElement("span");
	    purge_el.setAttribute("id", "purge");
	    purge_el.appendChild(document.createTextNode("purge offline cache"));
	    
	    purge_el.onclick = function(){
		
		offline.application.purge_with_confirmation().then((purged) => {
		    if (purged){
			alert("Offline cache has been removed.");
		    }
		}).catch((err) => {
		    alert("Failed to purge offline cache, " + err);
		});
		
		return false;
	    };

	    el.appendChild(purge_el);
	},
    };

    return self;
    
})();
