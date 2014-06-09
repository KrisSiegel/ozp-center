'use strict';

/* jasmine specs for Tag Manager Controller go here */

describe('Admin Topics Controller', function() {
    var rootScope, scope;
    var appService, appWorkflowService, tagService, personaService;

    // pre-loaded ids for all fixtures, which should change after every test in beforeEach method
    var preLoadedIds = [];
    var testPersona = null, personaKey = null;

    // createTagsAssociatedToNewApps() initialized objects
    var initialTagNames = {}, initialApps = {};

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

    var initializeControllerAndSetPersona = function(username, topicUri) {
        inject(function($injector, $controller, $http, $rootScope) {
            appService = $injector.get('AppOrComponent');
            appWorkflowService = $injector.get('AppWorkflow');
            tagService = $injector.get('Tag');
            personaService = $injector.get('Persona');

            rootScope = $rootScope;
            scope = $rootScope.$new();

            setCurrentPersona(username);

            var ctrl = $controller('AdminTopicsController', {
                $scope: scope, 
                AppOrComponent: appService,
                AppWorkflow: appWorkflowService,
                Tag: tagService,
                Persona: personaService
            });
            if (Ozone.utils.isFunction(scope.initializeController)) {
                scope.initializeController(topicUri || '/AppsMall/App/');
            }
        });
        rootScope.$apply();
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
    }

    // create threre tags that are associated to apps as follows:
    // app1: [tag1, tag2]
    // app2: [tag2, tag3]
    // Names for each fo the three tags are assigned to tagNamesForFixtureApps.
    var createTagsAssociatedToNewApps = function() {
        var App1 = Ozone.mockHelper.getRandomRecord('Apps'), App2 = Ozone.mockHelper.getRandomRecord('Apps');

        appService.save(App1).then(function(savedApp) {
            initialApps.first = savedApp;
        });
        appService.save(App2).then(function(savedApp) {
            initialApps.second = savedApp;
        });
        rootScope.$apply();

        initialTagNames = {
            firstonly: Ozone.mockHelper.getRandomString(12),
            both: Ozone.mockHelper.getRandomString(12),
            secondonly: Ozone.mockHelper.getRandomString(12)
        }

        var newTag1_App1 = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: initialTagNames.firstonly, uri: appService.getUri(initialApps.first)});
        var newTag2_App1 = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: initialTagNames.both, uri: appService.getUri(initialApps.first)});
        var newTag2_App2 = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: initialTagNames.both, uri: appService.getUri(initialApps.second)});
        var newTag3_App2 = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: initialTagNames.secondonly, uri: appService.getUri(initialApps.second)});

        _([newTag1_App1, newTag2_App1, newTag2_App2, newTag3_App2])
         .each(function(newTag) {
             tagService.createNewTagsAndTopics([newTag.tag], newTag.uri, '/AppsMall/App/', newTag.level).then(function(tagResult) {
                 var savedTag = _(tagResult).values().flatten().first();
                 // console.log('CTATNA: SAVED TAG = ' + JSON.stringify(savedTag));
                 expect(savedTag.uri).toStartWith('/AppsMall/Apps/');
             });
             rootScope.$apply();
         });

         scope.refreshTopics();
         rootScope.$apply();
    };

    it('should set permission flag accordingly if user lacks permission to access this page', function() {
        initializeControllerAndSetPersona();
        expect(scope.hasPermission()).toBeFalsy();
    });

    it('should set permission flag accordingly if user has permission to access this page', function() {
        initializeControllerAndSetPersona('testSystemAdmin1');
        expect(scope.hasPermission()).toBeTruthy();
    });

    // tag controller should refresh with new app, after creating new tag and topic for new app.
    it('should load and refresh tags when new tag and topic has been created for an existing app', function() {
        initializeControllerAndSetPersona('testSystemAdmin1');

        var testApp = Ozone.mockHelper.getRandomRecord('Apps');
        var savedApp;

        appService.save(testApp).then(function(app) {
            savedApp = app;
        });
        rootScope.$apply(); 

        expect(savedApp).toBeRecordWithIdField();

        var newTagUri = appService.getUri(savedApp);
        var newTagName = Ozone.mockHelper.getRandomString(10);

        expect(scope.appsByTopic[newTagName]).toBeEmpty();

        var newTag = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: newTagName, uri: newTagUri});
        tagService.createNewTagsAndTopics([newTag.tag], newTag.uri, '/AppsMall/App/', newTag.level);
        rootScope.$apply();

        scope.refreshTopics();
        rootScope.$apply();

        expect(scope.appsByTopic[newTagName]).toBeAnArrayOfSize(1);
        expect(scope.appsByTopic[newTagName][0]).toHaveFieldMatching(newTag, 'tag');
    });

    // tag controller should not load apps that don't exist
    it('should not load apps that do not exist', function() {
        initializeControllerAndSetPersona('testSystemAdmin1');

        var testApp = Ozone.mockHelper.getRandomRecord('Apps');
        var newTagUri = Ozone.mockHelper.getRandomString(10);
        var newTagName = Ozone.mockHelper.getRandomString(10);

        expect(scope.appsByTopic[newTagName]).toBeEmpty();

        var newTag = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: newTagName, uri: newTagUri});
        tagService.createNewTagsAndTopics([newTag.tag], newTag.uri, '/AppsMall/App/', newTag.level);
        rootScope.$apply();

        scope.refreshTopics();
        rootScope.$apply();

        expect(scope.appsByTopic[newTagName]).toBeEmpty();
    });

    // tag controller should not load tags without valid topic types
    it('should ignore all tags without a valid topic', function() {
        initializeControllerAndSetPersona('testSystemAdmin1');

        var testApp = Ozone.mockHelper.getRandomRecord('Apps');
        var savedApp;

        appService.save(testApp).then(function(app) {
            savedApp = app;
        });
        rootScope.$apply(); 

        expect(savedApp).toBeRecordWithIdField();

        var newTagUri = appService.getUri(savedApp);
        var newTagName = Ozone.mockHelper.getRandomString(10);

        expect(scope.appsByTopic[newTagName]).toBeEmpty();

        var newTag = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'}, {tag: newTagName, uri: newTagUri});
        tagService.createNewTagsAndTopics([newTag.tag], newTag.uri, '/dummy/topic', newTag.level);
        rootScope.$apply();

        scope.refreshTopics();
        rootScope.$apply();

        expect(scope.appsByTopic[newTagName]).toBeEmpty();
    });

    // tag controller should be able to add new tags
    it('should add new tags', function() {
        initializeControllerAndSetPersona('testSystemAdmin1');
        createTagsAssociatedToNewApps();

        var initialTopics = _.clone(scope.topics);

        // simulate pressing "Add New Tag" button
        scope.createNewTopic();
        rootScope.$apply();

        var newTagName = Ozone.mockHelper.getRandomString(12);
        expect(initialTopics).not.toHaveRecordWithFieldEqualTo(newTagName, 'tag');

        scope.topicModel.topic.tag = newTagName;
        scope.topicModel.topic.description = Ozone.mockHelper.getRandomString(12);

        // simulate pressing Save button on New Topic page
        scope.saveTopic();
        rootScope.$apply();

        scope.refreshTopics();
        rootScope.$apply();

        var newTopics = _.clone(scope.topics);
        expect(newTopics).toBeAnArrayOfSize(initialTopics.length + 1);
        expect(newTopics).toHaveRecordWithFieldEqualTo(newTagName, 'tag');
    });

    // APPSMALL-68: tag controller should be able to remove existing tags
    it('should remove all tags with AppsMall/App URI prefix when removing a tag', function() {
        initializeControllerAndSetPersona('testSystemAdmin1');
        createTagsAssociatedToNewApps();

        var firstAppUri = '/AppsMall/Apps/' + initialApps.first.shortname;
        var secondAppUri = '/AppsMall/Apps/' + initialApps.second.shortname;

        expect(scope.appsByTopic[initialTagNames.firstonly]).toBeAnArrayOfSize(1);
        expect(scope.appsByTopic[initialTagNames.both]).toBeAnArrayOfSize(2);
        expect(scope.appsByTopic[initialTagNames.secondonly]).toBeAnArrayOfSize(1);

        tagService.getTags({uri: firstAppUri}).then(function(tagList) { 
            expect(tagList).toBeAnArrayOfSize(2);
        });
        tagService.getTags({uri: secondAppUri}).then(function(tagList) { 
            expect(tagList).toBeAnArrayOfSize(2);
        });
        rootScope.$apply();

        var bothAppsTopic = _.find(scope.topics, function(topic) { return (topic.tag === initialTagNames.both)  });
        expect(bothAppsTopic).toBeRecordWithIdField();

        // simulate selecting topic from left menu
        scope.setSelected(bothAppsTopic._id);
        expect(scope.topicModel.apps).toBeAnArrayOfSize(2);
        rootScope.$apply();

        // simulate pressing Delete (trash) button on selected topic
        scope.deleteTopic();
        rootScope.$apply();

        expect(scope.appsByTopic[initialTagNames.firstonly]).toBeAnArrayOfSize(1);
        expect(scope.appsByTopic[initialTagNames.both]).toBeEmpty();
        expect(scope.appsByTopic[initialTagNames.secondonly]).toBeAnArrayOfSize(1);

        tagService.getTags({uri: firstAppUri}).then(function(tagList) { 
            expect(tagList).toBeAnArrayOfSize(1);
        });
        tagService.getTags({uri: secondAppUri}).then(function(tagList) { 
            expect(tagList).toBeAnArrayOfSize(1);
        });
        rootScope.$apply();
    });

    // APPSMALL-68: tag controller should only remove existing tags with AppsMall/App URI prefix
    it('should not remove tags that do not have the AppsMall/App URI prefix when removing a tag', function() {
        initializeControllerAndSetPersona('testSystemAdmin1');
        createTagsAssociatedToNewApps();
        var firstAppUri = '/AppsMall/Apps/' + initialApps.first.shortname;
        var secondAppUri = '/AppsMall/Apps/' + initialApps.second.shortname;

        var newTag = Ozone.mockHelper.getRandomRecord('Tags');
        var dummyUri = '/dummy/uri';
        newTag.tag = initialTagNames.both;
        newTag.uri = dummyUri;
        tagService.createNewTag(newTag.tag, newTag.uri, dummyUri).then(function(tag) { 
            expect(tag).toBeAnArrayOfSize(1);
            expect(tag[0]).toBeRecordWithIdField();
        });
        rootScope.$apply();

        var bothTagSubstring = initialTagNames.both.substring(0,10);

        tagService.searchTagsByNameSubstring(bothTagSubstring).then(function(tagList) { 
            expect(tagList).toBeAnArrayOfSize(3);
            expect(tagList).toHaveRecordWithFieldMatching({uri: dummyUri}, 'uri');
            console.log('>>> TAGS: ' + JSON.stringify(tagList));
        });
        rootScope.$apply();

        var bothAppsTopic = _.find(scope.topics, function(topic) { return (topic.tag === initialTagNames.both)  });
        expect(bothAppsTopic).toBeRecordWithIdField();

        // simulate selecting topic from left menu
        scope.setSelected(bothAppsTopic._id);

        // simulate pressing Delete (trash) button on selected topic
        scope.deleteTopic();
        rootScope.$apply();

        tagService.searchTagsByNameSubstring(bothTagSubstring).then(function(tagList) { 
            expect(tagList).toBeAnArrayOfSize(1);
            expect(tagList).toHaveRecordWithFieldMatching({uri: dummyUri}, 'uri');
        });
        rootScope.$apply();
    });

    // APPSMALL-68: tag controller should adds apps to the user-selected tag
    it('should add new applications to the tag selected by the user', function() {
        initializeControllerAndSetPersona('testSystemAdmin1');
        createTagsAssociatedToNewApps();
        var firstAppUri = '/AppsMall/Apps/' + initialApps.first.shortname;
        var secondAppUri = '/AppsMall/Apps/' + initialApps.second.shortname;

        expect(scope.appInTopic(initialApps.first, initialTagNames.firstonly)).toBeTruthy();
        expect(scope.appInTopic(initialApps.second, initialTagNames.firstonly)).toBeFalsy();

        scope.toggleAppTopic(initialApps.second, initialTagNames.firstonly);
        rootScope.$apply();

        expect(scope.appInTopic(initialApps.first, initialTagNames.firstonly)).toBeTruthy();
        expect(scope.appInTopic(initialApps.second, initialTagNames.firstonly)).toBeTruthy();
    });

    // APPSMALL-68: tag controller should remove the tag from a single application
    // Rewritten for Admin Topics controller.
    it('should toggle tags selected from within an application', function() {
        initializeControllerAndSetPersona('testSystemAdmin1');
        createTagsAssociatedToNewApps();
        var firstAppUri = '/AppsMall/Apps/' + initialApps.first.shortname;
        var secondAppUri = '/AppsMall/Apps/' + initialApps.second.shortname;

        expect(scope.appsByTopic[initialTagNames.firstonly]).toBeAnArrayOfSize(1);
        expect(scope.appsByTopic[initialTagNames.both]).toBeAnArrayOfSize(2);
        expect(scope.appsByTopic[initialTagNames.secondonly]).toBeAnArrayOfSize(1);

        // toggle uncheck tag <firstonly> from app <first>, and uncheck tag <secondonly> from app <second>

        scope.toggleAppTopic(initialApps.first, initialTagNames.firstonly);
        rootScope.$apply();

        expect(scope.appsByTopic[initialTagNames.firstonly]).toBeEmpty();
        expect(scope.appsByTopic[initialTagNames.both]).toBeAnArrayOfSize(2);
        expect(scope.appsByTopic[initialTagNames.secondonly]).toBeAnArrayOfSize(1);

        scope.toggleAppTopic(initialApps.second, initialTagNames.secondonly);
        rootScope.$apply();

        expect(scope.appsByTopic[initialTagNames.firstonly]).toBeEmpty();
        expect(scope.appsByTopic[initialTagNames.both]).toBeAnArrayOfSize(2);
        expect(scope.appsByTopic[initialTagNames.secondonly]).toBeEmpty();

        tagService.getTags({uri: firstAppUri}).then(function(tagList) { 
            expect(tagList).toBeAnArrayOfSize(1);
            expect(tagList).toHaveRecordWithFieldMatching({tag: initialTagNames.both}, 'tag');
        });
        rootScope.$apply();

        tagService.getTags({uri: secondAppUri}).then(function(tagList) { 
            expect(tagList).toBeAnArrayOfSize(1);
            expect(tagList).toHaveRecordWithFieldMatching({tag: initialTagNames.both}, 'tag');
        });
        rootScope.$apply();

        // toggle re-check tag <firstonly> from app <first>, and re-check tag <secondonly> from app <second>

        scope.toggleAppTopic(initialApps.first, initialTagNames.firstonly);
        rootScope.$apply();

        expect(scope.appsByTopic[initialTagNames.firstonly]).toBeAnArrayOfSize(1);
        expect(scope.appsByTopic[initialTagNames.both]).toBeAnArrayOfSize(2);
        expect(scope.appsByTopic[initialTagNames.secondonly]).toBeEmpty();

        scope.toggleAppTopic(initialApps.second, initialTagNames.secondonly);
        rootScope.$apply();

        expect(scope.appsByTopic[initialTagNames.firstonly]).toBeAnArrayOfSize(1);
        expect(scope.appsByTopic[initialTagNames.both]).toBeAnArrayOfSize(2);
        expect(scope.appsByTopic[initialTagNames.secondonly]).toBeAnArrayOfSize(1);

        tagService.getTags({uri: firstAppUri}).then(function(tagList) { 
            expect(tagList).toBeAnArrayOfSize(2);
            expect(tagList).toHaveRecordWithFieldMatching({tag: initialTagNames.firstonly}, 'tag');
            expect(tagList).toHaveRecordWithFieldMatching({tag: initialTagNames.both}, 'tag');
        });
        rootScope.$apply();

        tagService.getTags({uri: secondAppUri}).then(function(tagList) { 
            expect(tagList).toBeAnArrayOfSize(2);
            expect(tagList).toHaveRecordWithFieldMatching({tag: initialTagNames.secondonly}, 'tag');
            expect(tagList).toHaveRecordWithFieldMatching({tag: initialTagNames.both}, 'tag');
        });
        rootScope.$apply();
    });

});