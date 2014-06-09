Ozone.Service("Persistence", (function () {
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

							Ozone.ajax({
								method: "GET",
								url: url,
								success: function (status, response) {
									Ozone.logger.debug("store.collection.get-->success")
									callback.apply((context || this), [response]);
								},
								error: function (status, response) {
									Ozone.logger.debug("store.collection.get-->error, status: " + status)
									callback.apply((context || this), [response]);
								},
								context: (context || this)
							});
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

                            Ozone.ajax({
								method: "GET",
								url: url,
								success: function (status, response) {
									Ozone.logger.debug("store.collection.query-->success")
									callback.apply((context || this), [response]);
								},
								error: function (status, response) {
									Ozone.logger.debug("store.collection.query-->error, status: " + status)
									callback.apply((context || this), [response]);
								},
								context: (context || this)
							});

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

							Ozone.ajax({
								method: "POST",
								url: url,
								success: function (status, response) {
									Ozone.logger.debug("store.collection.set-->success")
									callback.apply((context || this), [response]);
								},
								error: function (status, response) {
									Ozone.logger.debug("store.collection.set-->error, status: " + status);
									callback.apply((context || this), [response]);
								},
								context: (context || this),
								data: array
							});
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

							Ozone.ajax({
								method: "DELETE",
								url: url,
								success: function (status, response) {
									Ozone.logger.debug("store.collection.remove-->success")
									callback.apply((context || this), [response.count]);
								},
								error: function (status, response) {
									Ozone.logger.debug("store.collection.remove-->error, status: " + status);
									callback.apply((context || this), [response]);
								},
								context: (context || this)
							});
                        }

					}
				},
				Drive: function (drive) {
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
							//Ozone.logger.debug("in store.drive.get, url: " + url + " key: " + key);

							Ozone.ajax({
								method: "GET",
								url: url,
								success: function (status, response) {
									Ozone.logger.debug("store.drive.get-->success")
									callback.apply((context || this), [response]);
								},
								error: function (status, response) {
									Ozone.logger.debug("store.drive.get-->error, status: " + status)
									callback.apply((context || this), [response]);
								},
								context: (context || this)
							});
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
                            //Ozone.logger.debug("in store.drive.set, array: " + JSON.stringify(array));

							Ozone.ajax({
								method: "POST",
								url: url,
								data: formData,
								success: function (status, response) {
									Ozone.logger.debug("store.drive.set-->success")
									callback.apply((context || this), [response]);
								},
								error: function (status, response) {
									Ozone.logger.debug("store.drive.set-->error, status: " + status);
									callback.apply((context || this), [response]);
								},
								context: (context || this)
							});
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
                            //Ozone.logger.debug("in store.drive.remove, url: " + url);

							Ozone.ajax({
								method: "DELETE",
								url: url,
								success: function (status, response) {
									Ozone.logger.debug("store.drive.remove-->success")
									callback.apply((context || this), [response]);
								},
								error: function (status, response) {
									Ozone.logger.debug("store.drive.remove-->error, status: " + status);
									callback.apply((context || this), [response]);
								},
								context: (context || this)
							});
                        }

					}
				}
			};
		}
	};
}()));
