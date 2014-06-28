/**
 *  This file contains handlers for the "Application" entity, when the
 *  generic REST-to-mongo handler is, well, too generic.
 *  
 *  @module Ozone.Services.AppsMall
 *  @class Ozone.Services.AppsMall
 *  @submodule Server-Side
 */

var constants = require('./conf/constants'),
	appsStore = constants.database.store.apps,
	appsmallStore = constants.database.store.appsmall,
	appCollection = constants.database.collection.app,
	reviewCollection = constants.database.collection.review,
    Ozone = null,
    Persistence = null,
    logger = null;

/**
 * Initializes the Ozone API object
 * @method init
 * @param _ozone {Object} the Ozone API object
 */
exports.init = function(_ozone) {
	Ozone = _ozone;
	Persistence = Ozone.Service('Persistence');
	logger = Ozone.logger;
};

/**
 * Returns the app from the app id
 * @method getAppFromID
 * @param appId {String} The unique identifier for the app passed in
 * @param callback {Function} Method invoked with (```err, app```) parameters after app has been retrieved
 */
function getAppFromID = function(appId, callback) {
	Persistence.Store(appsStore).Collection(appCollection).get(appId, function(err, result) {
		if (err) {
			return callback({'error':'Error getting app with id ' + appId + ' err: ' + err});
		};

		if (result.length == 1) {
			var app = result[0]; // should only be one
			logger.debug("AppsMallService-->AppHandlers-->got app shortname: " + app.shortname);
			callback(null, app);
		} else {
			logger.debug('AppsMallService-->AppHandlers-->Could not find app with id ' + appId);
			callback({'error':'Could not find app with id ' + appId});
		}
	});
}

/**
 * 'updateAction' MongoDB collection 'update' method, with custom action, CORS enabled.
 *
 * @method updateAction
 * @param req {Object} Express request object -- will contain an "action" parameter
 * @param res {Object} Express results object
 */
exports.addReview = function(req, res) {
		var id = req.params.id || req.body.appid, update = req.body;
		getAppFromID(id, function (err, app) {
			if (err) {
				return res.send(err);
			}

			logger.debug("AppsMallService-->AppHandlers-->addReview-->updating review for app: " + app.shortname +
							", user: " + update.user + ", rating: " + update.rating);

			// need to save the rating to the 'review' collection for this app & user; insert a new review if it doesn't exist.
			var now = new Date();
			var selector = JSON.stringify({"app": app.shortname, "user": update.user}),
				updateObj = {
					"$set": {
						"starRating": update.starRating,
						"appVersion": update.appVersion,
						"dateModified": now,
						"reviewText": (update.reviewText || '')
					},
					"$setOnInsert": { "dateCreated": now }
				};
			Persistence.Store(appsmallStore).Collection(reviewCollection).set(selector, updateObj, function(err, result) {
				if (err) {
					return res.send({'error':'Could not update review for app: ' + app.shortname + ' user: ' + update.user +
										' with new rating: ' + update.rating + ', err: ' + err});
				};


				if (Persistence.Store(appsmallStore).Collection(reviewCollection).isImplemented("aggregate")) {
					aggregateDb(id, app, res);
				} else {
					updateDb(id, app, res);
				}

			});
		});
};

/**
 * Updates app to database and manually performs all auto-calculations on app fields (such as Average Rating)
 * @method updateDb
 * @param id {String} The unique identifier for the app passed in
 * @param app {Object} The app to be updated
 * @param res {Object} Express results object
 * @private
 */
var updateDb = function(id, app, res) {
	logger.debug("AppsMallService-->AppHandlers-->update manually");
	var selector = {
		app: app.shortname
	};
	Persistence.Store(appsmallStore).Collection(reviewCollection).query(selector, function(err, result) {
		if (err) {
			return res.send({'error':'Could not query existing reviews, err: ' + err});
		};

		var count = result.length;
		var sumRatings = 0;

		for (var i = 0; i < count; i++) {
			var review = result[i];

			sumRatings += review.starRating;
		}

		var average = sumRatings / count;
		app.ratings = count;
		app.rating = average;

		logger.debug("AppsMallService-->AppHandlers-->addReview-->After manual calculation, count: " + app.ratings + " average: " + app.rating);

		updateApp(id, app, res);
	});

};

