import "./0.5.js"; //https://dap.js.org/0.5.js
//import msg from "./localized/ru.js";
import wraps from "./jsm/wraps.js";
import wait from "./jsm/modal.js";
import restAPI	from "./jsm/rest.js";
import httpAuth	from "./jsm/auth.js";
import imgtaker	from "./jsm/imgtake.js";


const	grab	= src	=> Object.fromEntries(
		[...(src.parentNode.removeChild(src)).children]
		.filter(n=>n.hasAttribute("name"))
		.map(n=>[n.getAttribute("name"),n])
	),
		
	html	= grab(document.getElementById("data")),
	
	tsv = txt => txt.trim().split(/\n+/g).map(str => str.split(/\t+/g)),
	
	dict = arr => arr.reduce((d,r)=> (d[r[0]]=r[1])?d:d,{}), 
	
	scrim = 'scrim'.ui('.value=:?'),
	modal = (...dialog) => 
		'modal'.d('startmodal',scrim,'dialog'.d(...dialog))
		.u("value .value; endmodal")
		.e("POPSTATE", "endmodal"),
	
	bar = (ok,cancel) => "VAULT".d(""
		,'BUTTON.shy.cancel'.ui(cancel||'.value=:?')
		,'BUTTON.ok'.ui(ok||'.value=:!')
	),
	
	ok=bar(),


	headers= {  }, //"Content-Type":"application/json;charset=utf-8"
	server = "https://orders.saxmute.one/luna/",
	auth	= httpAuth( headers, u => 'Basic '+ btoa([u.author,u.token].join(":")) ),
	api	= restAPI( {base:server + "php/data.php?", headers} ),
	img	= imgtaker(server+"php/upload1.php",{maxw:1280,maxh:720}),
	ava	= imgtaker(server+"php/upload1.php",{maxw:320,maxh:320}),

	date = d => d && new Date(d)[d.split(" ").pop()==='00:00:00' ? 'toLocaleDateString' : 'toLocaleString'](),
	dateonly = str => str && str.split(" ")[0],

	
	vendor = (vendors => href => vendors.reduce( (m,a)=> m||href.startsWith(a[0])&&a[1],false ))([
		["https://chat.whatsapp.com/","whatsapp"],
		["https://t.me/","telegram"]
	]),
	

	edit = what => 'edit.what contenteditable'
		.d("! .what; paste plaintext")
		.ui(".what=#.innerText")
		.FOR({what})
	;




