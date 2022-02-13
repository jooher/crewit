export default {
	
	htmlIn:
	html=>html&&html.replace(/<.+[^>]/g,''),
	
	htmlOut:
	str=>str&&str
	.replace( /https?:\/\/(\S+)/g, "<a target=_blank class=href-url href=https://$1 ></a>" )
	.replace( /(\S+)@(\S+\.\S+)/g, "<a target=_blank class=href-mailto href=mailto:$1@$2 ></a>")
	.replace( /(\S+)@(instagram|facebook)\s/g, "<a target=_blank class=href-$2 href=https://$2.com/@$1 ></a>")

}