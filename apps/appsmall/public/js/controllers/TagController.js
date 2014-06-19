/**
 * Controller object for displaying tags on left panel of AppsMall home page
 *
 * @module AppsMallUI.controllersModule
 * @submodule AppsMallUI.TagControllerModule
 */

'use strict';

/**
 * @class AppsMallUI.TagController
 * @static
 */

/**
 * @class AppsMallUI.TagController
 * @constructor
 * @requires amlApp.controllers
 * @param $rootScope {Scope} Single root scope for application, and ancestor of all other scopes - [API Documentation](https://docs.angularjs.org/api/ng/service/$rootScope) 
 * @param $scope {ChildScope} Child scope that provides context for this controller - [API Documentation](https://docs.angularjs.org/api/ng/type/$rootScope.Scope) 
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 * @param $timeout {Function} Angular wrapper for window.setTimeout - [API Documentation](https://docs.angularjs.org/api/ng/service/$timeout) 
 * @param AppOrComponent {Object} an Angular-injected instance of {{#crossLink "AppOrComponentService"}}{{/crossLink}}
 * @param Tag {Object} an Angular-injected instance of {{#crossLink "TagService"}}{{/crossLink}}
 * @param AppSelectionMessage {Object} an Angular-injected instance of {{#crossLink "AppSelectionMessageService"}}{{/crossLink}}
 */


var TagController = ['$rootScope', '$scope', '$q', '$timeout', 'AppOrComponent', 'Tag', 'AppSelectionMessage',  function($rootScope, $scope, $q, $timeout, AppOrComponent, Tag, AppSelectionMessage) {

    /**
     * Method called by ng-init directive when declaring controller in view page
     * @method initializeController
     */
     $scope.initializeController = function() {
         $scope.organizationTag = null;
         $scope.defaultTag = 'Home'
         $scope.collectionTags = [];
         $scope.categoryTags = [];
         $scope.systemTags = [];

         $rootScope.$on('organizationUpdate', function(event, newOrg){
             $scope.organizationTag = newOrg;
         });
         $rootScope.$on('tagRemoved', function(event) {
             if ($scope.systemTags !== undefined) {
                 for (var i = $scope.systemTags.length - 1; i >= 0; i--) {
                     $scope.systemTags[i].selected = false;
                     if($scope.systemTags[i].name == 'Home'){
                         $scope.systemTags[i].selected = true;
                     }
                 }
             }
             if ($scope.categoryTags !== undefined) {
                 for (var i = $scope.categoryTags.length - 1; i >= 0; i--) {
                     $scope.categoryTags[i].selected = false;
                 }
             }
             if ($scope.collectionTags !== undefined) {
                 for (var i = $scope.collectionTags.length - 1; i >= 0; i--) {
                     $scope.collectionTags[i].selected = false;
                 }
             }
         });

         $q.all([Tag.getTopicsByComplex({uri: '/AppsMall/Category/', level: 'System'}),
                 Tag.getTopicsByTopic('/AppsMall/Collection/'),
                 Tag.getTopicsByTopic('/AppsMall/Category/')])
         .then(function (results) {
             var appsWithTagsData = results[0],
                 collections = results[1],
                 categories = results[2];

             // set system tags
             for (var i = 0; i < appsWithTagsData.length; i++) {
                 if(appsWithTagsData[i].tag === $scope.defaultTag){
                     $scope.systemTags.unshift({
                         name: appsWithTagsData[i].tag,
                         type: 'System',
                         selected: true,
                         tooltip: appsWithTagsData[i].description || ''
                     });
                 }else{
                     $scope.systemTags.push({
                         name: appsWithTagsData[i].tag,
                         type: 'System',
                         selected: false,
                         tooltip: appsWithTagsData[i].description || ''
                     });
                 }
             }
             if (!_.contains($scope.systemTags, function(sysTag){return sysTag.name === $scope.defaultTag})) {
                 $scope.systemTags.unshift({
                     name: $scope.defaultTag,
                     type: 'System',
                     selected: true,
                     tooltip: 'Apps Mall Home'
                 });
             }

             // set collection tags
             for (var i = 0; i < collections.length; i++) {
                 $scope.collectionTags.push({
                     name: collections[i].tag,
                     type: '/AppsMall/Collection/',
                     selected: false,
                     tooltip: collections[i].description || ''
                 });
             }

             // set category tags
             for (var i = 0; i < categories.length; i++) {
                 if(categories[i].level == 'System') continue;
                 $scope.categoryTags.push({
                     name: categories[i].tag,
                     type: '/AppsMall/Category/',
                     selected: false,
                     tooltip: categories[i].description || ''
                 });
             }
         });
     }

     /**
      * Select tag passed in, and unselect all other tags
      * @method selectTagFromMenu
      * @param tag {String} name of tag to be selected
      */
     $scope.selectTagFromMenu = function(tag) {
         //set all tags to be unselected
         _.each($scope.systemTags, function(sysTag){sysTag.selected = false;});
         _.each($scope.collectionTags, function(collectionTag){collectionTag.selected = false;});
         _.each($scope.categoryTags, function(categoryTag){categoryTag.selected = false;});
         //select the current tag
         tag.selected = true;

         //send broadcast based on type
         sendAppFilterBroadcast(tag)
     }

     /**
      * Send broadcast to load tag passed in on AppsMall main page
      * @method sendAppFilterBroadcast
      * @param tag {String} name of tag to be selected
      * @private
      */
     function sendAppFilterBroadcast(tag) {
         if (tag.type === 'System' && tag.name === $scope.defaultTag) {
             // get array of {tagname => [app_names]} association objects, one element for each unique tagname.
             AppSelectionMessage.getHomeAppSelectionMessage(true).then(function(selectionMessage) {
                 $rootScope.$broadcast('filterApps', { tags: selectionMessage });
             });
             return;
         }
         var tags = $scope.organizationTag ? [tag, $scope.organizationTag] : [tag];
         if(tag.type === 'System'){
             var snowFlakeFilters = {
                 "New Arrivals": function () {
                     AppOrComponent.query({type: 'app', workflowState: 'Published'}).then(function(appData) {
                         var newArrivalList = _.clone(appData || []).sort(common.getDateSorterFunction('createdOn', true));
                         // get names from sorted list
                         newArrivalList = _.pluck(newArrivalList, 'shortname');
                         $rootScope.$broadcast('filterApps', { filter: { shortname: newArrivalList }, sortBy: 'createdOn', isDescending: true, selectedTags: tags });
                     });
                 },
                 "Most Popular": function () {
                     AppOrComponent.query({type: 'app', workflowState: 'Published'}).then(function(appData) {
                         var mostPopularList = _.clone(appData || []).sort(common.getSorterFunction('launchedCount', 0, true));
                         // get names from sorted list
                         mostPopularList = _.pluck(mostPopularList, 'shortname');
                         $rootScope.$broadcast('filterApps', { filter: { shortname: mostPopularList }, sortBy: 'launchedCount', isDescending: true, selectedTags: tags });
                     });
                 }
             };

             snowFlakeFilters.hasOwnProperty(tag.name) ? snowFlakeFilters[tag.name]() :
                 $rootScope.$broadcast('filterApps', { filter: { shortname: [] }, selectedTags: tags });
         } else {
             AppSelectionMessage.getTagFilterMessage(tags).then(function(tagFilterMessage) {
                 $rootScope.$broadcast('filterApps', tagFilterMessage);
             });
         }
     }

}];

controllersModule.controller('TagController', TagController);
