/**
 * Controller object for displaying tags on left panel of AppsMall home page
 *
 * @module AppsMallUI.controllersModule
 * @submodule AppsMallUI.AdminAppControllerModule
 * @requires amlApp.controllers
 */

'use strict';

/**
 * @class AppsMallUI.AdminAppController
 * @static
 */

/**
 * @class AppsMallUI.AdminAppController
 * @constructor
 * @param $scope {ChildScope} Child scope that provides context for this controller - [API Documentation](https://docs.angularjs.org/api/ng/type/$rootScope.Scope) 
 * @param $rootScope {Scope} Single root scope for application, and ancestor of all other scopes - [API Documentation](https://docs.angularjs.org/api/ng/service/$rootScope) 
 * @param $window {Window} Reference to browser window object - [API Documentation](https://docs.angularjs.org/api/ng/service/$window) 
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 * @param AppOrComponent {Object} an Angular-injected instance of {{#crossLink "AppsMallUI.AppOrComponentService"}}{{/crossLink}}
 * @param AppWorkflow {Object} an Angular-injected instance of {{#crossLink "AppsMallUI.AppWorkflowService"}}{{/crossLink}}
 * @param Persona {Object} an Angular-injected instance of {{#crossLink "AppsMallUI.PersonaService"}}{{/crossLink}}
 */


