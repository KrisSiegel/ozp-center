'use strict';
 
controllersModule.controller('AppController', ['$scope', '$rootScope', '$modal', '$q', 'AppOrComponent', 'FileUpload', 'Review', 'Persona', 'Search', 'AppSelectionMessage', 'Tag',
    function($scope, $rootScope, $modal, $q, AppOrComponent, FileUpload, Review, Persona, Search, AppSelectionMessage, Tag) {

        // If featured apps appear larger than non-featured apps in a standard app listing, then set this to True.
        var displayFeaturedAppsAsLarge = false;

        $scope.personaData = {};

        // flag for whether AppsMall uses components, from config file
        $scope.AllowComponents = Ozone.config().getProperty('allowComponents');

        // View state "enumeration"
        $scope.ViewStates = {
            Empty: 'empty',
            Home: 'home',
            Search: 'search',
            Apps: 'apps',
            TagFilter: 'tag',
            Loading: 'loading'
        };

        $scope.initializeController = function() {
            $scope.showHelp = false;
            $scope.allApps = [];
            $scope.tagFilteredApps = [];
            $scope.visibleApps = [];
            $scope.components = [];
            $scope.appRows = [];
            $scope.homeSearchResults = [];
            $scope.favoriteApps = [];
            $scope.selectedTags = [];

            // For filtered searching
            $scope.filteredSearchResults = {
                filter: defaultFilterMode()
            };
            $scope.filteredSearchResults.apps = [];
            $scope.filteredSearchResults.components = [];
            $scope.orgList = {
                ORG1: "National Endowment of the Arts",
                ORG2: "American Institute of Architects"
            };
            $scope.selectedOrganization = null;

            // selected app in Search window.  RWP TEMP: this will fire off REST call to service.
            $scope.searchText = '';
            $scope.searchResults = {};

            // Tag, Persona, and App calls all asynchronously with promise that get invoked after all responses have been received.
            $q.all([
                Persona.getCurrentPersonaData(), 
                Tag.getTopicsByComplex({uri: "/AppsMall/Organization/"}),
                $scope.getAppsAndComponentsFromServer()
            ]).then(function(responseData) {
                // extract results from array of response data
                var currentPersonaData = responseData[0];
                var orgTags = responseData[1];

                // request #1: get persona data
                $scope.userName = currentPersonaData.username;
                $scope.roles = currentPersonaData.roles;
                $scope.favoriteApps = currentPersonaData.favoriteApps;
                $scope.personaData = currentPersonaData;
                if (!currentPersonaData.viewedHelpPage){
                    $scope.showHelp = true;
                }

                // request #2: Get the full list of Organization tags, and create an appropriate set for $scope.orgList
                $scope.orgList = _.reduce(orgTags, function (obj, tag) {
                    obj[tag.tag] = tag.description;
                    return obj;
                }, {})

                // request #4: mark controller as initialized and load Home page
                $scope.appsLoaded = true;
                return loadHomePage();
            });

            // if $scope.visibleApps changes:
            // set apps to be displayed in "All Apps" (deprecated) and category listings, either sorted by featured/non-featured 
            // apps that are differently sized, or copied directly from visibleApps.
            $scope.$watch('visibleApps', function(newValue, oldValue) {
                if (displayFeaturedAppsAsLarge) {
                    $scope.appRows = createVisualAppRows($scope.visibleApps);
                }
                else {
                    $scope.appRows = [$scope.visibleApps];
                }
            });

            $rootScope.$on('openApp', function(event, app) {
                console.log("openApp broadcast received for app " + (app || {})._id);
                $scope.openApp(app);
            });

            $rootScope.$on('changeFavoriteApps', function(event, favoriteApps) {
                console.log("changeFavoriteApps broadcast - new favorite apps: " + (_.difference(favoriteApps, $scope.favoriteApps) || '[none]'));
                console.log("changeFavoriteApps broadcast - removed favorite apps: " + (_.difference($scope.favoriteApps, favoriteApps) || '[none]'));
                $scope.favoriteApps = favoriteApps;
            });

            $rootScope.$on('filterApps', function(event, facets) {
                console.log("filterApps broadcast received: params = " + JSON.stringify(facets));
                if (facets.filter && facets.selectedTags) {
                    return loadTagFilterPageFromMessage(facets);
                } 
                else if (facets.tags) {
                    return loadHomePageFromMessage(facets);
                }
                return loadHomePage();
            });

            // reset search if user clears search text
            $scope.$watch('searchValue', function(newValue, oldValue) {
                // APPSMALL-391: do not load home page if apps have not been initially loaded.
                if (_.isEmpty(newValue) && $scope.appsLoaded) {
                    if ($scope.selectedTags.length === 0) {
                        return loadHomePage();  // both search and tag selection are empty
                    }
                    else {
                        return $scope.executeSearch({});
                    }
                }
            });

            // If a new organization is selected, add that org's tag
            // to the list of search tags.
            $scope.$watch('selectedOrganization', function(newValue, oldValue) {
                if (newValue === null && oldValue === null) return;
                var oldTag = {name: oldValue, type: '/AppsMall/Organization/'}
                if (newValue === null) {
                    $scope.executeTagRemovalSearch(oldTag).then(function () {
                    });
                    $rootScope.$broadcast('organizationUpdate', null);
                    return;
                }
                $scope.selectedTags = _.reject($scope.selectedTags, function (tag) {
                    return tag.name === oldTag.name && tag.type === oldTag.type;
                });
                var newOrg = { name: newValue, type: '/AppsMall/Organization/'};
                var newTagSelection = $scope.selectedTags.concat([newOrg]);
                $rootScope.$broadcast('organizationUpdate', newOrg);
                return loadTagFilterPage(newTagSelection);
            });

        } // end $scope.initializeController declaration

        $scope.getAppsAndComponentsFromServer = function() {
            return AppOrComponent.query({workflowState: 'Published'}).then(function(appsAndComponents) {
                var apps = _.filter(appsAndComponents, function(appOrComponent) { return (appOrComponent.type === 'app'); });
                var components = _.filter(appsAndComponents, function(appOrComponent) { return (appOrComponent.type === 'component'); });

                console.log(apps)

                $scope.allApps = sortApps(apps, 'shortname');
                $scope.allComponentsFromServer = sortApps(components, 'shortname');
                $scope.components = _.clone($scope.allComponentsFromServer);

                // refresh visible apps if tags or searches were entered in
                var currentState = $scope.getViewState();
                if ((currentState === $scope.ViewStates.Empty) || (currentState === $scope.ViewStates.Home)) {
                    return loadHomePage(); 
                }
                else {
                    return loadTagFilterPage($scope.selectedTags);
                }
            });
        }

        // Method to retrieve application view state, and used internally by the shortcut methods directly below.
        // App state checks folllow this order of predecence: 
        // 1. Empty: full app list from server is empty
        // 2. Search: user typed text into the search bar (TO DO: search will only show when user hits enter)
        // 3. Home: User selected Home on left panel
        // 4. Tag Filter: User selected at least one tag to filter on
        // 5. Apps: main mode, displayed when all three conditions above are false
        $scope.getViewState = function() {
            if(!$scope.appsLoaded){
                return $scope.ViewStates.Loading;
            }
            if ($scope.allApps.length === 0) {
                return $scope.ViewStates.Empty;
            }
            if (!_.isEmpty($scope.searchText)) {
                return $scope.ViewStates.Search;
            }
            if (!_.isEmpty($scope.homeSearchResults)) {
                return $scope.ViewStates.Home;
            }
            if ($scope.selectedTags.length > 0) {
                return $scope.ViewStates.TagFilter;
            }
            return $scope.ViewStates.Apps;
        }

        $scope.isEmpty = function() {
            return ($scope.getViewState() === $scope.ViewStates.Empty);
        }

        $scope.isEmptyOrLoading = function() {
            return  _.contains([$scope.ViewStates.Empty, $scope.ViewStates.Loading], $scope.getViewState());
        }

        $scope.isSearchMode = function(){
            return ($scope.getViewState() === $scope.ViewStates.Search);
        }

        $scope.isHome = function() {
            return ($scope.getViewState() === $scope.ViewStates.Home);
        }

        $scope.isSearchPanelVisible = function() {
            return _.contains([$scope.ViewStates.Home, $scope.ViewStates.Search], $scope.getViewState());
        }

        $scope.isSearchOrFilterMode = function() {
            return _.contains([$scope.ViewStates.TagFilter, $scope.ViewStates.Search], $scope.getViewState());
        }

        $scope.isTagFilterMode = function() {
            return ($scope.getViewState() === $scope.ViewStates.TagFilter);
        }

        $scope.isAppMode = function() {
            return ($scope.getViewState() === $scope.ViewStates.Apps);
        }

        $scope.hasSelectedTags = function() {
            return ($scope.selectedTags.length > 0);
        }
        
        $scope.getSelectedTagNames = function() {
            return _.pluck($scope.selectedTags, 'name');
        }

        //--- "Public" (externally callable) Search functions ---//

        // Get autocomplete search results as list of app names, component names, or both.
        $scope.getSearchResults = function(term) {
            var searchType = ($scope.filteredSearchResults || {}).filter || '';
            return Search.appAndTagNameSearch(term, searchType).then(function(resultRecords) {

                // sort a clone of the apps list in descending rating order, to show the results in that order.
                var appsClone = _.clone($scope.visibleApps),
                    componentsClone = _.clone($scope.components),
                    sortFunction = common.getSorterFunction('rating', '', true);

                appsClone.sort(sortFunction);
                componentsClone.sort(sortFunction);

                // if search type = 'app' or 'apps': only return app names.
                // if search type = 'component' or 'components': only return component names.
                // if search type is blank: return everything
                var filteredAppAndComponentNames = [], filteredAppResultObjects = [], filteredTagResultObjects = [];
                if (!searchType.startsWith('component')) {
                    filteredAppAndComponentNames =  _.chain(appsClone).pluck('name').intersection(resultRecords.apps).value() || [];
                }
                if (!searchType.startsWith('app')) {
                    filteredAppAndComponentNames = filteredAppAndComponentNames.concat(_.chain(componentsClone).pluck('name').intersection(resultRecords.components).value() || []);
                }

                // add search term to start of list, unless term matches an app or component name
                var searchTermIsExactMatch = _.contains(filteredAppAndComponentNames, term);

                // creating result objects for apps, to distinguish apps from tags
                filteredAppResultObjects = _.map(filteredAppAndComponentNames, function(name) { return {name: name, app: name, searchString: (name === term)}; });
                if (!searchTermIsExactMatch) {
                    filteredAppResultObjects.unshift({name: term, app: term, searchString: true});
                }

                // creating result objects for tags, with empty object for 'app' so that search string gets cleared
                filteredTagResultObjects = _.map(resultRecords.tags, function(tag) { return {name: tag, tag: tag, app: ''}; });

                return filteredAppResultObjects.concat(filteredTagResultObjects);
            });
        };

        // setting watch to check search results for full app name, and load that app modal if found.
        // AMLUI-193: perform filtering on all apps that contain the search string in any part of the app (or component) name, not just the beginning.
        $scope.executeSearch = function(searchObj) {
            if (_.isEmpty(searchObj) || _.isString(searchObj)) {
                 return displayAppSearchFromTagFilterResults(searchObj || '');
            }
            else if (!_.isEmpty(searchObj.app)) {
                return displayAppSearchFromTagFilterResults(searchObj.app);
            }
            else if (searchObj.tag) {
                // if user selects tag: add tag to selected list, then apply tag filter to apps
                var newTagSelection = $scope.selectedTags.concat({name: searchObj.tag, type: '/AppsMall/App/'});
                return loadTagFilterPage(newTagSelection);
            }
        }

        // removing tag from selected list and performing new search with updated tags
        $scope.executeTagRemovalSearch = function(tagToRemove) {
            //if(tagToRemove === undefined || tagToRemove === null) return loadHomePage();
            if(['/AppsMall/Collection/', '/AppsMall/Category/', 'System'].indexOf(tagToRemove.type) >= 0)
                $rootScope.$broadcast('tagRemoved');
            var newTagSelection =  _.chain($scope.selectedTags || [])
                                   .clone()
                                   .reject(function(selectedTagObj) { return (selectedTagObj.name === tagToRemove.name && tagToRemove.type === selectedTagObj.type); })
                                   .value();

            if ((newTagSelection.length > 0) || (!_.isEmpty($scope.searchText))) {
                return loadTagFilterPage(newTagSelection);
            }
            else {
                return loadHomePage();
            }
        }

        $scope.clearSearch = function(){
            //clears search text and triggers the removal of search filters
            $scope.searchValue = '';
        }
        //--- Internal search functions ---//

        // load the Home (default) app selection page by getting message, then calling post-message callback
        function loadHomePage() {
            //clear Organization filter on homepage load
            $scope.selectedOrganization = null;
            return AppSelectionMessage.getHomeAppSelectionMessage(true).then(function(selectionMessage) {
                return loadHomePageFromMessage({ tags: selectionMessage });
            });
        }

        // loading Home (default) page from AppSelectionMessage parameters
        function loadHomePageFromMessage(homeAppsMessage) {
            //clear Organization filter on homepage load
            $scope.selectedOrganization = null;
            // Clearing all search parameters
            $scope.filteredSearchResults.filter = defaultFilterMode();
            $scope.filteredSearchResults.apps = [];
            $scope.filteredSearchResults.components = [];
            $scope.searchText = '';

            // Remove filtering and load search results for all taqgs passed in.
            $scope.selectedTags = [];
            $scope.tagFilteredApps = $scope.allApps;
            $scope.visibleApps = $scope.allApps;
            $scope.searchResults = createSearchResultAppObjects(homeAppsMessage.tags);
            $scope.homeSearchResults = _.clone($scope.searchResults);
        }

        // loading tag filter page by getting message, then calling post-message callback
        function loadTagFilterPage(newTagSelection) {
            return AppSelectionMessage.getTagFilterMessage(newTagSelection).then(function(tagFilterMessage) {
                return loadTagFilterPageFromMessage(tagFilterMessage);
            });
        }

        // loading tag filter page from AppSelectionMessage parameters
        function loadTagFilterPageFromMessage(tagFilterMessage) {
            $scope.selectedTags = tagFilterMessage.selectedTags; // RWP: change when multiple tags can be selected at once
            if ($scope.selectedTags.length > 0) {
                $scope.tagFilteredApps = filterApps($scope.allApps, tagFilterMessage.filter, tagFilterMessage.sortBy, tagFilterMessage.isDescending);
            }
            else {
                $scope.tagFilteredApps = $scope.allApps;
            }
            $scope.homeSearchResults = [];

            if (tagFilterMessage.selectedTags) {
                setFilterTitle(tagFilterMessage.selectedTags);
            }

            return displayAppSearchFromTagFilterResults($scope.searchText);
        }

        // executing search for app
        var displayAppSearchFromTagFilterResults = function(searchValue) {
            $scope.searchText = searchValue;
            $scope.filteredSearchResults.apps = [];
            $scope.filteredSearchResults.components = [];

            if (_.isEmpty(searchValue) && $scope.appsLoaded) {
                 $scope.filteredSearchResults.filter = defaultFilterMode();
                 $scope.searchResults = $scope.homeSearchResults;

                 // setting visible apps as all tag-filtered apps
                 $scope.visibleApps = $scope.tagFilteredApps;
                 return;
            }

            // assigning app (and component, if applicable) search results to filtered result values
            return Search.appSearch(searchValue).then(function(appSearchResults) {
                var tagFilteredAppNames = _.pluck($scope.tagFilteredApps, 'shortname');
                console.log("APP SEARCH RESULTS - SHORTNAMES: " + JSON.stringify(_.pluck(appSearchResults, 'shortname')));
                console.log("TAG FILTERED NAMES: " + JSON.stringify(tagFilteredAppNames));
                appSearchResults = _.filter(appSearchResults, function(app) {
                    return _.contains(tagFilteredAppNames, app.shortname);
                });
                $scope.filteredSearchResults.apps = appSearchResults;
                $scope.visibleApps = appSearchResults;

                if ($scope.AllowComponents) {
                    Search.componentSearch(searchValue).then(function(componentSearchResults) {
                        var componentNames = _.pluck($scope.components, 'name');
                        componentSearchResults = _.filter(componentSearchResults, function(component) {
                            return _.contains(componentNames, component.name);
                        });
                        $scope.filteredSearchResults.components = componentSearchResults;
                        $scope.components = componentSearchResults;
                    });
                }
            });
        }

        // // load selected app into modal by id attribute
        // $scope.getSelectedAppById = function(id, modifySearchResults) {
        //     id = id || (this.app && this.app._id);
        //     var appIndexWithId = _.chain($scope.visibleApps).pluck('_id').indexOf(id).value();
        //     $scope.getSelectedAppByIndex(appIndexWithId, modifySearchResults);
        // }
        // 
        // // load selected app into modal by array index
        // $scope.getSelectedAppByIndex = function(appIndex, modifySearchResults) {
        //     if ((appIndex >= 0) && (appIndex < $scope.visibleApps.length)) {
        //         var selectedApp = $scope.visibleApps[appIndex];
        //         if (modifySearchResults) {
        //             $scope.searchResults = createSearchResultAppObjects([selectedApp.name]);
        //         }
        //         $scope.loadAppChildForm(selectedApp);
        //     }
        // }

        // Return search result limit: unlimited for one category, or 8 for each category in "All" setting.
        // (The limit is set to a high number (100) instead of being truly unlimited.)
        $scope.getSearchResultLimit = function() {
            if (($scope.filteredSearchResults || {}).filter === 'all') {
                return 8;
            }
            return 100;
        }

        // click event method invoked from amlApp directive
        $scope.openApp = function(currentApp) {
            Ozone.Service("Apps").launchAppByShortname(currentApp.shortname, function(updatedApp) {
                replaceById($scope.allApps, updatedApp);
                replaceById($scope.visibleApps, updatedApp);
            });
        }

        // click event method invoked from amlApp directive
        $scope.setBookmark = function(currentApp) {
            var isBookmarked = $scope.isBookmarked(currentApp);
            Persona.addOrRemoveFavoriteApp(currentApp.shortname, !isBookmarked).then(function(newFavoriteApps) {
                $scope.favoriteApps = newFavoriteApps;
            })
        }
        
        $scope.isBookmarked = function(currentApp) {
            return (_.contains($scope.favoriteApps, (currentApp || {}).shortname));
        }

        $scope.loadAppChildForm = function(selectedApp) {
            var modalInstance = $modal.open({
                templateUrl: Ozone.utils.murl('amlUrl', '/partials/appmodal.html'),
                controller: AppModalInstanceController,
                backdrop: 'true',
                resolve: {
                    currentApp: function() { return selectedApp; },
                    currentTags: function() { return null; },
                    previewer: function() { return false; }
                }
            });

            modalInstance.opened.then(function(selectedItem) {
                console.log('Modal opened = ' + JSON.stringify(selectedItem));
            });

            modalInstance.result.then(function(selectedItem) {
                console.log('Modal selected item = ' + JSON.stringify(selectedItem));
            }, function() {
                console.log('Modal dismissed at: ' + new Date());
            });
        }

        // setting default filter mode based on whether this app allows components
        function defaultFilterMode() { 
            return ($scope.AllowComponents ? 'all' : 'apps');
        }

        // set header for tag-filter searches.
        function setFilterTitle(selectedTags) {
            if (_.isArray(selectedTags) && (selectedTags.length > 1)) {
                var selectedTagNamesWithQuotes = 
                    _.map(selectedTags, function(tagObj) { return '"' + tagObj.value + '"'; });
                $scope.filterTitle = selectedTagNamesWithQuotes.join(' + ');
            }
            else if (_.isObject((selectedTags || [])[0])) {
                $scope.filterTitle = selectedTags[0].value;
            }
            else {
                $scope.filterTitle = selectedTags;
            }
        }

        // Loading search results into scope that will show up on the search results subpage.
        function createSearchResultAppObjects(searchResultAppNames) {
            if (_.isArray(searchResultAppNames) && !isArrayOfObjectsWithAttribute(searchResultAppNames)) {
                // turn into a single row category "Search Results", with 
                searchResultAppNames = [{
                    header: "Search Results",
                    appShortNames: searchResultAppNames
                }];
            }
            // loading apps by looking up app names and mapping to apps array
            if (_.isEmpty(searchResultAppNames.apps) && isArrayOfObjectsWithAttribute(searchResultAppNames, 'appShortNames')) {
                // creating <app_name> => app lookup to avoid N^2 nastiness in result app mapping function.
                var appNameLookup = {};
                _.each($scope.visibleApps, function(app) { this[app.shortname] = app; }, appNameLookup);
                // creating apps array from appShortNames
                _.each(searchResultAppNames, function(resultObj) {
                    resultObj.bannerHeight = (resultObj.featuredBanner ? 225 : 210);
                    resultObj.numItemsPerRow = (resultObj.featuredBanner ? 2 : 4);
                    resultObj.numScrollItemsPerRow = (resultObj.featuredBanner ? 1 : 4);
                    resultObj.apps = _.map(resultObj.appShortNames, function(appShortName) { return appNameLookup[appShortName]; });
                    delete resultObj.appShortNames;
                });
            }
            return searchResultAppNames;
        }

        // Checks if the array contains objects with the given attribute, or merely that the array elements are objects if no attribute value is passed in.
        // Returns false if the array is empty.
        function isArrayOfObjectsWithAttribute(array, attribute) {
            if (!_.isArray(array) || (array.length === 0)) {
                return false;
            }
            return _.all(array, function(arrayElement) {
                return _.isObject(arrayElement) && (_.isUndefined(attribute) || _.has(arrayElement, attribute));
            });
        }

        // Method for filtering apps based on filtering parameters of the form {categories: ['a','b','c'], groupings: ['d','e']}.
        // Apps are filtered out of the array unless the app contains values in the filter parameter array, for all values
        // passed in as parameter keys.
        // If sorting parameters are non-null, then sorting will be performed on the filtered app array.
        function filterApps(currentApps, filterParameters, sortField, isDescending) {
            if (_.isEmpty(filterParameters)) {
                return currentApps;
            }
            var filteredApps = _.filter(currentApps, function(app) {
                return _.chain(filterParameters).map(function(valueArray, filterParamType) {
                    if (_.isArray(app[filterParamType])) {
                        return (_.intersection(valueArray, (app[filterParamType] || [])).length > 0);
                    } else {
                        return (_.contains(valueArray, app[filterParamType]));
                    }

                }).all().value();
            });

            if (_.isEmpty(sortField)) {
                return filteredApps;
            }
            else {
                return sortApps(filteredApps, sortField, isDescending);
            }
        }

        var numericalFields = ['users', 'rating', 'ratings', 'launchedCount'];

        // Method for sorting apps by the field name passed in.
        function sortApps(currentApps, sortField, isDescending) {
            var sortFunction = null;
            if (_.contains(['createdOn', 'updatedOn', 'softwareUpdatedOn'], sortField)) {
                sortFunction = common.getDateSorterFunction(sortField, isDescending);
            }
            else if (_.contains(numericalFields, sortField)) {
                sortFunction = common.getSorterFunction(sortField, 0, isDescending);
            }
            else {
                sortFunction = common.getSorterFunction(sortField, '', isDescending);
            }
            return (currentApps || []).sort(sortFunction);
        }

        function getAppIdFromFindByName(appName) {
            var appWithMatchedName = _.find($scope.visibleApps, function(app) {
                return (app.name === appName);
            });
            if (_.isObject(appWithMatchedName)) {
                return appWithMatchedName._id;
            }
        }

        // "constants" used to align apps into rows and columns
        var NonFeaturedAppGroupingSize = 4;
        var GroupingsPerLine = 2;

        // function to order apps so that non-featured apps are grouped together in a manner to 
        // reduce empty space on Apps main page
        function createAppGroupingList(appList) {
            var featuredApps = _.filter(appList, function(app) { return app.featured; });
            var nonFeaturedApps = _.reject(appList, function(app) { return app.featured; });
            var appGroupingList = [];

            // difference between featured app grouping (1 featured app) and non-featured app grouping (NonFeaturedAppGroupingSize non-featured apps)
            // if positive: featured apps outnumber non-featured, and display excess featured apps on top.
            // if negative: non-featured apps outnumber featured apps, and display excess non-featured apps on bottom.
            var featuredAppGroupingDifference = Math.floor(((featuredApps.length * NonFeaturedAppGroupingSize) - nonFeaturedApps.length) / NonFeaturedAppGroupingSize);

            while (featuredAppGroupingDifference > 0) {
                appGroupingList.push(featuredApps.shift());
                featuredAppGroupingDifference -= 1;
            }

            for (var i = 0, len = featuredApps.length; i < len; i++) {
                appGroupingList.push(featuredApps.shift());
                appGroupingList.push(nonFeaturedApps.splice(0, NonFeaturedAppGroupingSize));
            }

            while (nonFeaturedApps.length > 0) {
                appGroupingList.push(nonFeaturedApps.splice(0, NonFeaturedAppGroupingSize));
            }

            return appGroupingList;
        }

        // creating visual structure for displaying apps on main page
        function createVisualAppRows(appList) {
            var reverseOrderRow = false;
            var groupingList = createAppGroupingList(appList);
            var appRows = [];

            while (groupingList.length > 0) {
                var appsInLine = _.flatten(groupingList.splice(0, GroupingsPerLine));
                if (reverseOrderRow) {
                    appsInLine.reverse();
                }
                appRows.push(appsInLine);
                reverseOrderRow = !reverseOrderRow;  // alternate between standard and reversed rows
            }
            return appRows;
        }

        // Replace object in an array where the id field matches from the new (updated) object matches the first value found in the object array.
        function replaceById(objectList, updatedObject, idField) {
            if (!idField) {
                idField = '_id';
            }
            var oldObjectIndex = _.findIndex(objectList, function(obj) { return (obj[idField] === updatedObject[idField]); });
            if (oldObjectIndex >= 0) {
                common.assignToObjectInPlace(objectList[oldObjectIndex], updatedObject);
            }
        }
    }
]);
