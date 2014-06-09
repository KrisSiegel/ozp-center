/**
 * Service object for performing simple CRUD operations and advanced searches on the Tag Mongo collection
 *
 * @module servicesModule
 * @submodule TagModule
 * @requires amlApp.services
 */

'use strict';

/**
 * @class TagService
 * @static
 */ 

/**
 * @class TagService
 * @constructor
 * @param $q {Object} The AngularJS core promise service - [API Documentation](https://docs.angularjs.org/api/ng/service/$q) 
 * @param Persona {Object} an Angular-injected instance of {{#crossLink "PersonaService"}}{{/crossLink}}
 */
var TagService = ['$q', 'Persona', function($q, Persona) {

    // get URI from app data. (TO DO: apps and components might have different URI path components, if applicable.)
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

    // This method currently doesn't work as expected. Just ignore it; getTagByComplex works
    // for the same thing. We'll revisit this later as part of the Ozone API.
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

    // queries tags by the query object passed in.

    /*

      Make an arbitrary tag query using a query object.

      Example query object:

      {
         "topic": "/AppsMall/Category",
         "uri": uri,
         "tag": tag,
      }
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

    // creates a new tag with the parameters passed in
    var createNewTag = function(tag, uri, topic, context) {
        var deferred = $q.defer();
        Persona.getCurrentPersonaData().then(function(personaData) {
            createTagFromPersonaData(tag, uri, topic, personaData, context).then(function(newTag) {
                deferred.resolve(newTag);
            });
        });
        return deferred.promise;
    };

    // function that calls createNewTag() for every tag in the list using $q.all.
    // The success function chained to calling this function doesn't get invoked until all createNewTag() calls succeed.
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

    var updateTag = function(tag, context){
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

    var updateTags = function(tagList, context){
        if (!_.isArray(tagList) || (tagList.length === 0)) {
            return $q.reject('No tags were given to be updated.');
        }
        var deferred = $q.defer();
        $q.all(_.map(tagList, function(tag) { return updateTag(tag, context); })).then(function() {
            deferred.resolve.apply(this, arguments);
        });
        return deferred.promise;
    }

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

    var deleteSingleTag = function(idValueOrArray, context) {
        var deferred = $q.defer();
        Ozone.Service("Tags").tag.del({id: idValueOrArray}, function() {
            deferred.resolve.apply(this, arguments);
        }, context);
        return deferred.promise;
    }

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

    // creates a new topic with the parameters passed in
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

    //updates a topic with the parameters passed in
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

    function getTopicsByTopic(topic, level) {
        var deferred = $q.defer();
        var filter = {uri: topic};
        if(level)
            filter['level'] = level;
        Ozone.Service("Tags").topic.query(filter, function(topics) {
                deferred.resolve(topics);
        });
        return deferred.promise;
    };

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

    var deleteSingleTopic = function(idValueOrArray, context) {
        var deferred = $q.defer();
        Ozone.Service("Tags").topic.delete({id: idValueOrArray}, function() {
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