'APP'.d("$auth=:auth.load $ava="
	,'PAGE'.d("$scheduled= $create= $tagset= $article=. $search=( .author .tag )"//; u!
	
		,'ATTIC'.d("$?="

			,'BAR'.d(""
				,'home'.ui("$search=")
				,'LABEL.search'.d(""
					,'ICON.search'.d("")
					,'INPUT'.d("# $search.tag@value").ui("$search=( #:text@tag )")
				)
				,'ICON.login'.d("? $auth:!").ui("? $auth=Login():wait") //; About( $auth.author )
				,'auth'.d('? $auth $ava; Avatar( $auth.info.pic )').ui("About( $auth.author )")
				
				//? $auth.info $auth.info=Info($auth.author):wait;
			)
	
		)

		,'ETAGE'.d(""
			,'SECTION.articles FADE=1000'.d("* (`Articles $search )api:query; ! Article")
			,'SECTION.create'.d("? $create; Article(:!@edit)")
			,'SECTION.auth'.d("? $auth"
				,'TAP.add'.d("? $create:!").ui('? Confirm( html.create@message ):wait; $create=:!')
			)
		).d("! html.footer")
		
	)
)
.DICT({
	
	Article
	:'ARTICLE'.d("$?=( $article .article )eq $edit=.; & .content@; a!"
	
		,'auth'.d("$edit; ? (.author $auth.author)eq"
			,'ICON.edit'.d("? $edit:!").ui("$edit=:!")
		)
		
		,'content'
		
		.d("? $edit:!; "
		
			,'HEADER'.d(""
			
				,'thumb'.d("bg (dir.pics@ (.thumb .pics.0 `default.jpg)? )concat")
			
				,'H3'.d("! .title; #:focus")
			
				,'tags'.d("* .tags:split@tag"
					,'tag'.d("! .tag").ui("$search=(.tag)")
				)
				
			).ui("$?=$?:!")
			
			,'html.intro'.d("#.innerHTML=.html:sanitizeOut")
			
			,'info'.d(""
				,'venue'.d("! (.venue .date:date)?")
				,'price'.d("! .price").ui(".buy=$")
			)
			
			,'more'.d('? $?; $crew=("Members .article)api:query .joined='
			
				,'pics'.d("* .pics"
					,'IMG'.d("!! (dir.pics .pics)concat@src")
				)
				
				,'html.details'.d("? .details; ! .details")//SECTION.
				
				,'crew'.d("$ava; *@ $crew" //SECTION.
					,'member'.d(`
						..joined=(..joined .me=(.author $auth.author)eq)?; !? .me;
						Avatar(.info.pic);
						`
						,'skill'.d('! .crew.skill; !? ("level .crew.level)concat;')
					).ui(`
					{? .me:!; About(.author) };
					{? .me; $crew=( Member( ..article .author .crew ):wait $crew )? };
					`)
				)
				
				,'VAULT'.d("$joined=($crew $auth.author)filter:??"
				
					,'joined'.d(`? $joined; ? .crewonly=("Crewonly_ .article)api:query`
										
						,'hrefs'.d("* .crewonly.0.content.hrefs:hrefsplit@href"
							,'A'.d("? .title=.href:vendor; !? .title@; !! .href .title")
						)
					)
					
					,'ICON.share'.ui('( ( base@ .article .tag .author .member)uri@url .title .html@text):share')
				
					,'BUTTON.join'.d("? $joined:!")
					.ui(`	? Confirm( html.join@message ):wait;
						? $auth $auth=Auth:query,auth.save;
						? $crew=( Member(.article $auth.author):wait $crew )?;
					`)// $auth=Login():wait
					
				).u('?')
				
			)
			
			,'TOGGLE'.d('a!').ui('? $?=$?:!;').a("!? $?@on")
		)
		
		.d("? $edit; $pics= $tags="
		
			,'HEADER'.d(""
			
				,'LABEL.thumb'.d("$thumb=; a!"
				
					,'INPUT type=file'.ui("? $thumb=#.files:ava.take,ava.upload; .thumb=$thumb.0")
					
				).a("bg (dir.pics@ ($thumb.0 .thumb .pics.0 `default.jpg)? )concat")

				,'H3 contenteditable'.d("! .title; paste plaintext; #:focus").ui(".title=#:value")
			
				,edit('tags')
				
			)
		
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
			
			,'html.intro contenteditable'
			.d("#.innerHTML=.html:sanitizeOut; paste safehtml")
			.ui(".html=#:sanitizeIn")
					
			,'info'.d(""
				,edit('venue')// contenteditable'.d("! .venue").ui(".venue")
				,'price'.d(""
					,'INPUT type=number step=100'.d("# .price@value").ui(".price=#:value")
				)
			)
			
			,'LABEL.addpics'.d(""// icon=photo
				,'INPUT type=file multiple accept=image/png,image/gif,image/jpeg'.ui("$pics=#.files:img.take")
			)

			,'pics'
			.d("? $pics; ! $pics")
			.d("? $pics:!; ? .pics; * .pics@pic"
				,'IMG'.d("!! (dir.pics .pic)concat@src")
			)
			
			,'html.details contenteditable'
			.d("#.innerHTML=.details:sanitizeOut; paste safehtml")
			.ui(".details=#:sanitizeIn")
			
			,'more'.d(""
			
				,'LABEL.link'.d(""
					,'INPUT type=url'
					.d(`? .article:! $!=("Crewonly_ .article)api:query; !! $!.0.content.hrefs@value`)
					.ui(`? ( @POST"Crewonly (.article (#:value@hrefs)@content) )api:query`)
				)
				
				,'LABEL.expiry'.d(""
					,'INPUT.date type=date'.d("!! .date:dateonly@value").ui(".date=#:value")
				)
				
				,bar(`
					? (.date .tags .title .price .html)! error.incomplete:alert;
					? $pics:! .pics=($pics:img.upload .pics)? error.upload:alert;
					? .result=( @POST"Article (.article .title .tags .date (.price .venue .html .thumb .pics .details .link)@content) )api:query error.connection:alert;
					.article=.result.0.article $edit=
					`				
					,'$edit= $create='
				)
			)
		)
	).a('!? .focused=($? $edit)?; ? .focused; scrollto #'),
	
	Avatar
	:'avatar'.d("bg (dir.pics@ (.pic `avatar/default.jpg)? )concat"),
	
	Badge
	:'badge'.d('*@ .info; ! Avatar'
		,'alias'.d("! .alias")
		,'about'.d("! .about")
	),
	
	MyBadge
	:'badge'.d('*@ .info=(.info ())?'
		,'LABEL.avatar.filepicker'.d("a!"
			,'INPUT type=file'.ui("? $ava=#.files:ava.take,ava.upload; .pic=$ava.0")
		).a("bg (dir.pics@ ($ava.0 .pic `avatar/default.jpg)? )concat")
		,'alias contenteditable'.d("! .alias").ui(".alias=#:value")
		,'about contenteditable'.d("! .about").ui(".about=#:value")
	).u('? (@POST"Author ( $auth.info=. ) )api:query error.connection:alert; $auth:auth.save $ava=()'),
		
	About
	:modal('.me=( .author $auth.author )eq'
	
		,'info'.d('* ("Author .author)api:query; ! (..me MyBadge Badge)?!').u('?')
	
		,'UL.activities'.d('* ("Activities .author)api:query'
			,'LI.activity'.d(''
				,'date'.d("! .date:dateonly")
				,"skill".d("! .crew.skill; !? (`level .crew.level)concat")
				,'title'.d("! .title")
			).ui('$search=( ..author .article )')
		)
		
		,"VAULT".d(''
			,"BUTTON.shy.follow".ui('? ("Signup .author@to)api:query error.connection:alert')
			,"BUTTON.shy.ok".ui(':!')
		)
/*		
		,'auth'.d('? .me'
			,'ICON.logout'.ui("$auth=:auth.quit")
		)
*/
	),
	
	Login
	:modal('$challenge='
		
		,'LABEL.phone'.d(""
			,'INPUT.phone type=tel'.d("#:focus").ui(`
				? .phone=#:value,valid.phone error.phone:alert;
				? $challenge=( Auth@ .phone )uri:query error.connection:alert;
				.otpwd=$challenge.otpwd;
			?`)
		)
		
		,'LABEL.challenge'.d('? $challenge'
			,'INPUT'.d("#:focus").ui(`
				? .verify=( Auth@ .phone .otpwd )uri:query error.wrong:alert;
				? .value=.verify:auth.save;
			`)
		)
	),
	
	Info
	:modal('* ("Author .author)api:query'
		,"info".d('! MyBadge').u('?')
		,bar('..value=.info')
	),
	
	Member
	:modal("! html.skill; $?=.crew.skill"
		,'UL'.d('* levels@'
			,"LABEL.skill".d('! .1; !? ("level .0)concat' //'//
				,"INPUT type=radio name=level".ui('..crew.level=.0 $?=.crew.skill=($? .1)?; ?')
			)			
		)
		,"LABEL.skillcomment".d('? $?'
			,"INPUT".d('#.value=$?; #:focus').ui('.crew.skill=#:value; ?')
		)
		
		,"VAULT".d(''
		
			,"ICON.block".d('? .crew').ui(`
				? .value=( @DELETE"Member .article)api:query,check error.connection:alert;
			`)//? Confirm( html.unjoin@message ):wait,check;
			
			,"BUTTON.correct".ui(`
				? .value=( @POST"Member ( .article .crew ) )api:query,check error.connection:alert
			`)
		)
	),

	Confirm
	:modal("! .message",ok),

})

