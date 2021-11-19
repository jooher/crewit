const

pack = (n,v) => n ? n+'='+encodeURIComponent(v) : v,

xpand = o => o && Object.keys(o).filter(k=>o[k]!==null).map(k => pack(k,o[k])).join("&"),
	
query =(proc,values,names,method) => [proc, ...values
		.map( (v,i) => typeof v !== 'object' ? pack(names[i],v) : method ? null : xpand(v) ) //
		.filter(v => v!=null && v.length!==0 )
		.reverse()
	].join("&"),
	
route = (proc,values,names) => values.reduce(
		(url,value,i)=>
			names[i] ? url.replace(":"+name[i],value) : url,
		proc
	);

export default req => (values,names) =>{
	
	const
	method = names[names.length-1],
	body = names[0] ? null : JSON.stringify(values[0]),
	proc = req.base + values.pop(),
	format = proc.indexOf("?")>=0 ? query : route,
	url = format(proc,values,names,method);
	
	return Object.assign({method:method||'GET',body,url},req);
}