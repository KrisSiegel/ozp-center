'use strict';

servicesModule.factory('AppSelectionMessage', function($q, AppOrComponent, Tag) {

    var AppSortCategories = {};
    var AppFilterCategories = {};

    AppSortCategories['Featured'] = common.getDateSorterFunction('createdOn', true);
    AppSortCategories['New Arrivals'] = common.getDateSorterFunction('createdOn', true);
    AppSortCategories['Most Popular'] = common.getSorterFunction('launchedCount', 0, true);

    AppFilterCategories['Featured'] = function(app) { return (app.featured); };

    var HomeCategories = ['Featured', 'New Arrivals', 'Most Popular'];

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
        getHomeAppSelectionMessage: getHomeAppSelectionMessage,
        getTagFilterMessage: getTagFilterMessage,
        HomeCategories: HomeCategories
    };

});
