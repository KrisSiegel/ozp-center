/**
 * Service object for performing CRUD operations on Component Mongo collection
 *
 * @module servicesModule
 * @submodule ComponentModule
 * @requires amlApp.services
 */

'use strict';

/**
 * Performs querying and data modification on Component objects
 *
 * @class ComponentService
 * @static
 */ 

/**
 * @class ComponentService
 * @constructor
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 */
var ComponentService = ['$q', function($q) {

    // return resource object if AppsMall uses components, or an empty object if AppsMall does not use components
    if (Ozone.config().getClientProperty('allowComponents')) {
        return {
            /**
             * @method save
             * @param component {Object} an Component object to be saved
             * @param [context] {Object} an object context for Ozone API call.  Uses Ozone API context if not defined.
             * @return Angular promise that returns newly created/updated Component object in then() callback
             */
            save: function(component, context) { 
                var deferred = $q.defer();
                // call save function (create or update, depending on whether _id exists)
                if (component._id) {
                    Ozone.Service("Components").update(component, function() {
                         deferred.resolve.apply(this, arguments);
                    }, context);
                }
                else {
                    Ozone.Service("Components").create(component, function() {
                         deferred.resolve.apply(this, arguments);
                    }, context);
                }
                return deferred.promise;
            },
            /**
             * @method query
             * @param [selector] {Object} a list of attributes and values to be queried on; if empty all values will be returned.
             *                 (Example: ```{shortname: 'Bob'}``` will query for all components with shortname equal to 'Bob'.)
             * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
             * @return Angular promise that returns query results as an array of Component objects in then() callback
             */
            query: function(selector, context) {
                var deferred = $q.defer();
                Ozone.Service("Components").query((selector || {}), function() {
                    deferred.resolve.apply(this, arguments);
                }, context);
                return deferred.promise;
            },
            /**
             * @method get
             * @param id {String} the UUID (unique identifier) of the Component object to delete
             * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
             * @return Angular promise that returns Component object with id equal to parameter in then() callback
             */
            get: function(id, context) { 
                var deferred = $q.defer();
                Ozone.Service("Components").get(id, function() {
                    deferred.resolve.apply(this, arguments);
                }, context);
                return deferred.promise;
            },
            /**
             * @method delete
             * @param component {Object} an Component object to be deleted
             * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
             * @return Angular promise that returns newly deleted Component object in then() callback
             */
            delete: function(component, context) { 
                var deferred = $q.defer();
                Ozone.Service("Components").delete(component, function() {
                    deferred.resolve.apply(this, arguments);
                }, context);
                return deferred.promise;
            },
            /**
             * @method remove
             * @param component {Object} an Component object to be deleted
             * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
             * @return Angular promise that returns newly deleted Component object in then() callback
             */
            remove: function(component, context) { 
                var deferred = $q.defer();
                Ozone.Service("Components").delete(component, function() {
                    deferred.resolve.apply(this, arguments);
                }, context);
                return deferred.promise;
            }
        };
    }
    else {
        return {
            // see save method in (allowComponents) section above
            save: function(component, context) { 
                return $q.reject();
            },
            // see query method in (allowComponents) section above
            query: function(selector, context) {
                var deferred = $q.defer();
                deferred.resolve([]);
                return deferred.promise;
            },
            // see get method in (allowComponents) section above
            get: function(id, context) { 
                return $q.reject();
            },
            // see delete method in (allowComponents) section above
            delete: function(component, context) { 
                return $q.reject();
            },
            // see remove method in (allowComponents) section above
            remove: function(component, context) { 
                return $q.reject();
            }
        };
    }
}];

servicesModule.factory('Component', ComponentService);
