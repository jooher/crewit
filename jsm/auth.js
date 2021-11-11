export default (headers,pack) => {
	const auth = u => {
			if(u)headers.authorization=pack(u);
			else delete headers.authorization;
			return u;
		}
	return{
		save: (u,r) => localStorage.setItem("authorization",JSON.stringify(u))||auth(u),
		load: (_,r)=> r && auth(JSON.parse(localStorage.getItem("authorization"))),
		quit: (_,r)=> r && auth(localStorage.removeItem("authorization")||null) 
	}
}