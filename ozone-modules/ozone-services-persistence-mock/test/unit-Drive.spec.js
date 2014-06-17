var assert = require("assert"),
    expect = require("expect.js"),
    request = require("supertest"),
    basePersistenceURL = "/api/persistence/store/",
    fs = require('fs'),
    async = require('async'),
    screenshot1File = 'screenshot1.png',
    screenshot2File = 'screenshot2.png',
    screenshot3File = 'screenshot3.png',
    screenshot4File = 'screenshot4.png',
    screenshot5File = 'screenshot5.png',
    screenshotArchive1mbFile = "ScreenshotArchive1mb.zip",
    constants = require('../../../config/constants'),
    appsStore = constants.database.store.apps,
    appCollection = constants.database.collection.app,
    Ozone = {}, 
    express = require("express"),
    app = express(),
    database = {}, // duplicate of in-memory database (in mockHelper.js), so that we can query here; however, this one uses the filename as the key instead of _id.
    logger, Persistence;

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
        app.use(express.bodyParser({
        	limit: '25mb'
        }));
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


describe('Set files - Drive', function () {
    describe('create a file in database with null id', function (done) {
        it('should create a file in database', function (done) {

            fs.readFile(__dirname + '/data/binary/' + screenshot1File, function (err, data) {
                if (err) throw err;
                var obj = {
                        fileName: screenshot1File,
                        data: data,
                        metaData: {
                            category: 'file'
                        }
                    };

                Persistence.Store(appsStore).Drive(appCollection).set(null, obj, function (err, testResult) {
                    //logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(1);
                    expect(testResult.elements[0].data.length).to.be(data.length);

                    // save to our local instance of in-memory database using the filename as the key
                    database[testResult.elements[0].filename] = testResult.elements[0];

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
            var screenshot2FilePath = __dirname + '/data/binary/' + screenshot2File,
                screenshot3FilePath = __dirname + '/data/binary/' + screenshot3File;

            async.parallel([

                    function (callback) {
                        fs.readFile(screenshot2FilePath, function (err, data) {
                            if (err) return callback(err);
                            //console.log(data);
                            var obj = {
                                fileName: screenshot2File,
                                data: data,
                                metaData: {
                                    category: 'file'
                                }
                            };

                            callback(null, {
                                'null': obj
                            });
                        });
                    },
                    function (callback) {
                        fs.readFile(screenshot3FilePath, function (err, data) {
                            if (err) return callback(err);
                            //console.log(data);
                            var obj = {
                                fileName: screenshot3File,
                                data: data,
                                metaData: {
                                    category: 'file'
                                }
                            };
                            callback(null, {
                                'null': obj
                            });
                        });
                    }
                ],
                function (err, objList) {
                    if (err) throw err;
                    Persistence.Store(appsStore).Drive(appCollection).set(objList, function (err, testResult) {
                        //logger.debug("testResult: " + JSON.stringify(testResult));

                        expect(testResult.apps).to.exist;
                        expect(testResult.elements.length).to.be(2);

                        // save to our local instance of in-memory database using the filename as the key
                        database[testResult.elements[0].filename] = testResult.elements[0];
                        database[testResult.elements[1].filename] = testResult.elements[1];

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
            fs.readFile(__dirname + '/data/binary/' + screenshot4File, function (err, data) {
                if (err) throw err;

                var obj = {
                    fileName: screenshot4File,
                    data: data,
                    metaData: {
                        category: 'file'
                    }
                };

                Persistence.Store(appsStore).Drive(appCollection).set('2285345ba6d80a479000000a', obj, function (err, testResult) {
                    //logger.debug("testResult: " + JSON.stringify(testResult));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(1);
                    expect(testResult.elements[0].data.length).to.be(data.length);

                    // save to our local instance of in-memory database using the filename as the key
                    database[testResult.elements[0].filename] = testResult.elements[0];

                    expect(testResult.requested.ids).to.be('2285345ba6d80a479000000a');
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.drive).to.be(appCollection);
                    done();
                });
            });
        });
    })

    describe('update a file', function (done) {
        it("should update a file (screenshot1 with screeneshot5's data)", function (done) {
            fs.readFile(__dirname + '/data/binary/' + screenshot5File, function (err, data) {
                if (err) throw err;

                var obj = {
                	fileName: screenshot1File,
                    data: data,
                    metaData: {
                        category: 'fileNEWscreenshot5'
                    }
                };

                // find screenshot1 from db
                var dbObj = database[screenshot1File];

                logger.debug("dbObj._id: " + dbObj._id);

                Persistence.Store(appsStore).Drive(appCollection).set(dbObj._id, obj, function (err, testResult) {
                    //logger.debug("testResult: " + JSON.stringify(testResult));

                    expect(testResult.elements).to.exist;
                    expect(testResult.elements.length).to.be(1);
                    expect(testResult.elements[0].data.length).to.be(data.length); // data updated to screenshot5's
                    expect(testResult.requested.ids).to.be(dbObj._id);
                    expect(testResult.requested.store).to.be(appsStore);
                    expect(testResult.requested.drive).to.be(appCollection);
                    done();
                });

            });
        });
    })
    describe('update 2 files', function (done) {
        it("should update 2 files(screenshot2File, screenshot3File with screenshot5File's data)", function (done) {
            fs.readFile(__dirname + '/data/binary/' + screenshot5File, function (err, data) {
                if (err) throw err;

                // need to get existing files' _ids
                async.parallel([

                        function (callback) {
                            var dbObj = database[screenshot2File];
                            var obj = {
                            	fileName: screenshot2File,
                                data: data,
                                metaData: {
                                    category: 'fileNEWscreenshot5File-1'
                                }
                            };
                            var returnObj = {};
                            returnObj[dbObj._id] = obj;

                            callback(null, returnObj);
                        },
                        function (callback) {
                            var dbObj = database[screenshot3File];
                            var obj = {
                            	fileName: screenshot3File,
                                data: data,
                                metaData: {
                                    category: 'fileNEWscreenshot5File-2'
                                }
                            };
                            var returnObj = {};
                            returnObj[dbObj._id] = obj;

                            callback(null, returnObj);
                        }
                    ],
                    function (err, objList) {
                        if (err) throw err;
                        Persistence.Store(appsStore).Drive(appCollection).set(objList, function (err, testResult) {
                            //logger.debug("testResult: " + JSON.stringify(testResult));

                            expect(testResult.apps).to.exist;
                            expect(testResult.elements.length).to.be(2);
                            expect(testResult.elements[0].data.length).to.be(data.length); // data updated to screenshot5File
                            expect(testResult.elements[1].data.length).to.be(data.length); // data updated to screenshot5File
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
    describe('get all data (files) in apps database', function (done) {
        it('should return all data (files) in apps database', function (done) {
            Persistence.Store(appsStore).Drive(appCollection).get(function (err, testResult) {
                //logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be.greaterThan(0);
                expect(testResult.requested.ids).to.be(null);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.drive).to.be(appCollection);
                done();

                /*
                // try writing the files to verify the contents
                function writeToFile(record, cb) {
                    logger.debug("record._id: " + record._id + " fileName: " + record.filename + " metaData.category: " + record.metaData.category);
                    fs.writeFile('./' + record.filename, record.data, function () {
                        cb();
                    });
                }

                async.each(testResult.elements, writeToFile, function (err) {
                    // if any of the setFunction calls produced an error, err would equal that error
                    if (err) {
                        logger.error("error while writing files: " + err);
                    }
                    logger.debug("done writing files!");
                    done();
                });
                */
            });
        });
    })
    describe('get one file', function (done) {
        it('should return a file', function (done) {
            var dbObj = database[screenshot1File];

            Persistence.Store(appsStore).Drive(appCollection).get(dbObj._id, function (err, testResult) {
                //logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(1);
                expect(testResult.elements[0].filename).to.be(screenshot1File);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.drive).to.be(appCollection);
                done();
            });
        });
    })
    describe('get two files', function (done) {
        it('should return two files', function (done) {
            var dbObj1 = database[screenshot2File],
                dbObj2 = database[screenshot3File],
                idArray = [dbObj1._id, dbObj2._id];

            Persistence.Store(appsStore).Drive(appCollection).get(idArray, function (err, testResult) {
                //logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(2);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.drive).to.be(appCollection);
                done();
            });
        });
    })
});

describe('Remove file tests - Drive', function () {
    describe('remove one file', function (done) {
        it('should remove a file', function (done) {
            var dbObj = database[screenshot1File];

            Persistence.Store(appsStore).Drive(appCollection).remove(dbObj._id, function (err, testResult) {
                //logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.removed).to.exist;
                expect(testResult.removed.length).to.be(1);
                expect(testResult.removed[0].DeletedFile._id).to.be(dbObj._id);
                expect(testResult.removed[0].Deleted).to.be(true);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.drive).to.be(appCollection);
                done();
            });
        });
    })
    describe('remove three files', function (done) {
        it('should remove three files', function (done) {
            var dbObj1 = database[screenshot2File],
                dbObj2 = database[screenshot3File],
                dbObj3 = database[screenshot4File],
                idArray = [dbObj1._id, dbObj2._id, dbObj3._id];

            Persistence.Store(appsStore).Drive(appCollection).remove(idArray, function (err, testResult) {
                //logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.removed).to.exist;
                expect(testResult.removed.length).to.be(3);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.drive).to.be(appCollection);
                done();
            });

        });
    })
});

describe('Get tests - Drive', function () {
    describe('get all data (files) in apps database', function (done) {
        it('should return zero files in apps database', function (done) {
            Persistence.Store(appsStore).Drive(appCollection).get(function (err, testResult) {
                //logger.debug("testResult: " + JSON.stringify(testResult, null, 3));

                expect(testResult.elements).to.exist;
                expect(testResult.elements.length).to.be(0);
                
                // also delete everything from our local 'database' object
                database = {};
                
                expect(testResult.requested.ids).to.be(null);
                expect(testResult.requested.store).to.be(appsStore);
                expect(testResult.requested.drive).to.be(appCollection);
                done();
            });
        });
    })
})

describe('REST API tests - Drive', function () {
    describe('create a png file in db via REST API(POST)', function (done) {
        it('should create a png file in db via REST API(POST)', function (done) {

        	var URL = basePersistenceURL + appsStore + '/drive/' + appCollection;
        	request(app)
            .post(URL)
            .attach('null', __dirname + '/data/binary/' + screenshot1File)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                //logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                expect(res.body.length).to.be(1);
                expect(res.body[0].filename).to.be(screenshot1File);
                expect(res.body[0].contentType).to.be('image/png');
                
                // save to our local db
                database[res.body[0].filename] = res.body[0];
                
                done();
            });
        	
        });
    })
    
    describe('get the png file in db via REST API(GET)', function (done) {
        it('get the png file in db via REST API(GET)', function (done) {

        	var dbObj = database[screenshot1File];
        	
        	logger.debug("found file to get: " + JSON.stringify(dbObj.filename, null, 3));

            var URL = basePersistenceURL + appsStore + '/drive/' + appCollection + '/' + dbObj._id;
        	request(app)
            .get(URL)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                
                /*
                // remove the created file
                removeFile(screenshot1File, done);
                */
                done();
            });
        });
    })
    describe('create a zip file in db via REST API(POST)', function (done) {
        it('should create a zip file in db via REST API(POST)', function (done) {

        	var URL = basePersistenceURL + appsStore + '/drive/' + appCollection;
        	request(app)
            .post(URL)
            .attach('null', __dirname + '/data/binary/' + screenshotArchive1mbFile)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                //logger.debug("res.body: " + JSON.stringify(res.body, undefined, 3));
                expect(res.body.length).to.be(1);
                expect(res.body[0].filename).to.be(screenshotArchive1mbFile);
                expect(res.body[0].contentType).to.be('application/zip');
                
                // save to our local db
                database[res.body[0].filename] = res.body[0];
                
                done();
            });
        	
        });
    })
    
    describe('get the zip file in db via REST API(GET)', function (done) {
        it('should get the zip file in db via REST API(GET)', function (done) {

        	var dbObj = database[screenshotArchive1mbFile];
        	
        	logger.debug("found file to get: " + JSON.stringify(dbObj.filename, null, 3));

        	var URL = basePersistenceURL + appsStore + '/drive/' + appCollection + '/' + dbObj._id;
        	request(app)
            .get(URL)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body.error).not.to.exist;
                
                /*
                // remove the created file
                removeFile(screenshotArchive1mbFile, done);
                */
                done();
            });
        });
    })
});

var removeFile = function(filename, done) {
	var db = mongoClient.db(appsStore),
    collection = db.collection(appCollection + '.files'),
    findParams = {
    	filename: {
    		$in: [filename]
    	}
    };

    collection.find(findParams).toArray(function (err, results) {
    	expect(results.length).to.be(1);
    	var file = results[0];

    	logger.debug("found file to remove: " + JSON.stringify(file, null, 3));
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
};
