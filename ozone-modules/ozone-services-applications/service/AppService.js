var Ozone = null,
	logger = null,
    Persistence = null,
	constants = require('../constants'),
    path = require("path"),
	appsStore = constants.database.store.apps,
    appCollectionName = constants.database.collection.app,
	fs = require('fs'),
	async = require('async');


var exporting = {

	init: function (_ozone) {
        Ozone = _ozone;
        logger = Ozone.logger;
        Ozone.Service().on('ready', 'Persistence', function(){
            Persistence = Ozone.Service("Persistence");
        });

	},
    query: function(selector, options, callback){
        Persistence.Store(appsStore).Collection(appCollectionName).query(selector, options, callback);
    },
    update: function(appId, appJson, callback){
        Persistence.Store(appsStore).Collection(appCollectionName).set(appId, appJson, callback);
    },
    create: function(appJson, callback){
        exporting.query({shortname: appJson['shortname']}, {}, function(err, res) {//if matching shortname, update existing entry
            if (err) {
                return callback(err);
            }
            if (res.length > 0) {
                exporting.update(res[0]._id, appJson, callback);
            } else {
                Persistence.Store(appsStore).Collection(appCollectionName).set(null, appJson, callback);
            }
        });
    },
    import: function(data, callback, path){
        var importReport = { successful: 0, failed: 0 };
        if(!data){
            return callback(importReport);
        }
        async.parallel(data.map(function(app){
            return function(callback){
                app.images = {};
                if(path){
                    async.parallel([
                    function(cb) {
                        if (app.icon) {
                            _persistImage(path, app.icon, function (id) {
                                app.images.iconId = id;
                                cb();
                            });
                        } else {
                            cb();
                        }
                    }, function(cb) {
                            if (app.smallBanner) {
                                _persistImage(path, app.smallBanner, function (id) {
                                    app.images.smallBannerId = id;
                                    cb();
                                });
                            } else {
                                cb();
                            }
                        }, function(cb) {
                            if (app.featuredBanner) {
                                _persistImage(path, app.featuredBanner, function (id) {
                                    app.images.featuredBannerId = id;
                                    cb();
                                });
                            } else {
                                cb();
                            }
                        }, function(cb){
                            app.images.screenshots = []
                            if(app.screenshot) {//TODO: UPDATE TO SUPPORT ARRAYS
                                if(Ozone.Utils.isArray(app.screenshot)){
                                    var queue = Ozone.Utils.clone(app.screenshot);
                                    if(queue.length === 0){
                                        cb();
                                    } else {
                                        var addScreenshot = function(screenshot) {
                                            _persistImage(path, screenshot, function (id) {
                                                app.images.screenshots.push(id);
                                                if(queue.length === 0){
                                                    cb();
                                                } else {
                                                    addScreenshot(queue.shift());
                                                }
                                            });
                                        }
                                        addScreenshot(queue.shift);
                                    }
                                } else {
                                    _persistImage(path, app.screenshot, function(id){
                                        app.images.screenshots.push(id);
                                        cb();
                                    });
                                }
                            } else {
                                cb();
                            }
                        }
                    ],function(){
                        exporting.create(app, function (err) {//will update if app currently exists with same shortname
                            if (err) {
                                importReport.failed++;
                                return callback();
                            }
                            importReport.successful++;
                            callback();
                        });
                    });
                } else {
                    exporting.create(app, function (err) {//will update if app currently exists with same shortname
                        if (err) {
                            importReport.failed++;
                            return callback();
                        }
                        importReport.successful++;
                        callback();
                    });
                }
            }
        }), function(){
            callback(importReport);
        });
    },
	export: function (callback) {
		Ozone.Service("Persistence").Store(appsStore).Collection(appCollectionName).query({ }, { }, function (err, result) {
			callback.apply(this, [result]);
		});
	}
};

var _persistImage = function (tempPath, p, callback) {
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

module.exports = exporting;