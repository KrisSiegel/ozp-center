'use strict';

/* jasmine specs for Search service go here */

describe('Search service', function() {
    var appService, searchService, rootScope;
    var preLoadedIds = [];

    beforeEach(function() {
        module('amlApp.services');
        this.addMatchers(Ozone.mockHelper.appsMallCustomMatchers);

        Ozone.mockDb.loadFixture('Apps');
        preLoadedIds = Ozone.mockDb.getAllIds(['Apps']);

        inject(function($injector, $rootScope) {
            appService = $injector.get('App');
            searchService = $injector.get('Search');
            rootScope = $rootScope;
        });
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    it('should search for existing apps, where the search string matches the start of the name', function() {
        var savedAppName, nameStartSearchResults, nameMiddleSearchResults;

        // save app and get name (not shortname) of saved app for searching
        appService.get(preLoadedIds.Apps[0]).then(function(app) {
            savedAppName = app.name;
        });
        rootScope.$apply();

        // getting substring at start-of-name (which should match existing app) and
        // middle-of-name substring (which should not match).
        var startNameSubstring = savedAppName.substring(0,4);
        var midNameSubstring = savedAppName.substring(2,6);

        searchService.nameSearch(startNameSubstring).then(function(nameList) {
            nameStartSearchResults = nameList;
        });
        searchService.nameSearch(midNameSubstring).then(function(nameList) {
            nameMiddleSearchResults = nameList;
        });
        rootScope.$apply();
        console.log('start: ' + JSON.stringify(nameStartSearchResults) + ', mid: ' + JSON.stringify(nameMiddleSearchResults) );

        expect(nameStartSearchResults.apps).toBeTruthy();
        expect(nameMiddleSearchResults.apps).toBeTruthy();

        expect(nameStartSearchResults.apps.length).toBeGreaterThan(0);
        expect(nameMiddleSearchResults.apps.length).toEqual(0);
    });

    it('should search for recently saved apps, where the search string matches the start of the name', function() {
        var savedApp, queryResultNames, allApps;
        var newApp = Ozone.mockHelper.getRandomRecord('Apps');
        var appFirstTwoLetters = newApp.name.substring(0,2);

        // check if new app has been saved to mock DB
        appService.query().then(function(appList) {
            allApps = appList;
        });
        rootScope.$apply();

        // sanity check on test data: at least one test app name must not match the autocomplete string.
        // Make sure that the fixture data names do not start with the same letter.
        var appNames =_.pluck(allApps, 'name');
        var appNamesMatchingSearchString = appNames.filter(function(appName) { return (appName.substring(0,2) === appFirstTwoLetters); });
        expect(appNamesMatchingSearchString.length).toBeLessThan(appNames.length);

        // save app and get id of saved app
        appService.save(newApp).then(function(app) {
            savedApp = app;
        });
        rootScope.$apply();

        // check if new app has been saved to mock DB
        searchService.nameSearch(appFirstTwoLetters).then(function(nameList) {
            queryResultNames = nameList;
        });
        rootScope.$apply();

        // check if new app has been saved to mock DB
        appService.query().then(function(appList) {
            allApps = appList;
        });
        rootScope.$apply();

        // query should return a list of names greater than 0 (i.e. including newly saved app), but less than entire app list.
        expect(queryResultNames.apps).toBeTruthy();
        expect(queryResultNames.apps.length).toBeGreaterThan(0);
        expect(queryResultNames.apps.length).toBeLessThan(allApps.length);
        expect(queryResultNames.apps).toContain(savedApp.name);
    });

    describe('when searching for apps and tags', function() {
        var tagService, personaService;
        var testPersona = null;
        var personaKey;

        beforeEach(function() {
            Ozone.mockDb.loadFixtures(['Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions']);

            preLoadedIds.Tags = Ozone.mockDb.getAllIds('Tags');
            preLoadedIds.Personas = Ozone.mockDb.getAllIds('Personas');

            personaKey = Ozone.mockDb.getKeyFieldFromRecord('Personas');
            testPersona = null;

            inject(function($injector, $rootScope) {
                tagService = $injector.get('Tag');
                personaService = $injector.get('Persona');
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

        it('should search for apps and tags, by app name, with one call where the search string matches the start of the name', function() {
            var savedApp, savedTag, searchResultObject;

            var newTag = Ozone.mockHelper.getRandomRecord('Tags');

            // save tag and retrieve saved tag from callback (which returns tag wrapped in an array-of-arrays)
            tagService.createNewTagsAndTopics([newTag.tag], newTag.uri, '/AppsMall/App/', newTag.level).then(function(tagResult) {
                savedTag = _(tagResult).values().flatten().first();
            });
            rootScope.$apply();

            // create shortname for app where search string matches the start of the shortname string
            var tagShortname = savedTag.tag;
            var appShortname = tagShortname + 'ABC';

            var newAppWithTagShortname = Ozone.mockHelper.getRandomRecord('Apps', null, {name: appShortname, shortname: appShortname});
            appService.save(newAppWithTagShortname).then(function(app) {
                savedApp = app;
            });
            rootScope.$apply();

            // perform search using search string, which should match both app and tag

            searchService.appAndTagNameSearch(tagShortname).then(function(results) {
                searchResultObject = results;
            });
            rootScope.$apply();

            console.log('searchResultObject = ' + JSON.stringify(searchResultObject));
            expect(searchResultObject.apps).toBeAnArrayOfSize(1);
            expect(searchResultObject.tags).toBeAnArrayOfSize(1);
            expect(searchResultObject.components).toBeEmpty();

            // names in search result object should match corresponding fields of newly created app and tag
            expect(searchResultObject.apps[0]).toEqual(savedApp.name);
            expect(searchResultObject.tags[0]).toEqual(savedTag.tag);

            // perform search using search string, which should match only the app

            var appOnlySearchResultObject;
            searchService.appAndTagNameSearch(appShortname).then(function(results) {
                appOnlySearchResultObject = results;
            });
            rootScope.$apply();

            // query should return a list of names greater than 0 (i.e. including newly saved app), but less than entire app list.
            expect(appOnlySearchResultObject.apps).toBeAnArrayOfSize(1);
            expect(appOnlySearchResultObject.tags).toBeEmpty();
            expect(appOnlySearchResultObject.components).toBeEmpty();
        });

    });

});
