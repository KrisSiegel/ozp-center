Ozone.Service("Persistence", (function () {

    // return file attribute object in this format:
    // _id: "52e17d33a7b52bc73100004b"
    // chunkSize: 262144
    // contentType: "image/jpeg"
    // filename: "IMG_0326.JPG"
    // length: 1166744
    // md5: "0a0b909ecd9ca45aad4323f51a49faa1"
    // uploadDate: "2014-01-23T20:36:03.426Z"
    var convertFileObjectToAttributes = function(fileObj) {
        if (fileObj && (fileObj instanceof File)) {
            return {
                _id: Ozone.utils.generateId(),
                chunkSize: 262144,
                contentType: fileObj.type,
                filename: fileObj.name,
                length: fileObj.size,
                md5: Ozone.utils.generateFakeHash(),
                uploadDate: (new Date()).toString()
            };
        }
        return {};
    }

    return {
        getServicePath: function () {
            return Ozone.utils.murl("apiBaseUrl", "/persistence/", true);
        },
        Store: function (store) {
            return {
                getStorePath: function () {
                    return Ozone.Service("Persistence").getServicePath() + "store/" + store + "/";
                },
                Collection: function (collection) {

                    var collectionName = 'Collections_' + collection;

                    return {
                        getCollectionPath: function () {
                            return Ozone.Service("Persistence").Store(store).getStorePath() + "collection/" + collection + "/";
                        },
                        get: function (key, callback, context) {
                            //Ozone.logger.debug("in store.collection.get, key: " + key + " callback: " + callback + " context: " + context);
                            var keys;

                            if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) { // get all
                                context = callback;
                                callback = key;
                            } else {
                                keys = key;
                                if (!Ozone.utils.isArray(key)) {
                                    keys = [key];
                                }
                            }

                            if (!Ozone.utils.isFunction(callback)) {
                                throw "No callback defined";
                            }

                            var url = Ozone.Service("Persistence").getServicePath() + "store/" + store + "/collection/" + collection + "/";
                            if (!Ozone.utils.isUndefinedOrNull(keys)) {
                                url = url + JSON.stringify(keys);
                            }
                            //Ozone.logger.debug("in store.collection.get, url: " + url + " key: " + key);

                            //---  Ozone.ajax replacement code ---//
                            for (var i = 0, len = keys.length; i < len; i++) {
                                var value = Ozone.mockDb.getSingleRecord(collectionName, keys[i]);
                                values.push(value);
                            }
                            return callback.apply((context || this), [Ozone.utils.clone(values)]);
                            //---  Ozone.ajax replacement code ---//
                        },
                        query: function (selector, options, callback, context) {
                            if (!Ozone.utils.isObject(selector)) {
                                throw "No selector defined";
                            }

                            if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) {
                                context = callback;
                                callback = options;
                            }

                            if (!Ozone.utils.isFunction(callback)) {
                                throw "No callback defined";
                            }

                            var criteria = {
                                selector: selector,
                                options: options
                            };

                            var url = Ozone.Service("Persistence").getServicePath() + "store/" + store + "/collection/" + collection + "/query/" + JSON.stringify(criteria);
                            //Ozone.logger.debug("in store.collection.query, url: " + url);

                            //---  Ozone.ajax replacement code ---//
                            // RWP TEMP: querying with selector but ignoring options, for now.
                            var queriedValues = Ozone.mockDb.query(collectionName, selector);
                            return callback.apply((context || this), [queriedValues]);
                            //---  Ozone.ajax replacement code ---//
                        },
                        set: function (key, value, callback, context) {
                            //Ozone.logger.debug("in store.collection.set, url: " + url + " key: " + JSON.stringify(key) + " value: " + JSON.stringify(value));

                            var array = [];

                            if (Ozone.utils.isUndefinedOrNull(context) && Ozone.utils.isArray(key) && !Ozone.utils.isFunction(callback)) {
                                context = callback;
                                callback = value;
                                array = array.concat(key);
                            } else {
                                var obj = {};
                                obj[key] = value;
                                array.push(obj);
                            }

                            if (!Ozone.utils.isFunction(callback)) {
                                throw "No callback defined";
                            }

                            var url = Ozone.Service("Persistence").getServicePath() + "store/" + store + "/collection/" + collection;
                            //Ozone.logger.debug("in store.collection.set, array: " + JSON.stringify(array));

                            //---  Ozone.ajax replacement code ---//
                            for (var i = 0, len = array.length; i < len; i++) {
                                var currentPair = array[i];
                                if (Ozone.utils.isObject(currentPair)) {
                                    for (var currentKey in currentPair) {
                                        if (currentPair.hasOwnProperty(currentKey)) {
                                            var currentValue = currentPair[currentKey];
                                            Ozone.mockDb.update(collectionName, currentValue, keys[i]);
                                        }
                                    }
                                }
                            }
                            var clonedValue = Ozone.utils.clone(array);
                            return callback.apply((context || this), [clonedValue]);
                            //---  Ozone.ajax replacement code ---//
                        },
                        remove: function (key, callback, context) {
                            if (Ozone.utils.isUndefinedOrNull(key)) {
                                throw "No key defined";
                            }
                            if (!Ozone.utils.isFunction(callback)) {
                                throw "No callback defined";
                            }

                            var keys = key;
                            if (!Ozone.utils.isArray(key)) {
                                keys = [key];
                            }

                            var url = Ozone.Service("Persistence").getServicePath() + "store/" + store + "/collection/" + collection + "/" + JSON.stringify(keys);
                            //Ozone.logger.debug("in store.collection.remove, url: " + url);

                            //---  Ozone.ajax replacement code ---//
                            for (var i = 0, len = keys.length; i < len; i++) {
                                var currentKey = keys[i];
                                var deleted = Ozone.mockDb.delete(collectionName, currentKey);
                                if (deleted) {
                                    deletedRecords.push(keys[i])
                                }
                            }
                            return callback.apply((context || this), [deletedRecords]);
                            //---  Ozone.ajax replacement code ---//
                        }
                    }
                },
                Drive: function (drive) {

                    var driveName = 'Drives_' + drive;

                    return {
                        getDrivePath: function (id) {
                            if (Ozone.utils.isUndefinedOrNull(id)) {
                                id = '';
                            }
                            return Ozone.Service("Persistence").Store(store).getStorePath() + "drive/" + drive + "/" + id;
                        },
                        get: function (key, callback, context) {
                            //Ozone.logger.debug("in store.drive.get, key: " + key + " callback: " + callback + " context: " + context);
                            var keys;

                            if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) { // get all
                                context = callback;
                                callback = key;
                            } else {
                                keys = key;
                                if (!Ozone.utils.isArray(key)) {
                                    keys = [key];
                                }
                            }

                            if (!Ozone.utils.isFunction(callback)) {
                                throw "No callback defined";
                            }

                            var url = Ozone.Service("Persistence").getServicePath() + "store/" + store + "/drive/" + drive + "/";
                            if (!Ozone.utils.isUndefinedOrNull(keys)) {
                                url = url + JSON.stringify(keys);
                            }

                            //---  Ozone.ajax replacement code ---//
                            for (var i = 0, len = keys.length; i < len; i++) {
                                var value = Ozone.mockDb.getSingleRecord(driveName, keys[i]);
                                values.push(value);
                            }
                            return callback.apply((context || this), [Ozone.utils.clone(values)]);
                            //---  Ozone.ajax replacement code ---//
                        },
                        set: function (key, value, callback, context) {
                            //Ozone.logger.debug("in store.drive.set, url: " + url + " key: " + JSON.stringify(key) + " value: " + JSON.stringify(value));

                            var array = []; // array of objects that have id as key, file as value.

                            if (Ozone.utils.isUndefinedOrNull(context) && Ozone.utils.isArray(key) && !Ozone.utils.isFunction(callback)) {
                                context = callback;
                                callback = value;
                                array = array.concat(key);
                            } else {
                                var obj = {};
                                obj[key] = value;
                                array.push(obj);
                            }

                            if (!Ozone.utils.isFunction(callback)) {
                                throw "No callback defined";
                            }

                            var formData = new FormData();

                            // for each object, need to set the id & file object in the formData.
                            for (var i = 0; i < array.length; i++) {
                                var obj = array[i];
                                for (var id in obj) { // obj will only have one key
                                    if (obj.hasOwnProperty(id)) {
                                        formData.append(id, obj[id]);
                                    }
                                }
                            }

                            var url = Ozone.Service("Persistence").getServicePath() + "store/" + store + "/drive/" + drive;

                            //---  Ozone.ajax replacement code ---//
                            for (var i = 0, len = array.length; i < len; i++) {
                                 var currentPair = array[i];
                                 if (Ozone.utils.isObject(currentPair)) {
                                     for (var currentKey in currentPair) {
                                         if (currentPair.hasOwnProperty(currentKey)) {
                                             var currentValue = currentPair[currentKey];
                                             var fileObjAttributes = convertFileObjectToAttributes(currentValue);
                                             var updatedRecord = Ozone.mockDb.update(driveName, fileObjAttributes, currentKey);
                                             returnValues.push(updatedRecord);
                                         }
                                     }
                                 }
                             }
                            return callback.apply((context || this), [returnValues]);
                            //---  Ozone.ajax replacement code ---//
                        },
                        remove: function (key, callback, context) {
                            if (!Ozone.utils.isFunction(callback)) {
                                throw "No callback defined";
                            }
                            if (Ozone.utils.isUndefinedOrNull(key)) {
                                throw "No key defined";
                            }

                            var keys = key;
                            if (!Ozone.utils.isArray(key)) {
                                keys = [key];
                            }

                            var url = Ozone.Service("Persistence").getServicePath() + "store/" + store + "/drive/" + drive + "/" + JSON.stringify(keys);

                            //---  Ozone.ajax replacement code ---//
                            for (var i = 0, len = keys.length; i < len; i++) {
                                var currentKey = keys[i];
                                 var deleted = Ozone.mockDb.delete(driveName, currentKey);
                                 if (deleted) {
                                     deletedRecords.push(currentKey)
                                 }
                            }
                            return callback.apply((context || this), [deletedRecords]);
                            //---  Ozone.ajax replacement code ---//
                        }
                    }
                }
            };
        }
    };
}()));
