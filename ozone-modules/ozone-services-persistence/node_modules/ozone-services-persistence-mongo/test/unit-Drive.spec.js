var assert = require("assert"),
    expect = require("expect.js"),
    fs = require("fs"),
    async = require("async"),
    ObjectID = require('mongodb').ObjectID,
    mongo = require('mongodb'),
    mongoClient, 
    Ozone = {}, 
    express = require("express"),
    app = express(),
    request = require("supertest"),
    basePersistenceURL = "/api/persistence/store/",
    logger, 
    Persistence, 
    constants = require('../../../config/constants'),
    appsStore = constants.database.store.apps,
    appCollection = constants.database.collection.app,
    screenshotArchive18mbFile = "ScreenshotArchive18mb.zip",
    screenshotArchive20mbFile = "ScreenshotArchive20mb.zip",
    screenshotArchive1mbFile = "ScreenshotArchive1mb.zip",
    screenshot1File = "Screenshot1.png",
    screenshot2File = "Screenshot2.png",
    screenshot3File = "Screenshot3.png",
    screenshot4File = "Screenshot4.png";

if (typeof jasmine !== 'undefined') {
	beforeEach(function (done) {
	    setup(done);
		//done();
	})
} else {
	before(function (done) {
	    setup(done);
	})
}

function setup(done) {
    app.configure(function () {
        app.use(express.logger('dev'));
        app.use(express.bodyParser({
        	limit: '30mb',
        	uploadDir: "/tmp"
        }));
    });

    Ozone = require('../../../../ozone-api')(app);
    logger = Ozone.logger;

    logger.info("in unit-Drive before")
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

    require('../../../main')(function () {
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
	
	logger.debug("unit-Drive.spec-->getDatabaseName-->storeName: " + storeName);
	return storeName;
};
function getCollection(store, collection, db) {
	var collectionName = store + "_" + collection;
	
	logger.debug("unit-Drive.spec-->getCollection-->collectionName: " + collectionName);
	
	return db.collection(collectionName);
};

describe('Set files - Drive', function () {
    describe('create a file in GridFS with null id', function (done) {
        it('should create a file in GridFS', function (done) {

            fs.readFile(__dirname + '/data/binary/' + screenshotArchive18mbFile, function (err, data) {
                if (err) throw err;
                var obj = {
                        fileName: screenshotArchive18mbFile,
                        data: data,
                        metaData: {
                            category: 'file'
                        }
                    };

                Persistence.Store(appsStore).Drive(appCollection).set(null, obj, function (err, testResult) {
                    //logger.debug("testResult: " + JSON.stringify(testResult));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(1);
                    expect(testResult.elements[0].filename).to.be(screenshotArchive18mbFile);
                    expect(testResult.requested.ids).to.be(null);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.drive).to.be(appCollection);
                    done();
                });
            });
        });
    })
    describe('create 2 more files', function (done) {
        it('should create 2 files', function (done) {
            var screenshotArchive20mbFilePath = __dirname + '/data/binary/' + screenshotArchive20mbFile,
                screenshot1FilePath = __dirname + '/data/binary/' + screenshot1File;

            async.parallel([

                    function (callback) {
                        fs.readFile(screenshotArchive20mbFilePath, function (err, data) {
                            if (err) return callback(err);
                            //console.log(data);
                            var obj = {
                                fileName: screenshotArchive20mbFile,
                                data: data,
                                metaData: {
                                    category: 'file'
                                }
                            };

                            callback(null, {
                                'null': obj
                            }); // use 'null' as the ObjectID to create a new Id
                        });
                    },
                    function (callback) {
                        fs.readFile(screenshot1FilePath, function (err, data) {
                            if (err) return callback(err);
                            //console.log(data);
                            var obj = {
                                fileName: screenshot1File,
                                data: data,
                                metaData: {
                                    category: 'file'
                                }
                            };
                            callback(null, {
                                'null': obj
                            }); // use 'null' as the ObjectID to create a new Id
                        });
                    }
                ],
                function (err, objList) {
                    if (err) throw err;
                    Persistence.Store(appsStore).Drive(appCollection).set(objList, function (err, testResult) {
                        //logger.debug("testResult: " + JSON.stringify(testResult));

                        expect(testResult.apps).to.exist;
                        expect(testResult.elements.length).to.be(2);
                        expect(testResult.requested.store).to.be(appsStore);
                        expect(testResult.requested.drive).to.be(appCollection);
                        done();
                    });
                }
            );

        });
    })

    describe('create a file with predefined id', function (done) {
        it('should create a file with predefined id', function (done) {
            fs.readFile(__dirname + '/data/binary/' + screenshot2File, function (err, data) {
                if (err) throw err;

                var obj = {
                    fileName: screenshot2File,
                    data: data,
                    metaData: {
                        category: 'file'
                    }
                };

                Persistence.Store(appsStore).Drive(appCollection).set('1285345ba6d80a479000000a', obj, function (err, testResult) {
                    //logger.debug("testResult: " + JSON.stringify(testResult));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(1);
                    expect(testResult.elements[0].filename).to.be(screenshot2File);
                    expect(testResult.requested.ids).to.be('1285345ba6d80a479000000a');
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.drive).to.be(appCollection);
                    done();
                });
            });
        });
    })

    describe('update a file', function (done) {
        it("should update a file (screenshot2 with screeneshot3's data)", function (done) {
            // read screenshot3 data
            fs.readFile(__dirname + '/data/binary/' + screenshot3File, function (err, data) {
                if (err) throw err;

                // NOTE: it seems you can't rename the existing filename by passing it in the options.
                var obj = {
                	fileName: screenshot2File,
                    data: data,
                    metaData: {
                        category: 'fileNEWscreenshot3'
                    }
                };

                // find screenshot2 from db
                var db = mongoClient.db(getDatabaseName(appsStore)),
                    collection = getCollection(appsStore, appCollection + '.files', db),
                    findParams = {
                        filename: {
                            $in: [screenshot2File]
                        }
                    };

                collection.find(findParams).toArray(function (err, results) {
                    expect(results.length).to.be(1);
                    var file = results[0];

                    logger.debug("file: " + JSON.stringify(file, null, 3));

                    Persistence.Store(appsStore).Drive(appCollection).set(file._id, obj, function (err, testResult) {
                        //logger.debug("testResult: " + JSON.stringify(testResult));

                        expect(testResult.elements).to.exist;
                        expect(testResult.elements.length).to.be(1);
                        expect(testResult.elements[0].filename).to.be(screenshot2File);
                        expect(testResult.elements[0].length).to.be(data.length); // data updated to screenshot3's
                        expect(testResult.elements[0].metadata.category).to.be(obj.metaData.category);
                        expect(testResult.requested.ids).to.be(file._id);
                        expect(testResult.requested.store).to.be(appsStore);
                        expect(testResult.requested.drive).to.be(appCollection);
                        done();
                    });
                });
            });
        });
    })
    describe('update 2 files', function (done) {
        it("should update 2 files(screenshotArchive18mbFile, screenshotArchive20mbFile with screenshotArchive1mbFile's data)", function (done) {
            // read screenshotArchive1mbFile's data
            fs.readFile(__dirname + '/data/binary/' + screenshotArchive1mbFile, function (err, data) {
                if (err) throw err;

                // need to get existing files' _ids
                var db = mongoClient.db(getDatabaseName(appsStore)),
                    collection = getCollection(appsStore, appCollection + '.files', db);

                async.parallel([

                        function (callback) {
                            var findParams = {
                                filename: {
                                    $in: [screenshotArchive18mbFile]
                                }
                            };
                            collection.find(findParams).toArray(function (err, results) {
                                if (err) return callback(err);

                                expect(results.length).to.be(1);
                                var file = results[0];
                                var obj = {
                                	fileName: screenshotArchive18mbFile,
                                    data: data,
                                    metaData: {
                                        category: 'fileNEWscreenshotArchive1mb-1'
                                    }
                                };
                                var returnObj = {};
                                returnObj[file._id] = obj;

                                callback(null, returnObj);
                            });
                        },
                        function (callback) {
                            var findParams = {
                                filename: {
                                    $in: [screenshotArchive20mbFile]
                                }
                            };
                            collection.find(findParams).toArray(function (err, results) {
                                if (err) return callback(err);

                                expect(results.length).to.be(1);
                                var file = results[0];
                                var obj = {
                                	fileName: screenshotArchive20mbFile,
                                    data: data,
                                    metaData: {
                                        category: 'fileNEWscreenshotArchive1mb-2'
                                    }
                                };
                                var returnObj = {};
                                returnObj[file._id] = obj;

                                callback(null, returnObj);
                            });
                        }
                    ],
                    function (err, objList) {
                        if (err) throw err;
                        Persistence.Store(appsStore).Drive(appCollection).set(objList, function (err, testResult) {
                            //logger.debug("testResult: " + JSON.stringify(testResult));

                            expect(testResult.apps).to.exist;
                            expect(testResult.elements.length).to.be(2);
                            expect(testResult.elements[0].length).to.be(data.length); // data updated to screenshot1mb's
                            expect(testResult.elements[1].length).to.be(data.length); // data updated to screenshot1mb's
                            expect(testResult.requested.store).to.be(appsStore);
                            expect(testResult.requested.drive).to.be(appCollection);
                            done();
                        });
                    }
                );
            });
        });
    })
})
describe('Get tests - Drive', function () {
    describe('get all gridFS data (files) in apps database', function (done) {
        it('should return all gridFS data (files) in apps database', function (done) {
            Persistence.Store(appsStore).Drive(appCollection).get(function (err, testResult) {
                //logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be.greaterThan(0);
                expect(testResult.requested.ids).to.be(null);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.drive).to.be(appCollection);
                done();
            });
        });
    })
    describe('get one file', function (done) {
        it('should return a file', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore)),
                collection = getCollection(appsStore, appCollection + '.files', db),
                findParams = {
                    filename: {
                        $in: [screenshotArchive18mbFile]
                    }
                };

            collection.find(findParams).toArray(function (err, results) {
                expect(results.length).to.be(1);
                var file = results[0];

                logger.debug("file: " + JSON.stringify(file, null, 3));
                Persistence.Store(appsStore).Drive(appCollection).get(file._id, function (err, testResult) {
                    //logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(1);
                    expect(testResult.elements[0].gridFSfile.filename).to.be(screenshotArchive18mbFile);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.drive).to.be(appCollection);
                    done();
                });
            });
        });
    })
    describe('get two files', function (done) {
        it('should return two files', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore)),
                collection = getCollection(appsStore, appCollection + '.files', db),
                fileNameArray = [screenshotArchive18mbFile, screenshotArchive20mbFile],
                findParams = {
                    filename: {
                        $in: fileNameArray
                    }
                };

            collection.find(findParams).toArray(function (err, results) {
                expect(results.length).to.be(2);

                logger.debug("results: " + JSON.stringify(results, null, 3));

                var idArray = [];
                results.forEach(function (result) {
                    idArray.push(result._id);
                });

                Persistence.Store(appsStore).Drive(appCollection).get(idArray, function (err, testResult) {
                    //logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(2);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.drive).to.be(appCollection);
                    done();
                });
            });
        });
    })
});

