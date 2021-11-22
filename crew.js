import "./0.5.js"; //https://dap.js.org/0.5.js

import msg from "./localized/ru.js";
	
import wraps from "./jsm/wraps.js";
import wait from "./jsm/modal.js";

const scrim = "scrim".ui('value :?'),
	modal = (...dialog) => "modal".d('top',scrim,"dialog".d(...dialog)).u("value .value; kill");

import restAPI	from "./jsm/rest.js";
import httpAuth	from "./jsm/auth.js";
import imgtaker	from "./jsm/imgtake.js";

const server = "https://orders.saxmute.one/luna/",
	headers= {  }, //"Content-Type":"application/json;charset=utf-8"
	auth	= httpAuth( headers, u => 'Basic '+ btoa([u.author,u.token].join(":")) ),
	api	= restAPI( {base:server + "php/data.php?", headers} ),
	img	= imgtaker(server+"php/upload1.php",{maxw:1280,maxh:720}),
	ava	= imgtaker(server+"php/upload1.php",{maxw:640,maxh:640});

const edit = what => 'edit.what contenteditable'.d("! .what; paste plaintext").ui(".what=#.innerText").FOR({what});

const	date = d => d && new Date(d)[d.split(" ").pop()=='00:00:00' ? 'toLocaleDateString' : 'toLocaleString']();

'APP'.d(""
	,'PAGE'.d("$auth=:auth.load $scheduled= $create= $tagset= $search=( .article .author .member .tag ); u!"
	
		,'ATTIC'.d("$?="

			,'BAR'.d(""
				,'home'.ui("$search=")
				,'LABEL.search'.d(""
					,'ICON.search'.d("")
					,'INPUT'.d("# $search.tag@value").ui("$search=( #:text@tag )")
				)
				,'ICON.login'.d("? $auth:!").ui("$auth=Login():wait")
				,'ICON.person'.d("? $auth").ui("$?=$?:!")
			)
		
			,'submenu'.d('? $?; Badge( $auth.author )'
				,'TAP.add'.ui("$create=:!")
				,'ICON.logout'.ui("$auth=:auth.quit")
			).u("$?=")
	
		)

		,'ETAGE'.d(""
			,'SECTION.create'.d("? $create; Article(:!@edit)")
			,'SECTION FADE=1000'.d("* (`Articles $search )api:query; ! Article")
		)
		
	)
)
.DICT({
	
	Article
	:'ARTICLE'.d("& .content@; $edit=.; here? .?=( $search.article .article )eq"
	
		,'auth'.d("$edit; ? (.author $auth.author)eq"
			,'ICON.edit'.d("? $edit:!").ui("$edit=:!")
		)
		
		,'content'
		
		.d("? $edit:!; $?=."
		
			,'H3'.d("! .title; #:focus")
		
			,'tags'.d("* .tags:split@tag"
				,'tag'.d("! .tag").ui("$search=(.tag)")
			)
			
			,'pics'.d("* .pics"
				,'IMG'.d("!! (dir.pics .pics)concat@src")
			)
			
			,'html'.d("#.innerHTML=.html:sanitizeOut")
			
			,'info'.d(""
				,'venue'.d("! (.venue .date:date)?")
				,'price'.d("! .price").ui(".buy=$")
/*				
				,'DATE'.d("! .date:date")
				,'prices'.d("* .prices"
					,'price'.d("! .price").ui("..buy=$")
				).ui("? (..buy):buy")
*/
			)
			
			,"more".d('? $?; $crew=("Members .article)api:query'
			
				,'SECTION.terms'.d("! .terms")
				
				,'SECTION.crew'.d("*@ $crew"
					,'member'.d("!! (.info.alias .author)? .info.skills@title; !? (.author $auth.author)eq@me")
				)
				
				,'bar'.d(""
					,"ICON.share".ui('( ( base@ .article .tag .author .member)uri@url .title .html@text):share')
				
					,'BUTTON.join'.d("? ($crew $auth.author)filter:?!")////$auth.info $auth.info
					.ui(`	? $auth $auth=Login():wait;
						? $auth.info $auth.info=Info($auth.author):wait;
						? $crew=( @PUT"Member .article)api:query msg.error.connection:alert;
					?`)
				).u('?')
				
			)
			,'TOGGLE'.ui('? $?=$?:!;').a("!? $?@on")
			
/*			
			,'attitude'.d("* (`Attitude .article)db"
				,'like'.d("a!").ui(".like=.like:!; a!").a("!? .like")
				,'ticket'.d("")
			)
*/
		)
		
		.d("? $edit; $pics= $tags="
		
			,'H3 contenteditable'.d("! .title; paste plaintext; #:focus").ui(".title=#:value")
		
			,edit('tags')
/*			
			,'addtags'.d("? $tags; ? $tagset $tagset=dir.tagset:query,tagset"
				,'tags'.d("* $tagset"
					,'tagset'.d("* .tagset@tag"
						,'tag'
						.d("! .tag; !? ($tags .tag)set.includes:!@unset")
						.ui("$tags=($tags .tag)set.toggle; ?")
					)
				)
				,'TAP.done'.ui(".tags=$tags:set.tostr $tags=")//
			)
			
			,'tags'
			.d("$tags; * .tags:split@tag"
				,'tag'.d("! .tag")
			)
			.ui("$tags=.tags:set.fromstr")			
*/		

			,'pics'
			.d("? $pics; ! $pics")
			.d("? $pics:!; ? .pics; * .pics@pic"// (defaultpics)?
				,'IMG'.d("!! (dir.pics .pic)concat@src")
			)
/*			
*/			
			,'LABEL.addpics icon=photo'.d(""
				,'INPUT type=file multiple'.ui("$pics=#.files:img.take")
			)

			,'html contenteditable'
			.d("#.innerHTML=.html:sanitizeOut; paste safehtml")
			.ui(".html=#:sanitizeIn")
					
			,'info'.d(""
				,edit('venue')// contenteditable'.d("! .venue").ui(".venue")
				,'price'.d(""
					,'INPUT type=number step=100'.d("# .price@value").ui(".price=#:value")
				)
			)
			
			,'LABEL.date'.d(""
				,'INPUT.date type=date'.d("# .date@value").ui(".date=#:value")
			)
			
			,'bar'.d(""
			
				,'ACTION.cancel'.ui("$edit= $create=")
			
				,'BUTTON.done'.ui(`
					? (.date .tags .title .price .html)! msg.error.incomplete:alert;
					? $pics:! .pics=($pics:img.upload .pics)? msg.error.upload:alert;
					? .result=( @POST"Article (.article .date .tags (.title .price .venue .html .pics)@content) )api:query msg.error.connection:alert;
					.article=.result.0.article $edit=
				`)//? (.pics $pics)? msg.error.nopics:alert;
			)
			
		)
	),
	
	Avatar
	:"IMG".d("!! (dir.pics@ (.info.pic `default.jpg)? )concat@src"),//.ui("upload")
	
	Badge
	:"badge".d('* ("Author .author)api:query'
	
		,'short'.d("*@ .info"
			,'avatar'.d("bg (dir.pics@ (.pic `default.jpg)? )concat")//d("! Avatar")
			,'alias'.d("! .alias")
			,'skills'.d("! .skills")
		).ui("$auth.info=Info(.author):wait")
		
		,'activity'.d(""
			,'LI.myarticles'.ui("$search=(.author)")
			,'LI.mymemberships'.ui("$search=(.author@member)")
		)
	),
	
	Login
	:modal('$challenge='
		
		,"LABEL.phone".d(''
			,"INPUT.phone type=tel".d("#:focus").ui(`
				? .phone=#:value,valid.phone msg.error.phone:alert;
				? $challenge=( "Auth.challenge .phone )api:query msg.error.connection:alert;
				.otpwd=$challenge.0.otpwd;
			?`)
		)
		
		,"LABEL.challenge".d('? $challenge'
				// ? .otpwd=#:value,valid.otpwd msg.error.otpwd:alert;
			,"INPUT".d("#:focus").ui(`
				? .verify=( "Auth.verify .phone .otpwd )api:query msg.error.wrong:alert;
				? .value=.verify.0:auth.save;
			`)
		)
	),
	
	Info
	:modal(''
		,'profile'.d('$?=; *@ ("Author .author)api:query'
	
			,"form".d('*@ .info=(.info ())?; '
			
				,'LABEL.avatar.filepicker'.d("$pic=; a!"
				
					,'INPUT type=file'.ui("? $pic=#.files:ava.take,ava.upload; .pic=$pic.0")
					
				).a("bg (dir.pics@ ($pic.0 .pic `default.jpg)? )concat")
				
				,"alias skills links".split(" ").map(edit)
			).u("$?=(); ?")
			
			,"BUTTON.ok".ui(`
				? $?:! (@POST"Author (.info) )api:query msg.error.connection:alert;
				..value=.info;
			`)
		)
	)
	

})

