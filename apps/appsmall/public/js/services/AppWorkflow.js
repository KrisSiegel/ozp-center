'use strict';

// Workflow status strings and corresponding CSS classes.
// Classes must match the "Workflow State CSS" section of aml.css
var workflowStatusColorClasses = {
    "Published": "workflow-state-published",
    "Pending Approval": "workflow-state-pending",
    "Action Needed": "workflow-state-action-needed",
    "Not Approved": "workflow-state-rejected",
    "Hidden": "workflow-state-hidden",
    "Drafts": "workflow-state-draft"
};

// List of actions and the new workflow status.
// If null, then workflow status will either get set to Drafts (if it didn't exist) or remain unchanged.
var workflowStatusActions = {
    "submit": 'Pending Approval',
    "publish": 'Published',
    "moreinfo": 'Action Needed',
    "reject": 'Not Approved',
    "save": null
};

var redHighlighted = ["Action Needed"];

servicesModule.factory('AppWorkflow', function() {
    return {
        workflowStatusTypes: _.keys(workflowStatusColorClasses),
        workflowStatusColorClasses: workflowStatusColorClasses,
        workflowStatusActions: workflowStatusActions,
        isRedHighlighted: function(workflowStatus) {
            return _.contains(redHighlighted, workflowStatus);
        }
    };
});