describe('Remove file tests - Drive', function () {
    describe('remove one file', function (done) {
        it('should remove a file', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore)),
                collection = getCollection(appsStore, appCollection + '.files', db),
                findParams = {
                    filename: {
                        $in: [screenshotArchive18mbFile]
                    }
                };

            collection.find(findParams).toArray(function (err, results) {
                expect(results.length).to.be(1);
                var file = results[0];

                logger.debug("file: " + JSON.stringify(file, null, 3));
                Persistence.Store(appsStore).Drive(appCollection).remove(file._id, function (err, testResult) {
                    logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.removed).to.exist;
                    expect(testResult.removed.length).to.be(1);
                    expect(testResult.removed[0].gridFSfile._id.toHexString()).to.be(file._id.toHexString());
                    expect(testResult.removed[0].deleted).to.be(true);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.drive).to.be(appCollection);
                    done();
                });
            });
        });
    })
    describe('remove three files', function (done) {
        it('should remove three files', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore)),
                collection = getCollection(appsStore, appCollection + '.files', db),
                findParams = {
                    filename: {
                        $in: [screenshotArchive20mbFile, screenshot1File, screenshot2File]
                    }
                };

            collection.find(findParams).toArray(function (err, results) {
                expect(results.length).to.be(3);

                var idArray = [];
                results.forEach(function (result) {
                    idArray.push(result._id);
                });

                Persistence.Store(appsStore).Drive(appCollection).remove(idArray, function (err, testResult) {
                    //logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.removed).to.exist;
                    expect(testResult.removed.length).to.be(3);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.drive).to.be(appCollection);
                    done();
                });
            });
        });
    })
});
describe('REST API tests - Set files - Drive', function () {
	
	var screenshot1FileId,
		screenshot2FileId = '1285345ba6d80a479000000a',
		screenshotArchive18mbFileId,
		screenshotArchive20mbFileId;
		
    describe('create a file in GridFS with null id', function (done) {
        it('should create a file in GridFS - REST', function (done) {

        	var URL = basePersistenceURL + appsStore + '/drive/' + appCollection;
        	request(app)
            .post(URL)
            .attach('null', __dirname + '/data/binary/' + screenshotArchive18mbFile)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                expect(res.body.length).to.be(1);
                expect(res.body[0].filename).to.be(screenshotArchive18mbFile);
                screenshotArchive18mbFileId = res.body[0]._id;
                done();
            });
        });
    })
    describe('create 2 more files', function (done) {
        it('should create 2 files - REST', function (done) {
            var screenshotArchive20mbFilePath = __dirname + '/data/binary/' + screenshotArchive20mbFile,
                screenshot1FilePath = __dirname + '/data/binary/' + screenshot1File;

            var URL = basePersistenceURL + appsStore + '/drive/' + appCollection;
        	request(app)
            .post(URL)
            .attach('null', screenshotArchive20mbFilePath)
            .attach('null2', screenshot1FilePath)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                expect(res.body.length).to.be(2);
                screenshot1FileId = res.body[0]._id;
                screenshotArchive20mbFileId = res.body[1]._id;
                done();
            });
        });
    })
    describe('create a file with predefined id', function (done) {
        it('should create a file with predefined id - REST', function (done) {
        	
        	var URL = basePersistenceURL + appsStore + '/drive/' + appCollection;
        	request(app)
            .post(URL)
            .attach(screenshot2FileId, __dirname + '/data/binary/' + screenshot2File)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                expect(res.body.length).to.be(1);
                expect(res.body[0].filename).to.be(screenshot2File);
                expect(res.body[0]._id).to.be(screenshot2FileId);
                done();
            });
        	
        });
    })
    describe('update a file', function (done) {
        it("should update a file (screenshot2 with screenshot3's data) - REST", function (done) {
        	
            // read screenshot3 data
            fs.readFile(__dirname + '/data/binary/' + screenshot3File, function (err, data) {
                if (err) throw err;

                var URL = basePersistenceURL + appsStore + '/drive/' + appCollection;
            	request(app)
                .post(URL)
                .attach(screenshot2FileId, __dirname + '/data/binary/' + screenshot3File)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body.error).not.to.exist;
                    logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    expect(res.body.length).to.be(1);
                    expect(res.body[0].filename).to.be(screenshot2File);
                    expect(res.body[0].length).to.be(data.length); // data updated to screenshot3's
                    done();
                });
            });
        });
    })
    describe('update 2 files', function (done) {
        it("should update 2 files(screenshotArchive18mbFile, screenshotArchive20mbFile with screenshotArchive1mbFile's data) - REST", function (done) {
            // read screenshotArchive1mbFile's data
            fs.readFile(__dirname + '/data/binary/' + screenshotArchive1mbFile, function (err, data) {
                if (err) throw err;

                var URL = basePersistenceURL + appsStore + '/drive/' + appCollection;
            	request(app)
                .post(URL)
                .attach(screenshotArchive18mbFileId, __dirname + '/data/binary/' + screenshotArchive1mbFile)
                .attach(screenshotArchive20mbFileId, __dirname + '/data/binary/' + screenshotArchive1mbFile)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body.error).not.to.exist;
                    logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    expect(res.body.length).to.be(2);
                    expect(res.body[0].length).to.be(data.length); // data updated to screenshot1mb's
                    expect(res.body[1].length).to.be(data.length); // data updated to screenshot1mb's
                    done();
                });
            });
        });
    })
})

