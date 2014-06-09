'use strict';

servicesModule.factory('Review', function($q) {
    return {
        get: function(appid, username, context) {
            var deferred = $q.defer();
            Ozone.Service("AppsMall").getReviews(appid, username, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
        submit: function(app, ratingAsNumber, username, reviewText, context) {
            var deferred = $q.defer();
            Ozone.Service("AppsMall").addReview(app, ratingAsNumber, username, reviewText, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
        getRatings: function() {
            return [{
                rating: 1,
                name: "Hate"
            }, {
                rating: 2,
                name: "Dislike"
            }, {
                rating: 3,
                name: "It's OK"
            }, {
                rating: 4,
                name: "Good"
            }, {
                rating: 5,
                name: "Great!"
            }];
        }
    };
});
