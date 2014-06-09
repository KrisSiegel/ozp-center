'use strict';

/* jasmine specs for FileUpload service go here */

describe('FileUpload service', function() {
    var fileUploadService, rootScope;
    
    beforeEach(function() {
        module('amlApp.services');

        inject(function($injector, $rootScope) {
            fileUploadService = $injector.get('FileUpload');
            rootScope = $rootScope;
        });
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    // RWP TEMP: don't add tests here unless it actually tests some kind of file upload operation.

    // it('should upload a file', function() {
    // 
    // });
});