describe('REST API tests - Get tests - Drive', function () {
    describe('get all gridFS data (files) in apps database', function (done) {
        it('should return all gridFS data (files) in apps database - REST', function (done) {
        	
        	if (typeof jasmine === 'undefined') {
        		this.timeout(3000); // to allow for transferring of all the files
        	}
        	
        	var URL = basePersistenceURL + appsStore + '/drive/' + appCollection;
        	request(app)
            .get(URL)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                //logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                expect(res.body.length).to.be.greaterThan(0);
                
                done();
            });
        	
        });
    })
    describe('get one file', function (done) {
        it('should return a file - REST', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore)),
                collection = getCollection(appsStore, appCollection + '.files', db),
                findParams = {
                    filename: {
                        $in: [screenshotArchive18mbFile]
                    }
                };

            collection.find(findParams).toArray(function (err, results) {
                expect(results.length).to.be(1);
                var file = results[0];

                logger.debug("file: " + JSON.stringify(file, null, 3));
                
                var URL = basePersistenceURL + appsStore + '/drive/' + appCollection + '/' + file._id;
            	request(app)
                .get(URL)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body.error).not.to.exist;
                    //logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    
                    done();
                });
                
            });
        });
    })
    describe('get two files', function (done) {
        it('should return two files - REST', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore)),
                collection = getCollection(appsStore, appCollection + '.files', db),
                fileNameArray = [screenshotArchive18mbFile, screenshotArchive20mbFile],
                findParams = {
                    filename: {
                        $in: fileNameArray
                    }
                };

            collection.find(findParams).toArray(function (err, results) {
                expect(results.length).to.be(2);

                logger.debug("results: " + JSON.stringify(results, null, 3));

                var idArray = [];
                results.forEach(function (result) {
                    idArray.push(result._id);
                });

                var URL = basePersistenceURL + appsStore + '/drive/' + appCollection + '/' + JSON.stringify(idArray);
            	request(app)
                .get(URL)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body.error).not.to.exist;
                    expect(res.body.length).to.be(2);
                    //logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                    
                    done();
                });
            });
        });
    })
});

