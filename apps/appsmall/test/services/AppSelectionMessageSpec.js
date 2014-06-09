'use strict';

/* jasmine specs for AppSelectionMessage service go here */

describe('AppSelectionMessage service', function() {
    var tagService, personaService, appSelectionMessageService, appOrComponentService, rootScope;
    var preLoadedIds = [];
    var testPersona = null;
    var personaKey;

    beforeEach(function() {
        module('amlApp.services');
        this.addMatchers(Ozone.mockHelper.appsMallCustomMatchers);

        Ozone.mockDb.loadFixtures(['Apps', 'Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions']);
        preLoadedIds = Ozone.mockDb.getAllIds(['Apps', 'Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions']);

        personaKey = Ozone.mockDb.getKeyFieldFromRecord('Personas');
        testPersona = null;

        inject(function($injector, $rootScope) {
            appSelectionMessageService = $injector.get('AppSelectionMessage');
            appOrComponentService = $injector.get('AppOrComponent');
            tagService = $injector.get('Tag');
            personaService = $injector.get('Persona');
            rootScope = $rootScope;
        });
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    it('should have home categories', function() {
        expect(appSelectionMessageService.HomeCategories).not.toBeEmpty();
    });

    it('should return apps in all Home page rows when Featured apps exist', function() {
        var newApp = Ozone.mockHelper.getRandomRecord('Apps', null, {featured: true});
        var savedAppId, selectionMessage;

        // save app and get id of saved app
        appOrComponentService.save(newApp).then(function(savedApp) {
            savedAppId = savedApp._id;
        });
        rootScope.$apply();

        // get Home message object that maps carousel rows on Home page to apps
        appSelectionMessageService.getHomeAppSelectionMessage().then(function(msg) {
            selectionMessage = msg;
        })
        rootScope.$apply();

        var categoriesFromMessage = _.pluck(selectionMessage, 'header');
        expect(categoriesFromMessage).toContainAllOf(appSelectionMessageService.HomeCategories);

        _.each(appSelectionMessageService.HomeCategories, function(category) {
            expect(selectionMessage).toHaveRecordWithFieldMatching({header: category}, 'header');
        })

        // All app rows should have at least 1 app.
        _.each(selectionMessage, function(appRow) { 
            expect(appRow.appShortNames).not.toBeEmpty();
        });
    });

    // APPSMALL-527: don't display empty rows of apps on AppsMall home page
    it('should not return Featured row when Featured apps exist', function() {
        var featuredAppIds = [];
        var selectionMessage;

        // remove all featured apps
        appOrComponentService.query().then(function(appList) {
            _.each(appList, function(app) {
                if (app.featured) {
                    featuredAppIds.push(app._id);
                }
            })
        });
        rootScope.$apply();

        _.each(featuredAppIds, function(appId) {
            appOrComponentService.delete({_id: appId, type: 'app'});
        })
        rootScope.$apply();

        // get Home message object that maps carousel rows on Home page to apps
        appSelectionMessageService.getHomeAppSelectionMessage().then(function(msg) {
            selectionMessage = msg;
        })
        rootScope.$apply();

        var categoriesFromMessage = _.pluck(selectionMessage, 'header');
        expect(categoriesFromMessage).not.toContainAllOf(appSelectionMessageService.HomeCategories);

    });

});