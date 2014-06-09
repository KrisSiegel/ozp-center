'use strict';

/* jasmine specs for App Controller go here */

describe('Tag Controller', function() {
    var rootScope, scope, ctrl;
    var appService, tagService, personaService;
    var preLoadedIds = [];
    var testPersona = null, personaKey = null;

    beforeEach(function() {
        module('amlApp.controllers');
        module('amlApp.services');
        module('amlApp.directives');

        Ozone.mockDb.loadFixtures(['Apps', 'Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions']);
        preLoadedIds = Ozone.mockDb.getAllIds(['Apps', 'Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions']);
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    var initializeControllerAndSetPersona = function(username) {
        inject(function($injector, $controller, $rootScope, $modal) {
            appService = $injector.get('AppOrComponent');
            tagService = $injector.get('Tag');
            personaService = $injector.get('Persona');

            rootScope = $rootScope;
            scope = $rootScope.$new();

            setCurrentPersona(username);

            ctrl = $controller('TagController', {
                $scope: scope, 
                AppOrComponent: appService, 
                Tag: tagService
            });
            if (Ozone.utils.isFunction(scope.initializeController)) {
                scope.initializeController();
            }
            rootScope.$apply();
        });
    };

    // set current persona to persona with corresponding user, or generic test user if empty
    var setCurrentPersona = function(username) {
        username = username || 'testOzoneUser1';

        var personaData = _.find(Ozone.fixtures.personaRecords, function(personaRecord) { return (personaRecord.username === username); });
        personaService.setCurrentPersona(personaData).then(function(setPersona) {
            testPersona = setPersona;
        });
        rootScope.$apply();
        expect(testPersona).toBeTruthy();
    };


    it('should initialize tags from fixture', function() {
        initializeControllerAndSetPersona();
        expect(scope.systemTags.length).toBeGreaterThan(0);
        expect(scope.categoryTags.length).toBeGreaterThan(0);
        expect(scope.collectionTags.length).toBeGreaterThan(0);
    });

});
