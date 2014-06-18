/**
 * Service object that acts as intermediaries for services that perform CRUD operations on either App or Collection Mongo collections.
 * Use this service when querying for a combined list of App and Component objects.
 *
 * @module servicesModule
 * @submodule AppOrComponentModule
 * @requires amlApp.services
 */

'use strict';

/**
 * Performs querying and data modification on either App or Component objects.
 * The 'type' object attribute is used to differentiate between apps and components.
 *
 * @class AppOrComponentService
 * @static
 */ 

/**
 * @class AppOrComponentService
 * @constructor
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 * @param App {Object} an Angular-injected instance of {{#crossLink "AppService"}}{{/crossLink}}
 * @param Component {Object} an Angular-injected instance of {{#crossLink "ComponentService"}}{{/crossLink}}
 */
var AppOrComponentService = ['$q', 'App', 'Component', function($q, App, Component) {
    
    /**
     * Ozone configuration flag that determines whether AppsMall recognizes Component objects
     * @attribute {Boolean} AllowComponents
     * @private
     * @writeOnce
     */
    var AllowComponents = Ozone.config().getClientProperty('allowComponents');

    function setEmptySelectorToDefault(selector) {
        selector = selector || {};
        if (!AllowComponents && !selector.type) {
            selector.type = 'app';
        }
        return selector;
    }

    // See return object for documentation
    function getUri(app) { 
        return ('/AppsMall/Apps/' + app.shortname); 
    }

    // True for app objects, or false for component objects.
    function isApp(appOrComponent) {
        return (appOrComponent.type === 'app');
    }

    return {
        /**
         * @method save
         * @param appOrComponent {Object} an App or Component object to be saved:
         * @param appOrComponent.type {String} lower-case string that identifies whether to save an App or Component object.
         *        (Defaults to 'app' but using default is not recommended)
         * @param [context] {Object} an object context for Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes newly created/updated App or Component object as a parameter into then() callback
         */
        save: function(appOrComponent, context) { 
            return (isApp(appOrComponent) ? App.save(appOrComponent, context) : Component.save(appOrComponent, context));
        },
        /**
         * @method query
         * @param [selector] {Object} a list of attributes and values to be queried on; if empty all values will be returned.
         *        (Example: ```{shortname: 'Bob'}``` will query for all apps with shortname equal to 'Bob'.)
         * @param [selector.type] {String} lower-case string that identifies whether to query on only App or Component objects; defaults to query on both types.
         * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes query results as an array of App objects as a parameter into then() callback
         */
        query: function(selector, context) {
            selector = setEmptySelectorToDefault(selector);
            if (selector.type === 'app') {
                return App.query(selector, context);
            }
            else if (AllowComponents && (selector.type === 'component')) {
                return Component.query(selector, context);
            }
            // If designated type is empty and components are allowed, then query both and concatenate results
            else {
                var deferred = $q.defer();
                App.query(selector, context).then(function(appData) {
                    var appsAndComponents = appData;
                    Component.query(selector, context).then(function(componentData) {
                        appsAndComponents = appsAndComponents.concat(componentData);
                        deferred.resolve(appsAndComponents);
                    })
                });
                return deferred.promise;
            }
        },
        /**
         * @method get
         * @param selector {Object} an object containing the id and/or type to get
         * @param selector.id {String} the UUID (unique identifier) of the App object to get
         * @param [selector.type] {String} lower-case string that identifies whether to get an App or Component object; defaults to 'app'.
         * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes App object with matching id as a parameter into then() callback
         */
        get: function(selector, context) {
            selector = setEmptySelectorToDefault(selector);
            // allow both id field formats
            if (selector._id && !selector.id) {
                selector.id = selector._id;
            }
            // redirect to App or Component service method
            if (_.isObject(selector) && selector.id) {
                // default selector type to app
                selector.type = selector.type || 'app';
                if (selector.type === 'app') {
                    return App.get(selector.id, context);
                }
                else if (selector.type === 'component') {
                    return Component.get(selector.id, context);
                }
            }
            return $q.reject();
        },
        /**
         * @method delete
         * @param appOrComponent {Object} an App object to be deleted
         * @param appOrComponent.type {String} lower-case string that identifies whether to delete an App or Component object
         *        (Defaults to 'app' but using default is not recommended)
         * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes newly deleted App object as a parameter into then() callback
         */
        delete: function(appOrComponent, context) {
            return (isApp(appOrComponent) ? App.delete(appOrComponent, context) : Component.delete(appOrComponent, context));
        },
        /**
         * @method remove
         * @param appOrComponent {Object} an App object to be deleted
         * @param appOrComponent.type {String} lower-case string that identifies whether to delete an App or Component object
         *        (Defaults to 'app' but using default is not recommended)
         * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
         * @return {PromiseObject} that, when invoked, passes newly deleted App object as a parameter into then() callback
         */
        remove: function(appOrComponent, context) {
            return (isApp(appOrComponent) ? App.remove(appOrComponent, context) : Component.remove(appOrComponent, context));
        },
        /**
         * @method getUri
         * @param app {Object} an App object with a unique shortname
         * @return {String} the URI of the App object passed in
         */
        getUri: getUri,
        /**
         * @method AllowComponents
         * @return {Boolean} Ozone configuration flag that determines whether AppsMall recognizes Component objects
         */
        AllowComponents: AllowComponents
    };
}];

servicesModule.factory('AppOrComponent', AppOrComponentService);
