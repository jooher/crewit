const

w = (base,tails){
	for(const k in tails)
		tails[k]=base+tails[k];
	return tails
},

gapi={
	
	gmail: w("https://gmail.googleapis.com/",{ //https://developers.google.com/gmail/api/reference/rest	
		meta:	"gmail/v1/users/{userId}/",
		upload: "upload/gmail/v1/users/{userId}"
	}),
				
	calendar: w("https://www.googleapis.com/calendar/v3",{// https://developers.google.com/calendar/v3/reference
		Acl: "calendars/{calendarId}/acl",
		Calendar: "calendars/{calendarId}/",
		Event: "calendars/{calendarId}/events/{eventId}/"
	})
}


