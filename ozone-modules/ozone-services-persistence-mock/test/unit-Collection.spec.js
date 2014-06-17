var assert = require("assert"),
    expect = require("expect.js"),
    request = require("supertest"),
    basePersistenceURL = "/api/persistence/store/",
    mockApp1 = require('./data/app/mockApp1'),
    mockApp2 = require('./data/app/mockApp2'),
    mockApp3 = require('./data/app/mockApp3'),
    mockApp4 = require('./data/app/mockApp4'),
    updatedMockApp1 = require('./data/app/updatedMockApp1'),
    updatedMockApp2 = require('./data/app/updatedMockApp2'),
    updatedMockApp3 = require('./data/app/updatedMockApp3'),
    constants = require('../../../config/constants'),
    appsStore = constants.database.store.apps,
    appCollection = constants.database.collection.app,
    Ozone = {}, 
    express = require("express"),
    app = express(),
    logger, 
    Persistence;

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

    Ozone = require('../../../../ozone-api')(app);
    logger = Ozone.logger;

    /*
	Persistence = require('../main')(Ozone);
	*/

    Ozone.configuration = {
        "Persistence": {
            "Module": "ozone-services-persistence-mock"
        }
    };

    require('../../../main')(function () {
        Persistence = Ozone.Service('Persistence');
        done();
    });

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

afterEach(function () {
	var title;
	if (typeof jasmine !== 'undefined') { 
		title = jasmine.getEnv().currentSpec.description
	} else { 
		title = this.currentTest.title;
	}
    logger.info("=============== DONE Running test: " + title + " =============== ")
})

