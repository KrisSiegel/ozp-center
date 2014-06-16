/**
 * Controller object for displaying the AppsMall home page main panel
 *
 * @module controllersModule
 * @submodule AppSubmissionControllerModule
 * @requires amlApp.controllers
 */

'use strict';

/**
 * @class AppSubmissionController
 * @static
 */ 

/**
 * @class AppSubmissionController
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

 /**
  * Description
  * @method addSelectedItemToList
  * @param itemToAdd {String} 
  * @param listScopeName {String} 
  * @param itemConversionFunction {Function} 
  */

 /**
  * Description
  * @method canAcceptOrRejectApp
  */

 /**
  * Exits App Submission and redirects the user back to the App Management page
  * @method close
  */

 /**
  * Description
  * @method getCategoryDropdownSelection
  * @param selectedText {String} 
  */

 /**
  * Description
  * @method getCategoryField
  * @param categoryObject {Object}
  */

 /**
  * Description
  * @method getShortDateUpdated
  * @param app {Object}
  */

 /**
  * Description
  * @method getTagDropdownSelection
  * @param selectedText {String} 
  */

 /**
  * Description
  * @method getTagField
  * @param tagObject {Object}
  */

 /**
  * Method called by ng-init directive when declaring controller in view page
  * @method initializeController
  */

 /**
  * Description
  * @method isExistingApp
  */

 /**
  * Description
  * @method isTabInvalid
  * @param tabName {String} 
  */

 /**
  * Description
  * @method loadPreviewModal
  * @param selectedApp {Object}
  */

 /**
  * Description
  * @attribute {Object} personaData
  * @optional
  */

 /**
  * Description
  * @method removeItemFromList
  * @param itemToRemove {String} 
  * @param listScopeName {String} 
  */

 /**
  * Description
  * @method workflowStatusClass
  * @param workflowStatus {String}
  */


var AppSubmissionController = ['$scope', '$rootScope', '$q', '$location', '$window', '$modal', 'Persona', 'AppOrComponent', 'Dropdown', 'Tag', 'AppWorkflow', 'FileUpload',  function ($scope, $rootScope, $q, $location, $window, $modal, Persona, AppOrComponent, Dropdown, Tag, AppWorkflow, FileUpload) {

     var orgTag = null; // The tag that maps the current app to an organization
     $scope.personaData = {};

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

         // load persona and tag data from server into local scope, to be called after loading app data
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


         if (_.isEmpty(appShortnameFromUrl)) {
             $scope.currentApp = defaultAppValues;
             loadTagAndPersonaData();
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
                     Tag.getTags({ uri: AppOrComponent.getUri($scope.currentApp) }).then(function(tagObjects) {
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
                     });
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

     $scope.workflowStatusClass = function(workflowStatus) {
          return AppWorkflow.workflowStateColorClasses[workflowStatus] || '';
     }

     $scope.getShortDateUpdated = function(app) {
          var date = new Date(app.updatedOn);
          return (isNaN(date.getYear())) ? '' : moment(date).format('MMDDYYYY');
     }

     $scope.isExistingApp = function() {
         if (_.isObject($scope.currentApp)) {
             return !(_.isEmpty($scope.currentApp._id) && $scope.AllowComponents);
         }
         else {
              return false;
         }
     }

     // True if user can accept or reject app
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

     $scope.removeItemFromList = function(itemToRemove, listScopeName) {
         if (_.isArray($scope[listScopeName])) {
             $scope[listScopeName] = _.reject($scope[listScopeName], function(item) { return (item === itemToRemove); });
         }
     }

     // functions to retrieve tag and category fields, passed in to addTagToList()
     $scope.getTagField = function(tagObject) { return tagObject.tag; };
     $scope.getCategoryField = function(categoryObject) { return categoryObject.category; };


     //--- validation methods ---//

     // validation for saving app as draft.
     var appNameValidation = function(app) {
         return (!_.isEmpty(app.name) && /^[A-Za-z0-9]+$/.test(app.shortname || '') && !_.isEmpty(app.type));
     };

     var isPublishedOrDirty = function() {
         return ($scope.hasInvalidPublishAttempt || ((($scope.currentApp || {}).workflowState || '').toLowerCase() === 'published'));
     }

     // Set tabValidationState based on validation state: complete, incomplete, or error.
     // Tri-state flags (true, false, undefined) are used for each tab, where true = complete and false = error.
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

     // explicitly checking for false on tabValidationState tri-state flag (true, false, undefined)
     $scope.isTabInvalid = function(tabName) {
         return (($scope.tabValidationState || {})[tabName] === false);
     }

     $rootScope.$on('formValidState', formValidReceiveFunction);


     //--- scope methods initialized after querying for app info ---//

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

         // cleans up app object before saving
         var getSafeClonedApp = function() {
             var clonedApp = angular.copy($scope.currentApp);
             // getting rid of empty screenshot used as placeholder
             clonedApp.images.screenshots = _.chain(clonedApp.images.screenshots).compact().uniq().value();
             return clonedApp;
         }

          //--- save / update/ delete routines ---

         // function to create a new App
         $scope.saveApp = function(workflowAction) {
             var params = {};
             var isPublishOrSubmitAction = _.contains(['publish', 'submit'], (workflowAction || '').toLowerCase());
             var isValidForWorkflowState = isPublishOrSubmitAction ? _($scope.tabValidationState).values().all() : true;

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
                 console.log('+++SAVED APP:' + JSON.stringify(savedAppData));
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

             // Create or update Organization tag for this app
             if (!_.isObject(orgTag)) {
                 if (!_.isEmpty($scope.currentOrgTag)) {
                     Tag.createNewTag($scope.currentApp.currentOrgTag, '/AppsMall/Apps/' + $scope.currentApp.shortname, '/AppsMall/Organization/');
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
         }

         $scope.saveTags = function(callback) {
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

             $q.all(_.map(tasks, function(task){return task.fn.apply(this, task.args)})).then(deleteTagsFunction);
         }

         // deleting application passed in
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

         $scope.setFieldToEmpty = function(field) {
             $scope.currentApp[field] = '';
         }

         $scope.fieldExistsInCurrentApp = function(field) {
             return _.has($scope.currentApp, field);
         }

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

     // load app into previewer modal
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

     $scope.close = function() {
         $window.location = Ozone.utils.murl('amlUrl', '/manage/apps/');
     }

}];

controllersModule.controller('AppSubmissionController',  AppSubmissionController);
