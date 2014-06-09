Ozone.Service("AppsMall", (function () {
    return {
        getServicePath: function () {
            return Ozone.utils.murl("apiBaseUrl", "/aml/", true);
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

            //---  Ozone.ajax replacement code ---//
            Ozone.Service("Apps").get(appId, function(app) {
                // replace appid with actual app name for querying
                queryObj.app = app.shortname;
                delete queryObj.appid;
                var filteredReviewValues = Ozone.mockDb.query('Reviews', queryObj);
                if (filteredReviewValues) {
                    return callback.apply((context || this), [filteredReviewValues]);
                }
            }, context);
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

            //---  Ozone.ajax replacement code ---//

            // RWP: Review app name gets assigned to shortname in DB.
            reviewObj.app = app.shortname;

            var createdReview = Ozone.mockDb.create('Reviews', reviewObj);
            if (createdReview) {
                return callback.apply((context || this), [createdReview]);
            }
            //---  Ozone.ajax replacement code ---//
        },
    };
}()));
