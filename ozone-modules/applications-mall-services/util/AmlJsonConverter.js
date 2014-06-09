var fs = require('fs');

// Set up variables.
var oldJson = require ('./results.json'),
	newRecords = [],
	records = oldJson.serviceItems,
	l = records.length,
	i = 0;

// Convert on a field-by-field basis from original metadata to new structure.
for (i; i < l; i++) {
	var r = {};
	r.name = records[i].title;
	r.version = records[i].versionName;
	r.lifeCycleState = 'prod';
	r.accessible = records[i].isEnabled;;
	r.users = Math.floor((Math.random()*25000)+1);
	r.rating = Math.floor((Math.random()*5)+1);
	r.ratings = Math.floor((Math.random()*r.users)+1);
	r.description = records[i].description;
	r.organization = 'Home';
	r.createdOn = records[i].createdDate;
	r.updatedOn = records[i].lastActivity.activityDate;
	r.icon = records[i].imageLargeUrl.replace('https://www.owfgoss.org/demodata', 'http://localhost/aml/img');
	r.documentationUrl = records[i].docUrl;
	r.largePhoto = '/img/largeScreenshot.png';
	r.smallPhoto = '/img/smallScreenshot.png';
	newRecords.push(r);
}

// Write the new results to a file.
fs.writeFile('./injectableAppRecords.json', JSON.stringify({injectableAppRecords: newRecords}, null, 4), function(err) {
	if(err) {
		console.log(err);
	}
	else {
		console.log("JSON saved to injectableAppRecords.json");
	}
});