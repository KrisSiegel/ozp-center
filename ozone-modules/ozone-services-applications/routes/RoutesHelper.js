var async = require('async'),
    logger,
    Ozone,
    Persistence,
    TaggingService,
    appSearchResultsMap, // from searchApps method results -- key: app._id, value: app
    constants = require('../constants'),
    appsStore = constants.database.store.apps,
    appCollection = constants.database.collection.app,
    componentCollection = constants.database.collection.component;

module.exports.init = function (OzoneObj) {
    Ozone = OzoneObj;
    logger = Ozone.logger;

    logger.debug("RoutesHelper(AppsService)-->in init()");
    Ozone.Service().on("ready", "Persistence", function() {
        Persistence = Ozone.Service('Persistence');
        Ozone.Service().on("ready", constants.TaggingService, function() {
            TaggingService = Ozone.Service(constants.TaggingService);
            TaggingService.init(Ozone);
        })
    });
    return this;
};

module.exports.getOne = function (collectionName, req, res, next) {
    var id = req.params.id;

    logger.debug("RoutesHelper(AppsService)-->in getOne(" + collectionName + "), id: " + id);

    Persistence.Store(appsStore).Collection(collectionName).get(id, function (err, result) {
        if (err) {
            logger.error('Error getting ' + appCollectionName + ': ' + err);
            res.send({
                'error': 'An error has occurred - ' + err
            });
            return next(err);
        }

        Ozone.Routing.helpers.send(req, res, result, ((((result || [])[0] || { }).shortname || "application") + ".json"));
    });
};

module.exports.get = function (collectionName, req, res) {
    logger.debug("RoutesHelper(AppsService)-->in get(" + collectionName + ")");
    var appSearchParams = {};

    // check if we are doing a name search by checking if query params exist
    // for example, URL: http://localhost:3000/api/apps/app?q=Mail
    // 					 	has the query param of q=Mail
    if (req.query.q) {
    	// uses Mongo Text Search. Searches the name, shortname, description, descriptionShort fields.
        appSearchParams["name"] = "\"" + req.query.q + "\"";
    }

    if (req.query.shortname) {
        appSearchParams["shortname"] = req.query.shortname;
    }

    if (req.query.workflowState) {
        appSearchParams["workflowState"] = req.query.workflowState;
    }

    // Use regex for autocomplete searches for now.
    // Note that this doesn't use indexes so it will be slow;
    // 		so when Mongo's Text Search feature gets wild card search capability, maybe use that.
    if (req.query.autocomplete) {
        appSearchParams["name"] = {
            "$regex": '^' + req.query.q,
            "$options": "i"
        }; // case insensitive
    }

    logger.debug("RoutesHelper(AppsService)-->GET-->appSearchParams: " + JSON.stringify(appSearchParams));

    findElements(collectionName, req, res, appSearchParams);
};

module.exports.post = function (collectionName, req, res, next) {
    var item = req.body;

    logger.debug("RoutesHelper(AppsService)-->in post(" + collectionName + "), body: " + JSON.stringify(item));

    Persistence.Store(appsStore).Collection(collectionName).set(null, item, function (err, result) {
        if (err) {
            logger.error('Error creating ' + appCollectionName + ': ' + err);
            res.send({
                'error': 'An error has occurred - ' + err
            });
            return next(err);
        }

        //logger.debug("'post' result: " + JSON.stringify(result));
        res.send(result);
    });
};

module.exports.put = function (collectionName, req, res, next) {
    var id = req.params.id,
        item = req.body;

    logger.debug('RoutesHelper(AppsService)-->in put(' + collectionName + '), Updating id: ' + id + ', with item: ' + JSON.stringify(item));

    Persistence.Store(appsStore).Collection(collectionName).set(id, item, function (err, result) {
        if (err) {
            logger.error('Error updating ' + appCollectionName + ': ' + err);
            res.send({
                'error': 'An error has occurred - ' + err
            });
            return next(err);
        }

        //logger.debug("'put' result: " + JSON.stringify(result));
        res.send(result);
    });
};

module.exports.delete = function (collectionName, req, res, next) {
    var id = req.params.id;

    logger.debug("RoutesHelper(AppsService)-->in delete(" + collectionName + "), id: " + id);

    Persistence.Store(appsStore).Collection(collectionName).remove(id, function (err, result) {
        if (err) {
            logger.error('Error deleting ' + appCollectionName + ': ' + err);
            res.send({
                'error': 'An error has occurred - ' + err
            });
            return next(err);
        }

        //logger.debug("'delete' result: " + JSON.stringify(result));
        res.send(result);
    });
};

/* Helper for searching elements in the database
 */
