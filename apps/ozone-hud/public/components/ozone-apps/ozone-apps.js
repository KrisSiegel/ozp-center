(function () {
	//xtagger.ready(function () {
	    microXTag.register("ozone-apps", "ozone-apps-tmpl", {
			lifecycle: {
				inserted: function() {
					//this.appendChild(xtagger.getImport("ozone-apps").cloneNode(true));
					apps.init();
				}
			}
		});
	//}, this);

    microXTag.ready(function () {
        microXTag.standUpTags(document.getElementsByTagName('ozone-apps'));
    });

	var apps = (function () {
		var cachedApps;
		var appLookup = {};
		var persona = null;
		var appsPerPage = 1;
		var currentPage = 0;
		var tabs = {
			favorite: 0,
			recent: 0
		};
		var currentTab = "favorite";
		var canClose = false;
		var imgPath = null;
		var displayItems;

		function getRecentApps() {
			var recentApps = persona.getLaunchedAppsArray()
				.sort(function (a, b) {
					return (a[1] < b[1]);
				});

			return $.map(recentApps, function (el) {
				return el[0];
			});
		}

		function createAppInfo (appname) {
			var appLookupMember = appLookup[appname];
 			if (!appLookupMember) {
				Ozone.logger.warn("Data inconsistency: " + appname + " not found in list of apps.");
				return null;
			};
			var appinfo = appLookupMember.appinfo;
			var app = appLookupMember.appdata;
			if (Ozone.utils.isUndefinedOrNull(appinfo)) {
				appinfo = microXTag.getComponent("ozone-apps-appinfo");
				appinfo.init(app, {
					imgPath: imgPath,
					persona: persona,
					appLookup: appLookup
				});
				appLookupMember.appinfo = appinfo;
			}
			appinfo.makeDraggable();
			appinfo.makeDroppable();
			return appinfo;
		};

		function buildCollection(collectionData) {
			var shortname = collectionData.id;
			var appitem = appLookup[shortname];
			var appinfo;
			var newFolder;
			if (!appitem) {
				newFolder = microXTag.getComponent("ozone-apps-appinfo");
				newFolder.setAsFolder();
				newFolder.setAttribute("name", collectionData.label);
				newFolder.xtag.collectionId = collectionData.id;
				appLookup[collectionData.id] = {
					appinfo: newFolder
				}
			} else {
				newFolder = appitem.appinfo;
			};
			newFolder.makeDroppable();

			/*
			  Find appinfos in displayItems that belong in the collection;
			  pull them out of displayItems and add to the collection
			*/
			for (j = displayItems.length - 1; j >= 0; j--) {
				appinfo = displayItems[j];
				if (collectionData.apps.indexOf(appinfo.getAttribute('shortname')) > -1) {
					newFolder.xtag.collection.addApp(appinfo);
					displayItems.splice(j, 1);
				}
			};
            newFolder.xtag.collection.renderIcon();
			displayItems.unshift(newFolder);
		};

		function hasApps (arr) {
			return (!Ozone.utils.isUndefinedOrNull(arr) &&
					arr.length > 0);
		}
		function appsToRenderHere () {
			var appsToShow, tmpAppList;
			if (currentTab == "favorite") {
				appsToShow = persona.getFavoriteApps();
				if (!hasApps(appsToShow)) {
					tmpAppList = persona.getLaunchedAppsArray();
					if (hasApps(tmpAppList)) {
						$('#recent-label').trigger('click');
						return [];
					}
				};

			};
			if (currentTab == "recent") {
				appsToShow = getRecentApps();
				if (!hasApps(appsToShow)) {
					tmpAppList = persona.getFavoriteApps();
					if (hasApps(tmpAppList)) {
						$('#fav-label').trigger('click');
						return [];
					}
				}
			}
			if (!hasApps(appsToShow)) {
				apps.renderNoApps();
				return [];
			}
			return appsToShow;
		};

		function createPageLink(pageNum) {
			var a = document.createElement('a');
			a.setAttribute('href', '#Apps/' +
						   (currentTab == 'recent' ? 'Recent/' : '') + 'Page/' + pageNum);
			if (pageNum == tabs[currentTab]) {
				$(a).addClass('active');
			} else {
				$(a).removeClass('active');
			}
			return a;
		}

		return {
			init: function () {
				pubsub.subscribe("navigate", function (hash) {
					apps.navigate(hash);
				});
				pubsub.subscribe("hide-app-close", function () {
					document.getElementById("ozone-apps-close").style.display = "none";
					canClose = false;
				});
				pubsub.subscribe("show-app-close", function () {
					document.getElementById("ozone-apps-close").style.display = "block";
					canClose = true;
				});
				apps.navigate(window.location.hash);
				document.getElementById("ozone-apps-close").addEventListener("click", function (event) {
					if (event.preventDefault) {
						event.preventDefault();
					};

					pubsub.publish("showApp");

					return false;
				}, false);

				var appMallLinks = document.querySelectorAll("a.link-to-appsmall");
				for (var i = 0; i < appMallLinks.length; ++i) {
					appMallLinks[i].addEventListener("click", function (event) {
						if (event.preventDefault) {
							event.preventDefault();
						};

						Ozone.Service("Apps").launchAppByShortname("AppsMall");

						return false;
					}, false);
				}

				/*
				document.getElementById("ozone-apps-appbuilder").addEventListener("click", function (event) {
					if (event.preventDefault) {
						event.preventDefault();
					};

					Ozone.Service("Apps").launchAppByShortname("AppBuilder");

					return false;
				}, false);
				*/

				document.getElementById("app-launcher-page-left").addEventListener("click", function (event) {
					if (event.preventDefault) {
						event.preventDefault();
					};

					location.hash = "Apps/" + ((currentTab === "recent") ? "Recent/" : "") + "Page/" + (tabs[currentTab] - 1);

					return false;
				}, false);

				document.getElementById("app-launcher-page-right").addEventListener("click", function (event) {
					if (event.preventDefault) {
						event.preventDefault();
					};

					location.hash = "Apps/" + ((currentTab === "recent") ? "Recent/" : "") + "Page/" + (tabs[currentTab] + 1);

					return false;
				}, false);

				document.getElementById("fav-label").addEventListener("click", function (event) {
					if (event.preventDefault) {
						//event.preventDefault();
					};

					var navit = {
						currentTab: currentTab,
						newTab: "",
						page: ((currentTab === "") ? tabs.favorite : 0)
					}

					location.hash = "Apps/" + ("" + ((navit.page !== 0) ? "Page/" + navit.page : ""));
					currentTab = "";

					return false;
				}, false);

				document.getElementById("recent-label").addEventListener("click", function (event) {
					if (event.preventDefault) {
						//event.preventDefault();
					};

					var navit = {
						currentTab: currentTab,
						newTab: "recent",
						page: ((currentTab === "recent") ? tabs.recent : 0)
					}

					location.hash = "Apps/" + ("Recent/" + ((navit.page !== 0) ? "Page/" + navit.page : ""));
					currentTab = "recent";

					return false;
				}, false);

                $("#ozone-apps-no-apps, #ozone-apps-launcher")
                    .on("click", function (event) {
                        pubsub.publish("hidePersonaMenu");
                    });

			},
			navigate: function (hash) {
				if (hash !== undefined && hash.indexOf("#Apps/") !== -1) {
					var isRecent = (hash.indexOf("#Apps/Recent/") !== -1) ? true : false;
					var page = (hash.indexOf("/Page/") !== -1) ? Number(hash.substring(hash.indexOf("/Page/") + 6, hash.length)) : undefined;
					if (isRecent) {
						tabs.recent = (page !== undefined) ? page : 1;
						$("#recent").prop('checked', true);
					} else {
						tabs.favorite = (page !== undefined) ? page : 1;
						$("#fav").prop('checked', true);
					}
					currentTab = (isRecent) ? "recent" : "favorite";
					Ozone.logger.debug("just set currentTab to " + currentTab);
					apps.showGui();
				} else {
					apps.hideGui();
				}
				if (hash === undefined || hash.length === 0) {
					window.location.href = Ozone.utils.murl("hudUrl", "/#Apps/", false);
				}
			},
			renderLauncher: function () {

				Ozone.logger.debug("in renderlauncher, current tab is " + currentTab);

				// First, figure out what we're going to show -- recent or favorites
				var appsToShow = appsToRenderHere();
				if (!hasApps(appsToShow)) {
					// No apps on the current page, so rendering has
					// been handled a different way
					return;
				};

				// Now display whatever we're going to display
				imgPath = Ozone.Service("Persistence").Store("apps").Drive("images").getDrivePath();
				displayItems = [];
				for (var i = 0; i < appsToShow.length; ++i) {
					var appname = appsToShow[i];
					var ai = createAppInfo(appname);
                    if (ai !== null) {
					    displayItems.push(ai);
                    }
				};

				if (currentTab == "favorite") {
					var collections = persona.getCollections();
					for (var i = 0, len = collections.length; i < len; i++) {
						buildCollection(collections[i]);
					};
				};

				var pages = [];

				var fragment;
				for (j = 0; j < displayItems.length; j++ ) {
					if ((j % appsPerPage) === 0) {
						// New documentFragment for new page
						fragment = document.createDocumentFragment();
						pages.push(fragment);
					}
					fragment.appendChild(displayItems[j].getElement());
				};

				var mainGridEl = document.getElementById("ozone-apps-main-grid");
                var mainGrid = microXTag.getMxtFromElement(mainGridEl);
                if (!this._microx && !mainGrid) {
                    // Interim method for making sure the mxtElement
                    // is instantiated without having to convert this
                    // component at the same time.
                    Ozone.logger.warning("Manually instantiating main grid");
                    mainGrid = microXTag.standUpTag(mainGridEl);
                };
				mainGrid.clearElements();
                var thisPage = pages[tabs[currentTab] - 1];
				mainGrid.appendElement(thisPage);

				if (appsPerPage == 1) {
					// Due to zoom-in, we can't calculate app/grid size
					// immediately.  So we display one app initially, wait,
					// calculate the correct value for appsPerPage, and
					// re-render
					setTimeout(function () {
						var numRows = mainGrid.getNumRows();
						Ozone.logger.debug("we'll start out with %d rows", numRows);
						appsPerPage = numRows * 5;
						apps.renderLauncher();
					}, 300); // Hope appinfo size has settled down by now...
				} else {
					// Create the dots to navigate to the pages
					var $pageSelector = $('#content-app-launcher .page-toggle');
					fragment = document.createDocumentFragment();
					$pageSelector.empty();
					for (j = 0; 1 < pages.length && j < pages.length; j++) {
						fragment.appendChild(createPageLink(j + 1));
					};
					$pageSelector.append(fragment);
				};

				document.getElementById("ozone-apps-launcher").style.display = "block";
				document.getElementById("ozone-apps-no-apps").style.display = "none";
			},
			renderLauncherWhenReady: function () {
				if (cachedApps != null && persona != null) {
					apps.renderLauncher();
				} else {
					//setTimeout(this.renderLauncherWhenReady, 25);
				}
			},
			renderNoApps: function () {
				document.getElementById("ozone-apps-no-apps").style.display = "block";
				document.getElementById("ozone-apps-launcher").style.display = "none";
			},
			hideGui: function () {
				document.getElementById("ozone-apps").style.display = "none";
				delete document.onkeydown;
			},
			showGui: function () {
				pubsub.publish("showMask");
				document.onkeydown = function (event) {
					event = event || window.event;
					if (event.keyCode === 27 && canClose) {
						pubsub.publish("showApp");
					}
				};
				if (Ozone.utils.isUndefinedOrNull(cachedApps) || cachedApps.length === 0) {
					Ozone.Service("Apps").get(undefined, function (result) {
						if (!Ozone.utils.isUndefinedOrNull(result)) {
						    cachedApps = result;
						    for (var i = 0; i < cachedApps.length; i++) {
						        appLookup[cachedApps[i].shortname] = {
							        appdata: cachedApps[i]
						        }
						    };
						    apps.renderLauncherWhenReady();
						}
                    });
				} else {
					apps.renderLauncherWhenReady();
				}
				if (Ozone.utils.isUndefinedOrNull(persona)) {
					var personas = Ozone.Service("Personas");
                    function assignPersona(_persona) {
						persona = _persona;
						Ozone.logger.debug(persona);
						apps.renderLauncherWhenReady();
					}
					personas.persona.getCurrent(function (_persona) {
                        if (!_persona) {
                            Ozone.logger.warn("ozone-apps: first attempt to get persona failed");
                            // one more time, for old times' sake
                            personas.persona.getCurrent(function (_persona) {
                                if (!_persona) {
                                    Ozone.logger.error("couldn't get persona for apps");
                                }
                                assignPersona(_persona)
                            });
                        } else {
                            assignPersona(_persona);
                        }
                    });
				};

				document.getElementById("ozone-apps").style.display = "block";
			}
		};
	}());
}());
//@ sourceURL=ozone-apps.js
