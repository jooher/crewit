import "https://dap.js.org/0.5.js";
import rest from "./jsm/rest.js";
import wraps from "./jsm/wraps.js";
import imgtaker from "./jsm/imgtaker.js";

import msg from "./localized/ru.js";

const server = "https://orders.saxmute.one/luna/";

const edit = what => 'edit.what'.d("! .what; paste textonly").ui(".what=#:value").FOR({what});


'PAGE'.d("$author=`1 $scheduled= $create= $tags= $tagset= $tag=. $datefrom=. $dateto=.; u!"
	
	,'filter'.d("$dates="
		,'INPUT.search placeholder="Все события"'.d("# $tag@value").ui("$tag=#:text")
		,'dates'.d(""
			,'INPUT type=date'.d("# $datefrom@value").ui("$datefrom=#:value")
			,'INPUT type=date'.d("# $dateto@value").ui("$dateto=#:value")
		)
	)
	
	,'SECTION.create'.d("? $create; Article($author :!@edit)")
	,'SECTION FADE=1000'.d("* (`Articles $tag $datefrom $dateto)api:query; ! Article")
		
	,'vault'.d(""
		,'auth'.d("? $author"
			,'ICON.add'.ui("$create=:!")
		)
	)
)

.DICT({
	
	Article
	:'ARTICLE'.d("& .content@; $auth=(.author $author)eq $edit=."
	
		,'auth'.d("? $auth"
			,'ICON.edit'.d("? $edit:!").ui("$edit=:!")
		)
		
		,'content'
		
		.d("? $edit:!; $?="
		
			,'TIME'.d("! .date:date")
			,'H2'.d("! .title")
		
			,'tags'.d("* .tags:split@tag"
				,'tag'.d("! .tag").ui("$tag=.")
			)
			
			,'pics'.d("* .pics"
				,'IMG'.d("!! (dir.pics .pics)concat@src")
			)
			
			,'html'.d("#.innerHTML=.html:sanitizeOut")
			
			,'info'.d(""
				,'ADDRESS'.d("! .venue")
				,'price'.d("! .price").ui(".buy=$")
				,'prices'.d("* .prices"
					,'price'.d("! .price").ui("..buy=$")
				).ui("? (..buy):buy")
			)
			
			,'BUTTON.interested'.d("? $?:!").ui("$?=$?:!")
			
			,'crew'.d("? $?"
				,'members'.d("*@ .crew=(`Members .article)api:query"
					,'member'.d("!! .name@ .publicinfo.skills@title")
				)
				/*
				,'roles'.d("*@ .roles"
					,'INPUT.role type=checkbox'.d("! .title"
						,'who'.d("*@ (..crew .role)filter"
							,'person'.d("! .nick").ui("$person=.; ?")
						)
					)
				).u(".myroles=#:checkboxMask")
				*/
				,'join'.d("$?="
					,'BUTTON.join'.ui("? $?=( @PUT`Member .article $author)api:query msg.error.connection:alert")
					,'person'.d("? $?; ! Person")
				)
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
				,'ICON.done'.ui(".tags=$tags:set.tostr $tags=")
			)
			
			,'tags'
			.d("$tags; * .tags:split@tag"
				,'tag'.d("! .tag")
			)
			.ui("$tags=.tags:set.fromstr")			
		
			,'pics'.d("? $cavs:!; * (.pics defaultpics)?@pic"
				,'IMG'.d("!! (dir.pics .pic)concat@src")
			)
			
			,'pics'.d("? $cavs; ! $cavs")

			,'INPUT.img type=file multiple'.ui("$cavs=#.files:img.take")//

			,'html contenteditable'
			.d("#.innerHTML=.html:sanitizeOut; paste safehtml")
			.ui(".html=#:sanitizeIn")
					
			,'info'.d(""
				,'INPUT.date type=datetime-local'.d("# .date@value").ui(".date=#:value")
				,'price'.d(""
					,'INPUT type=number step=100'.d("# .price@value").ui(".price=#:value")
				)
			)
			
			,'BUTTON.done'
			.ui(`
				? (.pics $cavs)? msg.error.nopics:alert;
				? (.date .tags .title .price .html)! msg.error.incomplete:alert;
				? .pics=($cavs:img.upload .pics)? msg.error.upload:alert;
				? .result=( @POST"Article (.article $author .date .tags (.title .price .venue .html .pics)@content) )api:query msg.error.connection:alert;
				msg.success.posted:alert $edit=
			`)
		)
		
	
	),
	
	Person
	:'person'
	.d("? ($author .author)eq"
		,edit('login')// , ,edit("privateinfo")
		,'publicinfo'.d("*@ .publicinfo=.publicinfo:publicinfo"
			,"name age skills link".split(" ").map(edit)
		)
		,'BUTTON.update'.ui("? ( @POST`Author ( $author .name .publicinfo ) )api:query msg.error.connection:alert")
	)
	.d("? ($author .author)ne; ! (.name .age .skills .link)divs" )
	
})

.DICT({
	
	msg,
	state:"new like interested definite",
	dir:{
		pics: server+"content/",
		tagset: server+"localized/ru.txt"
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
		set:{
			includes: values => values.reduce((a,k)=>(a && (k in a) && a), values.pop()),
			toggle: values => values.reduce((a,k)=>(a[k]=!(k in a), a), values.pop()),
		}
	}

})

.FUNC({
	
	operate:{
		paste: (value,alias,node)=>{
			node.contentEditable=true;
			node.addEventListener('paste', e => {
				e.preventDefault();
				document.execCommand("insertHTML", false, value(e.clipboardData));
			})
		}
	},
	
	convert:{
		split:str=>str?str.split(" "):[],
		date: date=>date,//
		sanitizeIn: elem=>elem.textContent,
		sanitizeOut: html=>html,
		buy: id=>alert("Купить id"),
		img: imgtaker(),
		tagset: txt=>txt.split("\n").map(line=>line.split(" ")),
		
		publicinfo: p => Object.assign({name:"", age:"99", skills:"Навыки", href:"https://facebook.com/"},p)
	},
	
	flatten:{
		api:rest({
			base: server + "php/data.php?",
			"Content-Type":"application/json",
			"charset":"utf-8"
		}),
		
	}
})

.FUNC(wraps)

.RENDER();