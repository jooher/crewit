const
	wrap = (tag,cls,value) => {
		const el = document.createElement(tag);
		if(cls)el.className=cls;
		if(value!=null)el.textContent = value;
		return el;
	},
	
	wrapc = tag => obj => Object.keys(obj).map( key => wrap(tag,key,obj[key]) ),
	
	wrapf = tag => (values,tags) => values.map( 
			(value,i) => value!=null ? wrap(tag,tags[i],value) : null 
		).reverse(),
	
	input = attrs => Object.assign(document.createElement("input"),attrs)
	;
	
export default {
	
	flatten:{
		 
		divs: wrapf("div"),
		spans: wrapf("span"),
		
		hiddens: (values,tags) => values.map( (value,i) => input({ name:tags[i], value, type:'hidden'}) ),
		inputs: (values,tags) => values.map( (name,i) => {
				const label = document.createElement("label");
				label.name=name;
				label.appendChild( input({ name, type:tags[i]||'text', required:true }) );
				return label;
			}).reverse()
		},
		
	convert:{
		divs: wrapc("div"),
		spans: wrapc("span")
	}
}