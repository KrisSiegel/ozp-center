(function () {

	var reservedAppShortNames = {
		"AppsMall": Ozone.utils.murl("amlUrl", undefined, true),
		"AppBuilder": Ozone.utils.murl("appBuilderUrl", undefined, true)
	};

	//xtagger.ready(function () {
		microXTag.register("ozone-app", "ozone-app-tmpl", {
			lifecycle: {
				created: function() {
					//this.appendChild(xtagger.getImport("ozone-app").cloneNode(true));
				},
                inserted: function () {
					app.init();
                }
			}
		});
	//}, this);

    microXTag.ready(function () {
        microXTag.standUpTags(document.getElementsByTagName('ozone-app'));
    });

	var app = (function () {
		var currentApp = undefined;
		return {
			init: function () {
				pubsub.subscribe("navigate", function (payload) {
					app.navigated(payload);
				});
				pubsub.subscribe("showApp", function () {
					if (Ozone.utils.isUndefinedOrNull(currentApp)) {
						location.hash = "Apps/";
					} else {
						app.loadApp(currentApp);
					}
				});
				app.navigated(window.location.hash);
			},
			loadApp: function (app) {
				if (currentApp === undefined) {
					pubsub.publish("hideMask");
					setTimeout(function () {
						pubsub.publish("show-app-close");
					}, 50);
					document.getElementById("ozone-app-iframe").setAttribute("src", app.appUrl);
					currentApp = app;
				} else if (app !== undefined) {
					pubsub.publish("hideMask");
					window.location.href = Ozone.utils.murl("hudUrl", ["/#App/", app.shortname, "/"], true);
				}
			},
			navigated: function (hash) {
				if (hash !== undefined && hash.indexOf("#App/") !== -1) {
					var shortname = window.location.hash.replace("#App", "").split("/").join("");
					if (reservedAppShortNames[shortname] !== undefined) {
						// Reserved app!
						app.loadApp({
							shortname: shortname,
							appUrl: reservedAppShortNames[shortname]
						});
					} else {
						Ozone.Service("Apps").get(undefined, function (apps) {
							if (apps !== undefined && apps.length > 0) {
								for (var i = 0; i < apps.length; ++i) {
									if (shortname.indexOf(apps[i].shortname) !== -1) {
										app.loadApp(apps[i]);
										break;
									}
								}
							}
						});
					}
				} else {
					setTimeout(function () {
						if (currentApp === undefined) {
							pubsub.publish("hide-app-close");
						}
					}, 50);
				}
			}
		};
	}());

}());
//@ sourceURL=ozone-app.js
