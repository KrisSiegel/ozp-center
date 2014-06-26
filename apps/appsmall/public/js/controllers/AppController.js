/**
 * Controller object for displaying the AppsMall home page main panel
 *
 * @module AppsMallUI.controllersModule
 * @submodule AppsMallUI.AppControllerModule
 * @requires amlApp.controllers
 */

'use strict';

/**
 * @class AppsMallUI.AppController
 * @static
 */ 

/**
 * @class AppsMallUI.AppController
 * @constructor
 * @param $scope {ChildScope} Child scope that provides context for this controller - [API Documentation](https://docs.angularjs.org/api/ng/type/$rootScope.Scope) 
 * @param $rootScope {Scope} Single root scope for application, and ancestor of all other scopes - [API Documentation](https://docs.angularjs.org/api/ng/service/$rootScope) 
 * @param $modal {Object} Angular service that creates modal instances - [API Documentation](http://angular-ui.github.io/bootstrap/#/modal) 
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 * @param AppOrComponent {Object} an Angular-injected instance of {{#crossLink "AppOrComponentService"}}{{/crossLink}}
 * @param FileUpload {Object} an Angular-injected instance of {{#crossLink "FileUploadService"}}{{/crossLink}}
 * @param Review {Object} an Angular-injected instance of {{#crossLink "ReviewService"}}{{/crossLink}}
 * @param Persona {Object} an Angular-injected instance of {{#crossLink "PersonaService"}}{{/crossLink}}
 * @param Search {Object} an Angular-injected instance of {{#crossLink "SearchService"}}{{/crossLink}}
 * @param AppSelectionMessage {Object} an Angular-injected instance of {{#crossLink "AppSelectionMessageService"}}{{/crossLink}}
 * @param Tag {Object} an Angular-injected instance of {{#crossLink "TagService"}}{{/crossLink}}
 */


