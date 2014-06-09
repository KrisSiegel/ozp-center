'use strict';

controllersModule.controller('AdminTopicsController', ['$scope', '$rootScope', '$q','$timeout', 'AppOrComponent', 'AppWorkflow', 'Persona', 'Tag',
    function ($scope, $rootScope, $q, $timeout, AppOrComponent, AppWorkflow, Persona, Tag) {
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

        $scope.personaData = {};

        //////////////////////
        //Controller variables
        //////////////////////
        $scope.topics = [];
        $scope.searchedTopic = '';
        $scope.appsByTopic = {};
        $scope.allApps = [];
        $scope.showAllApps = true;
        $scope.dragMode = false;

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

        $scope.openAppTopicMenu = "";
        $scope.groupedTopics = {};
        $scope.hoverGroup = "";
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

        /////////////////////////////
        //INITIALIZE AND REFRESH CODE
        /////////////////////////////
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

        $scope.searchTopic = function(){
            var topic = _.find($scope.topics, function(topic){return topic.tag == $scope.searchedTopic});
            if(_.isEmpty(topic)) return;
            $scope.searchedTopic = '';
            $scope.setSelected(topic._id);
        };

        $scope.getTopicNames = function(){
            var arr = _.pluck($scope.topics, 'tag');
            return arr;
        };

        /////////////////////////
        //UI 'PAGE' CHANGING CODE
        /////////////////////////
        $scope.isSelected = function (topicId) {
            return topicId == $scope.topicModel.topic._id;
        };

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

        $scope.displayAllApps = function(){
            $scope.showAllApps = true;
            $scope.topicModel.revertFromBackup();
            if ($scope.topicModel.topic._id == "new")
                $scope.topics.shift();
            $scope.topicModel.topic = {tag: "", description: "", _id: ""};
            $scope.topicModel.apps = [];
        };

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

        ////////////
        //UI HELPERS
        ////////////
        $scope.clearContextMenu = function($event){
            //closes app context menu if it is open and click was not in app context menu or opening it
            if(!_.isEmpty($scope.openAppTopicMenu) &&
                !($($event.target).is($('.context-menu-toggle')) || !_.isEmpty($('.context-menu-toggle').has($($event.target)))
                    || $($event.target).is($('.context-menu')) || !_.isEmpty($('.context-menu').has($($event.target)))))
                $scope.openAppTopicMenu = '';
        };

        $scope.hasApps = function () {
            return !_.isEmpty($scope.topicModel.apps);
        };

        $scope.anyApps = function(){
            return $scope.allApps.length != 0 && $scope.appsLoaded;
        };

        // Returns True if the user logged in has permission to access the selected manager page.
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

        $scope.showAppTopicMenu = function(appId){
            $scope.openAppTopicMenu = appId;
        };

        $scope.setActiveGroup = function(title){
            $scope.groupedTopics[title].active = !$scope.groupedTopics[title].active
        };

        $scope.checkUniqueName = function(){
            var currentTag = $scope.topicModel.topic.tag;
            var currentId = $scope.topicModel.topic._id;
            return !_.any( $scope.topics, function(topic){
                return(currentId !== topic._id && currentTag === topic.tag)
            })
        }
        ///////////////////////
        //DRAG AND DROP HELPERS
        ///////////////////////
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

        $scope.startDragFunction = function(){
            $scope.dragMode = true;
        };

        $scope.stopDragFunction = function(){
            $scope.dragMode = false;
        };

       $scope.hoverIn = function(group){
            $scope.hoverGroup = group;
        };

        $scope.hoverOut = function(){
            $scope.hoverGroup = '';
        };

        $scope.expandGroup = function(group){
            return ( ($scope.dragMode && $scope.hoverGroup == group) || ($scope.groupedTopics[group] && $scope.groupedTopics[group].active) );
        };

        $scope.draggableHoverState = function(group){
            return $scope.dragMode && $scope.hoverGroup == group;
        }
        //////////////////
        //TOPIC UPDATES
        //////////////////
        $scope.saveTopic = function () {
            if ($scope.topicModel.topic._id == "new") {//new topic
                $scope.addTopic();
            } else {//existing topic
                $scope.updateTopic();
            }
        };

        $scope.addTopic = function () {
            var topic = Ozone.utils.clone($scope.topicModel.topic);
            topic._id = null;
            topic.level = "Role"
            Tag.createNewTopic(topic).then(function () {
                var activeGroup = topic.tag[0].toUpperCase()
                $scope.refreshTopics(activeGroup);
            });
        };

        $scope.updateTopic = function(){
            Tag.updateTopic($scope.topicModel.topic).then(function(data){
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

        /////////////////////////////
        //UPDATES TO APPS IN TOPICS
        /////////////////////////////
        $scope.appInTopic = function(app, topicName){
            if(_.isEmpty($scope.appsByTopic[topicName])) return false;
            return _.any($scope.appsByTopic[topicName], function(appTag){
                if(!appTag || !appTag.uri) return false;
                return appTag.uri.indexOf(app.shortname) != -1;
            });
        };

        $scope.toggleAppTopic = function(app, topicName){
            //ensure appsByTopic includes this topic
            if(_.isEmpty($scope.appsByTopic[topicName]))
                $scope.appsByTopic[topicName] = [];
            //if app is in AppsByTopic remove it
            if($scope.appInTopic(app, topicName)){
                //find appropriate app topic tag
                var appTagToDelete = _.find($scope.appsByTopic[topicName], function(appTag){return appTag.uri.indexOf(app.shortname) != -1 && appTag.tag == topicName;});
                //remove it frm the apps by topic
                $scope.appsByTopic[topicName] = _.reject($scope.appsByTopic[topicName], function(topicApp){return topicApp._id == appTagToDelete._id })
                //remove app from current model if removing from currently selected topic
                if(topicName == $scope.topicModel.topic.tag)
                    $scope.topicModel.apps = _.reject($scope.topicModel.apps, function(topicApp){return topicApp._id == app._id});
                //delete the actual tag
                Tag.deleteTags(appTagToDelete._id);

            }else{
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
    }
]);
