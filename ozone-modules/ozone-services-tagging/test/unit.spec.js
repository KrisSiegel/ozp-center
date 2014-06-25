/**
 *  The Tagging module handles all RESTful calls for Tag and Topic objects.
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.Tagging
 *  @class Ozone.Services.Tagging.UnitTest
 *  @submodule Server-Side
 */
var assert = require("assert"),
    expect = require("expect.js"),
    request = require("supertest"),
    Ozone = {}, 
    TaggingService,
    constants = require('../config/constants'),
    express = require("express"),
    app = express(),
    sampleTag1 = require("./data/sampleTag1.json"),
    sampleTag2 = require("./data/sampleTag2.json"),
    sampleTag3 = require("./data/sampleTag3.json"),
    sampleTopic1 = require("./data/sampleTopic1.json"),
    updatedTag2 = require("./data/updatedTag2.json"),
    baseTagURL = "/api/tags/tag",
    baseTopicURL = "/api/tags/tagtopic",
    logger;

/*
 * Before running our tests, set up our Persistence, and express routes
 */
if (typeof jasmine !== 'undefined') {
	beforeEach(function (done) {
	    setup(done);
	});
} else {
	before(function (done) {
	    setup(done);
	});
}

function setup(done) {
    app.configure(function () {
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
    });

    Ozone = require('../../ozone-api');
    Ozone.Service("ApplicationEngine", app);
	var config = Ozone.config().getConfig();
    Ozone.config({
		server: {
            apiBasePath: "/api/",
			"persistence": {
				"module": "ozone-services-persistence-mongo",
				store: "Ozone",
				"Server": "localhost",
                mongo: {
                    connectionString: undefined,
                    servers: [
                        { host: "localhost", port: 27017, user: undefined, password: undefined }
                    ],
				},
				"Port": 27017
			}
		}
	}, config);
    
    logger = Ozone.logger;

    // also import Persistence Services when running as stand-alone here, since it's not running as part of the Container.
    require('../../ozone-services-persistence')(function () {
        require('../TaggingServicesApi.js')(function (ozone) {
            
        	TaggingService = Ozone.Service(constants.TaggingService);
            done();
        }, Ozone);
    }, Ozone);
};

beforeEach(function () {
	var title;
	if (typeof jasmine !== 'undefined') { 
		title = jasmine.getEnv().currentSpec.description
	} else { 
		title = this.currentTest.title;
	}
    logger.info("=============== Running test: " + title + " =============== ")
});

describe('Creating tags', function () {
    describe('via POST', function () {
        it('will create a tag in the "tag" collection in MongoDB', function (done) {
            logger.debug(sampleTag1);

            request(app)
                .post(baseTagURL)
                .send(sampleTag1)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    logger.debug('res.body: ' + JSON.stringify(res.body, null, 3));
                    expect(res.body).not.to.have.property('error');
                    expect(res.body).to.have.property('Created');
                    sampleTag1._id = res.body.Created[0]._id;
                    done();
                });
        });
    });
    describe('with an existing id via POST', function () {
        it('will create a tag (that already had an _id)', function (done) {
            logger.debug('sampleTag2: ' + JSON.stringify(sampleTag2));

            request(app)
                .post(baseTagURL)
                .send(sampleTag2)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    done();
                });
        });

        it('will not create a tag if a record with the same id already exists in the database, due to duplicate level/topic/uri/tag/creatorUserId', function (done) {
            logger.debug('sampleTag3: ' + JSON.stringify(sampleTag3));

            request(app)
                .post(baseTagURL)
                .send(sampleTag3)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    logger.debug("res.body: " + JSON.stringify(res.body, null, 3));
                    expect(res.body.error).to.contain("duplicate key error");
                    done();
                });
        });
    });
});

describe('Update tags', function () {
    describe('when updating a tag ', function () {
        it('should update tags with existing ids', function (done) {
            request(app)
                .put(baseTagURL + '/' + sampleTag2._id)
                .send(updatedTag2)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    logger.debug("res.body: " + JSON.stringify(res.body, null, 3));
                    expect(res.body.Updated).to.exist;
                    expect(res.body.Updated[0]).to.be(1);
                    done();
                });

        });
    });
});

