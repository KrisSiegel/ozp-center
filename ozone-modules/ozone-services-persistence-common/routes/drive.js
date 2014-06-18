module.exports = exports = function (Ozone) {
    var baseURL = require('../constants').rest.url,
        routing = Ozone.Routing,
        logger = Ozone.logger,
        Persistence = Ozone.Service('Persistence');

    // set up routing for RESTful data access (drives)
    // Create/Update Drives
    var putPostDrive = function(req, res, next) {
    	var store = req.params.store,
    		drive = req.params.drive,
    		files = req.files,
        	fs = require('fs');

    	logger.debug("Routes(PersistenceService)-->Put/Post(Drive)-->req.url: " + req.url + " store: " + store + " drive: " + drive);
    	logger.debug("Routes(PersistenceService)-->Put/Post(Drive)-->files: " + JSON.stringify(files, null, 3));

    	var fileList = [];
    	for (var id in files) {
    		if (files.hasOwnProperty(id)) {
    			var file = files[id],
    				fileObj = {};

    			if (id.indexOf('null') === 0) {
    				// We are expecting to have received any id that starts with 'null', so we could have 'null2', 'null3', etc.
    				// This is because if we were passed in multiple files with the same id of 'null', it would have an array under that 'null' id.
    				//  but we need distinct, single entries for each id.
    				id = 'null';
    			}

    			// NOTE: if id is 'null', we are creating a new record. If not, then we do an upsert using that id.

    			fileObj[id] = {
    				fileName: file.name,
                    contentType: file.type,
                    data: fs.readFileSync(file.path),
    			};

    			logger.debug("Routes(PersistenceService)-->Post(Drive)-->file id: " + id + " name: " + file.name);

    			fs.unlinkSync(file.path);
    			fileList.push(fileObj);
    		}
    	}

    	Persistence.Store(store).Drive(drive).set(fileList, function(err, result) {
    		if (err) {
                logger.error('Routes(PersistenceService)-->Post(Drive)-->An error has occurred: ' + err);
                res.send({
                    'error': 'An error has occurred: ' + err
                });
                return next(err);
            }

    		//logger.debug("Routes(PersistenceService)-->Post(Drive)-->result: " + JSON.stringify(result, null, 3));
    		var elements = result;
            logger.debug("Routes(PersistenceService)-->Post(Drive)-->created " + elements.length + " elements.");

            res.send(elements);
    	});
    };

    routing.post(baseURL + '/store/:store/drive/:drive', putPostDrive);
    routing.put(baseURL + '/store/:store/drive/:drive', putPostDrive);

    // Get Drives
    var getDrive = function(id, req, res, next) {
    	var store = req.params.store,
    		drive = req.params.drive;

    	logger.debug("Routes(PersistenceService)-->Get(Drive)-->req.url: " + req.url + " store: " + store +
    			" drive: " + drive + " id: " + JSON.stringify(id));

    	Persistence.Store(store).Drive(drive).get(id, function(err, results) {
    		if (err) {
    			logger.error('Routes(PersistenceService)-->Get(Drive)-->An error has occurred: ' + err);
    			res.send({
    				'error': 'An error has occurred: ' + err
    			});
    			return next(err);
    		}

    		//logger.debug("Routes(PersistenceService)-->Get(Drive)-->results: " + JSON.stringify(results, null, 3));

    		var elements = results;
    		logger.debug("Routes(PersistenceService)-->Get(Drive)-->got " + elements.length + " elements.");

    		if (elements.length === 1) {
            	var file = elements[0].gridFSfile;

            	if (file) {
            		logger.debug("Routes(PersistenceService)-->Get(Drive)-->elements[0].gridFSfile: " + JSON.stringify(file, null, 3));
            	} else { // when mock database is used, use elements[0]
            		file = elements[0];
            		logger.debug("Routes(PersistenceService)-->Get(Drive)-->elements[0].gridFSfile is undefined; we must be using mock db - filename: "
            						+ file.filename + " file length: " + file.data.length);
            	}

                /*
            	// try writing the files to verify the contents
                var data = elements[0].data;
                require('fs').writeFile('./' + file.filename, data, function () {
                });
            	*/

                res.set({
                	'Content-Type': file.contentType,
                	'Content-disposition': 'attachment; filename=' + file.filename // to let browser download the file
                });
                res.send(elements[0].data);

            } else if (elements.length > 1) {
            	// if we have multiple results, send them as json?
            	res.send(elements);
            } else {
            	res.send({ 'No files found with id': id });
            }
    	});

    };

    routing.get(baseURL + '/store/:store/drive/:drive/:id', function (req, res, next) {
    	// req.params.id is either an array or a string id
    	var obj = Ozone.Utils.convertStringToObject(req.params.id);
    	var id = obj !== undefined ? obj : req.params.id;

    	getDrive(id, req, res, next);
    });

    routing.get(baseURL + '/store/:store/drive/:drive', function (req, res, next) {
    	getDrive(undefined, req, res, next);
    });


    // Remove Drives
    routing.delete(baseURL + '/store/:store/drive/:drive/:id', function (req, res, next) {
    	var store = req.params.store,
    		drive = req.params.drive,
    		// req.params.id is either an array or a string id
			obj = Ozone.Utils.convertStringToObject(req.params.id),
			id = obj !== undefined ? obj : req.params.id;

    	logger.debug("Routes(PersistenceService)-->Remove(Drive)-->req.url: " + req.url + " store: " + store +
    			" drive: " + drive + " id: " + JSON.stringify(id));

    	Persistence.Store(store).Drive(drive).remove(id, function(err, result) {
    		if (err) {
                logger.error('Routes(PersistenceService)-->Remove(Drive)-->An error has occurred: ' + err);
                res.send({
                    'error': 'An error has occurred: ' + err
                });
                return next(err);
            }

    		//logger.debug("Routes(PersistenceService)-->Remove(Drive)-->result: " + JSON.stringify(result, null, 3));
            logger.debug("Routes(PersistenceService)-->Remove(Drive)-->removed " + result.length + " elements.");

            res.send(result);
    	});
    });
};