var AppController = ['$scope', '$rootScope', '$modal', '$q', 'AppOrComponent', 'FileUpload', 'Review', 'Persona', 'Search', 'AppSelectionMessage', 'Tag', function($scope, $rootScope, $modal, $q, AppOrComponent, FileUpload, Review, Persona, Search, AppSelectionMessage, Tag) {

    /**
     * If featured apps appear larger than non-featured apps in a standard app listing, then set this to True.
     * @attribute {Object} displayFeaturedAppsAsLarge
     * @private
     */
    var displayFeaturedAppsAsLarge = false;

    /**
     * Persona data for the currently logged-in user
     * @attribute {Object} personaData
     * @required
     */
    $scope.personaData = {};

    /**
     * Property from Ozone API to indicate whether components are loaded
     * @attribute {Boolean} AllowComponents
     * @required
     */
    $scope.AllowComponents = Ozone.config().getProperty('allowComponents');

    /**
     * An enumerated list of view states, with stringified values
     * @attribute {Object} ViewStates
     * @required
     */
    $scope.ViewStates = {
        Empty: 'empty',
        Home: 'home',
        Search: 'search',
        Apps: 'apps',
        TagFilter: 'tag',
        Loading: 'loading'
    };

    /**
     * Method called by ng-init directive when declaring controller in view page
     * @method initializeController
     */
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

    /**
     * Retrieves all apps and components from Ozone service
     * @method getAppsAndComponentsFromServer
     * @return {PromiseObject} used for loading apps and components
     */
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

    /**
     * Method to retrieve application view state, and used internally by the shortcut methods directly below.
     * App state checks folllow this order of predecence: 
     *
     * 1. _Empty_: full app list from server is empty
     * 2. _Search_: user typed text into the search bar (TO DO: search will only show when user hits enter)
     * 3. _Home_: User selected Home on left panel
     * 4. _Tag Filter_: User selected at least one tag to filter on
     * 5. _Apps_: main mode, displayed when all three conditions above are false
     *
     * @method getViewState
     * @return {String} stringified value of current view state from ViewStates enumeration
     */
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

    /**
     * Checks if Empty is the current view state, signifying that no apps were found in database
     * @method isEmpty
     * @return {Boolean} True only if the current view state equals Empty
     */
    $scope.isEmpty = function() {
        return ($scope.getViewState() === $scope.ViewStates.Empty);
    }

    /**
     * Checks if Empty or Loading is the current view state, signifying that no apps have been loaded yet
     * @method isEmptyOrLoading
     * @return {Boolean} True only if the current view is either Empty or Loading
     */
    $scope.isEmptyOrLoading = function() {
        return  _.contains([$scope.ViewStates.Empty, $scope.ViewStates.Loading], $scope.getViewState());
    }

    /**
     * Checks whether Search is the current view state
     * @method isSearchMode
     * @return {Boolean} True only if the current view state equals Search
     */
    $scope.isSearchMode = function(){
        return ($scope.getViewState() === $scope.ViewStates.Search);
    }

    /**
     * Checks whether Home is the current view state, signifying that the main page was loaded
     * @method isHome
     * @return {Boolean} True only if the current view state equals Home
     */
    $scope.isHome = function() {
        return ($scope.getViewState() === $scope.ViewStates.Home);
    }

    /**
     * Checks whether the Search panel used for Home and Search view states is visible
     * @method isSearchPanelVisible
     * @return {Boolean} True only if the current view is either Home or Search
     */
    $scope.isSearchPanelVisible = function() {
        return _.contains([$scope.ViewStates.Home, $scope.ViewStates.Search], $scope.getViewState());
    }

    /**
     * Checks whether the current view state is either Search or TagFilter
     * @method isSearchOrFilterMode
     * @return {Boolean} True only if the current view is either Search or TagFilter
     */
    $scope.isSearchOrFilterMode = function() {
        return _.contains([$scope.ViewStates.TagFilter, $scope.ViewStates.Search], $scope.getViewState());
    }

    /**
     * Checks whether TagFilter is the current view state
     * @method isTagFilterMode
     * @return {Boolean} True only if the current view is TagFilter
     */
    $scope.isTagFilterMode = function() {
        return ($scope.getViewState() === $scope.ViewStates.TagFilter);
    }

    /**
     * Checks whether Apps is the current view state
     * @method isAppMode
     * @return {Boolean} True only if the current view state equals Apps
     */
    $scope.isAppMode = function() {
        return ($scope.getViewState() === $scope.ViewStates.Apps);
    }

    /**
     * Checks whether at least one tag has been selected
     * @method hasSelectedTags
     * @return {Boolean} True if one or more tags have been selected
     */
    $scope.hasSelectedTags = function() {
        return ($scope.selectedTags.length > 0);
    }

    /**
     * Returns a list of names from all selected tags
     * @method getSelectedTagNames
     * @return {Array} list of names from all selected tags
     */
    $scope.getSelectedTagNames = function() {
        return _.pluck($scope.selectedTags, 'name');
    }

    /**
     * Retrieve and load autocomplete search results as list of app names, component names, or both.
     * Filtering is performed on all apps that contain the search string in any part of the app (or component) name, not just the beginning.
     * @method getSearchResults
     * @param term {String} search term
     * @return {PromiseObject} used to search for tags and apps, and load controller with results.
     */
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

    /**
     * Performs app and tag searches and loads results into controller, based on the parameter object passed in.
     * @method executeSearch
     * @param searchObj {Object} Object that may contain app and tag fields (ex. { ```app: <app_name>, tag: <tag_name>``` } ) for performing tag and/or app name searches.
     *        If this parameter is a string or empty, then an app search is performed on the string or empty value passed in.
     * @return {PromiseObject} used to perform app and/or tag search
     */
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

    /**
     * Removes tag from selected list, then performs new search with updated tags
     * @method executeTagRemovalSearch
     * @param tagToRemove {Object} Tag object to be removed from search query
     */
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

    /**
     * Clears search text and triggers the removal of search filters
     * @method clearSearch
     */
    $scope.clearSearch = function() {
        $scope.searchValue = '';
    }
    //--- Internal search functions ---//

    /**
     * Load the Home (default) app selection page by getting message, then calling post-message callback
     * @method loadHomePage
     * @private
     */
    function loadHomePage() {
        //clear Organization filter on homepage load
        $scope.selectedOrganization = null;
        return AppSelectionMessage.getHomeAppSelectionMessage(true).then(function(selectionMessage) {
            return loadHomePageFromMessage({ tags: selectionMessage });
        });
    }

    /**
     * loading Home (default) page from {{#crossLink "AppSelectionMessageService"}}{{/crossLink}} parameters
     * @method loadHomePageFromMessage
     * @private
     */
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

    /**
     * Loading tag filter page by getting message, then calling post-message callback
     * @method loadTagFilterPage
     * @param newTagSelection {Array} a list of all selected tags to be filtered on
     * @return {PromiseObject} used to load search results onto main page
     * @private
     */
    function loadTagFilterPage(newTagSelection) {
        return AppSelectionMessage.getTagFilterMessage(newTagSelection).then(function(tagFilterMessage) {
            return loadTagFilterPageFromMessage(tagFilterMessage);
        });
    }

    /**
     * Loading tag filter page from AppSelectionMessage parameters
     * @method loadTagFilterPageFromMessage
     * @param tagFilterMessage {Object} a 'message' object that describes the tag-filtering layout on main page
     * @return {PromiseObject} used to load search results onto main page
     * @private
     */
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

    /**
     * Executing search for app
     * @method displayAppSearchFromTagFilterResults
     * @param searchValue {String} a text string for searching apps by name
     * @return {PromiseObject} used to load search results onto main page
     * @private
     */
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

    /**
     * Return search result limit: unlimited for one category, or 8 for each category in "All" setting.
     * (The limit is set to a high number (100) instead of being truly unlimited.)
     * @method getSearchResultLimit
     * @return {Number} search result limit based on search type
     */
    $scope.getSearchResultLimit = function() {
        if (($scope.filteredSearchResults || {}).filter === 'all') {
            return 8;
        }
        return 100;
    }

    /**
     * Launches the app passed in into a separate window
     * @method openApp
     * @param currentApp {Object} the app to be launched
     */
    $scope.openApp = function(currentApp) {
        Ozone.Service("Apps").launchAppByShortname(currentApp.shortname, function(updatedApp) {
            replaceById($scope.allApps, updatedApp);
            replaceById($scope.visibleApps, updatedApp);
        });
    }

    /**
     * Toggles bookmarked status for app passed in
     * @method setBookmark
     * @param currentApp {Object} the app to toggle bookmark status for
     */
    $scope.setBookmark = function(currentApp) {
        var isBookmarked = $scope.isBookmarked(currentApp);
        Persona.addOrRemoveFavoriteApp(currentApp.shortname, !isBookmarked).then(function(newFavoriteApps) {
            $scope.favoriteApps = newFavoriteApps;
        })
    }

    /**
     * Checks whether the current app is bookmarked
     * @method isBookmarked
     * @param currentApp {Object} the app to check bookmark status
     * @return {Boolean} True only if the app passed in is bookmarked
     */
    $scope.isBookmarked = function(currentApp) {
        return (_.contains($scope.favoriteApps, (currentApp || {}).shortname));
    }

    /**
     * Load App Details page as Bootstrap modal within main page
     * @method loadAppChildForm
     * @param selectedApp {Object} app to display in details page
     */
    $scope.loadAppChildForm = function(selectedApp) {
        var modalInstance = $modal.open({
            templateUrl: Ozone.utils.murl('amlUrl', '/partials/appmodal.html', 'staticHost'),
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

    /**
     * Set default filter mode based on whether this app allows components
     * @method defaultFilterMode
     * @private
     */
    function defaultFilterMode() { 
        return ($scope.AllowComponents ? 'all' : 'apps');
    }

    /**
     * Set header for tag-filter searches.
     * @method setFilterTitle
     * @param selectedTags {Array} an array of Tag objects to display as header on Search Mode panel
     * @private
     */
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

    /**
     * Loading search results into scope that will show up on the search results subpage.
     * @method createSearchResultAppObjects
     * @param searchResultAppNames {Array} an array of objects, where each array element contains object data for an app listing row on the AppsMall main page.
     * @return {Array} an array of objects with more detailed information on listing apps: contains actual App objects instead of app names, and detailed rendering information such
     *         as banner height, items per row, and scrollable items per row
     * @private
     */
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

    /**
     * Checks if the array contains objects with the given attribute, or merely that the array elements are objects if no attribute value is passed in.
     * @method isArrayOfObjectsWithAttribute
     * @param array {Array} The array to check; should be an array of objects
     * @param attribute {String} The attribute to check on each object within the array 
     * @return True only if every Object element of the array contains the attribute passed in.  Returns False if the array contains non-objects or is empty.
     * @private
     */
    function isArrayOfObjectsWithAttribute(array, attribute) {
        if (!_.isArray(array) || (array.length === 0)) {
            return false;
        }
        return _.all(array, function(arrayElement) {
            return _.isObject(arrayElement) && (_.isUndefined(attribute) || _.has(arrayElement, attribute));
        });
    }

    /**
     * Method for filtering apps based on filtering parameters of the form ``` {categories: ['a','b','c'], groupings: ['d','e']} ```.
     * Apps are filtered out of the array unless the app contains values in the filter parameter array, for all values
     * passed in as parameter keys.
     * If sorting parameters are non-null, then sorting will be performed on the filtered app array.
     * @method filterApps
     * @param currentApps {Array} The array of App objects to filter and sort on
     * @param filterParameters {Object} An object of arrays used for filtering, with app attributes (fields) to be filtered on as keys and a list of valid attribute values as values.
     *        (Ex. { ``` shortname: ['foo', 'bar'] ``` } will filter out apps that don't have ```foo``` or ```bar``` as their shortname).
     * @param [sortField] {Function} A sorting function that, if defined, is called to sort on the result array
     * @param [isDescending] {String} If a sorting function is passed in, this is used to determine whether sorting is ascending or descending
     * @return {Array} A sorted and filtered array of App objects, based on the parameters passed in
     * @private 
     */
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

    /**
     * A list of all App object attributes that contain numeric values, and thus must be sorted numerically instead of by stringified value.
     * @attribute {Array} numericalFields
     * @private
     * @final
     */
    var numericalFields = ['users', 'rating', 'ratings', 'launchedCount'];

    /**
     * Method for sortApps apps by the field name passed in.
     * @method sortApps
     * @param currentApps {Array} The array of App objects to sort on
     * @param sortField {Function} A sorting function that, if defined, is called to sort on the array passed in
     * @param [isDescending] {String} Used to determine whether sorting is ascending or descending
     * @return {Array} A sorted array of App objects, based on the parameters passed in
     * @private 
     */
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

    /**
     * Performs name search based on name passed in, and returns the id of the matched App object if found.
     * @method getAppIdFromFindByName
     * @param appName {String} the app name to perform name search on
     * @return {String} The id of the matched App object, or undefined if no match is found
     * @private 
     */
    function getAppIdFromFindByName(appName) {
        var appWithMatchedName = _.find($scope.visibleApps, function(app) {
            return (app.name === appName);
        });
        if (_.isObject(appWithMatchedName)) {
            return appWithMatchedName._id;
        }
    }

    /**
     * Number of non-featured apps grouped together
     * @attribute {Number} NonFeaturedAppGroupingSize
     * @private
     * @final
     */
    var NonFeaturedAppGroupingSize = 4;

    /**
     * Number of grouping columns on AppsMall main page, where a grouping consists of either one featured app or 
     * NonFeaturedAppGroupingSize number of non-featured apps.
     * @attribute {Number} GroupingsPerLine
     * @private
     * @final
     */
    var GroupingsPerLine = 2;

    /**
     * Function to order apps so that non-featured apps are grouped together in a manner to reduce empty space on Apps main page
     * @method createAppGroupingList
     * @param appList {Array} An array of App objects to be sorted and grouped
     * @return {Array} An array-of-array of App objects where featured apps and non-featured apps are grouped in separate arrays, such as:
     *         ``` [[APP_F1], [APP_NF1, APP_NF2], [APP_F2], [APP_NF3, APP_NF4]] ```
     * @private 
     */
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

    /**
     * Creating visual structure for displaying apps on main page
     * @method createVisualAppRows
     * @param appList {Array} An array of App objects to be grouped
     * @return {Array} An array of App objects where non-featured apps are grouped together
     * @private 
     */
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

    /**
     * Replace object in an array where the id field matches from the new (updated) object matches the first value found in the object array.
     * @method replaceById
     * @param objectList {Array} An array of data objects to be updated with data from updatedObject
     * @param updatedObject {Object} A single data object with fields to be assigned to an element in objectList
     * @param idField {String} The id field of the objects in list; defaults to ``` _id ``` as used in MongoDB
     * @private 
     */
    // 
    function replaceById(objectList, updatedObject, idField) {
        if (!idField) {
            idField = '_id';
        }
        var oldObjectIndex = _.findIndex(objectList, function(obj) { return (obj[idField] === updatedObject[idField]); });
        if (oldObjectIndex >= 0) {
            common.assignToObjectInPlace(objectList[oldObjectIndex], updatedObject);
        }
    }

}];

controllersModule.controller('AppController', AppController);