describe('Get Tags', function () {
    describe('when getting all tags', function () {
        it('should return at least one tag', function (done) {
            request(app)
                .get(baseTagURL)
                .end(function (err, res) {
                    //logger.debug("******* res.body: " + JSON.stringify(res.body));
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    expect(res.body.length).to.be.greaterThan(0);
                    logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    done();
                });
        });
    });

    describe('when getting one tag by id', function () {
        it('should return one tag', function (done) {
            request(app)
                .get(baseTagURL + "/" + sampleTag2._id)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    done();
                });
        });
    });
    describe('when getting a tag by querying on id', function () {
        it('should return one tag', function (done) {
            request(app)
                .get(baseTagURL + '?id=' + sampleTag2._id)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    expect(res.body.length).to.be(1);
                    //logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    done();
                });
        });
    });
    describe('when getting a tag by querying on id and level', function () {
        it('should return one tag', function (done) {
            request(app)
                .get(baseTagURL + '?id=' + sampleTag2._id + "&level=" + updatedTag2.level)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    expect(res.body.length).to.be(1);
                    //logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    done();
                });
        });
    });
    describe('when getting a tag by querying on id and an invalid level', function () {
        it('should not return any tags', function (done) {
            request(app)
                .get(baseTagURL + '?id=' + sampleTag2._id + "&level=" + sampleTag2.level)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    expect(res.body.length).to.be(0);
                    logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    done();
                });
        });
    });
    describe('when getting a tag by querying on id, level, and topic', function () {
        it('should return one tag', function (done) {
            request(app)
                .get(baseTagURL + '?id=' + sampleTag2._id + "&level=" + updatedTag2.level + "&topic=" + sampleTag2.topic)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    expect(res.body.length).to.be(1);
                    //logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    done();
                });
        });
    });
    describe('when getting a tag by querying on id, level, topic, and uri', function () {
        it('should return one ta', function (done) {
            request(app)
                .get(baseTagURL + '?id=' + sampleTag2._id + "&level=" + updatedTag2.level +
                    "&topic=" + sampleTag2.topic + "&uri=" + sampleTag2.uri)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    expect(res.body.length).to.be(1);
                    //logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    done();
                });
        });
    });
    describe('when getting a tag by querying on uri', function () {
        it('should return one tag', function (done) {
            request(app)
                .get(baseTagURL + '?&uri=' + sampleTag2.uri)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    expect(res.body.length).to.be(1);
                    //logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    done();
                });
        });
    });
});



describe('Delete tags', function () {
    describe('when deleting the first tag by the id', function () {
        it('should delete only the first tag', function (done) {
            request(app)
                .del(baseTagURL + '/' + sampleTag1._id)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    logger.debug("res.body: " + JSON.stringify(res.body, null, 3));
                    expect(res.body["Deleted"]).to.be(1);
                    done();
                });
        });
    });
    describe('when deleting the second tag by the id', function () {
        it('should delete only the second tag', function (done) {
            request(app)
                .del(baseTagURL + '/' + sampleTag2._id)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    logger.debug("res.body: " + JSON.stringify(res.body, null, 3));
                    expect(res.body["Deleted"]).to.be(1);
                    done();
                });
        });
    });
});

describe('Create topics', function () {
    describe('when creating a topic via POST', function () {
        it('should create a topic in the "topic" collection in MongoDB', function (done) {
            logger.debug(sampleTopic1);

            request(app)
                .post(baseTopicURL)
                .send(sampleTopic1)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    logger.debug('res.body: ' + JSON.stringify(res.body, null, 3));
                    expect(res.body).not.to.have.property('error');
                    expect(res.body).to.have.property('Created');
                    //sampleTag1._id = res.body.Created[0]._id;
                    done();
                });
        });
    });
});


xdescribe('Mass import tags', function () {
    describe('when importing a json using import service', function () {
        it('should import all tags in the JSON block', function (done) {
            
        	TaggingService.import(['injectableTagRecords.json'], '../test/data/', function() {
                done();
            });
        });
    });
});
