/**
 * Controller object for displaying tags on left panel of AppsMall home page
 *
 * @module AppsMallUI.controllersModule
 * @submodule AppsMallUI.AdminTopicsControllerModule
 * @requires amlApp.controllers
 */

'use strict';

/**
 * @class AppsMallUI.AdminTopicsController
 * @static
 */ 

/**
 * @class AppsMallUI.AdminTopicsController
 * @constructor
 * @param $scope {ChildScope} Child scope that provides context for this controller - [API Documentation](https://docs.angularjs.org/api/ng/type/$rootScope.Scope) 
 * @param $rootScope {Scope} Single root scope for application, and ancestor of all other scopes - [API Documentation](https://docs.angularjs.org/api/ng/service/$rootScope) 
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 * @param $timeout {Function} Angular wrapper for window.setTimeout - [API Documentation](https://docs.angularjs.org/api/ng/service/$timeout) 
 * @param AppOrComponent {Object} an Angular-injected instance of {{#crossLink "AppOrComponentService"}}{{/crossLink}}
 * @param AppWorkflow {Object} an Angular-injected instance of {{#crossLink "AppWorkflowService"}}{{/crossLink}}
 * @param Persona {Object} an Angular-injected instance of {{#crossLink "PersonaService"}}{{/crossLink}}
 * @param Tag {Object} an Angular-injected instance of {{#crossLink "TagService"}}{{/crossLink}}
 */


