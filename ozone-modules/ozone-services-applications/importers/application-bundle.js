var Ozone = null,
    logger = null,
    fs = require('fs'),
    path = require("path"),
    constants = require("../constants");

module.exports = {
	init: function (_ozone) {
			Ozone = _ozone;
			logger = Ozone.logger;
	},
    getName: function() {
        return path.basename(__filename);
    },
    canProcess: function(data) {
        logger.debug("AppsService-->importers-->application-bundle-->canProcess()");

        try {
        	var buffer = new Buffer(data),
        	magicNumbers = buffer.toString('hex',0,4);

        	// examine the first few bytes (magic numbers) to see if it's a zip file (http://stackoverflow.com/a/8475542/1262856)
        	logger.debug("AppsService-->importers-->application-bundle-->magicNumbers: " + magicNumbers);
        	return magicNumbers.indexOf(constants.magicNumbers.zip) === 0;
        } catch(e) {
        	logger.debug("AppsService-->importers-->application-bundle-->error while trying to use magicNumbers: " + e);
        	return false;
        }
    },
    process: function(data, callback) {
        logger.debug("AppsService-->importers-->application-bundle-->process()");

        var AdmZip = require('adm-zip'),
            buffer = new Buffer(data),
            zip = new AdmZip(buffer),
            tmp = require('tmp'),
            async = require('async');

        tmp.setGracefulCleanup();

        tmp.dir({ dir: require("os").tmpdir(), prefix: 'massAppImportTemp_', unsafeCleanup: true }, function(err, tempPath) {
            if (err) {
                deleteFolderRecursive(tempPath);
                logger.debug("AppsService-->importers-->application-bundle-->error while creating temp dir: " + err);
                return callback(err);
            }

            logger.debug("AppsService-->importers-->application-bundle-->Created temp Dir: ", tempPath);

            zip.extractAllTo(tempPath);

            var insertedRecords = [];

            fs.readdir(tempPath, function(err, files){
                if (err) {
                    deleteFolderRecursive(tempPath);
                    logger.error("AppsService-->importers-->application-bundle-->error while reading unzipped files: " + err);
                    return callback(err);
                }

                var readFile = function(file, cb) {
                    var extension = file.slice(file.lastIndexOf('.') + 1);
                    logger.debug("AppsService-->importers-->application-bundle-->file: " + file + ", extension: " + extension);

                    if (extension.toLowerCase() == 'json') {
                        var filePath = tempPath + '/' + file;

                        // "cont" is from the data-seeding project
                        cont(tempPath, filePath, function() {
                            // save the modified apps json data w/ image ids to db
                            var applicationJsonImporter = require('./application-json'),
                                appJson = require(filePath);
							applicationJsonImporter.init(Ozone);
                            applicationJsonImporter.insertApps(appJson.injectableRecords, function(err, results) {
                                if (err) {
                                    logger.error("AppsService-->importers-->application-bundle-->error while inserting unzipped files: " + err);
                                    return cb(err);
                                }
                                insertedRecords = insertedRecords.concat(results);
                                cb();
                            });
                        });
                    } else {
                        cb();
                    }
                };

                async.each(files, readFile, function(err){
                    deleteFolderRecursive(tempPath);

                    if (err) {
                        logger.error("AppsService-->importers-->application-bundle-->error while processing unzipped files: " + err);
                        return callback(err);
                    }

                    callback(err, insertedRecords);
                });
            });
        });
    }
};

var deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

// Below methods are based on the data-seeding project
var restoreAppRecords = function (recPath, records, mainCallback) {
    var str = JSON.stringify(records);
    fs.writeFileSync(recPath, str);
    logger.debug("AppsService-->importers-->application-bundle-->Re-writing app records completed!");
    if (mainCallback !== undefined) {
        mainCallback.apply(this, []);
    }
};

var persist = function (tempPath, p, callback) {
    var fullpath = tempPath + '/' + p;
    if (fs.existsSync(fullpath)) {
        var buffer = fs.readFileSync(fullpath);
        var obj = {
            fileName: path.basename(p),
            data: buffer,
            metaData: {
                category: 'file'
            }
        };
        var id = Ozone.Service("Persistence").objectId();
        Ozone.Service("Persistence").Store("apps").Drive("images").set(id, obj, function (result) {
            callback.apply(this, [id]);
        });
    } else {
        callback.apply(this, []);
    }
};

var cont = function (tempPath, recPath, callback) {
    var appRecords = require(recPath);
    //logger.debug("appRecords: " + JSON.stringify(appRecords, null, 3));
    if (appRecords.injectableRecords !== undefined) {
        var queue = [];
        for (var i = 0; i < appRecords.injectableRecords.length; ++i) {
            appRecords.injectableRecords[i].images = { };
            queue.push({
                index: i,
                imagePath: appRecords.injectableRecords[i].icon,
                imageKey: 'iconId'
            });
            queue.push({
                index: i,
                imagePath: appRecords.injectableRecords[i].smallBanner,
                imageKey: 'smallBannerId'
            });
            queue.push({
                index: i,
                imagePath: appRecords.injectableRecords[i].featuredBanner,
                imageKey: 'featuredBannerId'
            });
            queue.push({
                index: i,
                imagePath: appRecords.injectableRecords[i].screenshot,
                imageKey: 'screenshotId'
            });
        }
        var process = function (img) {
            persist(tempPath, img.imagePath, function (id) {
                // RWP: if screenshot image, then add screenshot ID to array of screenshots
                if (img.imageKey === 'screenshotId') {
                    appRecords.injectableRecords[img.index].images.screenshots = [id];
                }
                appRecords.injectableRecords[img.index].images[img.imageKey] = id;
                if (queue.length > 0) {
                    process(queue.shift());
                } else {
                    // We're done!
                    restoreAppRecords(recPath, appRecords, callback);
                }
            });
        };
        if (queue.length > 0) {
            process(queue.shift());
        } else {
            callback();
        }
    }
};
