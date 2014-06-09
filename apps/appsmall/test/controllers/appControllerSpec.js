'use strict';

/* jasmine specs for App Controller go here */

describe('App Controller', function() {
    var rootScope, scope;
    var appService, appSelectionService, reviewService, uploadService, personaService, searchService, tagService;
    var preLoadedIds = [];
    var testPersona = null, personaKey = null;

    beforeEach(function() {
        module('amlApp.controllers');
        module('amlApp.services');
        module('amlApp.directives');
        this.addMatchers(Ozone.mockHelper.appsMallCustomMatchers);

        Ozone.mockDb.loadFixtures(['Apps', 'Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions']);
        preLoadedIds = Ozone.mockDb.getAllIds(['Apps', 'Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions']);

        personaKey = Ozone.mockDb.getKeyFieldFromRecord('Personas');
        testPersona = null;

        inject(function($injector, $controller, $http, $rootScope) {
            appService = $injector.get('AppOrComponent');
            reviewService = $injector.get('Review');
            uploadService = $injector.get('FileUpload');
            personaService = $injector.get('Persona');
            searchService = $injector.get('Search');
            appSelectionService = $injector.get('AppSelectionMessage');
            tagService = $injector.get('Tag');

            rootScope = $rootScope;
            scope = $rootScope.$new();

            var ctrl = $controller('AppController', {
                $scope: scope, 
                AppOrComponent: appService, 
                FileUpload: uploadService,
                Review: reviewService,
                Persona: personaService,
                Search: searchService,
                AppSelectionMessage: appSelectionService,
                Tag: tagService
            });
            if (Ozone.utils.isFunction(scope.initializeController)) {
                scope.initializeController();
            }
            rootScope.$apply();
        });
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    // set current persona to persona with corresponding user, or generic test user if empty
    var setCurrentPersona = function(username) {
        username = username || 'testOzoneUser1';

        var personaData = _.find(Ozone.fixtures.personaRecords, function(personaRecord) { return (personaRecord.username === username); });
        personaService.setCurrentPersona(personaData).then(function(setPersona) {
            testPersona = setPersona;
        });
        rootScope.$apply();
        expect(testPersona).toBeTruthy();
    }

    it('should initialize apps from fixture', function() {
        expect(scope.visibleApps.length).toEqual(preLoadedIds.Apps.length);
        expect(scope.allApps.length).toEqual(preLoadedIds.Apps.length);
    });

    it('should start in Home mode', function() {
        expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
        expect(scope.isHome()).toBeTruthy();
        expect(scope.isSearchMode()).toBeFalsy();

        expect(scope.homeSearchResults).toBeTruthy();
    });

    it('should increment app count when app is added and call to refresh apps is made', function() {
        var savedAppId;
        var numberOfApps = scope.allApps.length;
        var newApp = Ozone.mockHelper.getRandomRecord('Apps');

        // save app and get id of saved app
        appService.save(newApp).then(function(savedApp) {
            savedAppId = savedApp._id;
        });
        rootScope.$apply();

        // app count should not increment until call to get apps is made
        expect(scope.allApps.length).toEqual(numberOfApps);

        scope.getAppsAndComponentsFromServer();
        rootScope.$apply();

        expect(scope.allApps.length).toEqual(numberOfApps + 1);
    });

    it('should perform autocomplete filtering on recently added apps', function() {
        var savedAppName, savedAppId;
        var numberOfApps = scope.allApps.length;
        var newApp = Ozone.mockHelper.getRandomRecord('Apps');

        // make sure controller doesn't start in search mode
        expect(scope.isSearchMode()).toBeFalsy();
        expect(scope.isHome()).toBeTruthy();

        // save app and get id of saved app
        appService.save(newApp).then(function(savedApp) {
            savedAppName = savedApp.name;
            savedAppId = savedApp._id;
        });
        rootScope.$apply();

        // refresh apps and components in controller
        scope.getAppsAndComponentsFromServer();
        rootScope.$apply();

        var searchSubstringOfAppName = savedAppName.substring(0, 6);
        scope.executeSearch({app: searchSubstringOfAppName});
        rootScope.$apply();

        var filteredAppsFromController = scope.filteredSearchResults.apps;
        expect(filteredAppsFromController.length).toEqual(1);
        expect(filteredAppsFromController[0]).toHaveIdEqualTo(savedAppId);
        expect(scope.isSearchMode()).toBeTruthy();
        expect(scope.isHome()).toBeFalsy();
    });

    it('should toggle bookmark for existing app', function() {
        var currentApp;
        var numberOfApps = scope.allApps.length;
        var newApp = Ozone.mockHelper.getRandomRecord('Apps');

        // save app and get id of saved app
        appService.get({_id: preLoadedIds.Apps[0]}).then(function(app) {
            currentApp = app;
        });
        rootScope.$apply();

        expect(currentApp).toBeTruthy();
        expect(scope.isBookmarked(currentApp)).toBeFalsy();

        scope.setBookmark(currentApp);
        rootScope.$apply();

        expect(scope.isBookmarked(currentApp)).toBeTruthy();

        scope.setBookmark(currentApp);
        rootScope.$apply();

        expect(scope.isBookmarked(currentApp)).toBeFalsy();
    });

    describe('when performing searches on apps and tags', function() {
        var tagService;

        // createTagAndAppWithMatchingNames() initialized objects
        var firstExistingApp, savedApp, savedTag, tagAndAppSearchString, tagName, appShortname;

        // createTagsAssociatedToFixtureApps() initialized objects
        var tagNamesForFixtureApps, initialApps;

        // save an app and a tag, where the tag's name is a substring of the app name.
        // The tag's URI corresponds to the first existing app, and tag searches should match this app.
        beforeEach(function() {
            inject(function($injector) {
                tagService = $injector.get('Tag');
            });
        });

        // create test app and tag, where tag and app names can be searched with the same search string
        var createTagAndAppWithMatchingNames = function() {
            // if an invalid array index is passed in as persona index, then assign to first element
            appService.get({id: preLoadedIds.Apps[0]}).then(function(app) {
                firstExistingApp = app;
            });
            rootScope.$apply();

            setCurrentPersona();

            // set search string for both tag and app to be saved
            tagAndAppSearchString = Ozone.mockHelper.getRandomString(9);

            // create new tag with name that starts with search string
            var newTag = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: (tagAndAppSearchString + 'DEF'), uri: appService.getUri(firstExistingApp)});

            // save app and get id of saved app
            tagService.createNewTagsAndTopics([newTag.tag], newTag.uri, '/AppsMall/App/', newTag.level).then(function(tagResult) {
                savedTag = _(tagResult).values().flatten().first();
            });
            rootScope.$apply();

            // create new app with name and shortname that starts with search string
            tagName = savedTag.tag;
            appShortname = tagAndAppSearchString + 'ABC';

            // creating app with shortname that matches same string as tag
            var newAppWithTagShortname = Ozone.mockHelper.getRandomRecord('Apps', null, {name: appShortname, shortname: appShortname});
            appService.save(newAppWithTagShortname).then(function(app) {
                savedApp = app;
                preLoadedIds.Apps.push(app._id);
            });
            rootScope.$apply();

            // refresh app listing in controller
            scope.getAppsAndComponentsFromServer();
            rootScope.$apply();

            expect(scope.visibleApps).toHaveRecordWithIdMatching(savedApp);
        };

        // create threre tags that are associated to apps as follows:
        // app1: [tag1, tag2]
        // app2: [tag2, tag3]
        // Names for each fo the three tags are assigned to tagNamesForFixtureApps.
        var createTagsAssociatedToFixtureApps = function() {
            var resultAppList;
            appService.query().then(function(appList) {
                // sanity test for setting up tags to match two different apps
                expect(appList.length).toBeGreaterThan(1);
                initialApps = {first: scope.allApps[0], second: scope.allApps[1]};
            });
            rootScope.$apply();

            tagNamesForFixtureApps  = [Ozone.mockHelper.getRandomString(12), Ozone.mockHelper.getRandomString(12), Ozone.mockHelper.getRandomString(12)];

            var newTag1_App1 = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: tagNamesForFixtureApps[0], uri: appService.getUri(initialApps.first)});
            var newTag2_App1 = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: tagNamesForFixtureApps[1], uri: appService.getUri(initialApps.first)});
            var newTag2_App2 = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: tagNamesForFixtureApps[1], uri: appService.getUri(initialApps.second)});
            var newTag3_App2 = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: tagNamesForFixtureApps[2], uri: appService.getUri(initialApps.second)});

            _.chain([newTag1_App1, newTag2_App1, newTag2_App2, newTag3_App2])
             .each(function(newTag) {
                 tagService.createNewTagsAndTopics([newTag.tag], newTag.uri, '/AppsMall/App/', newTag.level).then(function(tagResult) {
                     var savedTag = _(tagResult).values().flatten().first();
                     console.log('CTAF: SAVED TAG = ' + JSON.stringify(savedTag));
                     expect(savedTag.uri).toStartWith('/AppsMall/Apps/');
                 });
                 rootScope.$apply();
             });
             rootScope.$apply();
        };

        // old ticket: first search result should be user-selected text box and autocomplete should search on both apps and tags
        it ('should display first search result as user-selected text', function() {
            var searchResults;
            createTagAndAppWithMatchingNames();

            expect(tagAndAppSearchString.length).toBeGreaterThan(5);
            tagAndAppSearchString = tagAndAppSearchString.substring(0,5);

            scope.getSearchResults(tagAndAppSearchString).then(function(results) {
                searchResults = results;
            });
            rootScope.$apply();

            // search results should return search string as first result, and app/tag matches as subsequent results.
            expect(searchResults.length).toBeGreaterThan(1);

            var firstResult = searchResults.shift();
            expect(firstResult.name).toEqual(tagAndAppSearchString);
            expect(firstResult.searchString).toBeTruthy();

            for(var i = 0, len = searchResults.length; i < len; i++) {
                expect(searchResults[i].searchString).toBeFalsy();
                expect(tagAndAppSearchString).toBeNonMatchingSubstringOf(searchResults[i].name);
            }
        });

        // APPSMALL-67: search box and autocomplete should search on both apps and tags
        it('should perform searches on apps and display results in App Mode', function() {
            var searchSelection = {};
            createTagAndAppWithMatchingNames();
            expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
            expect(scope.searchText).toBeEmpty();

            scope.getSearchResults(tagAndAppSearchString).then(function(results) {
                searchSelection = _.find(results, function(resultObj) { return (resultObj.app && !resultObj.searchString); });
            });
            rootScope.$apply();

            expect(searchSelection.app).toEqual(appShortname);
            expect(scope.searchText).toBeEmpty();

            scope.executeSearch(searchSelection);
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Search);
            expect(scope.selectedTags).toBeAnArrayOfSize(0);
            expect(scope.searchText).toEqual(searchSelection.app);

            expect(scope.filteredSearchResults.apps).toBeAnArrayOfSize(1);
            expect(scope.filteredSearchResults.apps).toHaveRecordWithIdMatching(savedApp);
        });

        // APPSMALL-67: tag searches on multiple tags should perform an AND search
        it('should perform searches on tags and display results in Tag Mode', function() {
            var selectedTagFromSearch;
            createTagsAssociatedToFixtureApps();
            expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
            expect(scope.visibleApps.length).toEqual(preLoadedIds.Apps.length);
            expect(scope.searchText).toBeEmpty();

            // searching on first tag name
            scope.getSearchResults(tagNamesForFixtureApps[0]).then(function(results) {
                selectedTagFromSearch = _.find(results, function(resultObj) { return (resultObj.tag && !resultObj.searchString); });
                expect(selectedTagFromSearch.tag).toEqual(tagNamesForFixtureApps[0]);
            });
            rootScope.$apply();

            scope.executeSearch(selectedTagFromSearch);
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.TagFilter);
            expect(scope.searchText).toBeEmpty();
            expect(scope.visibleApps).toHaveRecordWithFieldMatching(initialApps.first, 'shortname');
            expect(scope.visibleApps).not.toHaveRecordWithFieldMatching(initialApps.second, 'shortname');

            expect(scope.tagFilteredApps).toHaveRecordWithFieldMatching(initialApps.first, 'shortname');
            expect(scope.tagFilteredApps).not.toHaveRecordWithFieldMatching(initialApps.second, 'shortname');
        });

        // APPSMALL-67: clear app search if user clears search text
        it('should clear searches on apps when search text is cleared by user, and revert to Home state', function() {
            var searchSelection = {};
            createTagAndAppWithMatchingNames();
            expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
            expect(scope.searchText).toBeEmpty();

            scope.getSearchResults(tagAndAppSearchString).then(function(results) {
                searchSelection = _.find(results, function(resultObj) { return (resultObj.app && !resultObj.searchString); });
            });
            rootScope.$apply();

            expect(searchSelection.app).toEqual(appShortname);
            expect(scope.searchText).toBeEmpty();

            scope.executeSearch(searchSelection);
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Search);
            expect(scope.visibleApps).toBeAnArrayOfSize(1);
            expect(scope.visibleApps).toHaveRecordWithIdMatching(savedApp);

            // clearing name search value, which should remove app filtering
            scope.searchValue = '';
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
            expect(scope.visibleApps.length).toEqual(preLoadedIds.Apps.length);
        });

        // APPSMALL-67: default to Home mode when removing all tags
        it('should display apps in Home mode after removing all tags', function() {
            var selectedTagFromSearch;

            createTagsAssociatedToFixtureApps();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
            expect(scope.visibleApps.length).toEqual(preLoadedIds.Apps.length);
            expect(scope.getSelectedTagNames()).toBeEmpty();

            // searching on first tag name
            scope.getSearchResults(tagNamesForFixtureApps[0]).then(function(results) {
                selectedTagFromSearch = _.find(results, function(resultObj) { return (resultObj.tag && !resultObj.searchString); });
                expect(selectedTagFromSearch.tag).toEqual(tagNamesForFixtureApps[0]);
            });
            rootScope.$apply();

            scope.executeSearch(selectedTagFromSearch);
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.TagFilter);
            expect(scope.visibleApps.length).toBeLessThan(preLoadedIds.Apps.length);
            expect(scope.getSelectedTagNames()).toBeAnArrayOfSize(1);
            expect(_.first(scope.getSelectedTagNames())).toEqual(tagNamesForFixtureApps[0]);

            scope.executeTagRemovalSearch(_.first(scope.selectedTags));
            rootScope.$apply();

            expect(scope.getSelectedTagNames()).toBeEmpty();
            expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
            expect(scope.visibleApps.length).toEqual(preLoadedIds.Apps.length);
        });

        // APPSMALL-67: tag searches on multiple tags should perform an AND search
        it('should perform searches on multiple tags as an AND search', function() {
            var selectedTagFromSearch;

            createTagsAssociatedToFixtureApps();
            expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
            expect(scope.visibleApps.length).toEqual(preLoadedIds.Apps.length);
            expect(scope.getSelectedTagNames()).toBeEmpty();

            // searching on second tag name, which matches both apps
            scope.getSearchResults(tagNamesForFixtureApps[1]).then(function(results) {
                selectedTagFromSearch = _.find(results, function(resultObj) { return (resultObj.tag === tagNamesForFixtureApps[1]); });
                expect(selectedTagFromSearch).toBeTruthy();
            });
            rootScope.$apply();

            scope.executeSearch(selectedTagFromSearch);
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.TagFilter);
            expect(scope.getSelectedTagNames()).toBeAnArrayOfSize(1);

            expect(scope.visibleApps).toHaveRecordWithFieldMatching(initialApps.first, 'shortname');
            expect(scope.visibleApps).toHaveRecordWithFieldMatching(initialApps.second, 'shortname');

            // adding third tag name to search, which matches only second app.
            scope.getSearchResults(tagNamesForFixtureApps[2]).then(function(results) {
                selectedTagFromSearch = _.find(results, function(resultObj) { return (resultObj.tag === tagNamesForFixtureApps[2]); });
                expect(selectedTagFromSearch).toBeTruthy();
            });
            rootScope.$apply();

            scope.executeSearch(selectedTagFromSearch);
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.TagFilter);
            expect(scope.getSelectedTagNames()).toBeAnArrayOfSize(2);

            expect(scope.visibleApps).not.toHaveRecordWithFieldMatching(initialApps.first, 'shortname');
            expect(scope.visibleApps).toHaveRecordWithFieldMatching(initialApps.second, 'shortname');

            // adding first tag name to search, which matches only first app.
            scope.getSearchResults(tagNamesForFixtureApps[0]).then(function(results) {
                selectedTagFromSearch = _.find(results, function(resultObj) { return (resultObj.tag === tagNamesForFixtureApps[0]); });
                expect(selectedTagFromSearch).toBeTruthy();
            });
            rootScope.$apply();

            scope.executeSearch(selectedTagFromSearch);
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.TagFilter);
            expect(scope.getSelectedTagNames()).toBeAnArrayOfSize(3);

            expect(scope.visibleApps).not.toHaveRecordWithFieldMatching(initialApps.first, 'shortname');
            expect(scope.visibleApps).not.toHaveRecordWithFieldMatching(initialApps.second, 'shortname');
        });

        // APPSMALL-67: Tag search and app name auto complete should work in conjunction with each other, as AND search
        // Tag search in this test should select [app1, app2]
        // Text search in this test should select [app1, app3]
        it('should perform tag searches after performing a name search, and remove both searches to revert back to Home mode', function() {
            createTagsAssociatedToFixtureApps();

            var selectedSearchStringObj, emptySearchStringObj, selectedSearchTagObj;

            // create third app with name matching first app
            var newApp = Ozone.mockHelper.getRandomRecord('Apps', {}, {name: (initialApps.first.name + 'XYZ'), shortname: (initialApps.first.shortname + 'XYZ')});

            // save app and get id of saved app
            appService.save(newApp).then(function(savedApp) {
                initialApps.third = savedApp;
                preLoadedIds.Apps.push(savedApp._id);
            });
            rootScope.$apply();

            scope.getAppsAndComponentsFromServer();
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
            expect(scope.visibleApps.length).toEqual(preLoadedIds.Apps.length);
            expect(scope.getSelectedTagNames()).toBeEmpty();

            // starting with name search, on substring of first app name (this should also match the corresponding tag)
            var nameSearchString = (initialApps.first.name || '').substring(0,5);

            scope.getSearchResults(nameSearchString).then(function(results) {
                selectedSearchStringObj = _.find(results, function(resultObj) { return resultObj.searchString; });
                expect(selectedSearchStringObj).toBeTruthy();
            });
            rootScope.$apply();

            scope.executeSearch(selectedSearchStringObj);
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Search);
            expect(scope.filteredSearchResults.apps).toBeAnArrayOfSize(2);
            expect(scope.visibleApps).toBeAnArrayOfSize(2);
            expect(scope.visibleApps).toHaveRecordWithIdMatching(initialApps.first);
            expect(scope.visibleApps).toHaveRecordWithIdMatching(initialApps.third);

            // adding tag search to name search.
            // Search results should equal (tag search) AND (name search)
            scope.getSearchResults(tagNamesForFixtureApps[1]).then(function(results) {
                selectedSearchTagObj = _.find(results, function(resultObj) { return (resultObj.tag === tagNamesForFixtureApps[1]); });
                expect(selectedSearchTagObj).toBeTruthy();
            });
            rootScope.$apply();

            scope.executeSearch(selectedSearchTagObj);
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Search);
            expect(scope.visibleApps).toBeAnArrayOfSize(1);
            expect(scope.visibleApps).toHaveRecordWithIdMatching(initialApps.first);

            // clearing name search value, so that only tag search is performed
            scope.searchValue = '';
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.TagFilter);
            expect(scope.visibleApps).toBeAnArrayOfSize(2);
            expect(scope.visibleApps).toHaveRecordWithIdMatching(initialApps.first);
            expect(scope.visibleApps).toHaveRecordWithIdMatching(initialApps.second);

            // removing tag from search - should revert back to Home
            scope.executeTagRemovalSearch(_.first(scope.selectedTags));
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
            expect(scope.visibleApps.length).toEqual(preLoadedIds.Apps.length);
            expect(scope.getSelectedTagNames()).toBeEmpty();
        });

        // APPSMALL-67: Tag search and app name auto complete should work in conjunction with each other, as AND search
        // Tag search in this test should select [app1, app2]
        // Text search in this test should select [app1, app3]
        it('should perform name searches after performing a tag search, and remove both searches to revert back to Home mode', function() {
            createTagsAssociatedToFixtureApps(); 

            var selectedSearchStringObj, emptySearchStringObj, selectedSearchTagObj;

            // create third app with name matching first app
            var newApp = Ozone.mockHelper.getRandomRecord('Apps', {}, {name: (initialApps.first.name + 'XYZ'), shortname: (initialApps.first.shortname + 'XYZ')});

            // save app and get id of saved app
            appService.save(newApp).then(function(savedApp) {
                initialApps.third = savedApp;
                preLoadedIds.Apps.push(savedApp._id);
            });
            rootScope.$apply();

            scope.getAppsAndComponentsFromServer();
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
            expect(scope.visibleApps.length).toEqual(preLoadedIds.Apps.length);
            expect(scope.getSelectedTagNames()).toBeEmpty();

            // starting with tag search 
            scope.getSearchResults(tagNamesForFixtureApps[1]).then(function(results) {
                selectedSearchTagObj = _.find(results, function(resultObj) { return (resultObj.tag === tagNamesForFixtureApps[1]); });
                expect(selectedSearchTagObj).toBeTruthy();
            });
            rootScope.$apply();

            scope.executeSearch(selectedSearchTagObj);
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.TagFilter);
            expect(scope.visibleApps).toBeAnArrayOfSize(2);
            expect(scope.visibleApps).toHaveRecordWithIdMatching(initialApps.first);
            expect(scope.visibleApps).toHaveRecordWithIdMatching(initialApps.second);

            // adding name search to tag search: name search is substring of first app name (this should also match the corresponding tag)
            // Search results should equal (tag search) AND (name search)
            var nameSearchString = (initialApps.first.name || '').substring(0,5);

            scope.getSearchResults(nameSearchString).then(function(results) {
                selectedSearchStringObj = _.find(results, function(resultObj) { return resultObj.searchString; });
                expect(selectedSearchStringObj).toBeTruthy();
            });
            rootScope.$apply();

            scope.executeSearch(selectedSearchStringObj);
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Search);
            expect(scope.visibleApps).toBeAnArrayOfSize(1);
            expect(scope.visibleApps).toHaveRecordWithIdMatching(initialApps.first);

            // removing tag from search, so that only name search is performed
            scope.executeTagRemovalSearch(_.first(scope.selectedTags));
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Search);
            expect(scope.visibleApps).toBeAnArrayOfSize(2);
            expect(scope.visibleApps).toHaveRecordWithIdMatching(initialApps.first);
            expect(scope.visibleApps).toHaveRecordWithIdMatching(initialApps.third);

            // clearing name search - should revert back to Home
            scope.searchValue = '';
            rootScope.$apply();

            expect(scope.getViewState()).toEqual(scope.ViewStates.Home);
            expect(scope.visibleApps.length).toEqual(preLoadedIds.Apps.length);
            expect(scope.getSelectedTagNames()).toBeEmpty();
        });

    });

});
