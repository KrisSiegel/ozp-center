'use strict';

/* jasmine specs for Component service go here */

describe('Component service', function() {
    var componentService, rootScope;
    
    beforeEach(function() {
        module('amlApp.services');

        Ozone.mockDb.loadFixture('Apps');

        inject(function($injector, $rootScope) {
            componentService = $injector.get('Component');
            rootScope = $rootScope;
        });
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    it('should query for all components and return an empty list', function() {
        var resultComponentList;
        componentService.query().then(function(componentList) {
            resultComponentList = componentList;
        });
        rootScope.$apply();
        expect(resultComponentList.length).toBe(0);
    });
});