describe('Remove file tests - Drive', function () {
    describe('remove one file', function (done) {
        it('should remove a file - REST', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore)),
                collection = getCollection(appsStore, appCollection + '.files', db),
                findParams = {
                    filename: {
                        $in: [screenshotArchive18mbFile]
                    }
                };

            collection.find(findParams).toArray(function (err, results) {
                expect(results.length).to.be(1);
                var file = results[0];

                logger.debug("file: " + JSON.stringify(file, null, 3));
                
                var URL = basePersistenceURL + appsStore + '/drive/' + appCollection + '/' + file._id;
            	request(app)
            	.del(URL)
            	.end(function (err, res) {
            		expect(res).to.exist;
            		expect(res.status).to.be(200);
            		expect(res.body.error).not.to.exist;
            		//logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
            		//expect(res.body.count).to.be(1);
            		expect(res.body[0].gridFSfile._id).to.be(file._id.toHexString());
                    expect(res.body[0].deleted).to.be(true);

            		done();
            	});
                
            });
        });
    })
    describe('remove three files', function (done) {
        it('should remove three files - REST', function (done) {
            var db = mongoClient.db(getDatabaseName(appsStore)),
                collection = getCollection(appsStore, appCollection + '.files', db),
                findParams = {
                    filename: {
                        $in: [screenshotArchive20mbFile, screenshot1File, screenshot2File]
                    }
                };

            collection.find(findParams).toArray(function (err, results) {
                expect(results.length).to.be(3);

                var idArray = [];
                results.forEach(function (result) {
                    idArray.push(result._id);
                });

                var URL = basePersistenceURL + appsStore + '/drive/' + appCollection + '/' + JSON.stringify(idArray);
            	request(app)
            	.del(URL)
            	.end(function (err, res) {
            		expect(res).to.exist;
            		expect(res.status).to.be(200);
            		expect(res.body.error).not.to.exist;
            		//logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
            		expect(res.body.length).to.be(3);
            		expect(res.body[0].deleted).to.be(true);
            		expect(res.body[1].deleted).to.be(true);
            		expect(res.body[2].deleted).to.be(true);

            		done();
            	});
            });
        });
    })
});
