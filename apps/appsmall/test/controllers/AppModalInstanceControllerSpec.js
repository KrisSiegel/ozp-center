'use strict';

/* jasmine specs for App Modal Instance Controller go here */

describe('App Modal Instance Controller', function() {
    var rootScope, sce, scope, ctrl, modalInstance, currentAppToLoad, modalInstance;
    var appService, reviewService, uploadService, personaService, searchService;
    var currentRecordName;

    var rootScope, scope;
    var appService, appSelectionService, reviewService, uploadService, personaService, searchService, tagService, ozoneService;
    var preLoadedIds = [];
    var testPersona = null, personaKey = null;
    var DefaultUser = 'testOzoneUser1';

    beforeEach(function() {
        module('amlApp.controllers');
        module('amlApp.services');
        module('amlApp.directives');
        this.addMatchers(Ozone.mockHelper.appsMallCustomMatchers);

        Ozone.mockDb.loadFixtures(['Apps', 'Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions', 'Reviews']);
        preLoadedIds = Ozone.mockDb.getAllIds(['Apps', 'Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions', 'Reviews']);
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    // initialize controller with previewer flag set to true or false, and
    // with preselected tags or null.
    var initializeControllerAndModalsAndPersona = function(appId, options) {

        options = Ozone.extend((options || {}), {username: DefaultUser, testTags:[], isPreviewer: false});

        inject(function($injector, $controller, $rootScope, $modal, $sce) {
            appService = $injector.get('AppOrComponent');
            personaService = $injector.get('Persona');
            reviewService = $injector.get('Review');
            tagService = $injector.get('Tag');
            uploadService = $injector.get('FileUpload');
            ozoneService = $injector.get('OzoneCommon');

            rootScope = $rootScope;
            scope = $rootScope.$new();
            sce = $sce;

            rootScope.$apply();

            // get app with id passed in
            appService.get({_id: appId}).then(function(app) {
                currentAppToLoad = app;
            });
            rootScope.$apply();

            modalInstance = $modal.open({
                template: Ozone.utils.murl('amlUrl', '/partials/appmodal.html'),
                controller: AppModalInstanceController,
                scope: scope,
                resolve: {
                    currentApp: function() { return currentAppToLoad; },
                    currentTags: function() { return options.testTags; },
                    previewer: function() { return options.isPreviewer; }
                }
            });
            
            rootScope.$apply();

            setCurrentPersona(options.username);

            ctrl = $controller('AppModalInstanceController', {
                $scope: scope, 
                $modalInstance: modalInstance,
                $rootScope: rootScope,
                $sce: sce,
                Persona: personaService,
                Review: reviewService,
                Tag: tagService,
                AppOrComponent: appService,
                FileUpload: uploadService,
                OzoneCommon: ozoneService,
                currentApp: currentAppToLoad,
                currentTags: options.testTags,
                previewer: options.isPreviewer
            });

            if (Ozone.utils.isFunction(scope.initializeController)) {
                scope.initializeController();
            }
            rootScope.$apply();
        });

    }

    // set current persona to persona with corresponding user, or generic test user if empty
    var setCurrentPersona = function(username) {
        username = username || DefaultUser;

        var personaData = _.find(Ozone.fixtures.personaRecords, function(personaRecord) { return (personaRecord.username === username); });
        personaService.setCurrentPersona(personaData).then(function(setPersona) {
            testPersona = setPersona;
        });
        rootScope.$apply();
        expect(testPersona).toBeTruthy();
    };


    it('should load the current app from fixture data', function() {
        initializeControllerAndModalsAndPersona(preLoadedIds.Apps[0]);
        expect(scope.currentApp).toBeRecordWithIdField();
        expect(scope.isPreviewer).toBeFalsy();
    });

    it('should load the previewer flag from fixture data', function() {
        initializeControllerAndModalsAndPersona(preLoadedIds.Apps[0], {isPreviewer: true});
        expect(scope.isPreviewer).toBeTruthy();
    });

    it('should load apps from fixture with existing records', function() {
        var allReviewsForApp = [];

        reviewService.get(preLoadedIds.Apps[0]).then(function(reviews) {
            allReviewsForApp = reviews;
        })
        rootScope.$apply();

        expect(allReviewsForApp).not.toBeEmpty();

        initializeControllerAndModalsAndPersona(preLoadedIds.Apps[0], {isPreviewer: true});
        expect(scope.allUserReviews).not.toBeEmpty();
        expect(scope.allUserReviews).toBeAnArrayOfSize(allReviewsForApp.length);
    });

    it('should submit ratings for newly created apps', function() {
        var newApp = Ozone.mockHelper.getRandomRecord('Apps');
        var newReviewText = Ozone.mockHelper.getRandomString(12);
        var savedAppId, allReviewsForApp;

        // save app and get id of saved app
        appService.save(newApp).then(function(savedApp) {
            savedAppId = savedApp._id;
        });
        rootScope.$apply();

        reviewService.get(savedAppId).then(function(reviews) {
            allReviewsForApp = reviews;
        })
        rootScope.$apply();

        expect(allReviewsForApp).toBeEmpty();

        initializeControllerAndModalsAndPersona(savedAppId);
        expect(scope.isPreviewer).toBeFalsy();
        expect(scope.allUserReviews).toBeEmpty();

        scope.rating = 2;
        scope.reviewText = newReviewText;
        scope.submitRating();
        rootScope.$apply();

        expect(scope.allUserReviews).toBeAnArrayOfSize(1);
        expect(scope.allUserReviews).toHaveRecordWithFieldEqualTo(newReviewText, 'reviewText');
    });

    it('should not submit ratings when in previewer mode', function() {
        var newApp = Ozone.mockHelper.getRandomRecord('Apps');
        var newReviewText = Ozone.mockHelper.getRandomString(12);
        var savedAppId, allReviewsForApp;

        // save app and get id of saved app
        appService.save(newApp).then(function(savedApp) {
            savedAppId = savedApp._id;
        });
        rootScope.$apply();

        reviewService.get(savedAppId).then(function(reviews) {
            allReviewsForApp = reviews;
        })
        rootScope.$apply();

        expect(allReviewsForApp).toBeEmpty();

        initializeControllerAndModalsAndPersona(savedAppId, {isPreviewer: true});
        expect(scope.isPreviewer).toBeTruthy();
        expect(scope.allUserReviews).toBeEmpty();

        scope.rating = 2;
        scope.reviewText = newReviewText;
        scope.submitRating();
        rootScope.$apply();

        expect(scope.allUserReviews).toBeEmpty();
    });

    it('should rewrite existing rating when submitting a second time', function() {
        var newApp = Ozone.mockHelper.getRandomRecord('Apps');
        var goodReviewText = Ozone.mockHelper.getRandomString(12);
        var badReviewText = Ozone.mockHelper.getRandomString(12);
        var savedAppId, allReviewsForApp;

        // save app and get id of saved app
        appService.save(newApp).then(function(savedApp) {
            savedAppId = savedApp._id;
        });
        rootScope.$apply();

        reviewService.get(savedAppId).then(function(reviews) {
            allReviewsForApp = reviews;
        })
        rootScope.$apply();

        expect(allReviewsForApp).toBeEmpty();

        initializeControllerAndModalsAndPersona(savedAppId);
        expect(scope.allUserReviews).toBeEmpty();

        scope.rating = 1;
        scope.reviewText = badReviewText;
        scope.submitRating();
        rootScope.$apply();

        expect(scope.allUserReviews).toBeAnArrayOfSize(1);
        expect(scope.allUserReviews).not.toHaveRecordWithFieldEqualTo(goodReviewText, 'reviewText');
        expect(scope.allUserReviews).toHaveRecordWithFieldEqualTo(badReviewText, 'reviewText');

        scope.rating = 5;
        scope.reviewText = goodReviewText;
        scope.submitRating();
        rootScope.$apply();

        expect(scope.allUserReviews).toBeAnArrayOfSize(1);
        expect(scope.allUserReviews).toHaveRecordWithFieldEqualTo(goodReviewText, 'reviewText');
        expect(scope.allUserReviews).not.toHaveRecordWithFieldEqualTo(badReviewText, 'reviewText');
    });


    describe('when submitting ratings for the same app by two different users', function() {

        var newApp = Ozone.mockHelper.getRandomRecord('Apps');
        var goodReviewText = Ozone.mockHelper.getRandomString(12);
        var badReviewText = Ozone.mockHelper.getRandomString(12);
        var savedAppId, allReviewsForApp;

        // setup that follows the "should rewrite existing rating when submitting a second time" test, except that a new controller is
        // created with a new user in-between ratings submissions.
        beforeEach(function() {
            // save app and get id of saved app
            appService.save(newApp).then(function(savedApp) {
                savedAppId = savedApp._id;
            });
            rootScope.$apply();

            reviewService.get(savedAppId).then(function(reviews) {
                allReviewsForApp = reviews;
            })
            rootScope.$apply();

            expect(allReviewsForApp).toBeEmpty();

            initializeControllerAndModalsAndPersona(savedAppId, {username: 'testOzoneUser1'});
            expect(scope.allUserReviews).toBeEmpty();

            scope.rating = 1;
            scope.reviewText = badReviewText;
            scope.submitRating();
            rootScope.$apply();

            expect(scope.allUserReviews).toBeAnArrayOfSize(1);
            expect(scope.allUserReviews).not.toHaveRecordWithFieldEqualTo(goodReviewText, 'reviewText');
            expect(scope.allUserReviews).toHaveRecordWithFieldEqualTo(badReviewText, 'reviewText');

            initializeControllerAndModalsAndPersona(savedAppId, {username: 'testAppsMallMallModerator1'});
            expect(scope.allUserReviews).not.toBeEmpty();

            scope.rating = 5;
            scope.reviewText = goodReviewText;
            scope.submitRating();
            rootScope.$apply();
        });

        it('should not rewrite ratings', function() {
            expect(scope.allUserReviews).toBeAnArrayOfSize(2);
            expect(scope.allUserReviews).toHaveRecordWithFieldEqualTo(goodReviewText, 'reviewText');
            expect(scope.allUserReviews).toHaveRecordWithFieldEqualTo(badReviewText, 'reviewText');
        });

        it('should filter based on star rating', function() {
            expect(scope.allUserReviews).toBeAnArrayOfSize(2);
            expect(scope.visibleUserReviews).toBeAnArrayOfSize(2);
            expect(scope.visibleUserReviews).toHaveRecordWithFieldEqualTo(goodReviewText, 'reviewText');
            expect(scope.visibleUserReviews).toHaveRecordWithFieldEqualTo(badReviewText, 'reviewText');

            scope.filterReviewsByRating(5);
            rootScope.$apply();

            expect(scope.allUserReviews).toBeAnArrayOfSize(2);
            expect(scope.visibleUserReviews).toBeAnArrayOfSize(1);
            expect(scope.visibleUserReviews).toHaveRecordWithFieldEqualTo(goodReviewText, 'reviewText');
            expect(scope.visibleUserReviews).not.toHaveRecordWithFieldEqualTo(badReviewText, 'reviewText');

            scope.filterReviewsByRating(1);
            rootScope.$apply();

            expect(scope.allUserReviews).toBeAnArrayOfSize(2);
            expect(scope.visibleUserReviews).toBeAnArrayOfSize(1);
            expect(scope.visibleUserReviews).not.toHaveRecordWithFieldEqualTo(goodReviewText, 'reviewText');
            expect(scope.visibleUserReviews).toHaveRecordWithFieldEqualTo(badReviewText, 'reviewText');

            scope.filterReviewsByRating(3);
            rootScope.$apply();

            expect(scope.allUserReviews).toBeAnArrayOfSize(2);
            expect(scope.visibleUserReviews).toBeEmpty();
            expect(scope.visibleUserReviews).not.toHaveRecordWithFieldEqualTo(goodReviewText, 'reviewText');
            expect(scope.visibleUserReviews).not.toHaveRecordWithFieldEqualTo(badReviewText, 'reviewText');
        });

    });

});
