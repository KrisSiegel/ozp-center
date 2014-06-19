'use strict';

/* jasmine specs for App Controller go here */

describe('App Submission Controller', function() {
    var rootScope, scope;
    var personaService, appService, dropdownService, tagService, appWorkflowService, uploadService;
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
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    var initializeControllerAndSetPersona = function(username, shortname) {
        inject(function($injector, $controller, $http, $rootScope, $timeout, _$q_, _$location_, _$window_, _$modal_) {
            personaService = $injector.get('Persona');
            appService = $injector.get('AppOrComponent');
            dropdownService = $injector.get('Dropdown');
            tagService = $injector.get('Tag');
            appWorkflowService = $injector.get('AppWorkflow');
            uploadService = $injector.get('FileUpload');

            rootScope = $rootScope;
            scope = $rootScope.$new();
            var q = _$q_;
            var location = _$location_;
            var window = _$window_;
            var modal = _$modal_;

            setCurrentPersona('testOzoneUser1');

            if (shortname) {
                location.search = function() { return {shortname: shortname}; };
            }

            var ctrl = $controller('AppSubmissionController', {
                $scope: scope, 
                $rootScope: rootScope,
                $q: q,
                $location: location,
                $window: window,
                $modal: modal,
                Persona: personaService,
                AppOrComponent: appService,
                Dropdown: dropdownService,
                Tag: tagService,
                AppWorkflow: appWorkflowService,
                FileUpload: uploadService
            });
            if (Ozone.utils.isFunction(scope.initializeController)) {
                scope.initializeController();
            }
            rootScope.$apply();
        });
    }

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

    it('should load a new app in the Drafts phase', function() {
        initializeControllerAndSetPersona();
        expect(scope.currentApp).toBeTruthy();
        expect(scope.currentApp.workflowState).toEqual('Drafts');
    });

    it('should load an existing app', function() {
        var allAppsList;
        appService.query().then(function(appList) {
            allAppsList = appList;
        });
        rootScope.$apply();

        expect(allAppsList).not.toBeEmpty();
        var testShortname = allAppsList[0].shortname;

        initializeControllerAndSetPersona(null, testShortname);
        expect(scope.currentApp).toBeRecordWithIdField();
        expect(scope.currentApp.shortname).toEqual(testShortname);
    });

    it('should save newly created apps when no app is passed in', function() {
        initializeControllerAndSetPersona();
        
        var appName = Ozone.mockHelper.getRandomString(12);
        var oldAppId, newAppId;
        scope.currentApp.name = appName;
        scope.currentApp.shortname = appName;

        scope.saveApp('save');
        rootScope.$apply();

        var allAppsList;
        appService.query().then(function(appList) {
            allAppsList = appList;
        });
        rootScope.$apply();

        expect(allAppsList).toBeAnArrayOfSize(preLoadedIds.Apps.length + 1);

        appService.query({shortname: appName}).then(function(appList) {
            expect(appList).toBeAnArrayOfSize(1);
            expect(appList[0]).toBeRecordWithIdField();
        });
        rootScope.$apply();
    });

    it('should create a new app in Drafts phase, then load that app', function() {
        initializeControllerAndSetPersona();

        var initialAppsList;
        appService.query().then(function(appList) {
            initialAppsList = appList;
        });
        rootScope.$apply();

        var existingAppShortname = initialAppsList[0].shortname;

        var initialAppName = Ozone.mockHelper.getRandomString(12);
        var oldAppId, newAppId;
        scope.currentApp.name = initialAppName;
        scope.currentApp.shortname = initialAppName;

        scope.saveApp('save');
        rootScope.$apply();

        appService.query({shortname: initialAppName}).then(function(appList) {
            expect(appList).toBeAnArrayOfSize(1);
            expect(appList[0]).toBeRecordWithIdField();
            oldAppId = appList[0]._id;
        });
        rootScope.$apply();

        // load fixture app into controller, to test that controller gets cleared out
        initializeControllerAndSetPersona(null, existingAppShortname);
        expect(scope.currentApp).toBeRecordWithIdField();
        expect(scope.currentApp.shortname).not.toEqual(initialAppName);

        // test loading newly created app
        initializeControllerAndSetPersona(null, initialAppName);
        expect(scope.currentApp).toBeRecordWithIdField();
        expect(scope.currentApp.shortname).toEqual(initialAppName);
    });

    // APPSMALL-533: clicking Save twice on a new app should save the app once, then update the saved app.
    it('should not create duplicate apps when saving a new app twice', function() {
        initializeControllerAndSetPersona();

        var appName = Ozone.mockHelper.getRandomString(12);
        var oldAppId, newAppId;
        scope.currentApp.name = appName;
        scope.currentApp.shortname = appName;

        scope.saveApp('save');
        rootScope.$apply();

        appService.query({shortname: appName}).then(function(appList) {
            expect(appList).toBeAnArrayOfSize(1);
            expect(appList[0]).toBeRecordWithIdField();
            oldAppId = appList[0]._id;
        });
        rootScope.$apply();

        scope.saveApp('save');
        rootScope.$apply();

        appService.query({shortname: appName}).then(function(appList) {
            expect(appList).toBeAnArrayOfSize(1);
            expect(appList[0]).toBeRecordWithIdField();
            newAppId = appList[0]._id;
            expect(newAppId).toEqual(oldAppId);
        });
        rootScope.$apply();
    });

    // APPSMALL-526: Organization should always update when creating a new app in App Submission
    it('should save Organization when creating a new app', function() {
        var appName = Ozone.mockHelper.getRandomString(12);
        var orgName = Ozone.mockHelper.getRandomString(12);
        var oldAppId, newAppId;

        initializeControllerAndSetPersona();

        scope.currentApp.name = appName;
        scope.currentApp.shortname = appName;
        scope.currentOrgTag = orgName;

        scope.saveApp('save');
        rootScope.$apply();

        appService.query({shortname: appName}).then(function(appList) {
            expect(appList).toBeAnArrayOfSize(1);
            expect(appList[0]).toBeRecordWithIdField();
            oldAppId = appList[0]._id;
        });
        rootScope.$apply();

        // re-load newly created app make sure Organization gets set to saved value
        initializeControllerAndSetPersona(null, appName);

        expect(scope.currentApp).toBeRecordWithIdField();
        expect(scope.currentApp.shortname).toEqual(appName);
        expect(scope.currentOrgTag).toEqual(orgName);
    });

    it('should save Organization when editing an existing app', function() {
        var appName = Ozone.mockHelper.getRandomString(12);
        var orgName = Ozone.mockHelper.getRandomString(12);
        var oldAppId, newAppId;

        initializeControllerAndSetPersona();

        scope.currentApp.name = appName;
        scope.currentApp.shortname = appName;

        scope.saveApp('save');
        rootScope.$apply();

        // re-load newly created app make sure Organization gets set to saved value
        initializeControllerAndSetPersona(null, appName);
        scope.currentOrgTag = orgName;

        scope.saveApp('save');
        rootScope.$apply();

        appService.query({shortname: appName}).then(function(appList) {
            expect(appList).toBeAnArrayOfSize(1);
            expect(appList[0]).toBeRecordWithIdField();
            oldAppId = appList[0]._id;
        });
        rootScope.$apply();

        initializeControllerAndSetPersona(null, appName);

        expect(scope.currentApp).toBeRecordWithIdField();
        expect(scope.currentApp.shortname).toEqual(appName);
        expect(scope.currentOrgTag).toEqual(orgName);
    });

});