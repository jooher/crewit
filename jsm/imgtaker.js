//const uploadUrl="php/upload1.php";

export default (uploadUrl,options={}) => {
	
	const
	
	maxw = options.maxw||1024,
	maxh = options.maxh||1024,
	mime = options.mime || "image/jpeg",
	quality = options.quality || 0.8,

	canvas = img => {
		
		const
			scale = Math.min(maxw/img.width, maxh/img.height, 1),
			w = Math.round(scale*img.width),
			h = Math.round(scale*img.height),
			canvas = document.createElement('canvas');

		canvas.width = w;
		canvas.height = h;
		canvas.getContext("2d").drawImage(img, 0, 0, w, h);
	  
		return canvas;//.toDataURL(mime,quality);
	},

	prepare = file => new Promise( resolve => {
		const reader = new FileReader();
		reader.readAsArrayBuffer(file);
		reader.onload = e=>{
			const
				result = e.target.result,
				img = new Image();
			img.src = URL.createObjectURL(new Blob([result])); //(window.URL || window.webkitURL)
			img.onload = e => {
				URL.revokeObjectURL(e.target.src);
				resolve( canvas(e.target) );
			}
		}
	}),
	
	trunk	= canvases => canvases.reduce( 
		(formdata,canvas,i)=>{
			const file=canvas.toDataURL(mime,quality);
			formdata.append("img"+i,file);
			return formdata;
		},
		new FormData()
	)
	;

	return {
		
		take:	files => files && Promise.all( [...files]
			.filter( file=>file.type.startsWith('image/') )
			.map(prepare)
		),
		
		upload: canvases => canvases && Promise.all( canvases.map ( 
			canvas=>fetch(uploadUrl,{ method:"POST", body:canvas.toDataURL(mime,quality), contentType:mime}).then(response=>response.text())
			)
		)
		
	}	
}