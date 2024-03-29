/**
 * Service object for performing search operations on apps, components, and tags.
 *
 * @module AppsMallUI.servicesModule
 * @submodule AppsMallUI.SearchModule
 * @requires amlApp.services
 */

'use strict';

/**
 * @class AppsMallUI.SearchService
 * @static
 */ 

/**
 * @class AppsMallUI.SearchService
 * @constructor
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 * @param AppOrComponent {Object} an Angular-injected instance of {{#crossLink "AppsMallUI.AppOrComponentService"}}{{/crossLink}}
 * @param Tag {Object} an Angular-injected instance of {{#crossLink "AppsMallUI.TagService"}}{{/crossLink}}
 */
var SearchService =  ['$q', 'AppOrComponent', 'Tag', function($q, AppOrComponent, Tag) {

    /**
     * Performs query to retrieve apps (or components) as search results.
     * @method appOrComponentSearch
     * @private
     * @param searchTerm {String} name search string.  This method will query for all names that start with this search string.
     * @param searchType {String} must equal 'app' or 'component'; identifies whether to search on Apps or Components
     * @param isAutocomplete {Boolean} determines whether a standard or autocomplete search is being performed.
     * @return {PromiseObject} that, when invoked, passes search results as a parameter into then() callback.
     *          Search results are represented as an array of App objects if isAutocomplete is false, or an array of app names if isAutocomplete is true.
     */
    var appOrComponentSearch = function(searchTerm, searchType, isAutocomplete) {
        if (_.contains(['app', 'component'], searchType)) {
            return AppOrComponent.query({
                type: searchType,
                name: searchTerm,
                autocomplete: isAutocomplete
            });
        }
        else {
            return $q.reject();
        }
    };

    // See return object for documentation
    var nameSearch = function(searchTerm, searchType) {
        if (AppOrComponent.AllowComponents) {
            if ((searchType || '').startsWith('app')) {
                return appOrComponentSearch(searchTerm, 'app', true).then(function(result) {
                    JSON.stringify('+S search = ' + searchTerm + ', name result = ' + result)
                    return {apps: result};
                });
            }
            else if ((searchType || '').startsWith('component')) {
                return appOrComponentSearch(searchTerm, 'component', true).then(function(result) {
                    return {components: result};
                });
            }
            else {
                return $q.all([appOrComponentSearch(searchTerm, 'app', true), appOrComponentSearch(searchTerm, 'component', true)])
                         .then(function(results) {
                             // checking if results length matches promise array length
                             if (results.length === 2) {
                                 return {apps: results[0], components: results[1]};
                             }
                             return {};
                         });
            }
        }
        else {
            // return only app search, in same object format as standard nameSearch() call that searches apps and components.
            var deferred = $q.defer();
            appOrComponentSearch(searchTerm, 'app', true).then(function(result) {
                JSON.stringify('+S search = ' + searchTerm + ', name result = ' + result)
                deferred.resolve({ apps: result });
            });
            return deferred.promise;
        }
    }

    // See return object for documentation
    var appAndTagNameSearch = function(searchTerm, searchType) {
        return nameSearch(searchTerm, searchType).then(function(appsAndComponentResultObj) {
            return Tag.searchTagsByNameSubstring(searchTerm).then(function(tagResults) {
                var uniqueTagNames = _(tagResults).pluck('tag').uniq().value();
                return Ozone.extend(appsAndComponentResultObj, {tags: uniqueTagNames});
            });
        });
    };

    return {
        /**
         * Performs query to retrieve apps as search results.
         * @method appSearch
         * @param searchTerm {String} name search string.  This method will query for all names that start with this search string.
         * @return {PromiseObject} that, when invoked, passes an array of App objects with matching the search term into then() callback.
         */
        appSearch: function(searchTerm) {
            return appOrComponentSearch(searchTerm, 'app', false);
        },
        /**
         * Performs query to retrieve components as search results.
         * @method componentSearch
         * @param searchTerm {String} name search string.  This method will query for all names that start with this search string.
         * @return {PromiseObject} that, when invoked, passes an array of Component object query results into then() callback.
         */
        componentSearch: function(searchTerm) {
            return appOrComponentSearch(searchTerm, 'component', false);
        },
        /**
         * Performs query to retrieve app names as search results, where app names match the beginning of the search term passed in.
         * @method appNameSearch
         * @param searchTerm {String} name search string.  This method will query for all names that start with this search string.
         * @return {PromiseObject} that, when invoked, passes an array of app names into then() callback.
         */
        appNameSearch: function(searchTerm) {
            return appOrComponentSearch(searchTerm, 'app', true);
        },
        /**
         * Performs query to retrieve component names as search results, where component names match the beginning of the search term passed in.
         * @method componentNameSearch
         * @param searchTerm {String} name search string.  This method will query for all names that start with this search string.
         * @return {PromiseObject} that, when invoked, passes an array of component names into then() callback.
         */
        componentNameSearch: function(searchTerm) {
            return appOrComponentSearch(searchTerm, 'component', true);
        },
        /**
         * Performs search on app and/or component names
         * @method nameSearch
         * @param searchTerm {String} name search string.  This method will query for all names that start with this search string.
         * @param [searchType] {String} 'app' or 'apps' indicates App name serach; 'component' or 'components' indicates Component name search.
         *        If empty, this method will search on both apps and components.
         * @return {PromiseObject} that, when invoked, passes an object of the form ```apps: <app name array>, components: <component name array>``` into the then() callback.
         */
        nameSearch: nameSearch,
        /**
         * Performs search on app, component, and tag names
         * @method appAndTagNameSearch
         * @param searchTerm {String} name search string.  This method will query for all names that start with this search string.
         * @param searchType {String} 'app' or 'apps' indicates App + Tag name serach; 'component' or 'components' indicates Component + Tag name search
         *        If empty, this method will search on both Apps, Components, and Tags.
         * @return {PromiseObject} that, when invoked, passes an object of the form ```apps: <app name array>, components: <component name array>, tags: <tag name array>``` into the then() callback.
         */
        appAndTagNameSearch: appAndTagNameSearch
    };
}];

servicesModule.factory('Search', SearchService);
