/**
 *  The Import/Export module performs JSON serialization and deserialization of all module data and metadata
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.ImportExport
 *  @class Ozone.Services.ImportExport
 *  @submodule Server-Side
 *  @requires async
 *  @requires fs
 *  @requires path
 */
(function(){
    var constants = require('../config/constants'),
        async = require('async'),
        fs = require('fs'),
        path = require("path"),
        Ozone = null,
        containerConfigDir = '../../../config/',
        logger = null;



    var exporting = {
        /**
         * Setter function for Ozone service object and logger
         * @method init
         * @param ozone {Object} Ozone object
         */
        init: function(_ozone){
            Ozone = _ozone;
            logger = Ozone.logger;
        },

        /**
         * Performs import on file with path passed in.
         * @method import
         * @param filePath {String} Absoolute or relative file path of file to be imported, depending on defaultImport parameter.
         *        If contents of import file cannot be imported as JSON, then it will be imported as a bundled zip file.
         * @param callback {Function} Callback function invoked after JSON or bundle import succeeds.
         * @param [defaultImport] {Boolean} Default path will be used for file import if truthy.
         */
        import: function(filePath, callback, defaultImport) { //passes callback error, importResults
            if(defaultImport){
                filePath = __dirname + '/' + containerConfigDir + filePath;
            }
            logger.debug("ImportService-->import-->filePath: " + filePath);
            var data = null;
            // try to load it as json first, then try file
            try {
                data = require(filePath);
                _importJson(data, callback);
            }
            catch (e) {
                data = fs.readFileSync(filePath);
                _importBundle(data, callback);
            }
        }
    };
    module.exports = exporting;

    /**
     * @method importJson
     * @param importJson {Object} Object with all services to be imported as keys
     * @param callback {Function} Callback function invoked after JSON or bundle import succeeds.
     * @param tmpDirPath {String} Relative path of import file
     * @private
     */
    var _importJson = function(importJson, callback, tmpDirPath){
        var importResults = {}
        async.each(Object.keys(importJson), function(service, cb){
            //TODO: add check to ensure if service doesn't exist the callback will still be called.
            Ozone.Service().on("ready", service, function () {
                Ozone.logger.debug("ImportService -> importJson -> conducting auto import for " + service);
                if (!Ozone.Utils.isUndefinedOrNull(Ozone.Service(service).import)) {
                    Ozone.Service(service).import(importJson[service], function(serviceImportResults){
                        importResults[service] = serviceImportResults;
                        cb();
                    }, tmpDirPath);
                }else{
                    cb();
                }
            });
        }, function(){
            callback(null, importResults);
        });

    };

    /**
     * Imports bundled Zip file passed in, if the object is a valid zip file.
     * @method importBundle
     * @param importZipFile {Object} The bundle object to be imported, if the object is a valid zip file.
     * @param callback {Function} Callback function invoked after JSON or bundle import succeeds.
     * @private
     */
    var _importBundle = function(importZipFile, callback){
        if(!_canProcessBundle(importZipFile)){
            logger.debug('ImportService -> importBundle -> unable to process bundle file.');
            callback('Unable to process bundle file.');
            return;
        }
        var AdmZip = require('adm-zip'),
            buffer = new Buffer(importZipFile),
            zip = new AdmZip(buffer),
            tmp = require('tmp'),
            async = require('async'),
            importResults = {};

        tmp.setGracefulCleanup();
        tmp.dir({ dir: require("os").tmpdir(), prefix: 'massAppImportTemp_', unsafeCleanup: true }, function(err, tempPath) {
            if (err) {
                _deleteFolderRecursive(tempPath);
                logger.debug("ImportService-->importBundle-->error while creating temp dir: " + err);
                return callback(err);
            }

            logger.debug("ImportService-->importBundle-->Created temp Dir: ", tempPath);

            zip.extractAllTo(tempPath);

            fs.readdir(tempPath, function(err, files){
                if (err) {
                    _deleteFolderRecursive(tempPath);
                    logger.error("ImportService-->importBundle-->error while reading unzipped files: " + err);
                    return callback(err);
                }

                var readFile = function(file, cb) {
                    var extension = file.slice(file.lastIndexOf('.') + 1);
                    logger.debug("ImportService-->importBundle-->file: " + file + ", extension: " + extension);

                    if (extension.toLowerCase() == 'json') {
                        var filePath = tempPath + '/' + file;
                        var jsonData = require(filePath);
                        _importJson(jsonData, function(err, res){
                            _reduceResults(res, importResults);
                            cb();
                        }, tempPath);
                    } else {
                        cb();
                    }
                };

                async.each(files, readFile, function(err){
                    _deleteFolderRecursive(tempPath);

                    if (err) {
                        logger.error("ImportService-->importBundle-->error while processing unzipped files: " + err);
                        return callback(err);
                    }

                    callback(err, importResults);
                });
            });
        });
    };

    /**
     * Determines object passed in is a bundled Zip file that can be processed.
     * See (http://stackoverflow.com/a/8475542/1262856) for details on how to check the leading bytes of a zip file.
     * @method canProcessBundle
     * @param data {Object} Zip file object
     * @return {Boolean} True if object passed in is a valid zip file
     * @private
     */
    var _canProcessBundle = function(data){
        logger.debug("ImportService-->canProcess()");

        try {
            var buffer = new Buffer(data),
                magicNumbers = buffer.toString('hex',0,4);

            // examine the first few bytes (magic numbers) to see if it's a zip file (http://stackoverflow.com/a/8475542/1262856)
            logger.debug("ImportService-->canProcess-->magicNumbers: " + magicNumbers);
            return magicNumbers.indexOf(constants.magicNumbers.zip) === 0;
        } catch(e) {
            logger.debug("ImportService-->canProcess-->error while trying to use magicNumbers: " + e);
            return false;
        }
    };

    /**
     * Removes folder path passed in, and all child folders within this folder.
     * @method deleteFolderRecursive
     * @param path {String} directory path to be deleted.
     * @private
     */
    var _deleteFolderRecursive = function(path) {
        var files = [];
        if( fs.existsSync(path) ) {
            files = fs.readdirSync(path);
            files.forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.statSync(curPath).isDirectory()) { // recurse
                    _deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    /**
     * Recursively merges all fields of obj into target.  If a value exists in both obj and target objects, then
     * the following operation is performed using the Javascript plus operator:
     * <target_value> = <target_value> + <obj_value>
     * @method reduceResults
     * @param obj {Object} object to merge into target
     * @param target {Object} target of merge object, which will contain all keys of both objects passed in when returned.
     * @return {Object} target object
     * @private
     */
    var _reduceResults = function(obj, target){
        if (Object.prototype.toString.call(obj) === "[object Object]") {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (Object.prototype.toString.call(obj[key]) === "[object Object]") {
                        if (target[key] === undefined) {
                            target[key] = {};
                        }
                        target[key] = _reduceResults(obj[key], target[key]);
                    } else if (Object.prototype.toString.call(obj[key]) === "[object Number]") {
                        target[key] = (target[key] || 0) + obj[key];
                    } else {
                        target[key] = obj[key];
                    }
                }
            }
        }
        return target;
    }

}());