var findElements = function (collectionName, req, res, appSearchParams) {
    var options = {}; // for sort, skip, limit
    if (req.query.sort) {
    	var sortObj = Ozone.Utils.convertStringToObject(req.query.sort);
    	options.sort = sortObj !== undefined ? sortObj : req.query.sort;
    }

    if (req.query.skip) options.skip = parseInt(req.query.skip);
    if (req.query.limit) options.limit = parseInt(req.query.limit);

    logger.debug("RoutesHelper(AppsService)-->GET-->findElements-->options: " + JSON.stringify(options));

    appSearchResultsMap = {};

    if (!req.query.autocomplete && (!Ozone.Utils.isEmptyObject(appSearchParams) || req.query.tag)) {
        if (!Ozone.Utils.isEmptyObject(appSearchParams)) {
            searchApps(collectionName, options, req, res, appSearchParams);
        } else {
        	searchExactTags(collectionName, options, req, res);
        }
    } else { // get all or search by autocomplete
    	allOrAutocompleteSearch(collectionName, options, req, res, appSearchParams);
    }
};

// Using Mongo's "aggregation" or "find"
var allOrAutocompleteSearch = function(collectionName, options, req, res, appSearchParams) {
	// if we have search params, use aggregation
	if (!Ozone.Utils.isEmptyObject(appSearchParams)) {
		// When there are multiple results with the same string/position, results should be returned in descending average rating sequence (see requirement UI-20).
		var aggregationArray = [{ $match: appSearchParams },
		                        { $sort: { rating: -1 }
		                        }];

		if (Persistence.Store(appsStore).Collection(collectionName).isImplemented("aggregate")) {
			Persistence.Store(appsStore).Collection(collectionName).aggregate(aggregationArray, function (err, result) {
		    	allOrAutocompleteCallback(req, res, err, result);
		    });
		} else {
			Persistence.Store(appsStore).Collection(collectionName).query(appSearchParams, options, function (err, result) {
				allOrAutocompleteCallback(req, res, err, result);
		    });
		}

	} else { // get all
		Persistence.Store(appsStore).Collection(collectionName).query(appSearchParams, options, function (err, result) {
			allOrAutocompleteCallback(req, res, err, result);
	    });
	}

}

var allOrAutocompleteCallback = function(req, res, err, result) {
	if (err) {
        logger.error("Error occurred while searching with mongo - req.query: " + req.query + " err: " + err);
        res.send("Error occurred while searching - req.query: " + req.query + " err: " + err);
        return;
    }

    var elements = result;

    logger.debug("RoutesHelper(AppsService)-->GET (Mongo's find/aggregation)-->result: " + JSON.stringify(result, null, 3));
    logger.debug("RoutesHelper(AppsService)-->GET (Mongo's find/aggregation)-->Found " + elements.length + " elements.");

    // for autocomplete results, just return the app names.
    var names = [];
    if (req.query.autocomplete) {
        for (var element in elements) {
        	if (elements.hasOwnProperty(element)) {
        		names.push(elements[element].name);
        	}
        }
        elements = names;
    }

    Ozone.Routing.helpers.send(req, res, elements);
}

/* Helper for searching apps in the "apps" database's app collection, or components in the component collection.
 */
var searchApps = function (collectionName, options, req, res, appSearchParams) {

	if (appSearchParams.name) {
		options.type = 'TextSearch';
		options.filter = options.filter || {};

		if (appSearchParams.shortname) {
			options.filter.shortname = appSearchParams.shortname;
		}
	}

    Persistence.Store(appsStore).Collection(collectionName).query(appSearchParams, options, function (err, result) {
        if (err) {
            logger.error("Error occurred while searching with Mongo - req.query: " + req.query + " err: " + err);
            res.send("Error occurred while searching - req.query: " + req.query + " err: " + err);
            return;
        }
        var elements = result;

        for (var i = 0; i < elements.length; i++) {
        	var app = elements[i];
        	appSearchResultsMap[app._id] = app;
        }

        if (req.query.tag) {
            logger.debug("RoutesHelper(AppsService)-->GET-->searched for apps, now also search for exact tags.");
            searchExactTags(collectionName, options, req, res, elements);
        } else if (appSearchParams.name) {
        	logger.debug("RoutesHelper(AppsService)-->GET-->searched for apps, now also search for tags.");
        	searchTagsFromQueryParam(collectionName, options, req, res, elements, appSearchParams);
        } else {
            logger.debug("RoutesHelper(AppsService)-->GET (searchApps)-->Found " + elements.length + " elements.");
            Ozone.Routing.helpers.send(req, res, elements);
        }
    });
};

var getURI = function(collectionName) {
	var uri = '/AppsMall/';

	if (collectionName == appCollection) {
		uri += 'Apps';
	} else if (collectionName == componentCollection) {
		uri += 'Components';
	}

	return uri;
};

