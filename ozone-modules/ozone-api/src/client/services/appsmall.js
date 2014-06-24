Ozone.Service("AppsMall", (function () {
	return {
		getServicePath: function () {
			return Ozone.utils.murl("apiBaseUrl", "/aml/", 'servicesHost');
		},
		export: function (callback) {
			Ozone.Service("Exporter").exportService("AppsMall", callback);
		},
		getReviews: function (appId, username, callback, context) {
			var user = username;

			if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) {
				context = callback;
				callback = username;
				user = null;
			}

			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(appId) || Ozone.utils.isFunction(appId)) {
            	throw "No app id defined";
            }

			var queryObj = {};
			if (appId) {
				queryObj.appid = appId;
			}
			if (user) {
				queryObj.user = user;
			}

			var url = this.getServicePath() + "reviews";

			Ozone.ajax({
				method: "GET",
				url: url,
				query: queryObj,
				success: function (status, response) {
					Ozone.logger.debug("AppsMall.get-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("AppsMall.get-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
		addReview: function (app, ratingAsNumber, username, reviewText, callback, context) {
			if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) {
				context = callback;
				callback = reviewText;
			}

			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (!Ozone.utils.isObject(app)) {
            	throw "No app defined";
            }
			if (Ozone.utils.isUndefinedOrNull(ratingAsNumber)) {
            	throw "No ratingAsNumber defined";
            }
			if (Ozone.utils.isUndefinedOrNull(username)) {
            	throw "No username defined";
            }

			var reviewObj = {
                action: "rate",
                appid: app._id,
                appVersion: app.version,
                starRating: ratingAsNumber,
                user: username
            };

			if (!Ozone.utils.isFunction(reviewText)) {
				reviewObj.reviewText = reviewText;
			}

			var url = this.getServicePath() + "review/";
			Ozone.ajax({
				method: "POST",
				url: url,
				data: reviewObj,
				success: function (status, response) {
					Ozone.logger.debug("AppsMall.addReview-->success");
					callback.apply((context || this), [response]);
				},
				error: function (status, response) {
					Ozone.logger.debug("AppsMall.addReview-->error, status: " + status);
					callback.apply((context || this), [response]);
				},
				context: (context || this)
			});
		},
	};
}()));
