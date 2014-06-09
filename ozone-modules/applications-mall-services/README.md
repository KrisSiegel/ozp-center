ozp-aml-api
===========

##REST API
The following REST URLs have been implemented so far:

(/aml/api/v1  is assumed )
Get all apps belonging to Group A  // app svc
    GET /app/grouping/A

Get first N apps by rating  // app svc 
	GET /app?sort=rating&limit=N
Get next N apps by rating
	GET /app?sort=rating&skip=N&limit=N
Rate an App          // app mall svc
	POST /app/rate/<app_id>
		body: {
			rating: 5
		}

The following URLs have not been implemented:

Submit an App      // app svc
submitter chooses group and category?
	PUT /app
		body: {
			name: "My Awesome App",
			category: "Social",
			components: {
				:
				:
			}
		}

Favorite an App  //  ?????