describe('Set mocks - Collection', function () {
    describe('create a mock app with an id', function (done) {
        it('should create a mock app', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).set(null, mockApp1, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1); // inserted count
                expect(testResult.elements[0].name).to.be(mockApp1.name); 
                expect(testResult.requested.ids).to.be(null);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('create 2 mock apps', function (done) {
        it('should create 2 mock apps', function (done) {
            var objList = [{
                    'null': mockApp2
                }, {
                    'null': mockApp3
                }];

            Persistence.Store(appsStore).Collection(appCollection).set(objList, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(2); // inserted count
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('create a mock app with predefined id passed in as an argument', function (done) {
        it('should create a mock app with predefined id', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).set("mockApp4ID", mockApp4, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1); // inserted count
                expect(testResult.elements[0].name).to.be(mockApp4.name); 
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('update a mock app', function (done) {
        it('should update a mock app', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).set(mockApp1._id, updatedMockApp1, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1); // updated count
                expect(testResult.elements[0].name).to.be(updatedMockApp1.name); 
                expect(testResult.requested.ids).to.be(mockApp1._id);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('update a mock app w/ selector & $set', function (done) {
        it('should update a mock app w/ selector & $set', function (done) {
        	var selector = JSON.stringify({
        			_id: mockApp1._id
        		}),  
        		obj = {
        			$set: {
        				version: updatedMockApp1.version
        			}
        		};
        	
            Persistence.Store(appsStore).Collection(appCollection).set(selector, obj, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1); // updated count
                expect(testResult.elements[0].name).to.be(updatedMockApp1.name); 
                expect(testResult.elements[0].version).to.be(updatedMockApp1.version); 
                expect(testResult.requested.ids).to.be(selector);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('update 2 mock apps', function (done) {
        it('should update 2 mock apps', function (done) {
            var namesArray = [mockApp2.name, mockApp3.name],
            	objArray = [];


            // first get all apps to find out the _id's for our target apps.
            Persistence.Store(appsStore).Collection(appCollection).get(function (err, testResult) {
                for (var i = 0; i < testResult.elements.length; i++) {
                    var obj = {};
                    var record = testResult.elements[i];
                    if (namesArray.indexOf(record.name) > -1) {
                        if (record.name == mockApp2.name) {
                            obj[record._id] = updatedMockApp2;
                        } else if (record.name == mockApp3.name) {
                            obj[record._id] = updatedMockApp3;
                        }

                        objArray.push(obj);
                    }
                }
                logger.debug("going to update objArray: " + JSON.stringify(objArray, null, 3));

                Persistence.Store(appsStore).Collection(appCollection).set(objArray, function (err, testResult) {
                    logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(2);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.collection).to.be(appCollection);
                    done();
                });
            });
        });
    })
})

describe('Get mocks - Collection', function () {
    describe('get all mock apps', function (done) {
        it('should return all mock apps', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).get(function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.requested.ids).to.be(null);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });

    })
    describe('get a mock app', function (done) {
        it('should return a mock app', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).get(mockApp1._id, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements[0].name).to.be(mockApp1.name);
                expect(testResult.requested.ids).to.contain(mockApp1._id);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('get a mock app that doesnt exist', function (done) {
        it('should not return a mock app', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).get('noID', function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(0);
                expect(testResult.requested.ids).to.contain('noID');
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('get 2 mock apps', function (done) {
        it('should return 2 mock apps', function (done) {
            var namesArray = [mockApp2.name, mockApp3.name],
                idsArray = [];


            // first get all apps to find out the _id's for our target apps.
            Persistence.Store(appsStore).Collection(appCollection).get(function (err, testResult) {
                for (var i = 0; i < testResult.elements.length; i++) {
                    var record = testResult.elements[i];
                    if (namesArray.indexOf(record.name) > -1) {
                        idsArray.push(record._id);
                    }
                }
                logger.debug("going to get idsArray: " + JSON.stringify(idsArray, null, 3));

                Persistence.Store(appsStore).Collection(appCollection).get(idsArray, function (err, testResult) {
                    logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(2);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.collection).to.be(appCollection);
                    done();
                });
            });
        });
    })
})

describe('Query mocks - Collection', function () {
    describe('query for mockApp1', function (done) {
        it('should return mockApp1', function (done) {
            var searchParams = { name: updatedMockApp1.name };

            Persistence.Store(appsStore).Collection(appCollection).query(searchParams, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.elements[0].name).to.be(updatedMockApp1.name);
                expect(testResult.requested.selector).to.be(searchParams);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('query for mock apps using autocomplete', function (done) {
        it('should return mock apps using autocomplete', function (done) {
            var name = updatedMockApp1.name.slice(0, updatedMockApp1.name.length - 2),
                searchParams = { name: { $regex : name } };

            Persistence.Store(appsStore).Collection(appCollection).query(searchParams, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(3);
                expect(testResult.requested.selector).to.be(searchParams);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('query for mockApp1 w/ name & version', function (done) {
        it('should return mockApp1 w/ name & version', function (done) {
            var searchParams = { 
            	name: updatedMockApp1.name,
          		version: updatedMockApp1.version 
          	};

            Persistence.Store(appsStore).Collection(appCollection).query(searchParams, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.elements[0].name).to.be(updatedMockApp1.name);
                expect(testResult.elements[0].version).to.be(updatedMockApp1.version);
                expect(testResult.requested.selector).to.be(searchParams);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
});
describe('Remove mocks - Collection', function () {
    describe('remove a mock app', function (done) {
        it('should remove a mock app', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).remove(mockApp1._id, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.removed).to.exist;
                expect(testResult.removed.count).to.be(1);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('remove mock apps', function (done) {
        it('should remove mock apps', function (done) {
            var namesArray = [updatedMockApp2.name, updatedMockApp3.name, mockApp4.name],
                idsArray = [];


            // first get all apps to find out the _id's for our target apps.
            Persistence.Store(appsStore).Collection(appCollection).get(function (err, testResult) {
                for (var i = 0; i < testResult.elements.length; i++) {
                    var record = testResult.elements[i];
                    if (namesArray.indexOf(record.name) > -1) {
                        idsArray.push(record._id);
                    }
                }
                logger.debug("going to remove idsArray: " + JSON.stringify(idsArray, null, 3));

                Persistence.Store(appsStore).Collection(appCollection).remove(idsArray, function (err, testResult) {
                    logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.removed).to.exist;
                    expect(testResult.removed.count).to.be(namesArray.length);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.collection).to.be(appCollection);
                    done();
                });
            });
        });
    })
});

describe('REST API tests - Collection', function () {
	describe('create an app via REST API(POST)', function (done) {
        it('create an app via REST API(POST)', function (done) {
        	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection;
        	var obj = {
            		'null': mockApp1
            	};
            var objList = [obj];
            	
        	request(app)
            .post(URL)
            .send(objList)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                expect(res.body.length).to.be(1);
                expect(res.body[0].name).to.be(mockApp1.name);
                done();
            });
        });
    })
    describe('get an app via REST API(GET)', function (done) {
        it('get an app via REST API(GET)', function (done) {
        	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection + '/' + mockApp1._id;
        	request(app)
            .get(URL)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                expect(res.body.length).to.be(1);
                expect(res.body[0].name).to.be(mockApp1.name);
                
                // remove the created app
                Persistence.Store(appsStore).Collection(appCollection).remove(mockApp1._id, function (err, testResult) {
                    logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.removed).to.exist;
                    expect(testResult.removed.count).to.be(1);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.collection).to.be(appCollection);
                    done();
                });
            });
        });
    })
});


