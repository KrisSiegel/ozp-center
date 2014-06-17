var assert = require("assert"),
    expect = require("expect.js"),
    request = require("supertest"),
    basePersistenceURL = "/api/persistence/store/",
    mongo = require('mongodb'),
    mongoClient, 
    Ozone = {}, 
    express = require("express"),
    app = express(),
    async = require('async'),
    logger, 
    Persistence, 
    sampleApp1 = require("./data/app/sampleApp1.json"),
    sampleApp2 = require("./data/app/sampleApp2.json"),
    sampleApp3 = require("./data/app/sampleApp3.json"),
    sampleApp4 = require("./data/app/sampleApp4.json"),
    updatedApp1 = require("./data/app/updatedApp1.json"),
    updatedApp2 = require("./data/app/updatedApp2.json"),
    updatedApp3 = require("./data/app/updatedApp3.json"),
    updatedApp4 = require("./data/app/updatedApp4.json"),
    sampleTag1 = require("./data/tag/sampleTag1.json"),
    sampleTag2 = require("./data/tag/sampleTag2.json"),
    sampleTag3 = require("./data/tag/sampleTag3.json"),
    updatedTag1 = require("./data/tag/updatedTag1.json"),
    updatedTag2 = require("./data/tag/updatedTag2.json"),
    updatedTag3 = require("./data/tag/updatedTag3.json"),
    constants = require('../../../config/constants'),
    appsStore = constants.database.store.apps,
    tagsStore = constants.database.store.tags,
    appCollection = constants.database.collection.app,
    tagCollection = constants.database.collection.tag,
    componentCollection = constants.database.collection.component,
    existingIndexesCount = 0;

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
            "Module": "ozone-services-persistence-mongo",
            //"ConnectionURL": "mongodb://localhost:27017/Ozone", // this string overrides the "Servers" values below.
            "Servers": [
        	    {
        	    	"host": "localhost",
        	    	"port": 27017,
        	    	"user": null,
        	    	"password": null
        	    }
        	],
            "Store": {
            	"DefaultStoreName": "Ozone"
			}
        }
    };

    require('../../../main')(function (Ozone) {
        Persistence = Ozone.Service('Persistence');

        if (mongoClient === undefined) {
        	// also open our own Mongo connection so that we can do queries directly in these tests.
            var host = Ozone.configuration.Persistence.Servers[0].host;
            var port = Ozone.configuration.Persistence.Servers[0].port;
            mongoClient = new mongo.MongoClient(new mongo.Server(host, port, {
                auto_reconnect: true
            }));

            // Open the connection to the server
            mongoClient.open(function (err, openedMongoclient) {
                mongoClient = openedMongoclient;
                done();
            });
        } else {
        	done();
        }
        
    });
};

