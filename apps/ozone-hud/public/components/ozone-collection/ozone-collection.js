(function () {
//xtagger.ready(function () {
	microXTag.register("ozone-collection", "collection-tmpl", {
		lifecycle: {
			created: function () {
				//this.appendChild(xtagger.getImport("ozone-collection").cloneNode(true));
                var self = this;
                this.xtag.dropRemovesApp = true;
                this.xtag.appMap = {};
                this.xtag.appList = [];
                $(this.el).on('click', '.ozone-collection-layover, #ozone-folder-close', function (e) {
				    self.closeSave();
			    })
                    .on('click', 'button.collection-remove', function (e) {
				        var $appinfo = $(e.target).closest('ozone-apps-appinfo');
				        self.deleteApp($appinfo[0]);
			        })
                    .on('click', 'h1.ozone-collection-name', function (e) {
	                    self.editName();
			        })
                    .on('keydown', 'input', function (e) {
                        if (e.which == 13) {
                            self.setName(e.target.value);
                            self.closeSave();
                        }
                    })
                // the order of these two droppable declarations is important.
                // If the app that's within the collection is dropped while
                // still in the collection, both of these droppable handlers
                // will be executed; therefore the first one needs to be exe-
                // cuted first to prevent the second one from removing the app
                $(this.el).find('.ozone-collection-content').droppable({
                    drop: function (event, ui) {
                        // prevent action if the app was dropped within the folder modal
                        self.xtag.dropRemovesApp = false;
                    }
                });
                // Dragging an app out of the modal will remove it from the collection
                $(this.el).find('.ozone-collection-layover').droppable({
                    drop: function (event, ui) {
                        if (self.xtag.dropRemovesApp) {
                            self.deleteApp(ui.draggable[0].parentNode.parentNode);
                        }
                        self.xtag.dropRemovesApp = true;
                    },
                    disabled: false
                });
			},
			inserted: function () {
                // When the collection is open, the user may drag an app
                // out of the folder display to remove it from the folder.
                // We don't want this to accidentally create a new folder
                // if the the app happens to be released over an app or
                // folder in the background
                $('#ozone-apps-main-grid ozone-apps-appinfo div.application-info').droppable("option", "disabled", true);
			}
		},
		methods: {
			addApp: function (appinfo) {
				var gridEl = this.getElementsByTagName('ozone-apps-grid')[0];
                var grid = microXTag.getMxtFromElement(gridEl);
				grid.appendElement(appinfo);
				appinfo.showDeleteButton();
                var appName = appinfo.getAttribute("shortname");
                console.log("adding appName " + appName + " to collection!!!");
                // addApp may be called multiple times on the same app, so avoid duplication
                if (!this.xtag.appMap[appName]) {
                    this.xtag.appList.push(appName);
                } else {
                    Ozone.logger.info(appName + " has already been added to the collection");
                };
                this.xtag.appMap[appName] = appinfo;
			},
			deleteApp: function (appinfoEl) {
                var appinfo = microXTag.getMxtFromElement(appinfoEl);
				var mainGrid = microXTag.getMxtById('ozone-apps-main-grid');
				mainGrid.appendElement(appinfo);
				appinfo.hideDeleteButton();
				$(appinfo.xtag.componentElement).draggable("enable");
                var name = appinfo.getAttribute("shortname");
                delete this.xtag.appMap[name];
                var index = this.xtag.appList.indexOf(name);
                this.xtag.appList.splice(index, 1);
			},
			getApps: function () {
				return $(this.getElement())
					.find('ozone-apps-grid ozone-apps-appinfo')
					.map(function (index, el) {
						return el.getAttribute('shortname');
					}).toArray();
			},
			setLauncher: function (appinfo) {
				this.xtag.launcher = appinfo;
			},
            setIcon: function (collIcon) {
                this.xtag.launchIcon = collIcon;
            },
            renderIcon: function () {
                var oneAppInfo;
                // Get one appinfo object, which can be used to look up others
                for (var name in this.xtag.appMap) {
                    oneAppInfo = this.xtag.appMap[name];
                    break;
                }
                var appList = [];
                for (var i = 0, len = this.xtag.appList.length; i < len && i < 7; i++) {
                    var appThing = oneAppInfo.getAppSource(this.xtag.appList[i]);
                    //console.dir(appThing);
                    appList.push(appThing.appdata);
                };
                this.xtag.launchIcon.setApps(appList);
            },
			editName: function () {
				$(this.getElement()).find('.folder-name-wrapper').addClass('ozone-folder-name-edit');
			},
			displayName: function () {
				$(this.getElement()).find('.folder-name-wrapper').removeClass('ozone-folder-name-edit');
			},
			setName: function (name) {
				this.xtag.launcher.setAttribute('name', name);
				this.displayName();
			},
			closeSave: function () {
				this.displayName();
				this.xtag.launcher.saveCollection();
                this.renderIcon();
                var el = this.getElement();
				var parent = el.parentNode;
				parent.removeChild(el);
                $('#ozone-apps-main-grid ozone-apps-appinfo div.application-info').droppable("option", "disabled", false);
			}
		},
		accessors: {
			name: {
				attribute: { name: "name" },
				set: function (value) {
					var h1 = this.getElementsByTagName('h1')[0];
					if (h1.childNodes.length > 0) {
						h1.removeChild(h1.childNodes[0]);
					};
					h1.appendChild(document.createTextNode(value || ""));
					microXTag.query(this,'input[type=text]')[0].value = value;
				}
			}
		},
		events: { // Note: micro-xtags does not, and probably will never handle these
			'click:delegate(.ozone-collection-layover)': function (e) {
				e.currentTarget.closeSave();
			},
			'click:delegate(#ozone-folder-close)': function (e) {
				e.currentTarget.closeSave();
			},
			'click:delegate(button.collection-remove)': function (e) {
				var $appinfo = $(e.target).closest('ozone-apps-appinfo');
				e.currentTarget.deleteApp($appinfo[0]);
			},
			'click:delegate(h1.ozone-collection-name)': function (e) {
				e.currentTarget.editName();
			},
			'keydown:keypass(13):delegate(input)': function (e) {
				e.currentTarget.setName(e.target.value);
			}
		}
	});
//})
})();
//@ sourceURL=ozone-collection.js
