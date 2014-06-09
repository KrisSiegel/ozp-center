'use strict';

/* jasmine specs for App service go here */

describe('App service', function() {
    var appService, rootScope;
    var preLoadedIds = [];

    beforeEach(function() {
        module('amlApp.services');
        this.addMatchers(Ozone.mockHelper.appsMallCustomMatchers);

        Ozone.mockDb.loadFixture('Apps');
        preLoadedIds = Ozone.mockDb.getAllIds(['Apps']);

        inject(function($injector, $rootScope) {
            appService = $injector.get('App');
            rootScope = $rootScope;
        });
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    it('should query for all apps', function() {
        var resultAppList;
        appService.query().then(function(appList) {
            resultAppList = appList;
        });
        rootScope.$apply();
        expect(resultAppList.length).toEqual(preLoadedIds.Apps.length);
    });

    it('should save and retrieve new apps from the database', function() {
        var initialRecordCount = preLoadedIds.Apps.length;
        var savedAppId, resultAppList;
        var newApp = Ozone.mockHelper.getRandomRecord('Apps');

        // save app and get id of saved app
        appService.save(newApp).then(function(savedApp) {
            savedAppId = savedApp._id;
        });
        rootScope.$apply();

        // check if new app has been saved to mock DB
        appService.query().then(function(appList) {
            resultAppList = appList;
        });
        rootScope.$apply();

        expect(resultAppList.length).toEqual(preLoadedIds.Apps.length + 1);
        expect(Ozone.mockDb.getAllIds('Apps')).toContain(savedAppId);
    });

    it('should not delete apps that do not exist in the database', function() {
        var initialRecordCount = preLoadedIds.Apps.length;
        var deletedAppId, resultAppList;
        var newApp = Ozone.mockHelper.getRandomRecord('Apps');

        // save app and get id of saved app
        appService.delete({_id: Ozone.utils.generateId()}).then(function(deletedApp) {
            deletedAppId = (deletedApp || {})._id;
        });
        rootScope.$apply();

        // check if new app has been saved to mock DB
        appService.query().then(function(appList) {
            resultAppList = appList;
        });
        rootScope.$apply();

        expect(resultAppList.length).toEqual(preLoadedIds.Apps.length);
        expect(deletedAppId).toBeFalsy();
    });

    it('should remove deleted apps from the database', function() {
        var initialRecordCount = preLoadedIds.Apps.length;
        var deletedAppId, resultAppList;
        var newApp = Ozone.mockHelper.getRandomRecord('Apps');

        // save app and get id of saved app
        appService.delete({_id: preLoadedIds.Apps[0]}).then(function(deletedApp) {
            deletedAppId = deletedApp._id;
        });
        rootScope.$apply();

        // check if new app has been saved to mock DB
        appService.query().then(function(appList) {
            resultAppList = appList;
        });
        rootScope.$apply();

        expect(resultAppList.length).toEqual(preLoadedIds.Apps.length - 1);
        expect(Ozone.mockDb.getAllIds('Apps')).toNotContain(deletedAppId);
    });

    it('should only retrieve apps that exist', function() {
        var existingApp, nonExistingApp;

        // save app and get id of saved app
        appService.get(preLoadedIds.Apps[0]).then(function(app) {
            existingApp = app;
        });
        rootScope.$apply();

        // check if new app has been saved to mock DB
        appService.get(Ozone.utils.generateId()).then(function(app) {
            nonExistingApp = app;
        });
        rootScope.$apply();

        expect(existingApp).toBeRecordWithIdField();
        expect(nonExistingApp).toBeEmpty();
    });

    it('should not overwrite the id when performing an update on an existing record', function() {
        var initialRecordCount = preLoadedIds.Apps.length;
        var savedApp, resultAppList;
        var newApp = Ozone.mockHelper.getRandomRecord('Apps');
        var firstSaveApp, secondSaveApp;

        expect(newApp._id).toBeFalsy();

        // save app and get id of saved app
        appService.save(newApp).then(function(savedApp) {
            firstSaveApp = savedApp;
        });
        rootScope.$apply();

        expect(firstSaveApp._id).toBeTruthy();

        // clone recently saved record before saving, so that values between first and second save can be compared
        var recordToUpdate = Ozone.utils.clone(firstSaveApp);
        recordToUpdate.name = Ozone.mockHelper.getRandomString(12);

        // check if new app has been saved to mock DB
        appService.save(recordToUpdate).then(function(savedApp) {
            secondSaveApp = savedApp;
        });
        rootScope.$apply();

        // All fields, including _id, between the two records should match -- except for name.
        expect(firstSaveApp._id).toEqual(secondSaveApp._id);
        expect(firstSaveApp.descriptionShort).toEqual(secondSaveApp.descriptionShort);
        expect(firstSaveApp.name).toNotEqual(secondSaveApp.name);
    });

});
