/**
 * 
 *
 * @module servicesModule
 * @submodule AppWorkflowModule
 * @requires amlApp.services
 */

'use strict';

/**
 * A lookup object with workflow states as keys and CSS color classes as values
 * @attribute workflowStateColorClasses
 */
var workflowStateColorClasses = {
    "Published": "workflow-state-published",
    "Pending Approval": "workflow-state-pending",
    "Action Needed": "workflow-state-action-needed",
    "Not Approved": "workflow-state-rejected",
    "Hidden": "workflow-state-hidden",
    "Drafts": "workflow-state-draft"
};

/**
 * List of actions and the new workflow status.
 * If null, then workflow status will either get set to Drafts (if it didn't exist) or remain unchanged.
 * @attribute workflowStateActions
 */
var workflowStateActions = {
    "submit": 'Pending Approval',
    "publish": 'Published',
    "moreinfo": 'Action Needed',
    "reject": 'Not Approved',
    "save": null
};

/**
 * A list of all workflow states that appear in red on the App Management page
 * @attribute redHighlighted
 * @private
 */
var redHighlighted = ["Action Needed"];

/**
 * @class AppWorkflowService
 * @static
 */ 

/**
 * @class AppWorkflowService
 * @constructor
 */

var AppWorkflowService = [function() {
    return {
        /**
         * A list of all workflow states
         * @attribute workflowStateTypes
         */
        workflowStateTypes: _.keys(workflowStateColorClasses),
        // See attribute comment
        workflowStateColorClasses: workflowStateColorClasses,
        // See attribute comment
        workflowStateActions: workflowStateActions,
        /**
         * Returns true ior false based on whether the workflow state passed in should appear in red on the App Management page
         * @method isRedHighlighted
         * @return true if the workflow state passed in should appear in red on the App Management page
         */
        isRedHighlighted: function(workflowState) {
            return _.contains(redHighlighted, workflowState);
        }
    };
}];

servicesModule.factory('AppWorkflow', AppWorkflowService);