.DICT({
	
	html,
	
	error:dict(tsv(html.error.innerText)), 
	
	base: location.origin+"/#!",
	
	Auth: server+"php/auth.php?",
	
	dir:{
		pics: server+"content/",
		avatar: server+"content/avatar/",
		tagset: "localized/ru.txt"
	},
	
	defaultpics: ["default.jpg"],
	
	Option: "OPTION".d("!! .0@value .1@"),
	levels: tsv(html.levels.innerText),
	
	plaintext: ctrlv => ctrlv.getData('text/plain'),
	safehtml: ctrlv => ctrlv.getData('text/plain')//'application/rtf'

})

.FUNC({ //set

	convert:{
		set:{
			fromstr: a => a ? a.split(" ").reduce((s,k)=>(s[k]=true, s), {}) : {},
			tostr: s => Object.keys(s).join(" ")
		},
		focus: el=>setTimeout(_=> el.focus(),200),
		
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
		scrollto: (value,alias,node) => { setTimeout(_=>(value||node).scrollIntoView(),100); },
		bg: (value,alias,node) => { node.style.backgroundImage="url('"+value+"')"; }
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
		img, ava, auth, date, dateonly, vendor,
		split	:str=>str?str.split(" "):[],
		
		sanitizeIn: elem=>elem.innerText.trim(), //
		sanitizeOut: html=>html&&html.trim(),
		tagset: txt=>txt.split("\n").map(line=>line.split(" ")),
		
		hrefsplit: str => str&&str.split(/\s+/g),
		
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