var AdminTopicsController = ['$scope', '$rootScope', '$q','$timeout', 'AppOrComponent', 'AppWorkflow', 'Persona', 'Tag', function($scope, $rootScope, $q, $timeout, AppOrComponent, AppWorkflow, Persona, Tag) {

    /**
     * A list of drop status values, with keys and stringified values.  All stringified values must be unique.
     * @attribute {Array} dropStatuses
     * @private
     */
    var dropStatuses = {
        Success: 'icon-checkmark',
        Warning: 'icon-lightning',
        Fail:    'icon-blocked',
        Pending: 'icon-busy',
        Hide:    'hide' //hide
    }

    ///////////////////////
    //USER ACCOUNT CHECKING
    ///////////////////////

    /**
     * Persona data for the currently logged-in user
     * @attribute {Object} personaData
     * @required
     */
    $scope.personaData = {};

    /**
     * A list of all sorted topics
     * @attribute {Array} topics
     * @required
     */
    $scope.topics = [];

    /**
     * Value in search bar used to set topic
     * @attribute searchedTopic {String}
     * @required
     */
    $scope.searchedTopic = '';

    /**
     * An object that groups apps by topic name: [topic name] -> [list of apps with that topic]
     * @attribute {Object} appsByTopic
     * @required
     */
    $scope.appsByTopic = {};

    /**
     * An array of every single app returned from the Ozone service, included apps not displayed in the AppsMall view.
     * @attribute {Array} allApps
     * @required
     */
    $scope.allApps = [];

    /**
     * Gets boolean state for whether all apps are displayed in view
     * @attribute showAllApps {Boolean}
     * @required
     * @return {Boolean} True if all apps are displayed in view
     */
    $scope.showAllApps = true;

    /**
     * True if user is dragging an item
     * @attribute {Boolean} dragMode
     * @required
     */
    $scope.dragMode = false;

    /**
     * Object that contains information on when an app was past dropped, and whether the drop action succeeded or failed
     * @attribute {Object} dropStatus
     * @required
     */
    $scope.dropStatus = {
        topic: '',
        status: dropStatuses.Hide,
        _timer: null,
        updateStatus: function(newStatus){
            this.status = newStatus;
            if(this._timer) $timeout.cancel(this._timer);
            var _this = this;
            this._timer = $timeout(function(){_this.status = dropStatuses.Hide}, 1800);
        }
    };

    /**
     * Topic list dropdown menu is visible for the app id assigned to this value.  If empty or undefined, then no topic dropdown menus are visible.
     * @attribute {String} openAppTopicMenu
     * @required
     */
    $scope.openAppTopicMenu = "";

    /**
     * A collection object containing group names as keys and topics as values
     * @attribute {Object} groupedTopics
     * @required
     */
    $scope.groupedTopics = {};

    /**
     * The hover group attribute that denotes which group the user is hovering over
     * @attribute {String} hoverGroup
     * @required
     */
    $scope.hoverGroup = "";

    /**
     * An object that contains the user-selected topic, apps, and methods for rolling back the current topic to a previous value
     * @attribute {Object} topicModel
     * @required
     */
    $scope.topicModel = {
        topic: {tag: "", description: "", _id: ""},
        topicBackup: {},
        apps: [],
        backupTopic: function(){
            this.topicBackup = _.clone(this.topic);
        },
        revertFromBackup: function(){
            //revert any unsaved changes
            this.topic.tag = this.topicBackup.tag;
            this.topic.description = this.topicBackup.description;
        }
    };

    /**
     * Method called by ng-init directive when declaring controller in view page.  The admin page type (Tag, Collection, or Category) is determined by the topic URI passed in
     * @method initializeController
     * @param topicUri {String} Determines admin page type (Tag, Collection, or Category) and must equal one of the following values:
     *        '/AppsMall/App/' for Tag Management, '/AppsMall/Category/' for Category Management, or '/AppsMall/Collection/' for Collection Management.
     */
    $scope.initializeController = function (topicUri) {
        $scope.topicUri = topicUri;

        Persona.getCurrentPersonaData().then(function(currentPersonaData) {
            console.log('Persona data: ' + JSON.stringify(currentPersonaData));
            $scope.userName = currentPersonaData.username;
            $scope.roles = currentPersonaData.roles;
            $scope.favoriteApps = currentPersonaData.favoriteApps;
            $scope.personaData = currentPersonaData;

            $scope.refreshTopics();
        });
    };

    /**
     * Refreshes topics, tag, and associated apps
     * @method refreshTopics
     * @param [activeGroup] {String} default group to set after all topics and tags have been refreshed
     * @return {PromiseObject} that refreshes all topics, tag, and apps.  This object can be used to chain methods after all refresh actions
     */
    $scope.refreshTopics = function (activeGroup) {
        console.log('topic uri ' + $scope.topicUri);
        return $q.all([Tag.getTopicsByTopic($scope.topicUri, "Role"),
                Tag.getTags({topic: $scope.topicUri}),
                AppOrComponent.query({workflowState: 'Published'})])
            .then(function (results) {
                var topics = results[0],
                    tags = results[1],
                    apps = results[2];
                $scope.topics = _.sortBy(topics, function (tag) {
                    console.log('!!! Topics Refreshed: topics=' + _.pluck(topics,'tag') + ', tags=' + _.pluck(tags,'tag') + ', apps=' + _.pluck(apps,'shortname'));
                    return tag.tag.toLowerCase();
                });

                $scope.groupedTopics = {};
                _.each( _.groupBy(topics, function(topic){
                    if(_.isEmpty(topic.tag)) return '';
                    return topic.tag[0].toUpperCase();
                }), function(values, key){
                    $scope.groupedTopics[key] = {
                      topics: _.sortBy(values, function(topic){return topic.tag.toLowerCase();}),
                      active: false
                    };
                });
                //set defaulted opened group
                if(activeGroup && !_.isEmpty($scope.groupedTopics[activeGroup.toUpperCase()]))
                    $scope.groupedTopics[activeGroup.toUpperCase()].active = true;
                else if(!_.isEmpty($scope.topics) && !_.isEmpty($scope.topics[0].tag))
                    $scope.groupedTopics[$scope.topics[0].tag[0].toUpperCase()].active = true;

                var allAppsTags = _.filter(tags, function (tag) {
                    if(!tag || !tag.uri) return false;
                    return tag.uri.indexOf("/AppsMall/Apps") == 0;
                });
                $scope.appsByTopic = _.groupBy(allAppsTags, function (tag) {
                    return tag.tag;
                });

                var dateSorter = common.getDateSorterFunction('updatedOn', true);
                $scope.allApps = (apps || []).sort(dateSorter);
                $scope.showAllApps = true;
                $scope.appsLoaded = true;
                console.log('Topics Refreshed');
            });
    };

    /**
     * Set topic to value in search field
     * @method searchTopic
     */
    $scope.searchTopic = function(){
        var topic = _.find($scope.topics, function(topic){return topic.tag == $scope.searchedTopic});
        if(_.isEmpty(topic)) return;
        $scope.searchedTopic = '';
        $scope.setSelected(topic._id);
    };

    /**
     * Gets an array of topic names
     * @method getTopicNames
     * @return {Array} an array of topic names
     */
    $scope.getTopicNames = function(){
        var arr = _.pluck($scope.topics, 'tag');
        return arr;
    };

    /**
     * Compares the topid ID passed in to the topic model
     * @method isSelected
     * @param topicId {String} 
     * @return {Boolean} True if the topic model ID equals the value passed in
     */
    $scope.isSelected = function (topicId) {
        return topicId == $scope.topicModel.topic._id;
    };

    /**
     * Set topic with id passed in to internal topic model
     * @method setSelected
     * @attribute topicId {String} id of the topic to be set in topic model
     */
    $scope.setSelected = function (topicId) {
        //revert any unsaved changes
        $scope.topicModel.revertFromBackup();

        $scope.topicModel.topic = _.find($scope.topics, function (topic) { return topic._id == topicId; });
        if(topicId != 'new'){
            var group = $scope.groupedTopics[$scope.topicModel.topic.tag[0].toUpperCase()];
            if(group)
                group.active = true;
        }
        //backup the topic for saves and cancels
        $scope.topicModel.backupTopic();

        $scope.topicModel.apps = _.map(($scope.appsByTopic[$scope.topicModel.topic.tag] || []), function(appTag){
            return _.find($scope.allApps, function(app){
                if(!appTag || !appTag.uri) return false;
                return appTag.uri.indexOf(app.shortname) != -1;
            })
        });
        $scope.showAllApps = false;
    };

    /**
     * Sets topic model so that all apps are displayed.
     * @method displayAllApps
     */
    $scope.displayAllApps = function(){
        $scope.showAllApps = true;
        $scope.topicModel.revertFromBackup();
        if ($scope.topicModel.topic._id == "new")
            $scope.topics.shift();
        $scope.topicModel.topic = {tag: "", description: "", _id: ""};
        $scope.topicModel.apps = [];
    };

    /**
     * Creates new topic model in this controller
     * @method createNewTopic
     */
    $scope.createNewTopic = function () {
        if ($scope.topicModel.topic._id != "new"){
            //clear unsaved changes from previous topic
            $scope.topicModel.revertFromBackup();
        }
        $scope.topicModel.topic = {
            tag: "",
            description: "",
            level: "Role",
            uri: $scope.topicUri,
            _id: "new"
        };
        //backup the new topic (used to clear out any stored backup)
        $scope.topicModel.backupTopic();

        $scope.topicModel.apps = [];
        $scope.topics.unshift($scope.topicModel.topic);
        $scope.setSelected("new");
    };

    /**
     * Closes app context menu if it is open and click was not in app context menu or opening it
     * _**(DOM MANIPULATION METHODS SHOULD NOT EXIST IN CONTROLLER; refactor if practical.  
     *    Drag/drop is sometimes too hard to separate from controller logic.)**_
     * @method clearContextMenu
     * @param $event {Object} a click event containing the clicked element as target
     */
    $scope.clearContextMenu = function($event){
        if(!_.isEmpty($scope.openAppTopicMenu) &&
            !($($event.target).is($('.context-menu-toggle')) || !_.isEmpty($('.context-menu-toggle').has($($event.target)))
                || $($event.target).is($('.context-menu')) || !_.isEmpty($('.context-menu').has($($event.target)))))
            $scope.openAppTopicMenu = '';
    };

    /**
     * Returns True if the topic model contains apps
     * @method hasApps
     * @return {Boolean} True if the topic model contains apps
     */
    $scope.hasApps = function () {
        return !_.isEmpty($scope.topicModel.apps);
    };

    /**
     * Checks whether any apps have been loaded into this controller
     * @method anyApps
     * @return {Boolean} True if apps have finished loading with at least 1 app.
     */
    $scope.anyApps = function(){
        return $scope.allApps.length != 0 && $scope.appsLoaded;
    };

    /**
     * Returns True if the user logged in has permission to access this page
     * @method hasPermission
     * @return {Boolean} True if the persona logged in has the appropriate permission to access this page
     */
    $scope.hasPermission = function() {
        switch ($scope.topicUri) {
            case '/AppsMall/App/':
                return $scope.personaData.hasTagManagerAccess;
            case '/AppsMall/Collection/':
                return $scope.personaData.hasCollectionManagerAccess;
            case '/AppsMall/Category/':
                return $scope.personaData.hasCategoryManagerAccess;
            default:
                return false;
        }
    }

    /**
     * Topic list dropdown menu is visible for the app id passed in.
     * @method showAppTopicMenu
     * @attribute appid {String} the app to make dropdown menu visible for
     */
    $scope.showAppTopicMenu = function(appId){
        $scope.openAppTopicMenu = appId;
    };

    /**
     * Toggles active status of group
     * @method setActiveGroup
     * @attribute title {String} the group to toggle active bit for
     */
    $scope.setActiveGroup = function(title){
        $scope.groupedTopics[title].active = !$scope.groupedTopics[title].active
    };

    /**
     * Method to make sure that all topics are unique
     * @method checkUniqueName
     * @return {Boolean} True if all topics are unique
     */
    $scope.checkUniqueName = function(){
        var currentTag = $scope.topicModel.topic.tag;
        var currentId = $scope.topicModel.topic._id;
        return !_.any( $scope.topics, function(topic){
            return(currentId !== topic._id && currentTag === topic.tag)
        })
    }

    /**
     * Called when an app is being dropped into a topic
     * @method dropfunction
     * @param dropData {String} The id of the topic object that an app is being dropped into
     * @param dragData {String} The id of the app object being dragged into the topic container
     */
    $scope.dropfunction = function(dropData, dragData){
        var topic = _.find($scope.topics, {_id: dropData});
        var app = _.find($scope.allApps, {_id: dragData});
        if(!topic || !app) return;
        var group = topic.tag[0].toUpperCase();
        if(!$scope.expandGroup(group)) return; //slidable causes hidden elements to also receive a drop event.
        if(!$scope.groupedTopics[group].active) $scope.setActiveGroup(group);
        if($scope.dropTimer) $timeout.cancel($scope.dropTimer);
        $scope.dropStatus.topic = topic._id
        if(!$scope.appInTopic(app, topic.tag)){
            $scope.dropStatus.updateStatus(dropStatuses.Pending);
            $scope.toggleAppTopic(app, topic.tag);
        }
        else{
            $scope.dropStatus.updateStatus(dropStatuses.Warning);
            $scope.$apply();
        }
    };

    /**
     * Sets drag mode to true
     * @method startDragFunction
     */
    $scope.startDragFunction = function(){
        $scope.dragMode = true;
    };

    /**
     * Sets drag mode to false
     * @method stopDragFunction
     */
    $scope.stopDragFunction = function(){
        $scope.dragMode = false;
    };

    /**
     * Sets the hover group to the value passed in
     * @method hoverIn
     * @param group {String}
     */
   $scope.hoverIn = function(group){
        $scope.hoverGroup = group;
    };

    /**
     * Clears the hover group
     * @method hoverOut
     */
    $scope.hoverOut = function(){
        $scope.hoverGroup = '';
    };

    /**
     * Checks whether group passed in is active and expanded
     * @method expandGroup
     * @param group {String} a group name
     * @return {Boolean} True if group passed in is active and expanded
     */
    $scope.expandGroup = function(group){
        return ( ($scope.dragMode && $scope.hoverGroup == group) || ($scope.groupedTopics[group] && $scope.groupedTopics[group].active) );
    };

    /**
     * Checks whether the user is currently dragging a topic wiht the group passed in
     * @method draggableHoverState
     * @param group {String}
     * @return {Boolean} True if the user is currently dragging a topic wiht the group passed in
     */
    $scope.draggableHoverState = function(group){
        return $scope.dragMode && $scope.hoverGroup == group;
    }

    /**
     * Saves new or existing topic model to database
     * @method saveTopic
     * @return {PromiseObject} used for saving topic to database
     */
    $scope.saveTopic = function () {
        if ($scope.topicModel.topic._id == "new") {//new topic
            return $scope.addTopic();
        } else {//existing topic
            return $scope.updateTopic();
        }
    };

    /**
     * Creates a new topic from the created topic model
     * @method addTopic
     * @return {PromiseObject} used for adding new topic
     */
    $scope.addTopic = function () {
        var topic = Ozone.utils.clone($scope.topicModel.topic);
        topic._id = null;
        topic.level = "Role"
        return Tag.createNewTopic(topic).then(function () {
            var activeGroup = topic.tag[0].toUpperCase()
            $scope.refreshTopics(activeGroup);
        });
    };

    /**
     * Updates existing topic model selected by user
     * @method updateTopic
     * @return {PromiseObject} used for updating topic
     */
    $scope.updateTopic = function(){
        return Tag.updateTopic($scope.topicModel.topic).then(function(data){
            if(data && data.length !== 0){
                //if the topic name changed must update appsByTopic to reflect change.
                var newTag = $scope.topicModel.topic.tag;
                var oldTag = $scope.topicModel.topicBackup.tag;
                if ( oldTag != newTag){
                    $scope.appsByTopic[newTag] = $scope.appsByTopic[oldTag];
                    $scope.appsByTopic[oldTag] = null;
                }
                //update the backup
                $scope.topicModel.backupTopic();
            }
        });
    };

    /**
     * Deletes topic model in this controller; deletes from database if loaded topic model exists in database
     * @method deleteTopic
     */
    $scope.deleteTopic = function () {
        console.log('DELETING TOPIC: ID = '+ $scope.topicModel.topic._id);
        if ($scope.topicModel.topic._id == "new") {
            $scope.topics.shift();
            $scope.topicModel.topic = {tag: "", description: "", _id: ""};
            $scope.topicModel.apps = [];
            $scope.displayAllApps();
        } else {
            return Tag.deleteTopics($scope.topicModel.topic._id).then(function() {
                return $scope.refreshTopics()
            });
        }
    };

    /**
     * Checks whether the topic passed in contains the app passed in
     * @method appInTopic
     * @param app {Object} 
     * @param topicName {String} 
     * @return {Boolean} True if the app passed in is contained within the topic passed in, or false otherwise.
     */
    $scope.appInTopic = function(app, topicName){
        if (_.isEmpty($scope.appsByTopic[topicName])) return false;
        return _.any($scope.appsByTopic[topicName], function(appTag){
            if (!appTag || !appTag.uri) return false;
            return appTag.uri.indexOf(app.shortname) != -1;
        });
    };

    /**
     * Toggles existance of app in topic: If app previously existed in topic then remove, and if did not exist in topic then add to topic.
     * @method toggleAppTopic
     * @param app {Object} The app to be added or removed from topic
     * @param topicName {String} The topic to add/remove app from
     */
    $scope.toggleAppTopic = function(app, topicName){
        //ensure appsByTopic includes this topic
        if (_.isEmpty($scope.appsByTopic[topicName]))
            $scope.appsByTopic[topicName] = [];
        //if app is in AppsByTopic remove it
        if ($scope.appInTopic(app, topicName)){
            //find appropriate app topic tag
            var appTagToDelete = _.find($scope.appsByTopic[topicName], function(appTag){return appTag.uri.indexOf(app.shortname) != -1 && appTag.tag == topicName;});
            //remove it frm the apps by topic
            $scope.appsByTopic[topicName] = _.reject($scope.appsByTopic[topicName], function(topicApp){return topicApp._id == appTagToDelete._id })
            //remove app from current model if removing from currently selected topic
            if (topicName == $scope.topicModel.topic.tag)
                $scope.topicModel.apps = _.reject($scope.topicModel.apps, function(topicApp){return topicApp._id == app._id});
            //delete the actual tag
            Tag.deleteTags(appTagToDelete._id);

        } else {
            var uri = "/AppsMall/Apps/" + app.shortname;
            Tag.createNewTag(topicName, uri, $scope.topicUri).then(function(newTag){
                //success
                $scope.appsByTopic[topicName].push(newTag[0]);
                $scope.dropStatus.updateStatus(dropStatuses.Success);
            }, function(){
                //Fail
                $scope.dropStatus.updateStatus(dropStatuses.Fail);
            });
        }
    };

}];

controllersModule.controller('AdminTopicsController', AdminTopicsController);
