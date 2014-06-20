/**
 * Controller object for displaying the AppsMall home page main panel
 *
 * @module AppsMallUI.controllersModule
 * @submodule AppsMallUI.AppSubmissionControllerModule
 * @requires amlApp.controllers
 */

'use strict';

/**
 * @class AppsMallUI.AppSubmissionController
 * @static
 */ 

/**
 * @class AppsMallUI.AppSubmissionController
 * @constructor
 * @param $scope {ChildScope} Child scope that provides context for this controller - [API Documentation](https://docs.angularjs.org/api/ng/type/$rootScope.Scope) 
 * @param $rootScope {Scope} Single root scope for application, and ancestor of all other scopes - [API Documentation](https://docs.angularjs.org/api/ng/service/$rootScope) 
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 * @param $location {LocationHashbangUrl} Angular service for parsing URLs - [API Documentation](https://docs.angularjs.org/api/ng/service/$location) 
 * @param $window {Window} Reference to browser window object - [API Documentation](https://docs.angularjs.org/api/ng/service/$window) 
 * @param $modal {Object} Angular service that creates modal instances - [API Documentation](http://angular-ui.github.io/bootstrap/#/modal) 
 * @param Persona {Object} an Angular-injected instance of {{#crossLink "PersonaService"}}{{/crossLink}}
 * @param AppOrComponent {Object} an Angular-injected instance of {{#crossLink "AppOrComponentService"}}{{/crossLink}}
 * @param Dropdown {Object} an Angular-injected instance of {{#crossLink "DropdownService"}}{{/crossLink}}
 * @param Tag {Object} an Angular-injected instance of {{#crossLink "TagService"}}{{/crossLink}}
 * @param AppWorkflow {Object} an Angular-injected instance of {{#crossLink "AppWorkflowService"}}{{/crossLink}}
 * @param FileUpload {Object} an Angular-injected instance of {{#crossLink "FileUploadService"}}{{/crossLink}}
 */


