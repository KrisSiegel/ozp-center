'use strict';

/* jasmine specs for App Controller go here */

describe('App Admin Controller', function() {
    var rootScope, scope, ctrl;
    var appService, workflowService, personaService, tagService, currentApp;
    var preLoadedIds = {};
    var testPersona = null, personaKey = null;

    beforeEach(function() {
        module('amlApp.controllers');
        module('amlApp.services');
        module('amlApp.directives');
        this.addMatchers(Ozone.mockHelper.appsMallCustomMatchers);

        Ozone.mockDb.loadFixtures(['Apps', 'Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions']);
        preLoadedIds = Ozone.mockDb.getAllIds(['Apps', 'Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions']);
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    var initializeControllerAndSetPersona = function(username) {
        inject(function($injector, $controller, $rootScope, $timeout, _$q_) {
            appService = $injector.get('AppOrComponent');
            workflowService = $injector.get('AppWorkflow');
            personaService = $injector.get('Persona');
            tagService = $injector.get('Tag');

            rootScope = $rootScope;
            scope = $rootScope.$new();
            var q = _$q_;
            var timeout = $timeout;

            setCurrentPersona(username);

            ctrl = $controller('AdminAppController', {
                $scope: scope, 
                $rootScope: rootScope,
                $timeout: timeout,
                $q: q,
                AppOrComponent: appService, 
                AppWorkflow: workflowService,
                Persona: personaService,
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

    it('should not initialize apps from fixture if user lacks permission to access this page', function() {
        initializeControllerAndSetPersona();
        expect(scope.allApps.length).toBe(0);
    });

    it('should initialize apps from fixture if user has permission to access this page', function() {
        initializeControllerAndSetPersona('testSystemAdmin1');
        expect(scope.allApps.length).toBeGreaterThan(0);
    });

});
