/**
 * Service object for performing CRUD operations on App Mongo collection
 *
 * @module servicesModule
 * @submodule AppModule
 * @requires amlApp.services
 */

'use strict';

/**
 * Performs querying and data modification on App objects
 *
 * @class AppService
 * @static
 */ 

/**
 * @class AppService
 * @constructor
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 */
var AppService = ['$q', function($q) {
    return {
        /**
         * @method save
         * @param app {Object} an App object to be saved
         * @param [context] {Object} an object context for Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes newly created/updated App object as a parameter into then() callback
         */
        save: function(app, context) { 
            var deferred = $q.defer();
            // call save function (create or update, depending on whether _id exists)
            if (app._id) {
                Ozone.Service("Apps").update(app, function() {
                     deferred.resolve.apply(this, arguments);
                }, context);
            }
            else {
                Ozone.Service("Apps").create(app, function() {
                     deferred.resolve.apply(this, arguments);
                }, context);
            }
            return deferred.promise;
        },
        /**
         * @method query
         * @param [selector] {Object} a list of attributes and values to be queried on; if empty all values will be returned.
         *                 (Example: ```{shortname: 'Bob'}``` will query for all apps with shortname equal to 'Bob'.)
         * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes query results as an array of App objects as a parameter into then() callback
         */
        query: function(selector, context) {
            var deferred = $q.defer();
            Ozone.Service("Apps").query((selector || {}), function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
        /**
         * @method get
         * @param id {String} the UUID (unique identifier) of the App object to delete
         * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes App object with matching id as a parameter into then() callback
         */
        get: function(id, context) { 
            var deferred = $q.defer();
            Ozone.Service("Apps").get(id, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
        /**
         * @method delete
         * @param app {Object} an App object to be deleted
         * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes newly deleted App object as a parameter into then() callback
         */
        delete: function(app, context) {
            var deferred = $q.defer();
            Ozone.Service("Apps").delete(app, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        },
        /**
         * @method remove
         * @param app {Object} an App object to be deleted
         * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes newly deleted App object as a parameter into then() callback
         */
        remove: function(app, context) {
            var deferred = $q.defer();
            Ozone.Service("Apps").delete(app, function() {
                deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        }
    };
}];

servicesModule.factory('App', AppService);