var AppSubmissionController = ['$scope', '$rootScope', '$q', '$location', '$window', '$modal', 'Persona', 'AppOrComponent', 'Dropdown', 'Tag', 'AppWorkflow', 'FileUpload',  function ($scope, $rootScope, $q, $location, $window, $modal, Persona, AppOrComponent, Dropdown, Tag, AppWorkflow, FileUpload) {

    /**
     * The tag that maps the current app to an organization
     * @attribute {Object} orgTag
     * @required
     * @private
     */
     var orgTag = null;

     /**
      * Persona data for the currently logged-in user
      * @attribute {Object} personaData
      * @required
      */
     $scope.personaData = {};

     /**
      * Method called by ng-init directive when declaring controller in view page
      * @method initializeController
      */
     $scope.initializeController = function() {
         // resolving shortname from path, from one of two formats:
         // html5Mode: <url>?name=<shortname>
         // non-html5 mode: <url>/#/<shortname>
         var html5AppShortnameFromUrl = ($location.search() || {}).shortname;
         var appShortnameFromUrl = html5AppShortnameFromUrl || ($location.path() || '').replace('/','');

         // saving initial shortname for URL resolution - this remains unchanged even if user changes shortname
         $scope.initialShortname = '';

         $scope.AllowComponents = AppOrComponent.AllowComponents;

         // variables scoped to controller
         $scope.newApp = {};
         $scope.userFilterSelection = '';

         $scope.initialTagObjects = [];
         $scope.allTags = [];
         $scope.allCategories = [];
         $scope.selectedTags = [];
         $scope.selectedCategories = [];

         $scope.successMessage = '';
         $scope.errorMessage = '';

         $scope.isSaving = false;
         $scope.hasInvalidPublishAttempt = false;
         $scope.hasInvalidSaveAttempt = false;
         $scope.tabValidationState = {};

         //clear out orgTag
         orgTag = null;
         $scope.currentOrgTag = null;

         $scope.workflowStateTypes = AppWorkflow.workflowStateTypes;
         $scope.workflowStateActions = AppWorkflow.workflowStateActions;

         var defaultAppValues = {
             lifeCycleState: 'dev',
             accessible: true,
             featured: false,
             type: 'app',
             workflowState: 'Drafts',
             owner: {},
             poc: {},
             personnel: [],
             categories: [],
             images: {
                 screenshots: [undefined]
             }
         };

         /**
          * Load persona and tag data from server into local scope, to be called after loading app data
          * @method loadTagAndPersonaData
          * @private
          */
         var loadTagAndPersonaData = function() {
             $q.all([
                 Persona.getCurrentPersonaData(),
                 Tag.getTopicsByComplex({uri: "/AppsMall/Organization/"}),
                 Tag.getTopicsByComplex({level: "Role", uri: "/AppsMall/Category/"}),
                 Tag.getTopicsByComplex({level: "Role", uri: "/AppsMall/App/"})
             ]).then(function(resultData) {
                 var personaData = resultData[0],
                     orgResults = resultData[1],
                     categoryResults = resultData[2],
                     allTagResults = resultData[3];

                 // loading persona data into local scope
                 $scope.userName = personaData.username;
                 $scope.roles = personaData.roles;
                 $scope.favoriteApps = personaData.favoriteApps;
                 $scope.personaData = personaData;

                 // loading tag data into local scope
                 $scope.orgList = _.reduce(orgResults, function (obj, topic) {
                     obj[topic.tag] = topic.description;
                     return obj;
                 }, {});
                 $scope.allCategories = _.pluck(categoryResults, 'tag');
                 $scope.allTags = _.chain(allTagResults).pluck('tag').uniq().value();

                 // bind action button events
                 postInitialize();
             });
         };

         /**
          * Loads tags for the selected app.
          * @method initializeTagAndPersonaData
          * @param tagObjects {Array} an array of Tag objects to be loaded
          * @private
          */
         var initializeTagAndPersonaData = function(tagObjects) {
              $scope.initialTagObjects = tagObjects;
              var tagsByType = _.groupBy(tagObjects, function(tag){
                  return tag.topic;
              });
              var orgs = tagsByType['/AppsMall/Organization/'];
              var tags = tagsByType['/AppsMall/App/'];
              var cats = tagsByType['/AppsMall/Category/'];
              //set organization
              if(orgs){
                  if (orgs.length > 1)
                      Ozone.logger.warning("App " + appShortnameFromUrl + " has more than one organization associated with it");
                  orgTag = orgs[0];
                  $scope.currentOrgTag = orgTag.tag;
              } else {
                  orgTag = null;
                  $scope.currentOrgTag = null;
              }
              
              //set tags
              if(tags){
                  $scope.selectedTags = _.chain(tags).pluck('tag').uniq().value();
              } else {
                  $scope.selectedTags = []
              }

              //set categories
              if(cats){
                  $scope.selectedCategories = _.chain(cats).pluck('tag').uniq().value();
              } else {
                  $scope.selectedCategories = [];
              }

              loadTagAndPersonaData();
         };

         // load all data: apps, tags, and persona
         if (_.isEmpty(appShortnameFromUrl)) {
             $scope.currentApp = defaultAppValues;
             initializeTagAndPersonaData([]);
         }
         else {
             AppOrComponent.query({shortname: appShortnameFromUrl}).then(function(appList) {
                 $scope.initialShortname = appShortnameFromUrl;
                 if (_.isArray(appList) && (appList.length > 0)) {
                     var tmpApp = Ozone.extend(appList[0], defaultAppValues);

                     // adding empty image to end of list, for display purposes.
                     tmpApp.images.screenshots = _.compact(tmpApp.images.screenshots);
                     tmpApp.images.screenshots.push(undefined);

                     console.log('App Data >> ')
                     console.log(tmpApp);

                     // set current app and set CRUD functions in controller
                     $scope.currentApp = tmpApp;

                     //set tags for app
                     return Tag.getTags({ uri: AppOrComponent.getUri($scope.currentApp) }).then(initializeTagAndPersonaData);
                 }
             });
         }

         // watch on tag array, used for required-field validation
         $scope.$watch('selectedTags', function(newValue, oldValue) {
             $scope.tagCount = newValue.length;
             console.log('changed selected tags: count = ' + $scope.tagCount);
         });

         // watch on category array, used for required-field validation
         $scope.$watch('selectedCategories', function(newValue, oldValue) {
             $scope.categoryCount = newValue.length;
             console.log('changed selected categories: count = ' + $scope.categoryCount);
         });

         // watch on screenshot array, used for required-field validation
         $scope.$watch('currentApp.images.screenshots.length', function(newValue, oldValue) {
             $scope.screenshotCount = _.compact((($scope.currentApp || {}).images || {}).screenshots || []).length;
             console.log('changed screenshots: newValue = ' + newValue + ', count = ' + $scope.screenshotCount);
         });

     } // end initializeController()


     /**
      * Gets the CSS class used to visually display workflow state
      * @method workflowStatusClass
      * @param workflowStatus {String} A workflow state as defined in {{#crossLink "AppWorkflowService"}}{{/crossLink}}.workflowStateTypes
      * @return {String} the CSS class corresponding to workflow state passed in
      */
     $scope.workflowStatusClass = function(workflowStatus) {
          return AppWorkflow.workflowStateColorClasses[workflowStatus] || '';
     }

     /**
      * Gets formatted update date from app passed in
      * @method getShortDateUpdated
      * @param app {Object} An App object with date fields
      * @return {String} a stringified short date value for the app passed in
      */
     $scope.getShortDateUpdated = function(app) {
          var date = new Date(app.updatedOn);
          return (isNaN(date.getYear())) ? '' : moment(date).format('MMDDYYYY');
     }

     /**
      * Check whether currently loaded app exists in database
      * @method isExistingApp
      * @return {Boolean} True only if currently loaded app exists in database
      */
     $scope.isExistingApp = function() {
         if (_.isObject($scope.currentApp)) {
             return !(_.isEmpty($scope.currentApp._id) && $scope.AllowComponents);
         }
         else {
              return false;
         }
     }

     /**
      * Checks if currently logged in user has permission to accept or reject apps
      * @method canAcceptOrRejectApp
      * @return {Boolean} True only if currently logged in user has permission to accept or reject apps
      */
     $scope.canAcceptOrRejectApp = function() {
         if (!(_.isObject($scope.currentApp) && _.isObject($scope.personaData))) {
             return false;
         }
         if ($scope.currentApp.organizationOnlyApp) {
             return ($scope.personaData || {}).hasApproveOrganizationOnlyApplicationAccess;
         }
         else {
             return ($scope.personaData || {}).hasApproveMallWideApplicationAccess;
         }
     }

     /**
      * Get a list of objects, where each object contains a tag and new flag indicating whether this will be a new tag.
      * @method getTagDropdownSelection
      * @param [selectedText] {String} user-selected text that, if defined, will get added to top of returned list
      * @return {Array} list of objects to be displayed as dropdown list
      */
     $scope.getTagDropdownSelection = function(selectedText) {
         // creating array into (x,x) key-value pairs
         // var dropdownList = _.reduce($scope.allTags, function(memo,v) { memo[v] = v; return memo; }, {});
         var dropdownList =
             _.chain($scope.allTags)
              .filter(function(tag) {
                  return (!_.contains($scope.selectedTags, tag) && (tag || '').toLowerCase().startsWith(selectedText.toLowerCase()));
               })
              .map(function(tag) { return {tag: tag, new: false}; })
              .value();
         if (selectedText) {
             dropdownList.unshift({tag: selectedText, new: true});
         }
         console.log('Tag list = ' + JSON.stringify(dropdownList))
         return dropdownList;
     }

     /**
      * Returns a list of categories that match selection text passed in
      * @method getCategoryDropdownSelection
      * @param selectedText {String} text string used to match categories
      * @return {Array} a list of categories that match selection text passed in
      */
     $scope.getCategoryDropdownSelection = function(selectedText) {
         var dropdownList =
             _.chain($scope.allCategories)
              .filter(function(category) {
                  return (!_.contains($scope.selectedCategories, category) && (category || '').toLowerCase().startsWith(selectedText.toLowerCase()));
               })
              .map(function(category) { return {category: category}; })
              .value();
         console.log('Category list = ' + JSON.stringify(dropdownList))
         return dropdownList;
     }

     /**
      * Adds item passed in to specified list name in scope, with option to invoke conversion function on item
      * @method addSelectedItemToList
      * @param itemToAdd {String} item to add to list
      * @param listScopeName {String} name of list in this scope that item will get added to
      * @param [itemConversionFunction] {Function} Conversion function that is called on item parameter.  Does nothing if undefined.
      */
     $scope.addSelectedItemToList = function(itemToAdd, listScopeName, itemConversionFunction) {
         if (_.isFunction(itemConversionFunction)) {
             itemToAdd = itemConversionFunction(itemToAdd);
         }
         if (itemToAdd && _.isArray($scope[listScopeName])) {
             $scope.tagDropdownText = null;
             $scope.categoryDropdownText = null;
             $scope[listScopeName] = $scope[listScopeName].concat([itemToAdd]);
         }
     }

     /**
      * Removes item passed in to specified list name in scope
      * @method removeItemFromList
      * @param itemToRemove {String} item to remove from list
      * @param listScopeName {String} name of list in this scope that item will get removed from
      */
     $scope.removeItemFromList = function(itemToRemove, listScopeName) {
         if (_.isArray($scope[listScopeName])) {
             $scope[listScopeName] = _.reject($scope[listScopeName], function(item) { return (item === itemToRemove); });
         }
     }

     /**
      * Get tag field from object passed in
      * @method getTagField
      * @param tagObject {Object} object containing tag field
      * @return {String} tag field from object passed in
      */
     $scope.getTagField = function(tagObject) { return tagObject.tag; };

     /**
      * Get category field from object passed in
      * @method getCategoryField
      * @param categoryObject {Object} object containing category field
      * @return {String} category field from object passed in
      */
     $scope.getCategoryField = function(categoryObject) { return categoryObject.category; };


     //--- validation methods ---//

     /**
      * Performs validation for saving app as draft.
      * @method appNameValidation
      * @return {Boolean} True only if attributes necessary to save App object as draft are valid
      * @private
      */
     var appNameValidation = function(app) {
         return (!_.isEmpty(app.name) && /^[A-Za-z0-9]+$/.test(app.shortname || '') && !_.isEmpty(app.type));
     };

     /**
      * Performs validation for saving app as draft.
      * @method appNameValidation
      * @return {Boolean} True only if attributes necessary to save App object as draft are valid
      * @private
      */
     var isPublishedOrDirty = function() {
         return ($scope.hasInvalidPublishAttempt || ((($scope.currentApp || {}).workflowState || '').toLowerCase() === 'published'));
     }

     /**
      * Set tabValidationState based on validation state: complete, incomplete, or error.
      * Tri-state flags (true, false, undefined) are used for each tab, where true = complete and false = error.
      * @method formValidReceiveFunction
      * @param [event] {Object} Event object sent from {{#crossLink "FormValidationWatcherDirective"}}{{/crossLink}} -- _**deprecated**_ and no longer used
      * @param msg {Object} Tab validation message sent from {{#crossLink "FormValidationWatcherDirective"}}{{/crossLink}}
      * @private
      */
     var formValidReceiveFunction = function(event, msg) {
         var tabName = (msg || {}).tabPage;
         if (tabName) {
             if (msg.valid) {
                 $scope.tabValidationState[tabName] = true;
             }
             else if (isPublishedOrDirty()) {
                 $scope.tabValidationState[tabName] = false;
             }
             else {
                 $scope.tabValidationState[tabName] = undefined;
             }
         }
         else {
             // if no tab page was passed in: set validation states to false if Published/dirty (red dot), or undefined otherwise (gray dot).
             var isDirty = isPublishedOrDirty();
             _($scope.tabValidationState).keys().each(function(tabName) {
                 if (!$scope.tabValidationState[tabName]) {
                     $scope.tabValidationState[tabName] = (isDirty ? false : undefined);
                 }
             });
         }
     };

     /**
      * Explicitly checking for false on tabValidationState tri-state flag (true, false, undefined) for the tab passed in
      * @method isTabInvalid
      * @param tabName {String} tab name to check validation state for
      * @return {Boolean} True only if tab passed in is invalid.  Empty or clean tab pages will return False.
      */
     $scope.isTabInvalid = function(tabName) {
         return (($scope.tabValidationState || {})[tabName] === false);
     }

     $rootScope.$on('formValidState', formValidReceiveFunction);


     //--- scope methods initialized after querying for app info ---//

     /**
      * Adds app modification methods to controller after apps have been loaded.
      * @method postInitialize
      * @private
      */
     var postInitialize = function() {

         formValidReceiveFunction();

         // watch on app name that auto-generates shortname
         $scope.$watch('currentApp.name', function(newValue, oldValue) {
             if (newValue === oldValue) return;
             console.log('currentApp.name OLD = ' + oldValue + ', NEW = ' + newValue);
             if ($scope.currentApp) {
                 $scope.currentApp.shortname = (newValue || '').replace(/[^A-Za-z0-9]+/g, '');
             }
         });

         /**
          * Cleans up current app object before saving
          * @method getSafeClonedApp
          * @return {Object} App object without any Angular framework attributes
          * @private
          */
         var getSafeClonedApp = function() {
             var clonedApp = angular.copy($scope.currentApp);
             // getting rid of empty screenshot used as placeholder
             clonedApp.images.screenshots = _.chain(clonedApp.images.screenshots).compact().uniq().value();
             return clonedApp;
         }

         /**
          * Performs validation on current app, and saves all App data (including tags) to database if valid.
          * @method saveApp
          * @param workflowAction {String} The workflow action button clicked on by the user, as defined in {{#crossLink "AppWorkflowService"}}{{/crossLink}}.workflowStateActions
          */
         $scope.saveApp = function(workflowAction) {
             var params = {};
             var isPublishOrSubmitAction = _.contains(['publish', 'submit'], (workflowAction || '').toLowerCase());
             var isValidForWorkflowState = isPublishOrSubmitAction ? _($scope.tabValidationState).values().all() : true;

console.log(' ++++++++++++++++ TAB VALIDATION = ' + JSON.stringify($scope.tabValidationState));

             // perform basic save validation on app name and shortname, regardless of workflow state;
             // also checks for full-field validation if submitting or publishing.
             // If valid, set workflow state for app based on action type passed in.
             if (appNameValidation($scope.currentApp) && isValidForWorkflowState) {
                 if ($scope.workflowStateActions[workflowAction]) {
                     $scope.currentApp.workflowState = $scope.workflowStateActions[workflowAction];
                 }
                 else {
                     $scope.currentApp.workflowState = $scope.currentApp.workflowState || 'Drafts';
                 }
             }
             else {
                 if (isPublishOrSubmitAction) {
                     $scope.hasInvalidPublishAttempt = true;
                     formValidReceiveFunction();
                 }
                 $scope.hasInvalidSaveAttempt = true;
                 return;
             }

             $scope.hasInvalidSaveAttempt = false;

             // adding default parameters for new App, or getting id from existing App.
             if (_.isEmpty($scope.currentApp._id)) {
                 $scope.currentApp.createdOn = new Date();
                 $scope.currentApp.updatedOn = new Date();
                 $scope.currentApp.createdBy = $scope.userName;
                 $scope.currentApp.users = 0;
                 $scope.currentApp.ratings = 0;
             } else {
                 $scope.currentApp.updatedOn = new Date();
                 params.id = $scope.currentApp._id;
             }

             $scope.currentApp.updatedBy = $scope.userName;

             // copy scope variables into app object, if necessary
             $scope.currentApp.categories = $scope.selectedCategories;

             // saving app to server
             AppOrComponent.save(getSafeClonedApp($scope.currentApp)).then(function(savedAppData) {
                 if ((savedAppData || {}).error) {
                     $scope.setStatusMessage({errorMessage: savedAppData.error});
                 } else {
                     // assign newly created id to existing app
                     if (_.isArray(savedAppData) && (savedAppData.length === 1)) {
                         savedAppData = savedAppData[0];
                     }
                     if (_.isObject(savedAppData) && (!$scope.currentApp._id)) {
                         $scope.currentApp._id = savedAppData._id;
                     }
                     $rootScope.$broadcast('refreshApps', {successMessage: ("App '" + $scope.currentApp.name + "' has been successfully saved.")});
                     $scope.saveTags(function() {
                         if (workflowAction !== 'save') {
                             $scope.close();
                         }
                     });
                 }
             }, function(data, status, headers, config) {
                 $scope.setStatusMessage({errorMessage: data});
             });
         }

         /**
          * Saves all tags added by user, and deletes all tags removed by user -- all done as per tag and topic type.
          * @method saveApp
          * @param callback {Function} Callback to get invoked after all tags have been successfully updated and/or deleted
          */
         $scope.saveTags = function(callback) {

             // Create or update Organization tag for this app
             var updateOrgTag = function() {
                 if (!_.isObject(orgTag)) {
                     if (!_.isEmpty($scope.currentOrgTag)) {
                         Tag.createNewTag($scope.currentOrgTag, '/AppsMall/Apps/' + $scope.currentApp.shortname, '/AppsMall/Organization/');
                     };
                 } else if (orgTag.tag != $scope.currentOrgTag) {
                     if(_.isEmpty($scope.currentOrgTag)) return; //cannot save an app such that there is no orgTag if it had one.
                     // organization has been changed on the app
                     orgTag.tag = $scope.currentOrgTag;
                     Tag.updateTag(orgTag).then(function (tagUpdate) {
                         Ozone.logger.info("tag updated");
                         orgTag = tagUpdate[0];
                     });
                 };
             };

             var tagsByType = _.groupBy($scope.initialTagObjects, function(tag){
                 return tag.topic;
             });
             var nameUpdated = $scope.initialShortname !== $scope.currentApp.shortname;
             var tags = tagsByType['/AppsMall/App/'] || [];
             var cats = tagsByType['/AppsMall/Category/'] || [];
             var toDeleteTagsId = [];
             var uri = AppOrComponent.getUri($scope.currentApp);
             //update tags
             var initialTagNames =  _.chain(tags).pluck('tag').uniq().value();
             var newTagNames = _.difference($scope.selectedTags, initialTagNames);
             var deletedTagNames = _.difference(initialTagNames, $scope.selectedTags);
             //add deleted tags to toDeleteTagsId list
             for(var index = 0; index < deletedTagNames.length; index ++){
                 var tagToDelete = _.find(tags, function(tag){return tag.tag === deletedTagNames[index]});
                 if(tagToDelete && tagToDelete._id) toDeleteTagsId.push(tagToDelete._id);
             }

             //update categories
             var initialCatNames =  _.chain(cats).pluck('tag').uniq().value();
             var newCatNames = _.difference($scope.selectedCategories, initialCatNames);
             var deletedCatNames = _.difference(initialCatNames, $scope.selectedCategories);

             //add deleted cats to toDeleteTagsId list
             for(var index = 0; index < deletedCatNames.length; index ++){
                 var tagToDelete = _.find(cats, function(cat){return cat.tag === deletedCatNames[index]});
                 if(tagToDelete && tagToDelete._id) toDeleteTagsId.push(tagToDelete._id);
             }

             var updateList = [];
             if(nameUpdated){
                 _.each($scope.initialTagObjects, function(tag){
                     if(tag.uri !== uri && !_.any(toDeleteTagsId, function(deletedId){return deletedId === tag._id})){//ensure uri is incorrect and tag was not deleted.
                         tag.uri = uri;
                         updateList.push(tag);
                     }
                 });
             }

             // function to delete tags; called after new tag creation function
             var deleteTagsFunction = function() {
                 if (toDeleteTagsId.length > 0) {
                     Tag.deleteTags(toDeleteTagsId).then(callback);
                 }
                 else {
                     callback();
                 }
             }

             var tasks = [];
             if(newTagNames.length > 0){
                 tasks.push({fn: Tag.createNewTagsAndTopics, args: [newTagNames, uri, '/AppsMall/App/', 'Role']})
             }
             if(newCatNames.length > 0){
                 tasks.push({fn: Tag.createNewTags, args: [newCatNames, uri, '/AppsMall/Category/']})
             }
             if(updateList.length > 0){
                 tasks.push({fn: Tag.updateTags, args: [updateList]})
             }

             $q.all(_.map(tasks, function(task){return task.fn.apply(this, task.args)})).then(updateOrgTag).then(deleteTagsFunction);
         }

         /**
          * Deletes app passed in from database
          * @method deleteApp
          * @param app {Object} App object to delete from database
          */
         $scope.deleteApp = function(app) {
             app = app || $scope.currentApp;
             var deleteParams = {
                 id: app._id,
                 type: app.type
             };
             //delete on server
             AppOrComponent.delete(deleteParams).then(function() {
                 $rootScope.$broadcast('refreshApps', {successMessage: ("Deleted app '" + app.name + "'.")});
                 $scope.close();
             });
         }

         /**
          * Visually display message passed in, handling both success and error messages.
          * @method setStatusMessage
          * @param message {Object} object containing status message, containing either a success or error message:
          *        On success: { ``` successMessage: "Success!" ``` }; on error: { ``` errorMessage: "Fail!" ``` }; 
          */
         $scope.setStatusMessage = function(message) {
             message = message || {};
             // setting success or error message fields that will trigger watch in directive
             if (!_.isEmpty(message.successMessage)) {
                 $scope.errorMessage = '';
                 $scope.successMessage = message.successMessage;
             } else if (!_.isEmpty(message.errorMessage)) {
                 $scope.successMessage = '';
                 $scope.errorMessage = message.errorMessage || '';
             } else {
                 $scope.errorMessage = '';
                 $scope.successMessage = '';
             }
         }

         /**
          * Clears field in current app object
          * @method setFieldToEmpty
          * @param field {String} field (attribute) of current app object to clear
          */
         $scope.setFieldToEmpty = function(field) {
             $scope.currentApp[field] = '';
         }

         /**
          * Checks if field exists in current app object
          * @method fieldExistsInCurrentApp
          * @param field {String} field (attribute) of current app object to check for
          * @return {Boolean} True if field exists in App object
          */
         $scope.fieldExistsInCurrentApp = function(field) {
             return _.has($scope.currentApp, field);
         }

         /**
          * Adds new object element to array-of-objects field of current app object
          * @method addNewEmptyField
          * @param field {String} field (attribute) of current app object to add object to
          */
         $scope.addNewEmptyField = function(field) {
             if (_.isArray($scope.currentApp[field])) {

                 // if at least one empty field exists, then don't add another field
                 var fieldsWithoutScopeAttrs = _.map($scope.currentApp[field], function(fieldObj) { return _.isEmpty(common.cloneWithoutScopeAttributes(fieldObj)); });
                 if (!_.any(fieldsWithoutScopeAttrs)) {
                     $scope.currentApp[field].push({});
                 }
             }
         }

     } // end postInitialize()

     /**
      * Load App Preview modal page so that user can preview app as it would look on AppsMall main page
      * @method loadPreviewModal
      * @param selectedApp {Object} the app to display in previewer
      */
     $scope.loadPreviewModal = function(selectedApp) {
         selectedApp = angular.copy(selectedApp);
         selectedApp.images.featuredBannerUrl = FileUpload.getFileUrl(selectedApp.images.featuredBannerId, "featuredBanner");
         selectedApp.images.smallBannerUrl = FileUpload.getFileUrl(selectedApp.images.smallBannerId, "smallBanner");
         selectedApp.images.iconUrl = FileUpload.getFileUrl(selectedApp.images.iconId, "icon");
         selectedApp.images.screenshotUrl = FileUpload.getFileUrl(selectedApp.images.screenshotId, "featuredBanner");

        var modalInstance = $modal.open({
            templateUrl: Ozone.utils.murl('amlUrl', '/partials/appmodal.html'),
            controller: AppModalInstanceController,
            backdrop: 'true',
            resolve: {
                currentApp: function() { return selectedApp; },
                currentTags: function() { return $scope.selectedTags; },
                previewer: function() { return true; }
            }
         });

         modalInstance.opened.then(function(selectedItem) {
             console.log('Modal opened = ' + JSON.stringify(selectedItem));
         });

         modalInstance.result.then(function(selectedItem) {
             console.log('Modal selected item = ' + JSON.stringify(selectedItem));
         }, function() {
             console.log('Modal dismissed at: ' + new Date());
         });
     }

     /**
      * Exits App Submission and redirects the user back to the App Management page
      * @method close
      */
     $scope.close = function() {
         $window.location = Ozone.utils.murl('amlUrl', '/manage/apps/');
     }

}];

controllersModule.controller('AppSubmissionController',  AppSubmissionController);
