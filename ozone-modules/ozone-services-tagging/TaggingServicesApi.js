var PORT = 3000,
    logger;

function setup(callback, Ozone) {

    var Persistence = Ozone.Service('Persistence'),
        async = require('async');

    logger = logger || Ozone.logger;
    logger.debug("TaggingService-->in setup method");

    Ozone.Service().on("ready", "Persistence", createIndexes);
    var constants = require('./config/constants'),
        taggingService = require('./service/TaggingService');

    function setupTagRouting() {
        logger.debug("TaggingService-->setup-->setupTagRouting()");
        taggingService.init(Ozone);

        var createTagQueryObject = function (query) {
            var item = {};
            if (query.id) item._id = query.id;
            if (query._id) item._id = query._id;
            if (query.level) item.level = query.level;
            if (query.topic) item.topic = query.topic;
            if (query.uri) item.uri = query.uri;
            if (query.tag) item.tag = query.tag;
            if (query.description) item.description = query.description;
            if (query.creatorUserId) item.creatorUserId = 'TestUser1'; // hardcode for now, until we have Security
            if (query.created) item.created = query.created;
            if (query.modified) item.modified = query.modified;
            if (query.visibility) item.visibility = query.visibility;

            return item;
        };
        var baseTagURL = require('./config/version.json').rest.url.tag;
        var baseTopicUrl = require('./config/version.json').rest.url.topic;
        require('./routes')(taggingService, baseTagURL, createTagQueryObject, Ozone);
        require('./routes')(taggingService, baseTopicUrl, createTagQueryObject, Ozone);
        Ozone.Service(constants.TaggingService, taggingService);
    };

    var tagIndexers = [
        {
            _id: 1,
            level: 1,
            topic: 1,
            uri: 1,
            tag: 1,
            creatorUserId: 1
        },{
            level: 1,
            topic: 1,
            uri: 1,
            tag: 1,
            creatorUserId: 1
        },{
            topic: 1,
            uri: 1,
            tag: 1,
            creatorUserId: 1
        },{
            uri: 'text',
            tag: 'text',
            creatorUserId: 1
        },{
            tag: 1,
            creatorUserId: 1
        },{
            creatorUserId: 1
        }
    ].map(function (index) {
        return function (callback) {
            var constants = require('./config/constants'),
                store = constants.database.store.tags,
                collection = constants.database.collection.tag;
            Persistence.Store(store).Collection(collection).addIndex(index, function (err, result) {
                if (err) {
                    logger.error("TaggingService-->Error while ensuring text indexes: " + err);
                    throw err;
                };
                logger.debug("TaggingService-->ensured index: " + JSON.stringify(result, null, 3));

                callback();
            });
        }
    });


    var topicIndexers = [
        {
            _id: 1,
            level: 1,
            topic: 1,
            uri: 1,
            tag: 1,
            creatorUserId: 1
        },{
            creatorUserId: 1
        },{
            level: 1
        },{
            level: 1,
            uri: 1
        }
    ].map(function (index) {
        return function (callback) {
            var topicConstants = require('./config/topicConstants');
            Persistence.Store(topicConstants.database.store.tags).Collection(topicConstants.database.collection.tagTopic).addIndex(index, function (err, result) {
                if (err) {
                    logger.error("TopicService-->Error while ensuring text indexes: " + err);
                    throw err;
                };
                logger.debug("TopicService-->ensured index: " + JSON.stringify(result, null, 3));

                callback();
            });
        }
    });

    function createIndexes() {
        Ozone.Service().on("ready", "Persistence", function(){
            Persistence = Ozone.Service('Persistence');
            // also ensure compound index for level, topic, uri, tag, etc
            async.parallel(tagIndexers.concat(topicIndexers),
                           // callback after parallel functions
                           function (err, results) {
                               setupTagRouting();
                               if (callback) callback(Ozone);
                           });
        });
    };
}

module.exports = setup;

if (require.main === module) {
    var express = require('express');
    var app = express();
    app.configure(function () {
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
    });

    var Ozone = require("../ozone-api")(app);
    Ozone.configuration = {
        "Persistence": {
            "Module": "ozone-services-persistence-mongo",
            "Server": "localhost",
            "Port": 27017
        }
    };

    // also import Persistence Services when running as stand-alone here, since it's not running as part of the Container.
    require('ozone-services-persistence')(function () {
        setup(function (Ozone) {
            app.listen(PORT);
            logger = Ozone.logger;
            logger.info('Tagging Services Node.js API on port %d', PORT);
        });
    });

};
