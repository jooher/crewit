,'dialog'.d(""
	,'INPUT type=tel'.ui("? $phone=#:value,valid.phone msg.error.phone")
	
	
	; $?=(`Login $phone)")
	,'INPUT type=password'.ui("? ")
	,
	,'BUTTON.getcode'.ui("? $bycode=( `sendCode $phone ) ")
	,'INPUT.code'
	)
