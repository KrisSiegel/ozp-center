/**
 * Service object for getting and submitting user reviews
 *
 * @module AppsMallUI.servicesModule
 * @submodule AppsMallUI. ReviewModule
 * @requires amlApp.services
 */

'use strict';

/**
 * @class AppsMallUI. ReviewService
 * @static
 */ 

/**
 * @class AppsMallUI. ReviewService
 * @constructor
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 */
var ReviewService = ['$q', function($q) {
    return {
        /**
         * @method get
         * @param appid {String} the UUID (unique identifier) of the App object to query for reviews
         * @param [username] {String} The username as defined in the Persona object (Persona.username)
         *        If empty, then this parameter designates "all users"
         * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes a single-element Review array matching the appid and username into then() callback.
         *         If username is empty, then all Reviews with matching appid are passed in.
         *         If no review exists for the appid and/or user passed in, then an empty array is passed in.
         */
        get: function(appid, username, context) {
            var deferred = $q.defer();
            Ozone.Service("AppsMall").getReviews(appid, username, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
        /**
         * @method submit
         * @param app {String} the app that this review is being submitted for
         * @param ratingAsNumber {Number} the numerical rating, in stars.  Must match one of the values in the return value of getRatings
         * @param username {String} The username as defined in the Persona object (Persona.username)
         * @param reviewText {String} The text body of the review to be submitted
         * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes the newly created Review object into then() callback.
         */
        submit: function(app, ratingAsNumber, username, reviewText, context) {
            var deferred = $q.defer();
            Ozone.Service("AppsMall").addReview(app, ratingAsNumber, username, reviewText, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
        /**
         * Static list of all star ratings and descriptions
         * @method getRatings
         * @return {Array} list of all star ratings and descriptions
         */
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
}];

servicesModule.factory('Review', ReviewService);