/* Helper for searching tags in the 'tags' database
 */
var searchTagsFromQueryParam = function (collectionName, options, req, res, appRecords, appSearchParams) {
	// set up parameters for tags Text Search
	var uri = getURI(collectionName);
    var searchURI = "\"" +  uri + "\"";

    var textSearchParams = {
    		tag: searchURI + " " + appSearchParams.name
    	},
        textSearchOptions = {
            type: 'TextSearch'
        };

    logger.debug("RoutesHelper(AppsService)-->searchTagsFromQueryParam-->textSearchParams: " + JSON.stringify(textSearchParams));

    // search tags
    callTaggingService(textSearchParams, textSearchOptions, collectionName, options, req, res, uri, appRecords);
};

var callTaggingService = function(textSearchParams, textSearchOptions, collectionName, options, req, res, uri, appRecords) {
	TaggingService.tag.query(textSearchParams, textSearchOptions, function (err, results) {
    	if (err) {
            logger.error("RoutesHelper(AppsService)-->searchTagsFromQueryParam-->Error occurred while searching with Mongo's Text Search - req.query: " + req.query + " err: " + err);
            res.send("Error occurred while searching - req.query: " + req.query + " err: " + err);
            return;
        }

    	if (!req.query.tag) {
    		// if we have any tags returned, look up the apps for those tags
    		if (results.length > 0) {
    			logger.debug("RoutesHelper(AppsService)-->Get-->Found tags: " + results.length + " elements.");
    			getAppTagMap(results, uri, function (err, appTagMap) {

        			// also need to do an app search to return the actual app objects in the search results.
                    lookupApps(collectionName, options, req, res, appRecords, appTagMap);
                });
    		} else {
    			logger.debug("RoutesHelper(AppsService)-->Get-->Didn't find any tags. App Search  (Mongo's Text Search)-->Found " + appRecords.length + " elements.");
                Ozone.Routing.helpers.send(req, res, appRecords);
    		}
    	} else {
    		processExactTagSearchResults(collectionName, options, req, res, uri, results, appRecords);
    	}

	});
};

/* Helper for searching exact tags in the 'tags' database
 */
var searchExactTags = function (collectionName, options, req, res, appRecords) {
    // set up parameters for tags Text Search
	var uri = getURI(collectionName);
    var searchURI = "\"" +  uri + "\"";

    var textSearchParams = {
    		tag: searchURI
    	},
    	tagsArray = req.query.tag.split(','),
        textSearchOptions = {
            type: 'TextSearch',
            filter: {
            	'tag': {
                    $in: tagsArray
                }
            }
        };

    logger.debug("RoutesHelper(AppsService)-->searchExactTags-->textSearchParams: " + JSON.stringify(textSearchParams) +
    				" options: " + JSON.stringify(textSearchOptions));

    // search tags
    callTaggingService(textSearchParams, textSearchOptions, collectionName, options, req, res, uri, appRecords);
};

/* Helper to process tag search results
 */
var processExactTagSearchResults = function (collectionName, options, req, res, uri, tags, appRecords) {
    if (tags.length > 0) {
        logger.debug("RoutesHelper(AppsService)-->GetByTag/URI-->tags.length: " + tags.length);

        // appTagMap holds app/component shortname as key, tags as value.

        getAppTagMap(tags, uri, function (err, appTagMap) {
            // if we already did a search for app, combine that with our tag search results.
            // put the matching tags in the appRecords
            if (appRecords !== undefined) {
                updateAppRecords(appRecords, appTagMap);

                logger.debug("RoutesHelper(AppsService)-->GetByTag/URI (Mongo's Text Search)-->Found " + appRecords.length + " elements.");
                Ozone.Routing.helpers.send(req, res, appRecords);
            } else {
                // also need to do an app search to return the actual app objects in the search results.
                lookupApps(collectionName, options, req, res, appRecords, appTagMap);
            }
        });

    } else {
        // reset appRecords since we didn't find any matching tags
    	appRecords = [];

        logger.debug("RoutesHelper(AppsService)-->Didn't find exact tags. GetByTag/URI (Mongo's Text Search)-->Found " + appRecords.length + " elements.");
        Ozone.Routing.helpers.send(req, res, appRecords);
    }
};

/* Helper for looking up apps or components in the database for the tags in appTagMap
 */
