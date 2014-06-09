'use strict';

/* jasmine specs for Review service go here */

describe('Review service', function() {
    var appService, reviewService, rootScope;
    var preLoadedIds = [];

    beforeEach(function() {
        module('amlApp.services');
        this.addMatchers(Ozone.mockHelper.appsMallCustomMatchers);

        Ozone.mockDb.loadFixture('Apps');
        preLoadedIds = Ozone.mockDb.getAllIds(['Apps']);

        inject(function($injector, $rootScope) {
            appService = $injector.get('App');
            reviewService = $injector.get('Review');
            rootScope = $rootScope;
        });
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    it('should get ratings', function() {
        expect((reviewService.getRatings() || []).length).toEqual(5);
        _.each(_.pluck(reviewService.getRatings(), 'rating'), function(ratingValue) {
            expect(_.isNumber(ratingValue)).toBeTruthy();
        });
    });

    it('should add reviews for one and only one app', function() {
        var appWithReview, appWithoutReview, savedReview;

        // get two separate apps
        appService.get(preLoadedIds.Apps[0]).then(function(app) {
            appWithReview = app;
        });
        appService.get(preLoadedIds.Apps[1]).then(function(app) {
            appWithoutReview = app;
        });
        rootScope.$apply();

        expect(appWithReview._id).toNotEqual(appWithoutReview._id);

        var reviewTestData = Ozone.mockHelper.getRandomRecord('Reviews', {username: 'test'});

        // save app and get id of saved app
        reviewService.submit(appWithReview, reviewTestData.ratingAsNumber, reviewTestData.username, reviewTestData.reviewText).then(function(review) {
            savedReview = review;
        });
        rootScope.$apply();

        var reviewForSaved, reviewForOther;

        // get two separate apps
        reviewService.get(appWithReview._id, reviewTestData.username).then(function(review) {
            reviewForSaved = (review || [])[0];
        });
        reviewService.get(appWithoutReview._id, reviewTestData.username).then(function(review) {
            reviewForOther = (review || [])[0];
        });
        rootScope.$apply();

        expect(reviewForOther).toBeEmpty();
        expect(reviewForSaved).toBeRecordWithIdField();
    });

    it('should store one review for each user', function() {
        // initial values: test users 1 and 2 are different.
        var testUser1 = Ozone.mockHelper.getRandomString(8), testUser2 = Ozone.mockHelper.getRandomString(8);
        var testApp, testReview1Saved, testReview2Saved;

        // get two separate apps
        appService.get(preLoadedIds.Apps[0]).then(function(app) {
            testApp = app;
        });
        rootScope.$apply();

        var testReviewData1 = Ozone.mockHelper.getRandomRecord('Reviews', {username: testUser1});
        var testReviewData2 = Ozone.mockHelper.getRandomRecord('Reviews', {username: testUser2});

        // save app and get id of saved app
        reviewService.submit(testApp, testReviewData1.ratingAsNumber, testReviewData1.username, testReviewData1.reviewText);
        reviewService.submit(testApp, testReviewData2.ratingAsNumber, testReviewData2.username, testReviewData2.reviewText);
        rootScope.$apply();

        var testReview1, testReview2, updatedTestReview1;

        // get two separate apps
        reviewService.get(testApp._id, testUser1).then(function(review) {
            testReview1 = (review || [])[0] || {};
        });
        reviewService.get(testApp._id, testUser2).then(function(review) {
            testReview2 = (review || [])[0] || {};
        });
        rootScope.$apply();

        expect(testReview1).toBeRecordWithIdField();
        expect(testReview2).toBeRecordWithIdField();
        expect(testReview1.reviewText).not.toEqual(testReview2.reviewText);

        // modify existing review
        var newTestReviewData1 = Ozone.mockHelper.getRandomRecord('Reviews', {username: testUser1});
        reviewService.submit(testApp, newTestReviewData1.ratingAsNumber, newTestReviewData1.username, newTestReviewData1.reviewText);
        rootScope.$apply();

        expect(testReviewData1.reviewText).toNotEqual(newTestReviewData1.reviewText);

        // get updated review
        reviewService.get(testApp._id, testUser1).then(function(review) {
            updatedTestReview1 = (review || [])[0] || {};
        });
        rootScope.$apply();

        expect(testReview1.username).toEqual(updatedTestReview1.username);
        expect(testReview1.reviewText).toNotEqual(updatedTestReview1.reviewText);
        expect(testReview2.reviewText).toNotEqual(updatedTestReview1.reviewText);

    });

});

