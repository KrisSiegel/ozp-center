(function () {

    var api = Ozone.Service("Tags");

    var genericService = {
		getServicePath: function () {
			return Ozone.utils.murl("apiBaseUrl", this.controller, true);
		},
		get: function (id, callback, context) {
			if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) { // get all
				context = callback;
				callback = id;
			}

			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }

			var url = api.getServicePath() + this.endComponent;
			if (id !== undefined && !Ozone.utils.isFunction(id)) {
				url = url + id;
			}

            //---  Ozone.ajax replacement code ---//
            if (id !== undefined && !Ozone.utils.isFunction(id)) {
                var clonedTagTopic = Ozone.mockDb.getSingleRecord('TagTopics', id);
                return callback.apply((context || this), [clonedTagTopic]);
            }
            else {
                var clonedTagTopics = Ozone.mockDb.getAllRecords('TagTopics');
                return callback.apply((context || this), [clonedTagTopics]);
            }
            //---  Ozone.ajax replacement code ---//
		},
		query: function (selector, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (!Ozone.utils.isObject(selector)) {
            	throw "No selector defined";
            }

			var queryObj = null;
            if (typeof this.buildQueryObject === 'function') {
                queryObj = this.buildQueryObject(selector);
            } else {
                queryObj = selector;
            }

			Ozone.logger.debug("in tag query, queryObj: " + JSON.stringify(queryObj, null, 3));

			var url = this.getServicePath() + this.endComponent;

            //---  Ozone.ajax replacement code ---//
            var filteredTagTopicValues = Ozone.mockDb.query('TagTopics', queryObj);
            if (filteredTagTopicValues) {
                return callback.apply((context || this), [filteredTagTopicValues]);
            }
            //---  Ozone.ajax replacement code ---//
		},
		create: function (newItem, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(newItem)) {
            	throw "No newItem defined";
            }

			var url = api.getServicePath() + this.endComponent;

            //---  Ozone.ajax replacement code ---//
            var createdTagTopic = Ozone.mockDb.create('TagTopics', newItem);
            if (createdTagTopic) {
                return callback.apply((context || this), [[createdTagTopic]]);  // RWP 4/24/14: topic in Ozone App Service is returned inside a 1-element array
            }
            //---  Ozone.ajax replacement code ---//
		},
		update: function (updateItem, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(updateItem)) {
            	throw "No updateItem defined";
            }

			var id = (updateItem.id || updateItem._id);
			if (id === undefined) {
				throw "updateItem has no id";
			}

            var ec = this.endComponent
            if(ec.length > 0 && ec[ec.length - 1] != '/' )
                ec += '/';

            var url = api.getServicePath() + ec + id;

            //---  Ozone.ajax replacement code ---//
            var updatedTag = Ozone.mockDb.update('TagTopics', updateItem, id);
            if (updatedTag) {
                return callback.apply((context || this), [updatedTag]);
            }
            //---  Ozone.ajax replacement code ---//
 		},
		del: function (deleteItem, callback, context) {
			if (!Ozone.utils.isFunction(callback)) {
            	throw "No callback defined";
            }
			if (Ozone.utils.isUndefinedOrNull(deleteItem)) {
            	throw "No deleteItem defined";
            }

			var id = (deleteItem.id || deleteItem._id);
			if (id === undefined) {
				throw "deleteItem has no id";
			}
			var url = api.getServicePath() + this.endComponent + '/' + id;

            //---  Ozone.ajax replacement code ---//
            var topicWithId = Ozone.mockDb.query('TagTopics', {id: id});
            if (topicWithId) {
                var tagName = (topicWithId[0] || {}).tag;
                var tagTopic = (topicWithId[0] || {}).uri;
                var tagsWithName = Ozone.mockDb.query('Tags', {tag: tagName});
                var tagsWithNameAndTopic = _.filter(tagsWithName, function(tag) { return (tag.topic === tagTopic); });
                console.log('!!! TOPIC TO DELETE: '+ JSON.stringify(topicWithId));
                var isDeleted = Ozone.mockDb.delete('TagTopics', id);
                if (isDeleted) {
                    console.log('!!! DELETING TAG NAME ' + tagName + ', TAG NAME OBJS = ' + JSON.stringify(tagsWithName) + ', TAG + TOPIC OBJS = ' + JSON.stringify(tagsWithNameAndTopic));
                    tagsWithNameAndTopic.map(function(tag) { 
                        isDeleted = isDeleted && Ozone.mockDb.delete('Tags', tag._id);
                    });
                    // if topic and all related tags are deleted, then call the callback method
                    if (isDeleted) {
                        return callback.apply((context || this), [deleteItem]);
                    }
                }
            }

            //---  Ozone.ajax replacement code ---//
		}
	};

    // Support of IE8 and it's terrible understanding of ECMAScript
    genericService["delete"] = genericService.del;

    function serviceClass(serviceName, controller, endComponent) {
        this.controller = controller;
        this.serviceName = serviceName;
        this.endComponent = endComponent;
        this.buildQueryObject = function (selector) {
            var fields = [
                "id",
                "level",
                "topic",
                "uri",
                "tag",
                "createdUserId",
                "visibility"
            ];
            var queryObj = {};
            for (var i = 0, len = fields.length; i < len; i++) {
                var field = fields[i];
			    if (selector[field]) {
				    queryObj[field] = selector[field];
                }
			}
            return queryObj;
        };
    };

    serviceClass.prototype = genericService;
    api.topic = new serviceClass("Tags.topic", "tags/", "tagTopic");

}());