function getDatabaseName(store) {
	var storeConfig = Ozone.configuration.Persistence.Store,
		storeName = (storeConfig !== undefined && storeConfig.DefaultStoreName !== undefined) ? storeConfig.DefaultStoreName : "Ozone";
	
	logger.debug("unit-Collection.spec-->getDatabaseName-->storeName: " + storeName);
	return storeName;
};
function getCollection(store, collection, db) {
	var collectionName = store + "_" + collection;
	
	logger.debug("unit-Collection.spec-->getCollection-->collectionName: " + collectionName);
	
	return db.collection(collectionName);
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

describe('Set apps - Collection', function () {
    describe('create an app with null id', function (done) {
        it('should create an app', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).set(null, sampleApp1, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.elements[0].name).to.be(sampleApp1.name);
                expect(testResult.requested.ids).to.be(null);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('create 2 more apps', function (done) {
        it('should create 2 apps', function (done) {
            var objList = [{
                    'null': sampleApp2
                }, {
                    'null': sampleApp3
                }];

            Persistence.Store(appsStore).Collection(appCollection).set(objList, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.apps).to.exist;
                expect(testResult.elements.length).to.be(2);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('create an app with predefined id', function (done) {
        it('should create an app with predefined id', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).set(sampleApp4._id, sampleApp4, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.elements[0]).to.be(1);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('update an app', function (done) {
        it('should update an app', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _id using the app name
            getCollection(appsStore, appCollection, db).findOne({
                'name': sampleApp1.name
            }, function (err, item) {
            	if (err) throw err;
                Persistence.Store(appsStore).Collection(appCollection).set(item._id, updatedApp1, function (err, testResult) {
                    logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(1);
                    expect(testResult.elements[0]).to.be(1); // the count
                    expect(testResult.requested.ids).to.be(item._id);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.collection).to.be(appCollection);
                    done();
                });
            });
        });
    })
    describe('update 2 apps', function (done) {
        it('should update 2 apps', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            getCollection(appsStore, appCollection, db).find({
                'name': {
                    $in: [sampleApp2.name, sampleApp3.name]
                }
            }).toArray(function (err, items) {
                logger.debug("items: " + JSON.stringify(items, null, 3));

                expect(items.length).to.be(2);

                var sampleApp2Id = items[0]._id,
                    sampleApp3Id = items[1]._id,
                    sampleApp2Obj = {}, sampleApp3Obj = {};
                sampleApp2Obj[sampleApp2Id] = updatedApp2;
                sampleApp3Obj[sampleApp3Id] = updatedApp3;
                var objList = [sampleApp2Obj, sampleApp3Obj];

                logger.debug("objList: " + JSON.stringify(objList));

                Persistence.Store(appsStore).Collection(appCollection).set(objList, function (err, testResult) {
                    logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(2);
                    expect(testResult.elements[0]).to.be(1); // the count
                    expect(testResult.elements[1]).to.be(1); // the count
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.collection).to.be(appCollection);
                    done();
                });
            });
        });
    })
    describe('update an app using complex format', function (done) {
        it('should update an app using complex format', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            var findParams = JSON.stringify({ name: sampleApp4.name });
            var updateObj = { $set: { name: updatedApp4.name,
            						  description: updatedApp4.description }};
            
            logger.debug("findParams: " + JSON.stringify(findParams));
            Persistence.Store(appsStore).Collection(appCollection).set(findParams, updateObj, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.elements[0]).to.be(1); // the count
                expect(testResult.requested.ids).to.be(findParams);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
})


describe('Get app tests - Collection', function () {
    describe('get all apps', function (done) {
        it('should return all apps', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).get(function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be.greaterThan(0);
                expect(testResult.requested.ids).to.be(null);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })

    describe('get one app', function (done) {
        it('should return an app', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _id using the app name
            getCollection(appsStore, appCollection, db).findOne({
                'name': updatedApp1.name
            }, function (err, item) {
                Persistence.Store(appsStore).Collection(appCollection).get(item._id.toHexString(), function (err, testResult) {
                    logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(1);
                    expect(testResult.elements[0].name).to.be(updatedApp1.name);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.collection).to.be(appCollection);
                    done();
                });
            });
        });
    })
    describe('get two apps', function (done) {
        it('should return two apps', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _ids using the app names
            getCollection(appsStore, appCollection, db).find({
                'name': {
                    $in: [updatedApp2.name, updatedApp3.name]
                }
            }).toArray(function (err, items) {
                expect(items.length).to.be(2);
                var updatedApp2Id = items[0]._id.toHexString();
                var updatedApp3Id = items[1]._id.toHexString();

                Persistence.Store(appsStore).Collection(appCollection).get([updatedApp2Id, updatedApp3Id], function (err, testResult) {
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
});

describe('Query tests - Collection', function () {
	describe('query for app id for updatedApp1', function (done) {
        it('should query and return the app by updatedApp1 id', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _id using the app name
            getCollection(appsStore, appCollection, db).findOne({
                'name': updatedApp1.name
            }, function (err, item) {
            	
            	var selector = { _id: item._id.toHexString() };
            	Persistence.Store(appsStore).Collection(appCollection).query(selector, function (err, testResult) {
                    logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(1);
                    expect(testResult.requested.selector).to.be(selector);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.collection).to.be(appCollection);
                    done();
                });
            });
        });
    })
    describe('query for app name ' + updatedApp1.name, function (done) {
        it('should query and return the app ' + updatedApp1.name, function (done) {
            var selector = { name: updatedApp1.name };

            Persistence.Store(appsStore).Collection(appCollection).query(selector, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.requested.selector).to.be(selector);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('query for app name "updated"', function (done) {
        it('should query and not return any results since Mongo Text Search looks at whole words', function (done) {
            var selector = { name: 'updated' };

            Persistence.Store(appsStore).Collection(appCollection).query(selector, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(0);
                expect(testResult.requested.selector).to.be(selector);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('query for app name for updatedApp1 with Text Search', function (done) {
        it('should query and return the app updatedApp1', function (done) {
            var selector = { name: updatedApp1.name };

            Persistence.Store(appsStore).Collection(appCollection).query(selector, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.elements[0].name).to.be(updatedApp1.name);
                expect(testResult.requested.selector).to.be(selector);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('query for apps with sort option', function (done) {
        it('should query and return apps sorted by name ', function (done) {
            var selector = { version: '1' },
                options = { sort: { name: 1 } };

            Persistence.Store(appsStore).Collection(appCollection).query(selector, options, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be.greaterThan(0);
                expect(testResult.requested.selector).to.be(selector);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
});

describe('Aggregation tests - Collection', function () {
	describe('get one app using aggregation', function (done) {
        it('should return an app using aggregation', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore)),
            	aggregationArray = [{ $match: {name: updatedApp1.name} }];
            
            Persistence.Store(appsStore).Collection(appCollection).aggregate(aggregationArray, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.elements[0].name).to.be(updatedApp1.name);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
});

describe('Remove app tests - Collection', function () {
    describe('remove one app', function (done) {
        it('should remove an app', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _id using the app name
            getCollection(appsStore, appCollection, db).findOne({
                'name': updatedApp1.name
            }, function (err, item) {
                Persistence.Store(appsStore).Collection(appCollection).remove(item._id.toHexString(), function (err, testResult) {
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
    describe('remove three apps', function (done) {
        it('should remove three apps', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _ids using the app names
            getCollection(appsStore, appCollection, db).find({
                'name': {
                    $in: [updatedApp2.name, updatedApp3.name, updatedApp4.name]
                }
            }).toArray(function (err, items) {
                expect(items.length).to.be(3);
                var updatedApp2Id = items[0]._id,
                    updatedApp3Id = items[1]._id,
                    sampleApp4Id = items[2]._id;

                Persistence.Store(appsStore).Collection(appCollection).remove([updatedApp2Id, updatedApp3Id, sampleApp4Id], function (err, testResult) {
                    logger.debug("testResult: " + JSON.stringify(testResult));

                    expect(testResult.removed).to.exist;
                    expect(testResult.removed.count).to.be(3);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.collection).to.be(appCollection);
                    done();
                });
            });
        });
    })
});

describe('Set tags - Collection', function () {
    describe('create a tag with id', function (done) {
        it('should create a tag', function (done) {
            var id = sampleTag1._id;

            Persistence.Store(tagsStore).Collection(tagCollection).set(id, sampleTag1, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.elements[0]).to.be(1);
                expect(testResult.requested.ids).to.be(id);
                expect(testResult.requested.store).to.be(tagsStore);
                expect(testResult.requested.collection).to.be(tagCollection);
                done();
            });
        });
    })
    describe('create 2 more tags', function (done) {
        it('should create 2 tags', function (done) {
            var obj1 = {}, obj2 = {};
            obj1[sampleTag2._id] = sampleTag2;
            obj2[sampleTag3._id] = sampleTag3;

            var objList = [obj1, obj2];

            Persistence.Store(tagsStore).Collection(tagCollection).set(objList, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.apps).to.exist;
                expect(testResult.elements.length).to.be(2);
                expect(testResult.requested.store).to.be(tagsStore);
                expect(testResult.requested.collection).to.be(tagCollection);
                done();
            });
        });
    })
    describe('update a tag', function (done) {
        it('should update a tag', function (done) {
            var id = updatedTag1._id;

            Persistence.Store(tagsStore).Collection(tagCollection).set(id, updatedTag1, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.elements[0]).to.be(1); // the count
                expect(testResult.requested.ids).to.be(id);
                expect(testResult.requested.store).to.be(tagsStore);
                expect(testResult.requested.collection).to.be(tagCollection);
                done();
            });
        });
    })
    describe('update 2 tags', function (done) {
        it('should update 2 tags', function (done) {
            var sampleTag2Obj = {}, sampleTag3Obj = {};

            sampleTag2Obj[sampleTag2._id] = updatedTag2;
            sampleTag3Obj[sampleTag3._id] = updatedTag3;
            var objList = [sampleTag2Obj, sampleTag3Obj];

            logger.debug("objList: " + JSON.stringify(objList));

            Persistence.Store(tagsStore).Collection(tagCollection).set(objList, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(2);
                expect(testResult.elements[0]).to.be(1); // the count
                expect(testResult.elements[1]).to.be(1); // the count
                expect(testResult.requested.store).to.be(tagsStore);
                expect(testResult.requested.collection).to.be(tagCollection);
                done();
            });
        });
    })
})

describe('Get tag tests - Collection', function () {
    describe('get all tags', function (done) {
        it('should return all tags', function (done) {
            Persistence.Store(tagsStore).Collection(tagCollection).get(function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be.greaterThan(0);
                expect(testResult.requested.ids).to.be(null);
                expect(testResult.requested.store).to.be(tagsStore);
                expect(testResult.requested.collection).to.be(tagCollection);
                done();
            });
        });
    })
    describe('get one tag', function (done) {
        it('should return a tag', function (done) {
            Persistence.Store(tagsStore).Collection(tagCollection).get(sampleTag1._id, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.elements[0]._id.toHexString()).to.be(sampleTag1._id.toString());
                expect(testResult.requested.store).to.be(tagsStore);
                expect(testResult.requested.collection).to.be(tagCollection);
                done();
            });
        });
    })
    describe('get two tags', function (done) {
        it('should return two tags', function (done) {
            Persistence.Store(tagsStore).Collection(tagCollection).get([sampleTag2._id, sampleTag3._id], function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(2);
                expect(testResult.requested.store).to.be(tagsStore);
                expect(testResult.requested.collection).to.be(tagCollection);
                done();
            });
        });
    })
});
describe('Remove tag tests - Collection', function () {
    describe('remove one tag', function (done) {
        it('should remove a tag', function (done) {
            Persistence.Store(tagsStore).Collection(tagCollection).remove(updatedTag1._id, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.removed).to.exist;
                expect(testResult.removed.count).to.be(1);
                expect(testResult.requested.store).to.be(tagsStore);
                expect(testResult.requested.collection).to.be(tagCollection);
                done();
            });
        });
    })
    describe('remove 2 tags', function (done) {
        it('should remove 2 tags', function (done) {
            Persistence.Store(tagsStore).Collection(tagCollection).remove([updatedTag2._id, updatedTag3._id], function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.removed).to.exist;
                expect(testResult.removed.count).to.be(2);
                expect(testResult.requested.store).to.be(tagsStore);
                expect(testResult.requested.collection).to.be(tagCollection);
                done();
            });
        });
    })
});

describe('Index tests - Collection', function () {
	describe('get indexes for app collection', function (done) {
        it('should get indexes for app collection', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).getIndexes(function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.indexInformation.length).to.be.greaterThan(0);
                
                // save the existingIndexesCount to be used in the following tests below
                existingIndexesCount = testResult.elements.indexInformation.length;
                
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('add index for version to app collection', function (done) {
        it('should add the index in mongo for version in app collection', function (done) {
            var index = { version: 1 };

            Persistence.Store(appsStore).Collection(appCollection).addIndex(index, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.indexName).to.be('version_1');
                expect(testResult.requested.index).to.be(index);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('get indexes for app collection', function (done) {
        it('should get indexes for app collection', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).getIndexes(function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.indexInformation.length).to.be(existingIndexesCount + 1);
                expect(testResult.elements.indexInformation[0].name).to.be('_id_'); // MongoDB puts an index on _id by default
                expect(testResult.elements.indexInformation[existingIndexesCount].name).to.be('version_1');
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('remove the version index for app collection', function (done) {
        it('should remove the version index for app collection', function (done) {
            var indexName = 'version_1';

            Persistence.Store(appsStore).Collection(appCollection).removeIndex(indexName, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.result.ok).to.be(1);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('get indexes for app collection', function (done) {
        it('should get indexes for app collection', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).getIndexes(function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.indexInformation.length).to.be(existingIndexesCount);
                expect(testResult.elements.indexInformation[0].name).to.be('_id_'); // MongoDB puts an index on _id by default
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('add 2 indexes to app collection', function (done) {
        it('should add 2 indexes in app collection', function (done) {
            var descriptionIndex = { description: 'text' }, // mongo text search index
                idVersionIndex = { _id: 1, version: 1};

            async.parallel([

                            function (callback) {
                            	Persistence.Store(appsStore).Collection(appCollection).addIndex(descriptionIndex, function (err, testResult) {
                                    logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                                    expect(testResult.elements).to.exist;
                                    expect(testResult.elements.indexName).to.be('description_text');
                                    expect(testResult.requested.index).to.be(descriptionIndex);
                                    expect(testResult.requested.store).to.be(appsStore);
                                    expect(testResult.requested.collection).to.be(appCollection);
                                    callback(err);
                                });
                            },
                            function (callback) {
                            	Persistence.Store(appsStore).Collection(appCollection).addIndex(idVersionIndex, function (err, testResult) {
                                    logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                                    expect(testResult.elements).to.exist;
                                    expect(testResult.elements.indexName).to.be('_id_1_version_1');
                                    expect(testResult.requested.index).to.be(idVersionIndex);
                                    expect(testResult.requested.store).to.be(appsStore);
                                    expect(testResult.requested.collection).to.be(appCollection);
                                    callback(err);
                                });
                            }
                            ],
                            function (err, objList) {
            					if (err) throw err;
            					done();
            				}
            );
        });
    })
    describe('add UNIQUE index for name to app collection', function (done) {
        it('should add the UNIQUE index for name in app collection', function (done) {
            var index = { name: 1 },
                option = { unique: true };

            Persistence.Store(appsStore).Collection(appCollection).addIndex(index, option, function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.indexName).to.be('name_1');
                expect(testResult.requested.index).to.be(index);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('get indexes for app collection', function (done) {
        it('should get indexes for app collection', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).getIndexes(function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.indexInformation.length).to.be(existingIndexesCount + 3);
                var length = testResult.elements.indexInformation.length; 
                expect(testResult.elements.indexInformation[0].name).to.be('_id_'); // MongoDB puts an index on _id by default
                expect(testResult.elements.indexInformation[length - 3].name).to.be('description_text');
                expect(testResult.elements.indexInformation[length - 2].name).to.be('_id_1_version_1');
                expect(testResult.elements.indexInformation[length - 1].name).to.be('name_1');
                expect(testResult.elements.indexInformation[length - 1].unique).to.be(true);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('remove all indexes for app collection', function (done) {
        it('should remove all indexes for app collection', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).removeAllIndexes(function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.result).to.be(true);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
    describe('get indexes for app collection', function (done) {
        it('should get indexes for app collection', function (done) {
            Persistence.Store(appsStore).Collection(appCollection).getIndexes(function (err, testResult) {
                logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.indexInformation.length).to.be(1);
                expect(testResult.elements.indexInformation[0].name).to.be('_id_'); // MongoDB puts an index on _id by default
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.collection).to.be(appCollection);
                done();
            });
        });
    })
});

describe('REST API tests - Set apps - Collection', function () {
    describe('create an app with null id', function (done) {
        it('should create an app', function (done) {
        	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection;
        	var obj = {
        		'null': sampleApp1
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
                expect(res.body[0].name).to.be(sampleApp1.name);
                done();
            });
        });
    })
    describe('create 2 more apps', function (done) {
        it('should create 2 apps', function (done) {
        	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection;
            var objList = [{
                    'null': sampleApp2
                }, {
                    'null': sampleApp3
                }];

            request(app)
            .post(URL)
            .send(objList)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                expect(res.body.length).to.be(2);
                done();
            });
            
        });
    })
    
    describe('create an app with predefined id', function (done) {
        it('should create an app with predefined id', function (done) {
        	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection;
        	var obj = {};
        	obj[sampleApp4._id] = sampleApp4;
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
                done();
            });
        });
    })
    describe('update an app', function (done) {
        it('should update an app', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _id using the app name
            getCollection(appsStore, appCollection, db).findOne({
                'name': sampleApp1.name
            }, function (err, item) {
            	
            	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection;
            	var obj = {};
            	obj[item._id] = updatedApp1;
                var objList = [obj];

                request(app)
                .put(URL)
                .send(objList)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body.error).not.to.exist;
                    logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    expect(res.body.length).to.be(1);
                    done();
                });
            });
        });
    })
    describe('update 2 apps', function (done) {
        it('should update 2 apps', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            getCollection(appsStore, appCollection, db).find({
                'name': {
                    $in: [sampleApp2.name, sampleApp3.name]
                }
            }).toArray(function (err, items) {
                logger.debug("items: " + JSON.stringify(items, null, 3));

                expect(items.length).to.be(2);

                var sampleApp2Id = items[0]._id,
                    sampleApp3Id = items[1]._id,
                    sampleApp2Obj = {}, sampleApp3Obj = {};
                sampleApp2Obj[sampleApp2Id] = updatedApp2;
                sampleApp3Obj[sampleApp3Id] = updatedApp3;
                var objList = [sampleApp2Obj, sampleApp3Obj];

                logger.debug("objList: " + JSON.stringify(objList));

                var URL = basePersistenceURL + appsStore + '/collection/' + appCollection;

                request(app)
                .put(URL)
                .send(objList)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body.error).not.to.exist;
                    logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    expect(res.body.length).to.be(2);
                    done();
                });
                
            });
        });
    })
    describe('update an app using complex format', function (done) {
        it('should update an app using complex format', function (done) {

            var findParams = JSON.stringify({ name: sampleApp4.name });
            var updateObj = { $set: { name: updatedApp4.name,
            						  description: updatedApp4.description }};
            var obj = {
            	findParams: findParams,
            	updateObj: updateObj
            };
            
            logger.debug("findParams: " + JSON.stringify(obj));
            
            var URL = basePersistenceURL + appsStore + '/collection/' + appCollection;

            request(app)
            .put(URL)
            .send(obj)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                expect(res.body.length).to.be(1);
                done();
            });
            
        });
    })
})

describe('REST API tests - Get app tests - Collection', function () {
    describe('get all apps', function (done) {
        it('should return all apps', function (done) {
        	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection;
        	request(app)
            .get(URL)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                expect(res.body.length).to.be.greaterThan(0);
                
                done();
            });
        });
    })
    describe('get one app', function (done) {
        it('should return an app', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _id using the app name
            getCollection(appsStore, appCollection, db).findOne({
                'name': updatedApp1.name
            }, function (err, item) {
            
            	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection + '/' + item._id;
            	request(app)
            	.get(URL)
            	.end(function (err, res) {
            		expect(res).to.exist;
            		expect(res.status).to.be(200);
            		expect(res.body.error).not.to.exist;
            		logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
            		expect(res.body.length).to.be(1);
            		expect(res.body[0].name).to.be(updatedApp1.name);

            		done();
            	});

            });
        });
    })
    describe('get two apps', function (done) {
        it('should return two apps', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _ids using the app names
            getCollection(appsStore, appCollection, db).find({
                'name': {
                    $in: [updatedApp2.name, updatedApp3.name]
                }
            }).toArray(function (err, items) {
                expect(items.length).to.be(2);
                var updatedApp2Id = items[0]._id.toHexString();
                var updatedApp3Id = items[1]._id.toHexString();
                var array = [updatedApp2Id, updatedApp3Id];
                var URL = basePersistenceURL + appsStore + '/collection/' + appCollection + '/' + JSON.stringify(array);
            	request(app)
            	.get(URL)
            	.end(function (err, res) {
            		expect(res).to.exist;
            		expect(res.status).to.be(200);
            		expect(res.body.error).not.to.exist;
            		logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
            		expect(res.body.length).to.be(2);

            		done();
            	});
            	
            });
        });
    })
});

describe('REST API tests - Query tests - Collection', function () {
	describe('query for app id for updatedApp1', function (done) {
        it('should query and return the app by updatedApp1 id', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _id using the app name
            getCollection(appsStore, appCollection, db).findOne({
                'name': updatedApp1.name
            }, function (err, item) {
            	
            	var selector = { _id: item._id.toHexString() };
            	var criteria = {
            		selector: selector
            	};
            	
            	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection + '/query/' + JSON.stringify(criteria);
            	request(app)
            	.get(URL)
            	.end(function (err, res) {
            		expect(res).to.exist;
            		expect(res.status).to.be(200);
            		expect(res.body.error).not.to.exist;
            		logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
            		expect(res.body.length).to.be(1);

            		done();
            	});
            	
            });
        });
    })
    describe('query for app name ' + updatedApp1.name, function (done) {
        it('should query and return the app ' + updatedApp1.name, function (done) {
        	var selector = { name: updatedApp1.name };
        	var criteria = {
        		selector: selector
        	};
        	
        	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection + '/query/' + JSON.stringify(criteria);
        	request(app)
        	.get(URL)
        	.end(function (err, res) {
        		expect(res).to.exist;
        		expect(res.status).to.be(200);
        		expect(res.body.error).not.to.exist;
        		logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
        		expect(res.body.length).to.be(1);

        		done();
        	});
        });
    })
    describe('query for app name "updated"', function (done) {
        it('should query and not return any results since Mongo Text Search looks at whole words', function (done) {
            var selector = { name: 'updated' };
        	var criteria = {
        		selector: selector
        	};
        	
        	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection + '/query/' + JSON.stringify(criteria);
        	request(app)
        	.get(URL)
        	.end(function (err, res) {
        		expect(res).to.exist;
        		expect(res.status).to.be(200);
        		expect(res.body.error).not.to.exist;
        		logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
        		expect(res.body.length).to.be(0);

        		done();
        	});
        });
    })
    describe('query for app name for updatedApp1', function (done) {
        it('should query and return the app updatedApp1', function (done) {
            var selector = { name: updatedApp1.name },
            	criteria = {
            		selector: selector
            	};
            
            Persistence.Store(appsStore).Collection(appCollection).query(selector, function (err, testResult) {
            	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection + '/query/' + JSON.stringify(criteria);
                request(app)
                .get(URL)
                .end(function (err, res) {
                	expect(res).to.exist;
                	expect(res.status).to.be(200);
                	expect(res.body.error).not.to.exist;
                	logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                	expect(res.body.length).to.be(1);

                	done();
                });
            });
        });
    })
    describe('query for apps with sort option', function (done) {
        it('should query and return apps sorted by name ', function (done) {
            var selector = { version: '1' },
                options = { sort: { name: 1 } },
                criteria = {
            		selector: selector,
            		options: options
        		};
            
            var URL = basePersistenceURL + appsStore + '/collection/' + appCollection + '/query/' + JSON.stringify(criteria);
            request(app)
            .get(URL)
            .end(function (err, res) {
            	expect(res).to.exist;
            	expect(res.status).to.be(200);
            	expect(res.body.error).not.to.exist;
            	logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
            	expect(res.body.length).to.be.greaterThan(0);

            	done();
            });
        });
    })
});

describe('REST API tests - Remove app tests - Collection', function () {
    describe('remove one app', function (done) {
        it('should remove an app', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _id using the app name
            getCollection(appsStore, appCollection, db).findOne({
                'name': updatedApp1.name
            }, function (err, item) {
            	
            	var URL = basePersistenceURL + appsStore + '/collection/' + appCollection + '/' + item._id;
            	request(app)
            	.del(URL)
            	.end(function (err, res) {
            		expect(res).to.exist;
            		expect(res.status).to.be(200);
            		expect(res.body.error).not.to.exist;
            		logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
            		expect(res.body.count).to.be(1);

            		done();
            	});
            	
            });
        });
    })
    describe('remove three apps', function (done) {
        it('should remove three apps', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore));

            // find the _ids using the app names
            getCollection(appsStore, appCollection, db).find({
                'name': {
                    $in: [updatedApp2.name, updatedApp3.name, updatedApp4.name]
                }
            }).toArray(function (err, items) {
                expect(items.length).to.be(3);
                var updatedApp2Id = items[0]._id,
                    updatedApp3Id = items[1]._id,
                    sampleApp4Id = items[2]._id,
                    array = [updatedApp2Id, updatedApp3Id, sampleApp4Id];

                var URL = basePersistenceURL + appsStore + '/collection/' + appCollection + '/' + JSON.stringify(array);
            	request(app)
            	.del(URL)
            	.end(function (err, res) {
            		expect(res).to.exist;
            		expect(res.status).to.be(200);
            		expect(res.body.error).not.to.exist;
            		logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
            		expect(res.body.count).to.be(3);

            		done();
            	});
            	
            });
        });
    })
});
