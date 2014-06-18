'use strict';

/* jasmine specs for Dropdown service go here */

describe('Dropdown service', function() {
    var dropdownService, rootScope;
    
    beforeEach(function() {
        module('amlApp.services');

        inject(function($injector, $rootScope) {
            dropdownService = $injector.get('Dropdown');
            rootScope = $rootScope;
        });
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    // it('should get list of badges', function() {
    //     var resultBadgeList;
    //     dropdownService.getBadgeList().then(function(badgeList) {
    //         resultBadgeList = badgeList;
    //     });
    //     rootScope.$apply();
    //     expect(_.keys(resultBadgeList).length).toBeGreaterThan(0);
    // });
});
