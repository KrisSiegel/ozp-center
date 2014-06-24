/**
 *  The Tagging module handles all RESTful calls for Tag and Topic objects.
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.Tagging
 *  @class Ozone.Services.Tagging
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
	})
} else {
	before(function (done) {
	    setup(done);
	})
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
})

describe('Create tags', function () {
    describe('create a tag via POST', function () {
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
        })
    })
    describe('create a tag (that has an _id) via POST', function () {
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
        })
    })
    describe('create another tag (that has the same _id) via POST', function () {
        it('will not create a tag in the "tag" collection in MongoDB, due to duplicate level/topic/uri/tag/creatorUserId', function (done) {
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
        })
    })
})

describe('Update tags', function () {
    describe('update a tag ', function () {
        it('update the ' + sampleTag2._id + ' tag', function (done) {
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

        })
    })
})

describe('Get Tags', function () {
    describe('get all tags', function () {
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
        })
    })

    describe('get one tag by id', function () {
        it('should return one tag by id', function (done) {
            request(app)
                .get(baseTagURL + "/" + sampleTag2._id)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    done();
                });
        })
    })
    describe('get a tag by query - id', function () {
        it('should return one tag by query - id', function (done) {
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
        })
    })
    describe('get a tag by query - id & level', function () {
        it('should return one tag by query - id & level', function (done) {
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
        })
    })
    describe('get a tag by query - id & wrong level', function () {
        it('should not return any tags by query - id & wrong level', function (done) {
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
        })
    })
    describe('get a tag by query - id & level & topic', function () {
        it('should return one tag by query - id & level & topic', function (done) {
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
        })
    })
    describe('get a tag by query - id & level & topic & uri', function () {
        it('should return one tag by query - id & level & topic & uri', function (done) {
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
        })
    })
    describe('get a tag by query - uri', function () {
        it('should return one tag by query - uri', function (done) {
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
        })
    })
})



describe('Delete tags', function () {
    describe('delete the first tag by the id', function () {
        it('delete the first tag: ' + sampleTag1._id, function (done) {
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
        })
    })
    describe('delete the second tag by the id', function () {
        it('delete the second tag: ' + sampleTag2._id, function (done) {
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
        })
    })
})

describe('Create topics', function () {
    describe('create a topic via POST', function () {
        it('will create a topic in the "topic" collection in MongoDB', function (done) {
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
        })
    });
});


xdescribe('Mass import tags', function () {
    describe('import a json using import service', function () {
        it('should import the json using import service', function (done) {
            
        	TaggingService.import(['injectableTagRecords.json'], '../test/data/', function() {
                done();
            });
        })
    })
})
