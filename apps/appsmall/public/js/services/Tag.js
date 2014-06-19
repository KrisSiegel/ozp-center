/**
 * Service object for performing simple CRUD operations and advanced searches on the Tag Mongo collection
 *
 * @module AppsMallUI.servicesModule
 * @submodule AppsMallUI.TagModule
 * @requires amlApp.services
 */

'use strict';

/**
 * @class AppsMallUI.TagService
 * @static
 */ 

/**
 * @class AppsMallUI.TagService
 * @constructor
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 * @param Persona {Object} an Angular-injected instance of {{#crossLink "PersonaService"}}{{/crossLink}}
 */
var TagService = ['$q', 'Persona', function($q, Persona) {

    /**
     * get URI from app data. (TO DO: apps and components might have different URI path components, if applicable.)
     * @method getShortnameFromUri
     * @param uri {String} the full or relative path for an app
     * @param [tagObj] {Object} a tag object used as a search constraint that, if defined, must contain a tag from allTags with uri equal to the uri passed in
     * @param [allTags] {Array} an array of Tag objects that, if defined, must contain a tag with tagObj's tag name
     * @public
     * @return {String} the shortname parsed from the uri passed in, or the empty string of the uri was not contained in the tag object and tag list parameters
     */
    function getShortnameFromUri(uri, tagObj, allTags) { 
        // if no tags are passed in: do simple parsing of URI component.
        if (!tagObj && !allTags) {
            return uri.replace(/^.*[\/\\]/,'');
        }
        // If tags are passed in: search tags for matching URI and return if found; otherwise return empty string
        for (var i = 0; i < allTags.length; ++i) {
            if (allTags[i].tag === tagObj.tag) {
                if (allTags[i].uri.indexOf(uri) >= 0) {
                    return allTags[i].uri.replace(/^.*[\/\\]/,'');
                }
            }
        }
        return '';
    }

    /**
     * This method currently doesn't work as expected. Just ignore it; getTagByComplex works
     * for the same thing. We'll revisit this later as part of the Ozone API.
     * @method getTagById
     * @param id {String} the UUID (unique identifier) of the App object to delete
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @private
     * @deprecated
     * @return {PromiseObject} that, when invoked, passes Tag object with matching id as a parameter into then() callback
     */
    var getTagById = function (id, context) {
        if (_.isEmpty(id)) {
            return $q.reject();
        } else {
            var deferred = $q.defer();
            Ozone.Service("Tags").tag.get(id, function() {
                return deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        }
    };

     /**
      * Advanced function to query on tags.
      * @method getTags
      * @param [queryObj] {Object} a list of attributes and values to be queried on; if empty all values will be returned.
      * Example query object:
      * ```
      * {
      *   "topic": "/AppsMall/Category",
      *   "uri": uri,
      *   "tag": tag,
      * }```
      * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
      * @public
      * @return {PromiseObject} that, when invoked, passes an array of queried Tag objects into the then() callback.
      */
    var getTagByComplex = function (queryObj, context) {
        if (arguments.length > 2) {
            console.log("getTagByComplex signature has changed: now getTagByComplex(queryObj, context)");
            throw "getTagByComplex: too many arguments";
        };
        queryObj = queryObj || {};
        var deferred = $q.defer();
        Ozone.Service("Tags").tag.query(queryObj, function() {
            return deferred.resolve.apply(this, arguments);
        }, context);
        return deferred.promise;
    };

    /**
     * @method createTagFromPersonaData
     * @param tag {String} name of the tag to be created
     * @param uri {String} the full-path URI for this tag
     * @param topic {String} The topic of this tag
     * @param personaData {Object} A Persona object containing a valid username that will get assigned to the tag
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @private
     * @return {PromiseObject} that, when invoked, passes the newly created Tag object into the then() callback.
     */
    var createTagFromPersonaData = function(tag, uri, topic, personaData, context) {
        var deferred = $q.defer();
        var currentDate = (new Date()).toString();
        var newTag = {
            "topic": topic,
            "uri": uri,
            "tag": tag,
            "description": "",
            "creatorUserId": personaData.username,
            "created": currentDate,
            "modified": currentDate
        };
        Ozone.Service("Tags").tag.create(newTag, function() {
            return deferred.resolve.apply(this, arguments);
        }, context);
        return deferred.promise;
    }

    /**
     * Creates a single new tag using the user's logged-in Persona data.  If the user is not logged in, then this method will fail without raising an exception.
     * @method createNewTag
     * @param tag {String} name of the tag to be created
     * @param uri {String} the full-path URI for this tag
     * @param topic {String} The topic of this tag
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @public
     * @return {PromiseObject} that, when invoked, passes the newly created Tag object into the then() callback.
     */
    var createNewTag = function(tag, uri, topic, context) {
        var deferred = $q.defer();
        Persona.getCurrentPersonaData().then(function(personaData) {
            createTagFromPersonaData(tag, uri, topic, personaData, context).then(function(newTag) {
                deferred.resolve(newTag);
            });
        });
        return deferred.promise;
    };

    /**
     * Creates multiple new tags using the user's logged-in Persona data, by invoking the $q.all method.  If the user is not logged in, 
     *     then this method will fail without raising an exception.
     * @method createNewTags
     * @param tagList {Array} a list of tag names, for tags to be created
     * @param uri {String} the full-path URI for this tag
     * @param topic {String} The topic of this tag
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @public
     * @return {PromiseObject} that, when invoked, passes the newly created array of Tag objects into the then() callback.
     *         The then-clause for the returned promise will not get invoked until every single tag creation async call has been returned successfully.
     */
    var createNewTags = function(tagList, uri, topic, context) {
        if (!_.isArray(tagList) || (tagList.length === 0)) {
            return $q.reject('No tags were given to be created.');
        }
        var deferred = $q.defer();
        Persona.getCurrentPersonaData().then(function(personaData) {
            $q.all(_.map(tagList, function(tag) { return createTagFromPersonaData(tag, uri, topic, personaData, context); })).then(function() {
                deferred.resolve.apply(this, arguments);
            });
        });
        return deferred.promise;
    };

    /**
     * Update a single existing tag using the user's logged-in Persona data.  If the user is not logged in, then this method will fail without raising an exception.
     * @method updateTag
     * @param tag {Object} Tag object to be updated
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @public
     * @return {PromiseObject} that, when invoked, passes the newly updated Tag object into the then() callback.
     */
    var updateTag = function(tag, context) {
        var deferred = $q.defer();
        var currentDate = (new Date()).toString();
        var topicWithMetadata = {
            "modified": currentDate
        };
        Ozone.extend(tag, topicWithMetadata);
        Ozone.Service("Tags").update(tag, function() {
            return deferred.resolve.apply(this, arguments);
        }, context);
        return deferred.promise;
    }

    /**
     * Update a single existing tag using the user's logged-in Persona data.  If the user is not logged in, then this method will fail without raising an exception.
     * @method updateTags
     * @param tagList {Array} An array of Tag objects to be updated
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @public
     * @return {PromiseObject} that, when invoked, passes the newly updated Tag object into the then() callback.
     */
    var updateTags = function(tagList, context) {
        if (!_.isArray(tagList) || (tagList.length === 0)) {
            return $q.reject('No tags were given to be updated.');
        }
        var deferred = $q.defer();
        $q.all(_.map(tagList, function(tag) { return updateTag(tag, context); })).then(function() {
            deferred.resolve.apply(this, arguments);
        });
        return deferred.promise;
    }

    /**
     * Deletes one or more tags with ids equal to the values passed in.
     * @method deleteTags
     * @param idValueOrArray {Array, String} the UUID (unique identifier) of the Tag object to delete, or an array of tag UUIDs
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @public
     * @return {PromiseObject} that, when invoked, passes the newly deleted Tag objects into the then() callback.
     */
    var deleteTags = function(idValueOrArray, context) {
        if (common.isValidId(idValueOrArray)) {
            return deleteSingleTag(idValueOrArray, context);
        }
        if (!_.isArray(idValueOrArray) || idValueOrArray.length === 0) {
            return $q.reject('No tags were given to be deleted.');
        }
        var deferred = $q.defer();
        if (_.isArray(idValueOrArray)) {
            // id array passed in: call delete on every valid id in array
            var validTagIds = _.chain(idValueOrArray)
                                     .flatten()
                                     .compact()
                                     .filter(function(id) { return common.isValidId(id); })
                                     .value();

            $q.all(_.map(validTagIds, function(id) { return deleteSingleTag(id, context); })).then(function() {
                deferred.resolve.apply(this, arguments);
            });
        }
        return deferred.promise;
    };

    /**
     * Deletes a single tag with the id value passed in
     * @method deleteSingleTag
     * @param id {String} the UUID (unique identifier) of the Tag object to delete
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @private
     * @return {PromiseObject} that, when invoked, passes the newly deleted Tag into the then() callback.
     */
    var deleteSingleTag = function(id, context) {
        var deferred = $q.defer();
        Ozone.Service("Tags").tag.del({id: id}, function() {
            deferred.resolve.apply(this, arguments);
        }, context);
        return deferred.promise;
    }

    /**
     * Returns a list of Tag objects where the tag names start with the substring passed in
     * @method searchTagsByNameSubstring
     * @param substring {String} 
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @public
     * @return {PromiseObject} that, when invoked, passes an array of Tag objects as a single parameter into the then() callback.
     */
    var searchTagsByNameSubstring = function(substring, context) {
        substring = substring.toLowerCase();
        var deferred = $q.defer();
        Ozone.Service("Tags").tag.query({}, function(tags) {
            var nameFilteredTags = _.filter(tags, function(tag) {
                return (tag.tag || '').toLowerCase().startsWith(substring);
            });
            deferred.resolve(nameFilteredTags);
        }, context);
        return deferred.promise;
    };

    /**
     * Returns a list of Topic objects where the topic names start with the substring passed in
     * @method searchTagTopicsByNameSubstring
     * @param substring {String} 
     * @public
     * @return {PromiseObject} that, when invoked, passes an array of Topic objects as a single parameter into the then() callback.
     */
    var searchTagTopicsByNameSubstring = function(substring) {
        substring = substring.toLowerCase();
        var deferred = $q.defer();
        getTopicsByTopic("/AppsMall/App/", "Role").then(function(tagTopics){
            var nameFilteredTags = _.filter(tagTopics, function(tag) {
                return (tag.tag || '').toLowerCase().startsWith(substring);
            });
            deferred.resolve(nameFilteredTags);
        });
        return deferred.promise;
    };

    /**
     * Returns a list of all App shortnames that contain at least one tag.
     * @method getAllTagShortnames
     * @private
     * @return {PromiseObject} that, when invoked, passes an array of App shortnames as a single parameter into the then() callback.
     */
    var getAllTagShortnames = function() {
        var deferred = $q.defer();
        getTagByComplex().then(function(allTags) {
           var shortnames =  _.chain(allTags)
                              .map(function(tagObj) { return getShortnameFromUri(tagObj.uri, tagObj, allTags); })
                              .uniq()
                              .value();

            deferred.resolve(shortnames);
        });
        return deferred.promise;
    };

    /**
     * Returns a list of Tag objects that match the URI prefix passed in and match all query parameters contained in the query object.
     * @method getTagsByUriPrefix
     * @param prefix {String} a substring that all tag names returned must start with
     * @param queryObj {Object} An object containing query parameters, in standard key-value form
     * @public
     * @return {PromiseObject} that, when invoked, passes  an Array of Tag objects as a single parameter into the then() callback.
     */
    var getTagsByUriPrefix = function(prefix, queryObj) {
        queryObj = queryObj || {};
        var deferred = $q.defer();
        getTagByComplex(queryObj).then(function(queriedTags) {
            var filteredTags = _.filter(queriedTags, function(tag) {
                return (tag.uri || '').startsWith(prefix);
            });
            deferred.resolve(filteredTags);
        });
        return deferred.promise;
    }

    /**
     * Returns a list of all App shortnames that contain at least one tag from the tag name list passed in, and contained in the list of tag names passed in.
     * @method getAllTagShortnames
     * @param selectedTagNames {Array} a list of tag names used to filter return values
     * @public
     * @return {PromiseObject} that, when invoked, passes an Array of App shortnames as a single parameter into the then() callback.
     */
    var getAppShortnamesWithTags = function(selectedTagNames) {
        if (_.isEmpty(selectedTagNames)) {
            return getAllTagShortnames();
        }
        var deferred = $q.defer();
        getTagByComplex().then(function(allTags) {
            var shortnamesWithTags = [];
            //collects any app that matchs a tag
            _.each(allTags, function(tag){
                if(_.any(selectedTagNames, function(selTag){ return selTag.name == tag.tag && selTag.type == tag.topic })){
                    shortnamesWithTags.push({tag: tag.tag, shortname: getShortnameFromUri(tag.uri, tag, allTags)})
                }
            });
            //ensure that each app matches all selected tags
            var groupedShortnames = _.groupBy(shortnamesWithTags, 'shortname');
            var shortnames = _.map(groupedShortnames, function(values, key){
                return (values.length == selectedTagNames.length) ? key : undefined
            })
            deferred.resolve(_.compact(shortnames));
        });
        return deferred.promise;
    };

    // 

    /**
     * Creates a single new Topic object with the parameters and persona passed in.  If no persona is passed in, then this method will fail without raising an exception.
     * @method createNewTopic
     * @param newTopic {Object} new Topic to be created
     * @param [persona] {Object} Persona object that new topic will be assigned to.  Uses current persona if this field is empty. 
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @public
     * @return {PromiseObject} that, when invoked, passes the newly created Topic object into the then() callback.
     */
    var createNewTopic = function(newTopic, persona, context) {
        // if no persona was passed in, then make call to get persona and call recursively with returned persona (if valid)
        if (!_.isObject(persona)) {
            return Persona.getCurrentPersonaData().then(function(personaData) {
                if (_.isObject(personaData)) {
                    return createNewTopic(newTopic, personaData, context);
                }
            });
        }
        else {
            var deferred = $q.defer();
            var currentDate = (new Date()).toString();
            var newTopicWithMetadata = {
                "creatorUserId": persona.username,
                "created": currentDate,
                "modified": currentDate
            };
            Ozone.extend(newTopic, newTopicWithMetadata);
            Ozone.Service("Tags").topic.create(newTopicWithMetadata, function() {
                return deferred.resolve.apply(this, arguments);
            }, context);
            return deferred.promise;
        }
    };

    /**
     * Creates a single new Topic object with the parameters and persona passed in, then creates multiple new tags linked to the newly created topic
     *     using the user's logged-in Persona data, by invoking the $q.all method.  If the user is not logged in, then this method will fail without raising an exception.
     * @method createNewTagsAndTopics
     * @param tagList {Array} a list of tag names, for tags to be created
     * @param appUri {String} the full-path URI for all tags to be created
     * @param topicUri {String} the full-path URI for the topic to be created
     * @param level {String} The topic level; must be either 'System' for system-level topics or 'Role' for role-based topics.
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @public
     * @return {PromiseObject} that, when invoked, passes the newly created Tag objects into the then() callback.
     */
    var createNewTagsAndTopics = function(tagList, appUri, topicUri, level, context) {
        if (!_.isArray(tagList) || (tagList.length === 0)) {
            return $q.reject();
        }
        return $q.all([Persona.getCurrentPersonaData(), getTopicsByTopic(topicUri, level)]).then(function(results) {
            // get return values from promise return array
            var personaData = results[0], 
                allTopics = results[1];

            // create objects for new topics
            var topicNamesToCreate = _.difference(tagList, _.pluck(allTopics, 'tag'));
            var topicsToCreate = _.map(topicNamesToCreate, function(topicName) { return {tag: topicName, description: '', level: level, uri: topicUri}; });

            // make server call to create topics, then make call to create new tags
            return $q.all(_.map(topicsToCreate, function(topicObj) { return createNewTopic(topicObj, personaData, context); })).then(function(newTopics) {
                return createNewTags(tagList, appUri, topicUri, context).then(function() {
                    return arguments;
                });
            });
        });
    }

    /**
     * Updates an existing Topic object with the object passed in.
     * @method updateTopic
     * @param newTopic {Object} new Topic to be created
     * @param [persona] {Object} Persona object that new topic will be assigned to.  Uses current persona if this field is empty. 
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @public
     * @return {PromiseObject} that, when invoked, passes the newly created Topic object into the then() callback.
     */
    var updateTopic = function(topic, context) {
        var deferred = $q.defer();
        var currentDate = (new Date()).toString();
        var topicWithMetadata = {
            "modified": currentDate
        };
        Ozone.extend(topic, topicWithMetadata);
        Ozone.Service("Tags").topic.update(topic, function() {
            return deferred.resolve.apply(this, arguments);
        }, context);
        return deferred.promise;
    }

    /**
     * Queries topics based on the topic URI passed in an existing Topic object with the object passed in.
     * @method getTopicsByTopic
     * @param topicUri {String} topic URI to query on
     * @param [level] {String} The topic level; must be either 'System' or 'Role' for respective topic levels, or empty to search for all topic levels.
     * @public
     * @return {PromiseObject} that, when invoked, passes a list of topics matching the topic URI into the then() callback.
     */
    function getTopicsByTopic(topicUri, level) {
        var deferred = $q.defer();
        var filter = {uri: topicUri};
        if(level)
            filter['level'] = level;
        Ozone.Service("Tags").topic.query(filter, function(topics) {
                deferred.resolve(topics);
        });
        return deferred.promise;
    };

    /**
     * Advanced function to query on topics.
     * @method getTopicsByComplex
     * @param [queryObj] {Object} a list of attributes and values to be queried on; if empty all values will be returned.
     * Example query object:
     * ```
     * {
     *   "topic": "/AppsMall/Category",
     *   "uri": uri,
     *   "tag": tag,
     * }```
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @public
     * @return {PromiseObject} that, when invoked, passes a list of queried Tag objects into the then() callback.
     */

    // queries tags by a query object (see getTagByComplex)
    function getTopicsByComplex(queryObj, context) {
        if (arguments.length > 2) {
            console.log("getTopicsByComplex signature has changed: now getTopicsByComplex(queryObj, context)");
            throw "getTopicsByComplex: too many arguments";
        };
        queryObj = queryObj || {};
        var deferred = $q.defer();
        Ozone.Service("Tags").topic.query(queryObj, function() {
            return deferred.resolve.apply(this, arguments);
        }, context);
        return deferred.promise;
    };

    /**
     * Deletes one or more topics with ids equal to the values passed in.
     * @method deleteTags
     * @param idValueOrArray {Array, String} the UUID (unique identifier) of the Topic object to delete, or an array of tag UUIDs
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @public
     * @return {PromiseObject} that, when invoked, passes the newly deleted Topic objects into the then() callback.
     */
    function deleteTopics(idValueOrArray, context) {
        if (common.isValidId(idValueOrArray)) {
            return deleteSingleTopic(idValueOrArray, context);
        }
        var deferred = $q.defer();
        if (_.isArray(idValueOrArray)) {
            // id array passed in: call delete on every valid id in array
            var validTopicIds = _.chain(idValueOrArray)
                                     .flatten()
                                     .compact()
                                     .filter(function(id) { return common.isValidId(id); })
                                     .value();

            $q.all(_.map(validTopicIds, function(id) { return deleteSingleTopic(id, context); })).then(function() {
                deferred.resolve.apply(this, arguments);
            });
        }
        return deferred.promise;
    };

    /**
     * Deletes a single topic with the id value passed in
     * @method deleteSingleTag
     * @param id {String} the UUID (unique identifier) of the Topic object to delete
     * @param [context] {Object} an object to act as the context for the Ozone API call.  Uses Ozone API context if not defined.
     * @private
     * @return {PromiseObject} that, when invoked, passes the newly deleted Topic into the then() callback.
     */
    var deleteSingleTopic = function(id, context) {
        var deferred = $q.defer();
        Ozone.Service("Tags").topic.delete({id: id}, function() {
            console.log('DELETED TOPIC: '+ JSON.stringify(arguments));
            deferred.resolve.apply(this, arguments);
        }, context);
        return deferred.promise;
    }

    return {
        createNewTag: createNewTag,
        createNewTags: createNewTags,
        createNewTagsAndTopics: createNewTagsAndTopics,
        updateTag: updateTag,
        updateTags: updateTags,
        deleteTags: deleteTags,
        getTags: getTagByComplex,
        getShortnameFromUri: getShortnameFromUri,
        getTagsByUriPrefix: getTagsByUriPrefix,
        searchTagsByNameSubstring: searchTagsByNameSubstring,
        searchTagTopicsByNameSubstring: searchTagTopicsByNameSubstring,
        createNewTopic: createNewTopic,
        updateTopic: updateTopic,
        getTopicsByTopic: getTopicsByTopic,
        getTopicsByComplex: getTopicsByComplex,
        deleteTopics: deleteTopics,
        getAppShortnamesWithTags: getAppShortnamesWithTags
    };
}];

servicesModule.factory('Tag', TagService);
