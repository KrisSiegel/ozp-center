/**
	@module Ozone
	@class Ozone
*/
Ozone.extend(function () {
	return {
		/**
			In order to provide an API with little to no dependencies on another libraries a dedicated
			and custom ajax method was created that's very similar to the one found within jQuery in interface.
			It provides several defaults including redirection to a login page should a mock security service be used.

			The object passed in can contain the following properties:

			method -> the HTTP verb to use
			url -> the URL to use
			retries -> the number of times a retry should be attempted before giving up
			data -> the data to send
			type -> the data of the data being sent; defaults to json
			context -> the execution context if necessary
			query -> a set of keys and values to be turned into a query string
			timeout -> the timeout value
			allowCaching -> boolean specified whether caching is okay or not. Cache busting is employed when false
			withCredentials -> calls should contain credentials or not
			success -> a callback that returns the response upon success
			progress -> a callback that gets executed as progress occurs
			error -> a callback that returns the error upon failure
			failure -> an alias to error

			Example:
			Ozone.ajax({
				url: "http://localhost:3000/api/helloWorld",
				method: "GET",
				timeout: 2000,
				withCredentials: true,
				type: "json",
				context: this,
				data: { text: "Hello, World!" },
				success: function (status, response) { },
				error: function (status, response) { },
				failure: function (status, response) { }
			});

			@method ajax
			@param {Object} options a complex object that contains various options outlined in the function description
		*/
		ajax: function (options) {
			if (options === undefined || options.method === undefined || options.url === undefined) {
				return;
			}
            var numTries = 0,
                maxTries = (typeof options.retries == 'number') ? options.retries : 3;
			try {
				var xhr = new XMLHttpRequest();

				xhr.onreadystatechange = function () {
                    var url;
					if (xhr.readyState === 4) {
						if (xhr.status === 200 || xhr.status === 201) {
							if (options.success !== undefined) {
								options.success.apply((options.context || this), [xhr.status, xhr.response]);
							}
						} else if (xhr.status === 401) {
							if (Ozone.config().getClientProperty("canLogin") === true) {
								location.href = Ozone.utils.murl("hudUrl", '/login', "");
							} else {
								location.href = Ozone.utils.murl("hudUrl", '/unauthorized', "");
							}
						} else if (xhr.status === 403) {
							alert("Unauthorized to conduct requested action!");
                        } else {
                            Ozone.logger.warn("Ozone.ajax: status is " + xhr.status);
                            if (xhr.status == 0 && (options.method == 'GET' || options.method == 'OPTIONS') && numTries++ < maxTries) {
                                url = createUrl();
                                Ozone.logger.info("re-attempting ajax request to " + url);
                                console.log("this is attempt #" + (numTries + 1));
				                xhr.open(options.method, url);
                                if (Ozone.utils.isObject(options.data) || Ozone.utils.isArray(options.data)) {
					                xhr.setRequestHeader("Content-Type", "application/json");
					                xhr.send(JSON.stringify(options.data));
				                } else {
					                xhr.send(options.data);
				                }
                            } else {
							    if (options.error !== undefined || options.failure !== undefined) {
								    (options.error || options.failure).apply((options.context || this), [xhr.status, xhr.response]);
							    }
                            }
						}
					}
				};

				if (options.progress !== undefined) {
					xhr.addEventListener("progress", options.progress);
				}

				xhr.withCredentials = (options.withCredentials !== undefined) ? options.withCredentials : true;

				var query = [];
				if (options.query !== undefined) {
					for (var key in options.query) {
						if (options.query.hasOwnProperty(key)) {
							var opt = options.query[key];
							if (!Ozone.utils.isArray(opt)) {
								opt = [opt];
							}
							for (var i = 0; i < opt.length; ++i) {
								query.push(key + "=" + options.query[key]);
							}
						}
					}
				}

                var queryString = ((query.length > 0) ? "&" + query.join("&") : "");
                function createUrl () {
                    var url = options.url;
                    if (options.allowCaching !== true) {
                        url = url + "?=_" + (new Date().getTime());
                    }
                    url = url + queryString;
                    return url;
                }
				xhr.open(options.method, createUrl());
				xhr.timeout = (options.timeout !== undefined) ? options.timeout : 2000;
				xhr.responseType = (options.type !== undefined) ? options.type : "json";

				if (Ozone.utils.isObject(options.data) || Ozone.utils.isArray(options.data)) {
					xhr.setRequestHeader("Content-Type", "application/json");
					xhr.send(JSON.stringify(options.data));
				} else {
					xhr.send(options.data);
				}
			} catch (ex) {
				if (options.error !== undefined || options.failure !== undefined) {
					(options.error || options.failure).apply((options.context || this), [ex]);
				}
			}
		}
	};
}());
