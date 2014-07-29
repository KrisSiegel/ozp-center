(function () {
	var selectedApp;
	var appLookup;
	var shortnames = {},
	    appNames = {},
	    persona = null;
		microXTag.register("ozone-apps-appinfo", "appinfo-tmpl", {
			lifecycle: {
				created: function () {
					appinfo.init();
                    var thing = microXTag.query(this, '.application-info');
					this.xtag.componentElement = thing[0];
				},
				inserted: function () {
					if (this.xtag.isFolder) {
						var $bookmark = $(this.getElement()).find('.icon-bookmark');
						$bookmark.hide();
					} else {
						this.setupFavorites();
					};
                    $(this.getElement()).on('click', 'a', function (e) {
					    if (e.preventDefault) {
						    e.preventDefault();
					    };
                        var $appInfoEl = $(e.currentTarget).closest('ozone-apps-appinfo');
					    var appinfo = microXTag.getMxtFromElement($appInfoEl[0]);
					    if (appinfo.xtag.isFolder == true) {
						    appinfo.showFolder();
					    } else {
						    Ozone.Service("Apps").launchAppByShortname(appinfo.xtag.shortname, function (app) {
                                // Get updated persona
                                Ozone.Service("Personas").persona.getCurrent(function (_persona) {
                                    if (!Ozone.utils.isUndefinedOrNull(_persona.getId())) {
                                        persona = _persona;
                                    } else {
                                        Ozone.logger.warn("Persona not retrieved from server");
                                    }
                                });
                            });
					    }
				    });
				}
			},
			methods: {
				init: function (appSource, appsShare) {
					this.setAttribute("name", appSource.name);
					this.setAttribute("shortname", appSource.shortname);
					if (appSource.images !== undefined && appSource.images.smallBannerId !== undefined) {
						this.setAttribute("banner-img", appsShare.imgPath + appSource.images.smallBannerId);
					} else {
						this.setAttribute("banner-img", Ozone.utils.murl("hudUrl", "/assets/images/banner-sml-not-available-hires.png", true));
					}

					if (appSource.images !== undefined && appSource.images.iconId !== undefined) {
						this.setAttribute("drag-icon", appsShare.imgPath + appSource.images.iconId);
					} else {
						this.setAttribute("drag-icon", Ozone.utils.murl("hudUrl", "/assets/images/banner-sml-not-available-hires.png", true));
					}
					persona = appsShare.persona;
					appLookup = appsShare.appLookup;
				},
				setupFavorites: function() {
					var shortname = this.xtag.shortname;

					// set the bookmark checkbox "id" & label "for" to be the shortname, to detect the clicks correctly.
					var checkbox = $(this.el).find('input[type="checkbox"]')[0];
					checkbox.setAttribute("id", shortname);

                    // Found this code getting called twice, so writing it
                    // this way will avoid calling setAttribute on 'undefined'
					var label = $(this.el).find('label[class="favorite-toggle"]')
                        .attr("for", shortname);

					var favorites = persona.getFavoriteApps();

					// display the correct status for this bookmark (checked/unchecked) using value from database.
					if (favorites !== undefined && favorites.indexOf(shortname) > -1) {
						checkbox.checked = true;
					} else {
						checkbox.removeAttribute("checked");
					}

					// set up the onclick action for the bookmark (add/remove favorite)
					$(label).unbind("click");
					$(label).bind("click", function() {
						if ($(label).hasClass('noclick')) {
       						 $(label).removeClass('noclick');
					    }else {
							if (Ozone.utils.isUndefinedOrNull(persona.getUsername())) {
								location.href = Ozone.utils.murl("hudUrl", '/unauthorized', true);
							} else {
								if (checkbox.checked === true) {
									persona.removeFavoriteApp(shortname, function(favorites) {
				                    	Ozone.logger.debug("removeFavoriteApp() for current user, favorites: " + favorites);
				                    });
								} else {
									persona.addFavoriteApp(shortname, function(favorites) {
				                    	Ozone.logger.debug("addFavoriteApp() for current user, favorites: " + favorites);
				                    });
								}
							}
						}
					});
				},
				makeDraggable: function () {
					var self = this;
					$(this.xtag.componentElement).draggable({
						cursor: "move",
						start: function (event, ui) {
							selectedApp = self;
							var label = $(selectedApp.xtag.componentElement).find('label[class="favorite-toggle"]');
							 $(label).addClass('noclick');
						},
						revert: true,
						/**
						 // The helper gets a weird offset, and the
						 // cursorAt property only makes things worse
						cursorAt: { left: 120, top: 150 },
						helper: function () {
							return $('<div class="drag-helper"><img src="' + thisAppInfo.getAttribute('drag-icon') + '">' + name + '</div>');
						},
						*/
						zIndex: 1500
					});
				},
				makeDroppable: function () {
					var self = this;
					$(this.xtag.componentElement).droppable({
						hoverClass: 'app-drop-ready',
						drop: function (event, ui) {
							var dropFolder,
							    $draggable = $(selectedApp.xtag.componentElement);
							if (self.xtag.isFolder) {
								dropFolder = self;
							} else {
								dropFolder = self.createFolder();
								self.getElement().parentNode.insertBefore(dropFolder.getElement(), self.getElement());
                                dropFolder.onInsert();
								dropFolder.makeDroppable();
								dropFolder.xtag.collection.addApp(self);
								dropFolder.xtag.collection.editName();
							};

							// showFolder needs to be called first in
							// order for the draggable.disable to take
							// effect, for some reason.
							dropFolder.showFolder();
							dropFolder.xtag.collection.addApp(selectedApp);
						}
					});
				},
				setAsFolder: function () {
					this.xtag.isFolder = true;
					this.addClass('ozone-app-collection-icon');
					this.xtag.collection = microXTag.getComponent("ozone-collection");
					this.xtag.collection.setLauncher(this);
					//this.setAttribute("banner-img", Ozone.utils.murl("hudUrl", "/assets/images/banner-sml-folder-hires.png", true));
                    var $collIcon = $('<ozone-collection-icon>');
                    $(this.el).find('img').replaceWith($collIcon);
                    this.xtag.collection.setIcon(microXTag.standUpTag($collIcon[0]));
				},
				setShortName: function (newName) {
					var oldName = this.xtag.shortname;
					if (oldName == newName) return;
					if (newName in shortnames) {
						console.log("Short name already present: " + newName);
						throw "Short name conflict";
					};
					this.xtag.shortname = newName;
					delete shortnames[oldName];
					shortnames[newName] = 1;
					this.xtag.shortname = newName;
				},
				createFolder: function () {
					var folder = microXTag.getComponent("ozone-apps-appinfo");
					folder.setAsFolder();
					folder.setAttribute("name", "New Folder");
					//folder.setAttribute("shortname", "newfolder");
					return folder;
				},
				showFolder: function () {
					this.xtag.collection.appendTo(document.body);
				},
				saveCollection: function () {
					var self = this;
					var collElement = this.xtag.collection;
					var collApps = collElement.getApps();
					if (collApps.length == 0) {
						function removeCollection () {
                            var el = self.getElement();
							delete shortnames[self.xtag.shortname];
							delete appNames[self.xtag.name];
							el.parentNode.removeChild(el);

						};
						if (self.xtag.collectionId) {
							persona.removeCollection(self.xtag.collectionId, removeCollection);

						} else {
							removeCollection();
						}
						return;
					}

					var myName = this.xtag.name;
					function callback(collections) {
						console.dir(collections);
						var collLookup = {};
						for (var i = 0; i < collections.length; i++) {
							var label = collections[i].label;
							collLookup[label] = collections[i];
						};
						var collItem = collLookup[myName];
						self.xtag.collectionId = collItem.id;
						appLookup[collItem.id] = {
							appinfo: self
						};
					};
					var colUpdate = {
						label: myName,
						apps: collApps
					};
                    Ozone.Service("Personas").persona.getCurrent(function (_persona) {
                        if (!Ozone.utils.isUndefinedOrNull(_persona.getId())) {
                            persona = _persona;
                        } else {
                            Ozone.logger.warn("Persona not retrieved from server");
                        }

					    if (typeof self.xtag.collectionId == 'undefined') {
						    persona.setCollection(colUpdate, callback);
					    } else {
						    persona.setCollection(self.xtag.collectionId, colUpdate, callback);
					    }
                    });
				},
				showDeleteButton: function () {
					$(this.el).find('button').addClass('collection-remove');
				},
				hideDeleteButton: function () {
					$(this.el).find('button').removeClass('collection-remove');
				},
				getParentCollection: function () {
					return this.parentNode;
				},
                getAppSource: function (optName) {
                    if (arguments.length == 0) {
                        optName = this.xtag.shortname;
                    }
                    return appLookup[optName];
                }
			},
			accessors: {
				shortname: {
					attribute: { name: "shortname" },
					get: function () {
						return this.xtag.shortname;
					},
					set: function (value) {
						this.setShortName(value);
					}
				},
				bannerImg: {
					attribute: { name: "banner-img" },
					set: function (img) {
						this.getElementsByTagName("img")[0].setAttribute("src", img);
					}
				},
				name: {
					attribute: { name: "name" },
					get: function () {
						return this.xtag.name;
					},
					set: function (newName) {
						if (newName == "New Folder") {
							for (var i = 1; newName in appNames; i++) {
								newName = "New Folder" + i;
							}
						};
						if (newName === null) {
							alert("item name is null");
						}
						var shortname = newName.replace(/[ \t]/g, '');
						this.setShortName(shortname);
						delete appNames[this.xtag.name];
						appNames[newName] = 1;
						this.xtag.name = newName;
						var h1 = this.getElementsByTagName("h1")[0];
						if (this.xtag.collection) {
							this.xtag.collection.setAttribute('name', newName);
						};
						if (h1.childNodes.length > 0) {
							h1.removeChild(h1.childNodes[0]);
						};
						h1.appendChild(document.createTextNode(newName || ""));
					}

				}
			},
			events: {
				'click:delegate(a)': 0
			}
		});

	var appinfo = (function () {
		return {
			init: function () {
			}
		};
	}());
}());
//@ sourceURL=ozone-apps-appinfo.js
