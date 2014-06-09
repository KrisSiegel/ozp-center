'use strict';

/* jasmine specs for Persona service go here */

describe('Persona service', function() {
    var personaService, rootScope;
    var preLoadedIds = [];
    var testPersona = null;
    var personaKey;
    
    beforeEach(function() {
        module('amlApp.services');
        this.addMatchers(Ozone.mockHelper.appsMallCustomMatchers);

        Ozone.mockDb.loadFixtures(['Personas', 'PersonaRoles', 'PersonaPermissions']);
        preLoadedIds = Ozone.mockDb.getAllIds(['Personas', 'PersonaRoles', 'PersonaPermissions']);

        personaKey = Ozone.mockDb.getKeyFieldFromRecord('Personas');
        testPersona = null;

        inject(function($injector, $rootScope) {
            personaService = $injector.get('Persona');
            rootScope = $rootScope;
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

    it('should get a list of personas', function() {
        var allPersonas;
        personaService.queryPersona({}).then(function(personaList) {
            allPersonas = personaList;
        });
        rootScope.$apply();
        expect(allPersonas.length).toBeGreaterThan(0);
    });

    it('should set the current persona and query the persona list by the current username', function() {
        var queriedCurrentPersonaById, currentPersonaData;
        setCurrentPersona();
        rootScope.$apply();

        personaService.getCurrentPersonaData().then(function(personaData) {
            currentPersonaData = personaData;
        });
        rootScope.$apply();

        personaService.queryPersona({username: currentPersonaData.username}).then(function(personaList) {
            expect(personaList.length).toEqual(1);
            queriedCurrentPersonaById = _.first(personaList);
        });
        rootScope.$apply();

        expect(currentPersonaData.username).toEqual(queriedCurrentPersonaById.username);
    });

    describe('when assigning favorite apps', function() {
        var appService;

        beforeEach(function() {
            Ozone.mockDb.loadFixture('Apps', 'appRecords');
            preLoadedIds.Apps = Ozone.mockDb.getAllIds('Apps');

            inject(function($injector) {
                appService = $injector.get('App');
            });
        });

        afterEach(function() {
            Ozone.mockDb.deleteAllCollections();
        });


        it('should add and remove favorite apps for a given persona', function() {
            var queriedCurrentPersonaById, initialPersonaData, postFavoritedPersonaData, postRemovedPersonaData;
            setCurrentPersona();
            rootScope.$apply();

            var savedAppShortname;
            var newApp = Ozone.mockHelper.getRandomRecord('Apps');
            appService.save(newApp).then(function(savedApp) {
                savedAppShortname = savedApp.shortname;
            });

            // query current persona
            personaService.getCurrentPersonaData().then(function(personaData) {
                initialPersonaData = personaData;
            });
            rootScope.$apply();

            expect(initialPersonaData.favoriteApps).toNotContain(savedAppShortname);

            // adding app as favorite for current persona
            personaService.addOrRemoveFavoriteApp(savedAppShortname, true);
            rootScope.$apply();

            personaService.getCurrentPersonaData().then(function(personaData) {
                postFavoritedPersonaData = personaData;
            });
            rootScope.$apply();

            expect(postFavoritedPersonaData.favoriteApps).toContain(savedAppShortname);
            expect(postFavoritedPersonaData.favoriteApps.length).toEqual(initialPersonaData.favoriteApps.length + 1);

            // removing app as favorite for current persona
            personaService.addOrRemoveFavoriteApp(savedAppShortname, false);
            rootScope.$apply();

            personaService.getCurrentPersonaData().then(function(personaData) {
                postRemovedPersonaData = personaData;
            });
            rootScope.$apply();

            expect(postRemovedPersonaData.favoriteApps).toNotContain(savedAppShortname);
            expect(postRemovedPersonaData.favoriteApps.length).toEqual(initialPersonaData.favoriteApps.length);
        });

        it('should add favorite apps differently for each persona', function() {
            var queriedCurrentPersonaById, initialPersonaData, postFavoritedPersonaData, secondPersonaData;
            setCurrentPersona();
            rootScope.$apply();

            var savedAppShortname;
            var newApp = Ozone.mockHelper.getRandomRecord('Apps');
            appService.save(newApp).then(function(savedApp) {
                savedAppShortname = savedApp.shortname;
            });

            // query current persona
            personaService.getCurrentPersonaData().then(function(personaData) {
                initialPersonaData = personaData;
            });
            rootScope.$apply();

            expect(initialPersonaData.favoriteApps).toNotContain(savedAppShortname);

            // adding app as favorite for current persona
            personaService.addOrRemoveFavoriteApp(savedAppShortname, true);
            rootScope.$apply();

            personaService.getCurrentPersonaData().then(function(personaData) {
                postFavoritedPersonaData = personaData;
            });
            rootScope.$apply();

            expect(postFavoritedPersonaData.favoriteApps).toContain(savedAppShortname);
            expect(postFavoritedPersonaData.favoriteApps.length).toEqual(initialPersonaData.favoriteApps.length + 1);

            // change current persona and query for persona data
            setCurrentPersona('testSystemAdmin1');
            rootScope.$apply();

            personaService.getCurrentPersonaData().then(function(personaData) {
                secondPersonaData = personaData;
            });
            rootScope.$apply();

            expect(secondPersonaData.favoriteApps).toNotContain(savedAppShortname);
        });

    });

});
