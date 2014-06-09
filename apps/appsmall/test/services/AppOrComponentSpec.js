'use strict';

/* jasmine specs for AppOrComponent service go here */

describe('AppOrComponent service', function() {
    var appOrComponentService, rootScope;
    var preLoadedIds = [];

    beforeEach(function() {
        module('amlApp.services');
        this.addMatchers(Ozone.mockHelper.appsMallCustomMatchers);

        Ozone.mockDb.loadFixture('Apps');
        preLoadedIds = Ozone.mockDb.getAllIds(['Apps']);

        inject(function($injector, $rootScope) {
            appOrComponentService = $injector.get('AppOrComponent');
            rootScope = $rootScope;
        });
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    it('should query for all components when components type is passed in, and return no records if components are not enabled.', function() {
        var resultComponentList;
        appOrComponentService.query({type: 'component'}).then(function(componentList) {
            resultComponentList = componentList;
        });
        rootScope.$apply();
        expect(resultComponentList.length).toEqual(0);
    });

    describe('for App objects', function() {

        it('should query for all apps', function() {
            var resultAppList;
            appOrComponentService.query().then(function(appList) {
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
            appOrComponentService.save(newApp).then(function(savedApp) {
                savedAppId = savedApp._id;
            });
            rootScope.$apply();

            // check if new app has been saved to mock DB
            appOrComponentService.query().then(function(appList) {
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
            appOrComponentService.delete({_id: Ozone.utils.generateId(), type: 'app'}).then(function(deletedApp) {
                deletedAppId = (deletedApp || {})._id;
            });
            rootScope.$apply();

            // check if new app has been saved to mock DB
            appOrComponentService.query().then(function(appList) {
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
            appOrComponentService.delete({_id: preLoadedIds.Apps[0], type: 'app'}).then(function(deletedApp) {
                deletedAppId = deletedApp._id;
            });
            rootScope.$apply();

            // check if new app has been saved to mock DB
            appOrComponentService.query().then(function(appList) {
                resultAppList = appList;
            });
            rootScope.$apply();

            expect(resultAppList.length).toEqual(preLoadedIds.Apps.length - 1);
            expect(Ozone.mockDb.getAllIds('Apps')).toNotContain(deletedAppId);
        });

        it('should only retrieve apps that exist', function() {
            var existingApp, nonExistingApp;

            // save app and get id of saved app
            appOrComponentService.get({_id: preLoadedIds.Apps[0], type: 'app'}).then(function(app) {
                existingApp = app;
            });
            rootScope.$apply();

            // check if new app has been saved to mock DB
            appOrComponentService.get({_id: Ozone.utils.generateId(), type: 'app'}).then(function(app) {
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
            appOrComponentService.save(newApp).then(function(savedApp) {
                firstSaveApp = savedApp;
            });
            rootScope.$apply();

            expect(firstSaveApp._id).toBeTruthy();

            // clone recently saved record before saving, so that values between first and second save can be compared
            var recordToUpdate = Ozone.utils.clone(firstSaveApp);
            recordToUpdate.name = Ozone.mockHelper.getRandomString(12);

            // check if new app has been saved to mock DB
            appOrComponentService.save(recordToUpdate).then(function(savedApp) {
                secondSaveApp = savedApp;
            });
            rootScope.$apply();

            // All fields, including _id, between the two records should match -- except for name.
            expect(firstSaveApp._id).toEqual(secondSaveApp._id);
            expect(firstSaveApp.descriptionShort).toEqual(secondSaveApp.descriptionShort);
            expect(firstSaveApp.name).toNotEqual(secondSaveApp.name);
        });

    });

});