.DICT({
	
	msg,
	
	base: location.origin+"/#!",
	
	dir:{
		pics: server+"content/",
		avatar: server+"content/avatar/",
		tagset: "localized/ru.txt"
	},
	
	defaultpics: ["default.jpg"],
	
	plaintext: ctrlv => ctrlv.getData('text/plain'),
	safehtml: ctrlv => ctrlv.getData('text/plain')//'application/rtf'
	
/*
	state:"new like interested definite",
	"article-seed": {price:1500}, //, date:(new Date()).toISOString().substring(0,10)"2021-03-17T19:00"
	
	touch
	:'touch'.d("!! .state"
		,'UL'.d("? $?; * state"
			,'LI'.d("! .state").ui("..state=.")
		)
	).ui(""),	
	
*/	
	
})

.FUNC({ //set

	convert:{
		set:{
			fromstr: a => a ? a.split(" ").reduce((s,k)=>(s[k]=true, s), {}) : {},
			tostr: s => Object.keys(s).join(" ")
		},
		focus: el=>setTimeout(_=> el.focus(),100),
		
	},
	
	flatten:{
		filter:(values,tags)=> 
			values.reduce( 
				(a,v,i) => a.filter( o => 
					o[tags[i]]==v 
				),
				values.pop()
			),
		
		set:{
			includes: values => values.reduce((a,k)=>(a && (k in a) && a), values.pop()),
			toggle: values => values.reduce((a,k)=>(a[k]=!(k in a), a), values.pop()),
		}
	},
	
	operate:{
		"here?": (value,alias,node) => { if(value)setTimeout(_=>node.scrollIntoView(),100); },
		
		
		bg: (value,alias,node) => node.style.backgroundImage="url('"+value+"')"
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
		img, ava, auth, date,
		split	:str=>str?str.split(" "):[],
		
		sanitizeIn: elem=>elem.innerText.trim(), //
		sanitizeOut: html=>html&&html.trim(),
		tagset: txt=>txt.split("\n").map(line=>line.split(" ")),
		
		valid :{
			phone: str => {
				const phone=str.replace(/[^0-9]/g,'');
				return phone.length==11 && phone;
			},
			otpwd: str => str.replace(/[^0-9]/g,'')
		},
		
		share : data => navigator.share && navigator.share(data) && true
	}
		
})

.FUNC( wraps, wait, {flatten:{api}} )

.RENDER();