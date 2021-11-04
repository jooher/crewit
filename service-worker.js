const

VERSION = 'v0',

urlsToCache = [
/*
//	'./manifest.json',
	'./index.html',
	'./order-tracker.js',
	'./scanner.js',
	'./styles.css',
	'./scanner.css',
	'https://dap.js.org/0.5.js' //
*/
],


cached = ( _=>{
	
	let cache;

	const

	strategies = {
		// n: fetch,
		co: async req => await cache.match(req),
		nc: async req => await fetchncache(req) || await cache.match(req),
		cn: async req => await cache.match(req) || await fetchncache(req),
		swr:async req => cache.add(req) && await cache.match(req)
	},	
	
	fetchncache = async req => {
		
		const resp = await fetch(req).catch(e=>{
			console.warn("Offline "+req.url);
		});
		
		if(resp && resp.ok)
			cache.put(req, resp.clone()).catch(e=>{
				console.error(e);
			});
			
		return resp;
	};

	return (CACHE_NAME, decide) => event => {
		
		const
			req = event.request,
			strategy = strategies[decide(req)],
			promise = strategy && new Promise( async (res,rej) => {
				if(!cache)
					cache = await caches.open(CACHE_NAME);
				const resp = await strategy(req).catch(rej);
				//if(resp)
					res(resp);
			})//.catch(console.error);
		
		event.respondWith(promise||fetch(req));
	}	
	
})();



events={

	install: event => {
			event.waitUntil( caches.open(VERSION).then( cache => cache.addAll(urlsToCache) ) );
			console.log("installed "+VERSION);
		},

	activate: event => {
			console.log('activated '+VERSION);
		},

	fetch: cached( VERSION, req =>
		1||	req.method.toUpperCase()!='GET' ? 'n':
			req.url.includes("manifest.json") ? 'n':
			req.url.includes(".php") ? 'nc':
			"cn"
		),

	push:	event=>{  
		  var title = 'Yay a message.';  
		  var body = 'We have received a push message.';  
		  var icon = '/images/smiley.svg';  
		  var tag = 'simple-push-example-tag';
		  event.waitUntil(  
			self.registration.showNotification(title, {  
			  body: body,  
			  icon: icon,  
			  tag: tag  
			})  
		  );  
		}
		
	//message:

	//sync:

};

for(const i in events)
	self.addEventListener(i,events[i]);