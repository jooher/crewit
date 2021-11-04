const

/*
route = values => values.join("/")
	.replace(/\/&/g,"?")
	.replace(/@\//g,"@"),
*/
	
query =(proc,values,names) => [proc, ...values
		.map((v,i) =>
			typeof v === 'object' ? null : names[i] ? names[i]+'='+encodeURIComponent(v) : v
		)
		.filter(v=>v!=null)
		.reverse()
	].join("&"),
	
route = (proc,values,names) => values.reduce(
		(url,value,i)=>
			names[i] ? url.replace(":"+name[i],value) : url,
		proc
	);

/*
export default (api,headers) => (values,names) => {
	const
	method = names[names.length-1],
	payload = method && values.pop(),
	body = payload && JSON.stringify(payload),//new URLSearchParams(payload).toString(),//
	url = api+queryString(values,names);
	return {method,headers,url,body,error:null};
}
*/
export default req => (values,names) =>{
	
	const
	method = names[names.length-1]||'GET',
	body = names[0] ? null : JSON.stringify(values[0]),
	proc = req.base + values.pop(),
	format = proc.indexOf("?")>=0 ? query : route,
	url = format(proc,values,names);
	
	return Object.assign({method,body,url},req);
	
}