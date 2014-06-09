'use strict';

/* jasmine specs for AppWorkflow service go here */

describe('AppWorkflow service', function() {
    var appWorkflowService, rootScope;
    
    beforeEach(function() {
        module('amlApp.services');

        inject(function($injector, $rootScope) {
            appWorkflowService = $injector.get('AppWorkflow');
            rootScope = $rootScope;
        });
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    it('should get a list of workflow status types', function() {
        expect(appWorkflowService.workflowStateTypes.length).toBeGreaterThan(0);
    });
});