var AdminAppController = ['$scope', '$rootScope', '$window', '$q', 'AppOrComponent', 'AppWorkflow', 'Persona', function($scope, $rootScope, $window, $q, AppOrComponent, AppWorkflow, Persona) {

    /**
     * Persona data for the currently logged-in user
     * @attribute {Object} personaData
     * @required
     */
    $scope.personaData = {};

    /**
     * Angular Promise object used to query for persona data
     * @attribute {PromiseObject} personaDataPromise
     */
    var personaDataPromise = Persona.getCurrentPersonaData().then(function(currentPersonaData) {
        console.log('Persona data: ' + JSON.stringify(currentPersonaData));
        $scope.userName = currentPersonaData.username;
        $scope.roles = currentPersonaData.roles;
        $scope.favoriteApps = currentPersonaData.favoriteApps;
        $scope.personaData = currentPersonaData;
    });

    /**
     * An array of apps filtered by user-selected workflow state.  Contains all apps if no workflow state has been selected.
     * @attribute {Array} displayedApps
     * @required
     */
    $scope.displayedApps = [];

    /**
     * An array of every single app returned from the Ozone service, included apps not displayed in the AppsMall view.
     * @attribute {Array} allApps
     * @required
     */
    $scope.allApps = [];

    /**
     * Workflow state type lookup as defined in {{#crossLink "AppsMallUI.AppWorkflowService"}}{{/crossLink}}.workflowStateTypes
     * @attribute {Array} workflowStateTypes
     * @required
     */
     $scope.workflowStateTypes = AppWorkflow.workflowStateTypes;

    /**
     * Workflow state action lookup as defined in {{#crossLink "AppsMallUI.AppWorkflowService"}}{{/crossLink}}.workflowStateActions
     * @attribute {Object} workflowStateActions
     * @required
     */
    $scope.workflowStateActions = AppWorkflow.workflowStateActions;

    /**
     * object-of-arrays used to query apps by workflow state: [workflow state] -> [Array of apps with that workflow state]
     * @attribute {Object} appsByWorkflowStatus
     * @required
     */
    $scope.appsByWorkflowStatus = {};

    $rootScope.$on('refreshApps', function(event) {
        console.log("refreshApps broadcast received.");
        $scope.getAppsFromServer();
    });

    /**
     * Gets the CSS class used to visually display workflow state
     * @method workflowStatusClass
     * @param workflowStatus {String} A workflow state as defined in {{#crossLink "AppsMallUI.AppWorkflowService"}}{{/crossLink}}.workflowStateTypes
     * @return {String} the CSS class corresponding to workflow state passed in
     */
    $scope.workflowStatusClass = function(workflowStatus) {
        return AppWorkflow.workflowStateColorClasses[workflowStatus] || '';
    }

    /**
     * Check whether workflow state appears in red on the left panel
     * @method isHighlighted
     * @param workflowStatus {String} A workflow state as defined in {{#crossLink "AppsMallUI.AppWorkflowService"}}{{/crossLink}}.workflowStateTypes
     * @return {Boolean} true if workflow state is red-highlighted
     */
    $scope.isHighlighted = function(workflowStatus) {
        return AppWorkflow.isRedHighlighted(workflowStatus);
    }

    /**
     * Gets formatted update date from app passed in
     * @method getShortDateUpdated
     * @param app {Object} An App object with date fields
     * @return {String} a stringified short date value for the app passed in
     */
    $scope.getShortDateUpdated = function(app) {
        var date = new Date(app.updatedOn);
        return (isNaN(date.getYear())) ? '' : moment(date).format('MM-DD-YYYY');
    }

    /**
     * Checks if workflow status passed in was last selected
     * @method isWorkflowStatusSelected
     * @param workflowStatus {String} A workflow state as defined in {{#crossLink "AppsMallUI.AppWorkflowService"}}{{/crossLink}}.workflowStateTypes
     * @return {Boolean} True if the workflow status passed in was last selected, and False otherwise.
     */
    $scope.isWorkflowStatusSelected = function(workflowStatus) {
        return ($scope.userFilterSelection === workflowStatus);
    }

    /**
     * Sets selected workflow status:
     * If user clicked on selected workflow status, then unselect tag.
     * If user clicked on an unselected workflow status, then select the clicked status.
     * @method toggleWorkflowStatusSelection
     * @param workflowStatus {String} A workflow state as defined in {{#crossLink "AppsMallUI.AppWorkflowService"}}{{/crossLink}}.workflowStateTypes
     */
    $scope.toggleWorkflowStatusSelection = function(workflowStatus) {
        var workflowStatusClicked = $scope.isWorkflowStatusSelected(workflowStatus);
        if (workflowStatusClicked) {
            $scope.userFilterSelection = '';
            $scope.displayedApps = _.clone($scope.allApps);
        } else {
            $scope.userFilterSelection = workflowStatus;
            $scope.displayedApps = _.clone($scope.appsByWorkflowStatus[workflowStatus] || []);
        }
    }

    /**
     * Returns the number of apps with the workflow state passed in.
     * @method getWorkflowStatusCount
     * @param workflowStatus {String} A workflow state as defined in {{#crossLink "AppsMallUI.AppWorkflowService"}}{{/crossLink}}.workflowStateTypes
     * @return {Number} the number of apps with the workflow state passed in
     */
    $scope.getWorkflowStatusCount = function(workflowStatus) {
        return ($scope.appsByWorkflowStatus[workflowStatus] || []).length;
    }

    /**
     * Retrieves all apps from Ozone service, based on user permissions
     * @method getAppsFromServer
     * @return {PromiseObject} used to query for apps
     */
    $scope.getAppsFromServer = function() {
        personaDataPromise.then(function() {
            if ($scope.personaData.hasAppManagerAccess) {
                var queryParameters = {};
                // if user has no app approval / rejection permission: just show user's own apps
                if (!$scope.personaData.hasApproveMallWideApplicationAccess && !$scope.personaData.hasApproveOrganizationOnlyApplicationAccess) {
                    queryParameters = {createdBy: $scope.userName};
                }
                AppOrComponent.query(queryParameters).then(function(data) {
                    var dateSorter = common.getDateSorterFunction('updatedOn', true);
                    $scope.allApps = (data || []).sort(dateSorter);
                    // perform filtering on client side until query on server side considers createdBy a valid parameter.
                    if (queryParameters.createdBy) {
                        $scope.allApps = _.filter($scope.allApps, function(app) { return (app.createdBy === $scope.userName); });
                    }
                    $scope.hasApps = ($scope.allApps.length > 0);
                    $scope.displayedApps = _.clone($scope.allApps);
                    $scope.appsByWorkflowStatus = _.groupBy($scope.allApps, 'workflowState');
                    $scope.appsLoaded = true;
                });
            }
            else {
                $scope.allApps = [];
                $scope.hasApps = false;
                $scope.displayedApps = [];
                $scope.appsByWorkflowStatus = {};
            }
        });
    }

    var oldModals = false;


    /**
     * Redirects to the App Submission form with the app passed in, or New App if no app is passed in.
     * @method loadAppChildForm
     * @param selectedApp {Object} 
     */
    $scope.loadAppChildForm = function(selectedApp) {
        if ($scope.personaData.hasAppManagerAccess) {
            if (_.isEmpty(selectedApp)) {
                $window.location = Ozone.utils.murl("amlUrl", '/manage/apps/submission/');
            }
            else {
                $window.location = Ozone.utils.murl("amlUrl", ['/manage/apps/submission/#/', selectedApp.shortname]);
            }
        }
    }

    /**
     * View state "enumeration" with display states as keys and stringified rpresentation of each key as values.  All keys and values must be unique.
     * @attribute {Object} ViewStates
     * @private
     */
    var ViewStates = {
        Empty: 'empty',
        AppManager: 'manager'
    }

    /**
     * Method to retrieve application view state, and used internally by several shortcut methods.
     * @method getViewState
     * @return {String} the view state in stringified form
     */
    $scope.getViewState = function() {
        if ($scope.allApps.length === 0 && $scope.appsLoaded) {
            return ViewStates.Empty;
        }
        return ViewStates.AppManager;
    }

    /**
     * Check whether App Manager is displaying the empty message instead of displaying the App Manager main page
     * @method isEmpty
     * @return {Boolean} true if empty message is displayed, and false for any other state (such as App Manager mode)
     */
    $scope.isEmpty = function() {
        return ($scope.getViewState() === ViewStates.Empty);
    }

    /**
     * Check whether App Manager is visible
     * @method isAppManagerMode
     * @return {Boolean} true if in App Manager mode, and false otherwise
     */
    $scope.isAppManagerMode = function() {
        return ($scope.getViewState() === ViewStates.AppManager);
    }


    //----- App Import Code (TODO: Move into separate directive, or somewhere else out of the controller) -----//

    var html = document.getElementsByTagName("html")[0];

    html.ondragover = function () {
        this.className = 'hover'; return false;
    };
    html.ondragend = function () {
        this.className = ''; return false;
    };

    /**
     * Displays import success message
     * @method importSuccessFunction
     * @param status {Number} HTTP status code
     * @param response {Object} Import action response, as a list of App objects imported
     */
    var importSuccessFunction = function(status, response) {
        if (_.isArray(response)) {
            if (response.length > 0) {
                var numAppsSent = response.length;
                var appNames = _.pluck(response, 'name').join(', ');
                alert(numAppsSent + " app" + ((numAppsSent === 1) ? '' : 's') + " successfully imported: " + appNames);
            }
            else {
                alert("No app definitions were found in import file.");
            }
        }
        else {
            alert("Successfully imported apps to Apps Mall.");
        }
        $scope.getAppsFromServer();
    };

    /**
     * Displays import error message
     * @method importErrorFunction
     * @param status {Number} HTTP status code
     * @param response {Object} Error message response from server
     * @private
     */
    var importErrorFunction = function(status, response) {
        alert("Error importing apps to Apps Mall.");
    };

    html.ondrop = function (event) {
        event.preventDefault();
        var files = event.target.files || event.dataTransfer.files;
        var fileObj = files[0];
        if (files && fileObj && (fileObj instanceof File)) {
            if (fileObj.type === 'application/json' ||
                    (_.contains(['application/octet-stream', 'application/zip',
                                 'application/x-compressed', 'application/x-zip-compressed'], fileObj.type))) {
                Ozone.Service("Apps").import(fileObj, function(data) {
                    if (data !== undefined) {
                        importSuccessFunction(undefined, data);
                    } else {
                        importErrorFunction(undefined, data);
                    }
                });
            }
            else {
                alert("Import files must be in either JSON or ZIP file format.");
            }
        }
        return false;
    };

    // initializing controller
    $scope.getAppsFromServer();

}];

controllersModule.controller('AdminAppController', AdminAppController);
