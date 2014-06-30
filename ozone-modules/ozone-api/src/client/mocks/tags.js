Ozone.Service("Tags", (function () {
	var api = {
        getServicePath: function () {
			return Ozone.utils.murl("apiBaseUrl", "/tags/");
	    },
        tag: {
            get: function (id, callback, context) {
                if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) { // get all
                    context = callback;
                    callback = id;
                    id = undefined;
                }

                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }

                //---  Ozone.ajax replacement code ---//
                if (id !== undefined && !Ozone.utils.isFunction(id)) {
                    var clonedTag = Ozone.mockDb.getSingleRecord('Tags', id);
                    return callback.apply((context || this), [clonedTag]);
                }
                else {
                    var clonedTags = Ozone.mockDb.getAllRecords('Tags');
                    return callback.apply((context || this), [clonedTags]);
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

                var queryObj = {};
                if (selector.id) {
                    queryObj.id = selector.id;
                }
                if (selector.level) {
                    queryObj.level = selector.level;
                }
                if (selector.topic) {
                    queryObj.topic = selector.topic;
                }
                if (selector.uri) {
                    queryObj.uri = selector.uri;
                }
                if (selector.tag) {
                    queryObj.tag = selector.tag;
                }
                if (selector.createdUserId) {
                    queryObj.createdUserId = selector.createdUserId;
                }
                if (selector.visibility) {
                    queryObj.visibility = selector.visibility;
                }

                Ozone.logger.debug("in tag query, queryObj: " + JSON.stringify(queryObj, null, 3));

                var url = api.getServicePath() + "tag/";
                //---  Ozone.ajax replacement code ---//
                var filteredTagValues = Ozone.mockDb.query('Tags', queryObj);
                if (filteredTagValues) {
                    return callback.apply((context || this), [filteredTagValues]);
                }
                //---  Ozone.ajax replacement code ---//
            },
            create: function (tag, callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (Ozone.utils.isUndefinedOrNull(tag)) {
                    throw "No tag defined";
                }

                //---  Ozone.ajax replacement code ---//
                var createdTag = Ozone.mockDb.create('Tags', tag);
                if (createdTag) {
                    return callback.apply((context || this), [[createdTag]]);  // RWP 4/24/14: topic in Ozone App Service is returned inside a 1-element array
                }
                //---  Ozone.ajax replacement code ---//
            },
            update: function (tag, callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (Ozone.utils.isUndefinedOrNull(tag)) {
                    throw "No tag defined";
                }

                var id = (tag.id || tag._id);
                if (id === undefined) {
                    throw "tag has no id";
                }

                //---  Ozone.ajax replacement code ---//
                var updatedTag = Ozone.mockDb.update('Tags', tag, id);
                if (updatedTag) {
                    return callback.apply((context || this), [updatedTag]);
                }
                //---  Ozone.ajax replacement code ---//
            },
            del: function (tag, callback, context) {
                if (!Ozone.utils.isFunction(callback)) {
                    throw "No callback defined";
                }
                if (Ozone.utils.isUndefinedOrNull(tag)) {
                    throw "No tag defined";
                }

                var id = (tag.id || tag._id);
                if (id === undefined) {
                    throw "tag has no id";
                }

                //---  Ozone.ajax replacement code ---//
                var isDeleted = Ozone.mockDb.delete('Tags', id);
                if (isDeleted) {
                    return callback.apply((context || this), [tag]);
                }
                //---  Ozone.ajax replacement code ---//
            }
        }
    };

    // // Support of IE8 and it's terrible understanding of ECMAScript
    // api.tag["delete"] = api.tag.del;

    // To support old API:
    for (var methodName in api.tag) {
        (function(methodName, method) {
            api[methodName] = function() {
                Ozone.logger.warning('Ozone.Service("Tags").' + methodName + '() is deprecated.  Use Ozone.Service("Tags").tag.' + methodName + '() instead.');
                return method.apply(this, arguments);
            };
        })(methodName, api.tag[methodName]);
    };

    return api;

}()));
