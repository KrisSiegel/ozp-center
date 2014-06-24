Ozone.extend(function () {
	return {
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
