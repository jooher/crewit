import "./0.5.js"; //https://dap.js.org/0.5.js

import msg from "./localized/ru.js";
	
import wraps from "./jsm/wraps.js";
import wait from "./jsm/modal.js";

const scrim = "scrim".ui('value :?'),
	modal = (...dialog) => "modal".d('top',scrim,"dialog".d(...dialog)).u("value .value; kill");

import restAPI from "./jsm/rest.js";
import httpAuth from "./jsm/auth.js";
import imgtaker from "./jsm/imgtaker.js";

const server = "https://orders.saxmute.one/luna/",
	headers= {  }, //"Content-Type":"application/json;charset=utf-8"
	auth	= httpAuth( headers, u => 'Basic '+ btoa([u.author,u.token].join(":")) ),
	api	= restAPI( {base:server + "php/data.php?", headers} ),
	img	= imgtaker(server+"php/upload1.php");

const edit = what => 'edit.what contenteditable'.d("! .what; paste plaintext").ui(".what=#.innerText").FOR({what});


'PAGE'.d("$auth=:auth.load $scheduled= $create= $tags= $tagset= $tag=. $datefrom=. $dateto=.; u!"

	,'auth'
	.d("? $auth"
		,'TAP.add'.ui("$create=:!")
		,'ICON.logout'.ui("$auth=:auth.quit")
	)
	.d("? $auth:!"
		,'ICON.login'.ui("$auth=Login():wait")
	)
	
	,'filter'.d("$dates="
		,'INPUT.search placeholder="Все события"'.d("# $tag@value").ui("$tag=#:text")
		,'dates'.d(""
			,'INPUT type=date'.d("# $datefrom@value").ui("$datefrom=#:value")
			,'INPUT type=date'.d("# $dateto@value").ui("$dateto=#:value")
		)
	)
	
	,'SECTION.create'.d("? $create; Article(:!@edit)")
	,'SECTION FADE=1000'.d("* (`Articles $tag $datefrom $dateto)api:query; ! Article")
)

.DICT({
	
	Article
	:'ARTICLE'.d("& .content@; $edit=."
	
		,'auth'.d("? (.author $auth.author)eq"
			,'ICON.edit'.d("? $edit:!").ui("$edit=:!")
		)
		
		,'content'
		
		.d("? $edit:!"
		
			,'H3'.d("! .title")
		
			,'tags'.d("* .tags:split@tag"
				,'tag'.d("! .tag").ui("$tag=.")
			)
			
			,'pics'.d("* .pics"
				,'IMG'.d("!! (dir.pics .pics)concat@src")
			)
			
			,'html'.d("#.innerHTML=.html:sanitizeOut")
			
			,'info'.d(""
				,'DATE'.d("! .date:date")
				,'ADDRESS'.d("! .venue")
				,'price'.d("! .price").ui(".buy=$")
				,'prices'.d("* .prices"
					,'price'.d("! .price").ui("..buy=$")
				).ui("? (..buy):buy")
			)
			
			,'crew'.d("$crew="
			
				,'HEADING'.ui('? $crew=$crew:!; $crew=("Members .article)api:query')//crew:alert
				
				,'members'.d("*@ $crew"
					,'member'.d("!! (.info.alias .author)? .info.skills@title; !? (.author $auth.author)eq@me")
				)
				
				,'BUTTON.join'.d("? $crew; ? ($crew $auth.author)filter:?!")////$auth.info $auth.info
				.ui(`	? $auth $auth=Login():wait;
					? $auth.info $auth.info=Info($auth.author):wait,check;
					? $crew=( @PUT"Member .article:check)api:query msg.error.connection:alert;
				?`)
			)
			
/*			
			,'attitude'.d("* (`Attitude .article)db"
				,'like'.d("a!").ui(".like=.like:!; a!").a("!? .like")
				,'ticket'.d("")
			)
*/
		)
		
		.d("? $edit; $cavs= $tags="
		
			,'H3 contenteditable'.d("! .title; paste plaintext").ui(".title=#:value")
		
			,'addtags'.d("? $tags; ? $tagset $tagset=dir.tagset:query,tagset"
				,'tags'.d("* $tagset"
					,'tagset'.d("* .tagset@tag"
						,'tag'
						.d("! .tag; !? ($tags .tag)set.includes:!@unset")
						.ui("$tags=($tags .tag)set.toggle; ?")
					)
				)
				,'TAP.done'.ui(".tags=$tags:set.tostr $tags=")
			)
			
			,'tags'
			.d("$tags; * .tags:split@tag"
				,'tag'.d("! .tag")
			)
			.ui("$tags=.tags:set.fromstr")			
		
			,'pics'
			.d("? $cavs; ! $cavs")
			.d("? $cavs:!; * (.pics defaultpics)?@pic"
				,'IMG'.d("!! (dir.pics .pic)concat@src")
			)

			,'INPUT.img type=file multiple'.ui("$cavs=#.files:img.take")//

			,'html contenteditable'
			.d("#.innerHTML=.html:sanitizeOut; paste safehtml")
			.ui(".html=#:sanitizeIn")
					
			,'info'.d(""
				,'INPUT.date type=date'.d("# .date@value").ui(".date=#:value")
				,'price'.d(""
					,'INPUT type=number step=100'.d("# .price@value").ui(".price=#:value")
				)
			)
			
			,'BUTTON.done'
			.ui(`
				? (.pics $cavs)? msg.error.nopics:alert;
				? (.date .tags .title .price .html)! msg.error.incomplete:alert;
				? .pics=($cavs:img.upload .pics)? msg.error.upload:alert;
				? .result=( @POST"Article (.article .date .tags (.title .price .venue .html .pics)@content) )api:query msg.error.connection:alert;
				msg.success.posted:alert .article=.result.0.article $edit=
			`)
		)
	),
	
	Login
	:modal('$challenge='
		
		,"LABEL.phone".d(''
			,"INPUT.phone type=tel".ui(`
				? .phone=#:value,valid.phone msg.error.phone:alert;
				? $challenge=( "Auth.challenge .phone )api:query msg.error.connection:alert;
				.otpwd=$challenge.0.otpwd;
			?`)
		)
		
		,"LABEL.challenge".d('? $challenge'
				// ? .otpwd=#:value,valid.otpwd msg.error.otpwd:alert;
			,"INPUT".ui(`
				? .verify=( "Auth.verify .phone .otpwd )api:query msg.error.wrong:alert;
				? .value=.verify.0:auth.save;
			`)
		)
	),
	
	Info
	:modal('$?=; *@ ("Author .author)api:query'
		,"authorinfo".d('! `info; *@ .info=(.info ())?'
			,"alias skills links".split(" ").map(edit)
		).u("$?=:!; ?")
		,"TAP.ok".ui(`
			? $?:! (@POST"Author (.info) )api:query msg.error.connection:alert;
			log ..value=.info;
		`)
	)

})