/**
 * Updates existing app in database
 * @method updateApp
 * @param id {String} The unique identifier for the app passed in
 * @param app {Object} The app to be updated
 * @param res {Object} Express results object
 * @private
 */
var updateApp = function(id, app, res) {
	// update the app
	Persistence.Store(appsStore).Collection(appCollection).set(id, app, function(err, result) {
		if (err) {
			return res.send({'error':'Could not update app after updating reviews. err: ' + err});
		};
		logger.debug("AppsMallService-->AppHandlers-->addReview-->updated app count: " + result);
		res.send(result);
	});
};

/**
 * Performs all auto-calculations calculations on app fields (such as Average Rating) using an aggregation function, for increased performance
 * @method aggregateDb
 * @param id {String} The unique identifier for the app passed in
 * @param app {Object} The app to be updated
 * @param res {Object} Express results object
 * @private
 */
var aggregateDb = function(id, app, res) {
	logger.debug("AppsMallService-->AppHandlers-->running aggregation");

	// get the avg of ratings from all "review" documents for this app, and save that in the app.
	// use mongo's aggregation to get the count & average of ratings.
	var aggregationArray = [{ $match:{ "app": app.shortname} },
	                        { $group: {
	                        	_id: null,
	                        	count: { $sum: 1 },
	                        	average: { $avg: "$starRating" }
	                          }
	                        }];

	Persistence.Store(appsmallStore).Collection(reviewCollection).aggregate(aggregationArray, function(err, result) {
		if (err) {
			return res.send({'error':'Could not aggregate review while getting count and average, err: ' + err});
		};

		var aggregationResults = result;

		// the "aggregationResults" is an array that should contain only one element, which has "average" and "count" fields.
		app.ratings = aggregationResults[0].count;
		app.rating = aggregationResults[0].average;

		logger.debug("AppsMallService-->AppHandlers-->addReview-->After aggregation, count: " + app.ratings + " average: " + app.rating);

		updateApp(id, app, res);
	});
};

/**
 * Updates the Review records based on the ```action``` query parameter passed in
 * @method updateAction
 * @param req {Object} Express request object -- will contain an "action" parameter
 * @param res {Object} Express results object
 */
exports.updateAction = function(req, res) {
	var action = req.params.action;
	switch (action) {
	case "rate":
		exports.addReview.bind(this)(req, res);
		break;
	default:
		res.send({'error':'Unknown update action: ' + action});
	};
};

/**
 * Retrieves all Review records for the app whose ID matches the ```appid``` query parameter passed in
 * @method getReviews
 * @param req {Object} Express request object -- will contain an "action" parameter
 * @param res {Object} Express results object
 */
exports.getReviews = function(req, res) {
	var appid = req.query.appid;
	logger.debug('AppsMallService-->AppHandlers-->getReviews-->Getting reviews for appid: ' + appid);

	getAppFromID(appid, function(err, app) {
		if (err) {
			return res.send(err);
		}

		var findQuery = { app: app.shortname },
			user = req.query.user;
		if (user) findQuery["user"] = user;
		logger.debug("AppsMallService-->AppHandlers-->getReviews-->getting reviews for app shortname: " + app.shortname);

		// Rely on unique indexes to ensure this is not a dupe
		Persistence.Store(appsmallStore).Collection(reviewCollection).query(findQuery, function (err, result) {
			if (err) {
				logger.error('AppsMallService-->AppHandlers-->getReviews-->error: could not get reviews with appid ' + appid);
				return res.send({'error':'could not get reviews with appid ' + appid + ', err: ' + err});
			}

			var elements = result;
			logger.debug("AppsMallService-->AppHandlers-->getReviews-->Get Reviews-->Found " + elements.length + " records.");

			res.send(elements);
		});
	});
};
