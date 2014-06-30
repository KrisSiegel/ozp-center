/**
 * 
 *
 * @module AppsMallUI.servicesModule
 * @submodule AppsMallUI.AppSelectionMessageModule
 * @requires amlApp.services
 */

'use strict';

/**
 * @class AppsMallUI.AppSelectionMessageService
 * @static
 */ 

/**
 * @class AppsMallUI.AppSelectionMessageService
 * @constructor
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 * @param AppOrComponent {Object} an Angular-injected instance of {{#crossLink "AppsMallUI.AppOrComponentService"}}{{/crossLink}}
 * @param Tag {Object} an Angular-injected instance of {{#crossLink "AppsMallUI.TagService"}}{{/crossLink}}
 */
var AppSelectionMessageService = ['$q', 'AppOrComponent', 'Tag', function($q, AppOrComponent, Tag) {

    /**
     * Default categories used when loading the Home setting on the AppsMall main page.
     * @attribute HomeCategories
     * @writeOnce
     */
    var HomeCategories = ['Featured', 'New Arrivals', 'Most Popular'];

    /**
     * An object with categories as keys and corresponding sort functions as values.
     * @attribute AppSortCategories
     * @private
     * @writeOnce
     */
    var AppSortCategories = {};
    AppSortCategories['Featured'] = common.getDateSorterFunction('createdOn', true);
    AppSortCategories['New Arrivals'] = common.getDateSorterFunction('createdOn', true);
    AppSortCategories['Most Popular'] = common.getSorterFunction('launchedCount', 0, true);

    /**
     * An object with categories as keys and corresponding filtering functions (that return boolean values) as values.
     * All selections made on this category will be filtered by this function.
     * @attribute AppFilterCategories
     * @private
     * @writeOnce
     */
    var AppFilterCategories = {};
    AppFilterCategories['Featured'] = function(app) { return (app.featured); };

    // See return object for documentation
    var getHomeAppSelectionMessage = function() {
        var deferred = $q.defer();
        AppOrComponent.query({type: 'app', workflowState: 'Published'}).then(function(appData) {
            var sortedAppNameObjects = _.map(HomeCategories, function(homeCategory) {
                var sortedAppList = _.clone(appData || []).sort(AppSortCategories[homeCategory] || common.getSorterFunction('_id'));

                // perform additional filtering, if applicable
                if (_.isFunction(AppFilterCategories[homeCategory])) {
                    sortedAppList = _.filter(sortedAppList, AppFilterCategories[homeCategory]);
                }

                // get shortnames from sorted and filtered app list
                var sortedAppNameList =  _.pluck(sortedAppList, 'shortname');
                return {
                    appShortNames: sortedAppNameList,
                    header: homeCategory,
                    carousel: true,
                    featuredBanner: (homeCategory === 'Featured')
                };
            });

            // adding list of all apps
            sortedAppNameObjects.push({
                appShortNames: _.pluck(appData, 'shortname'),
                header: 'More recommendations',
                carousel: false,
                featuredBanner: false
            });

            // Remove display rows with no apps
            sortedAppNameObjects = _.filter(sortedAppNameObjects, function(appNameObject) {
                return ((appNameObject.appShortNames || []).length > 0);
            });

            deferred.resolve(sortedAppNameObjects);
        });
        return deferred.promise;
    };

    // See return object for documentation
    var getTagFilterMessage = function(selectedTags) {
        var deferred = $q.defer();
        selectedTags = _.isArray(selectedTags) ? selectedTags : [selectedTags]

        // get app shortnames with all the tags passed in, then create message
        Tag.getAppShortnamesWithTags(selectedTags).then(function(shortnames) {
            var filterMessage = { filter: { shortname: shortnames }, selectedTags: selectedTags };
            deferred.resolve(filterMessage);
        });
        return deferred.promise;
    }

    var convertTagsToObjectArray = function(selectedTags) {
        if (!_.isArray(selectedTags)) {
            selectedTags = [selectedTags];
        }
        return _.chain(selectedTags)
                .map(function(tag) {
                    if (_.isString(tag)) {
                        return {value: tag};
                    }
                    else if (_.isObject(tag) && tag.value) {
                        return tag;
                    }
                })
                .compact()
                .value();
    }

    return {
        /**
         * Retrieves a "message" array-of-objects containing every row on the AppsMall home page, and every app displayed within a given row.
         * @method getHomeAppSelectionMessage
         * @return An array of objects, where each array element contains object data for an app listing row on the AppsMall main page.
         *         App listing objects are in this format: ``` appShortNames: <array of shortnames of all apps in this row>, header: <header string>, 
         *         carousel: <true if this is a carousel row>, featuredBanner: <true if this is the Featured Apps carousel row, which has custom logic> ```
         */
        getHomeAppSelectionMessage: getHomeAppSelectionMessage,
        /**
         * Retrieves a "message" object that contains a list of tags passed in, and apps that contain every tag passed in.
         * @method getTagFilterMessage
         * @param selectedTags {Array} a list of tag names to search on
         * @return {PromiseObject} that, when invoked, passes filter result object as a parameter into then() callback.
         *         The filter result object is in the format: ``` filter: <shortname: <list of shortnames of apps that contain every tag passed in>>, selectedTags: <tags passed in> ```
         */
        getTagFilterMessage: getTagFilterMessage,
        // See attribute above
        HomeCategories: HomeCategories
    };
}];

servicesModule.factory('AppSelectionMessage', AppSelectionMessageService);