.DICT({
	
	crew:[
{"author":10,"info":{"alias": "Некто Неординарный", "skills": "IYT Offshore", "_empty_": null}}
,{"author":11,"info":{"alias": "veritasiumus", "skills": "RYA Superhero", "_empty_": null}}
,{"author":20,"info":{"alias": "Тодор Живков", "skills": "слесарь 6-го разряда", "_empty_": null}}
],
	
	msg,
	state:"new like interested definite",
	dir:{
		pics: server+"content/",
		tagset: "localized/ru.txt"
	},
	
	defaultpics: ["default.jpg"],
	
	"article-seed": {price:1500}, //, date:(new Date()).toISOString().substring(0,10)"2021-03-17T19:00"
	
	touch
	:'touch'.d("!! .state"
		,'UL'.d("? $?; * state"
			,'LI'.d("! .state").ui("..state=.")
		)
	).ui(""),	
	
	plaintext: ctrlv => ctrlv.getData('text/plain'),
	safehtml: ctrlv => ctrlv.getData('text/plain')//'application/rtf'
	
})

.FUNC({ //set

	convert:{
		set:{
			fromstr: a => a ? a.split(" ").reduce((s,k)=>(s[k]=true, s), {}) : {},
			tostr: s => Object.keys(s).join(" ")
		}
	},
	
	flatten:{
		filter:(values,tags)=> 
			values.reduce( 
				(a,v,i) => a.filter( o => 
					o[tags[i]]==v 
				),
				values.pop() ),
		
		set:{
			includes: values => values.reduce((a,k)=>(a && (k in a) && a), values.pop()),
			toggle: values => values.reduce((a,k)=>(a[k]=!(k in a), a), values.pop()),
		}
	}

})

.FUNC({
	
	operate:{
		paste: (value,alias,node)=>{
			node.addEventListener('paste', e => {
				e.preventDefault();
				document.execCommand("insertHTML", false, value(e.clipboardData));
			})
		}
	},
	
	convert:{
		img, auth, 
		split	:str=>str?str.split(" "):[],
		date	: date=>date,//
		sanitizeIn: elem=>elem.innerText.trim(), //
		sanitizeOut: html=>html&&html.trim(),
		buy	: id=>alert("Купить id"),
		tagset: txt=>txt.split("\n").map(line=>line.split(" ")),
		info	: p => Object.assign({name:"", skills:"Навыки", href:"https://facebook.com/"},p),
		
		valid :{
			phone: str => {
				const phone=str.replace(/[^0-9]/g,'');
				return phone.length==11 && phone;
			},
			otpwd: str => str.replace(/[^0-9]/g,'')
		}
	}
	
})

.FUNC( wraps, wait, {flatten:{api}} )

.RENDER();