var lookupApps = function (collectionName, options, req, res, appRecords, appTagMap) {
    // get all the app shortnames from the tags' URIs -- iterate through appTagMap
    var appShortNameList = Object.keys(appTagMap);
    logger.debug("RoutesHelper(AppsService)-->lookupApps-->appTagMap's appShortNameList: " + appShortNameList);

    options = undefined;

    var searchParam = {
        shortname: {
        	$in: appShortNameList
        }
    };

    Persistence.Store(appsStore).Collection(collectionName).query(searchParam, options, function (err, result) {
        if (err) {
            logger.error("RoutesHelper(AppsService)-->Error occurred while searching with Mongo's Text Search - req.query: " + req.query + " err: " + err);
            res.send("Error occurred while searching - req.query: " + req.query + " err: " + err);
            return;
        }

        if (!req.query.tag) {
    		// add these to appRecords if it's not already there
        	logger.debug("RoutesHelper(AppsService)-->lookupApps-->got " + result.length + " apps with those shortnames");
    		for (var i = 0; i < result.length; i++) {
                var app = result[i];

                if (appSearchResultsMap[app._id] === undefined) {
                	appRecords.push(app);
                	appSearchResultsMap[app._id] = app;
                	logger.debug("RoutesHelper(AppsService)-->lookupApps-->pushed app " + app.name + " to appRecords array.");
                } else {
                	logger.debug("RoutesHelper(AppsService)-->lookupApps-->already has app " + app.name + " in appRecords array.");
                }
    		}
    	} else {
    		appRecords = result; // sets to empty array if there are no results
    		logger.debug("RoutesHelper(AppsService)-->lookupApps-->set appRecords array.");
    	}

        // loop through the app records and put tags in them.
        for (var i = 0; i < appRecords.length; i++) {
            var app = appRecords[i];

            app.tags = appTagMap[app.shortname];
        }

        logger.debug("RoutesHelper(AppsService)-->GetByTag-->App Search  (Mongo's Text Search)-->Found " + appRecords.length + " elements.");
        Ozone.Routing.helpers.send(req, res, appRecords);
    });

};

/* Helper for adding tags to app/component records, or
 * removes app/component records if there are no matching tags.
 */
var updateAppRecords = function (appRecords, appTagMap) {
	logger.debug("RoutesHelper(AppsService)-->GetByTag/URI-->updateAppRecords-->appRecords.length: " + appRecords.length);
    // start from the end so we can remove while looping
    for (var j = appRecords.length - 1; j >= 0; j--) {
        var app = appRecords[j];

        logger.debug("RoutesHelper(AppsService)-->GetByTag/URI-->updateAppRecords-->app: " + app);
        if (app) {
            logger.debug("RoutesHelper(AppsService)-->GetByTag/URI-->updateAppRecords-->app/component shortName: " + app.shortname);

            if (appTagMap[app.shortname]) {
                logger.debug("RoutesHelper(AppsService)-->GetByTag/URI-->found app/component in appTagMap");
                app.tags = appTagMap[app.shortname];
            } else {
                logger.debug("RoutesHelper(AppsService)-->GetByTag/URI-->did not find app/component in appTagMap so removing it");
                appRecords.splice(j, 1);
            }
        }

    }
};

/* Helper for getting a map of:
 * key: app/component shortname
 * value: tags
 */
var getAppTagMap = function (tags, uri, callback) {
    var appTagMap = {};

    function getAppTags(tagRecord, cb) {
        var tagURI = tagRecord.uri,
            appShortName = getAppShortNameFromURI(tagURI, uri),
            selector = {
                uri: "\"" + tagURI + "\""
            }, options = {
                type: 'TextSearch'
            };

        logger.debug("RoutesHelper(AppsService)-->getAppTags-->appTagMap[" + appShortName + "]: " + appTagMap[appShortName]);
        if (appTagMap[appShortName] === undefined) {
        	// get all tags related to this app using the URI. Note that this doesn't filter based on any other fields.
        	TaggingService.tag.query(selector, options, function (err, result) {
        		if (err) {
                    logger.error("RoutesHelper(AppsService)-->getAppTags-->Error occurred while searching with Mongo's Text Search - err: " + err);
                    return cb(err);
                }

                logger.debug("RoutesHelper(AppsService)-->getAppTags-->got " + appShortName + " tagURI: " + tagURI +  ", got tags: " + result);
                appTagMap[appShortName] = result;

                cb();
        	});
        } else {
        	cb();
        }
    }

    async.eachSeries(tags, getAppTags, function (err) {
        logger.debug("RoutesHelper(AppsService)-->appTagMap-->" + JSON.stringify(appTagMap, null, 3) );
        callback(err, appTagMap);
    });

};

/* Helper for getting the app name from the URI string.
 * for example, this returns "Gmail" from "AppsMall/Apps/Gmail"
 * In this case, the 'base' argument is AppsMall/Apps/
 */
var getAppShortNameFromURI = function (uri, base) {
    // use indexOf here for the start of 'base' instead of assuming that it starts at index 0
    var substringStartIndex = uri.indexOf(base) + base.length + 1;
    return uri.substring(substringStartIndex, uri.length);
};
