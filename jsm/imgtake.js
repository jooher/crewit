//const uploadUrl="php/upload1.php";

export default (uploadUrl,options={}) => {
	
	const
	
	maxw = options.maxw||1024,
	maxh = options.maxh||1024,
	mime = options.mime || "image/jpeg",
	quality = options.quality || 0.8,

	show = file => new Promise( resolve => {
		const	reader = new FileReader(), img = new Image();
		img.onload = e => { resolve(e.target); } //canvas(e.target)
		reader.onload = e => { img.src = e.target.result; }
		reader.readAsDataURL(file);
	}),
	
	pack = img => {
		
		const
			scale = Math.min(maxw/img.naturalWidth, maxh/img.naturalHeight, 1),
			w = Math.round(scale*img.naturalWidth),
			h = Math.round(scale*img.naturalHeight),
			canvas = document.createElement('canvas');

		canvas.width = w;
		canvas.height = h;
		canvas.getContext("2d").drawImage(img, 0, 0, w, h);
	  
		return canvas.toDataURL(mime,quality);
	},

	upload = img => fetch(uploadUrl,{ method:"POST", body:pack(img), contentType:mime})
		.then(response=>response.text())
	;

	return {
		take:	files => files && Promise.all([...files].filter( file=>file.type.startsWith('image/') ).map(show)),
		upload: imgs => imgs && Promise.all( imgs.map (upload) ),		
	}	
}