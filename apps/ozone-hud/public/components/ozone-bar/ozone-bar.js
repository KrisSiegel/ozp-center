(function () {
	//xtagger.ready(function () {
		microXTag.register("ozone-bar", "ozone-bar-tmpl", {
			lifecycle: {
				created: function() {
					//this.appendChild(xtagger.getImport("ozone-bar").cloneNode(true));
				},
                inserted: function () {
					bar.init();
                }
			}
		});
	//}, this);

    microXTag.ready(function () {
        microXTag.standUpTags(document.getElementsByTagName('ozone-bar'));
    });

	var bar = (function () {
		var openedFocused = false;

		var states = {
			opened: "opened",
			closed: "closed",
			opening: "opening",
			closing: "closing",
			autoClosing: "autoClosing"
		};

		var currentState = states.closed;
		var autoCloseTimeout;

		var openAutoClose = function (first) {
			bar.showBar(first);
			openedFocused = false;
			currentState = states.autoClosing;
			autoCloseTimeout = setTimeout(function () {
				if (!openedFocused) {
					bar.hideBar();
				}
			}, 4500);
		};

		return {
			init: function () {
				document.getElementById("ozone-bar-right-menu-persona").style.display = "block";
				Ozone.Service("Personas").persona.getCurrent(function (persona) {
					var personaLabel = document.getElementById("ozone-bar-right-menu-username");
					while (personaLabel.childNodes[0]) {
						personaLabel.removeChild(personaLabel.childNodes[0]);
					}
					personaLabel.appendChild(document.createTextNode((persona.getUsername() || "Guest")));
					document.getElementById("ozone-bar-open").style.display = "block";
				});

				document.getElementById("AppLauncherButton").setAttribute("href", Ozone.utils.murl("hudUrl", "/#Apps/", ""));
				//
				document.getElementById("AppLauncherButton").addEventListener("click", function (event) {
					if (event.preventDefault) {
						//event.preventDefault();
					};
					if (document.getElementById("AppLauncherButton").getAttribute("class") === "active") {
						pubsub.publish("showApp");
					}
				}, false);

				document.getElementById("ozone-bar-right-menu-persona").addEventListener("click", function (event) {
					if (event.preventDefault) {
						event.preventDefault();
					}
                    if (document.getElementById("personaMenu").style.display == "block") {
                        pubsub.publish("hidePersonaMenu");
                    } else {
					    pubsub.publish("showPersonaMenu");
                    }
				}, false);

				pubsub.subscribe("showPersonaMenu", function () {
					document.getElementById("personaMenu").style.display = "block";
				});

				pubsub.subscribe("hidePersonaMenu", function () {
					document.getElementById("personaMenu").style.display = "none";
				});

				pubsub.subscribe("addToPersonaMenu", function (item) {
					var list = document.getElementById("personaMenu").querySelector(".dropdown-menu");
					var li = document.createElement("li");
					var a = document.createElement("a");
					a.appendChild(document.createTextNode(item.label));
					li.appendChild(a);
					li.addEventListener("click", function (event) {
						if (event.preventDefault) {
							event.preventDefault();
						}
						pubsub.publish(item.channel);
						pubsub.publish("hidePersonaMenu");
					});
					list.appendChild(li);
				});

				pubsub.subscribe("showBar", function () {
					bar.showBar();
				});

				pubsub.subscribe("hideBar", function () {
					bar.hideBar();
				});

				pubsub.subscribe("showMask", function () {
					bar.showBar();
					openedFocused = true;
				});

				pubsub.subscribe("hideMask", function () {
					bar.hideBar();
				});

				var setActive = function (hash) {

				};
				pubsub.subscribe("navigate", function (hash) {
					bar.navigated(hash);
				});

				openAutoClose(true);
				bar.navigated(window.location.hash);

				document.getElementById("ozone-bar-closed").addEventListener("click", function () {
					bar.showBar();
					openedFocused = true;
				}, false);

				document.getElementById("ozone-bar-closed").addEventListener("mouseover", function () {
					openAutoClose();
				}, false);

				document.getElementById("ozone-bar-open").addEventListener("click", function () {
					openedFocused = true;
				}, false);
			},
			navigated: function (hash) {
				$("#ozone-bar-open .ozone-bar-left-menu a").each(function () {
					if (hash.indexOf(this.hash) == -1) {
						$(this).removeClass('active');
					} else {
						$(this).addClass('active');
					}
				});
			},
			showBar: function (firstTime) {
				if (currentState === states.closing) {
					setTimeout(function () {
						bar.showBar(firstTime);
					}, 50);
				} else {
					if (currentState !== states.opening && currentState !== states.opened && currentState !== states.autoClosing) {
						currentState = states.opening;
						var doOpen = function () {
							animate({
								elementId: "ozone-bar-open",
								unit: "px",
								style: "marginBottom",
								startValue: -46,
								targetValue: 0,
								rate: 10,
								step: 2
							}, function () {
								currentState = states.opened;
								document.getElementById("ozone-bar-closed").style.marginBottom = "-16px";
							}).move();
						};

						if (firstTime) {
							doOpen();
						} else {
							currentState = states.closing;
							animate({
								elementId: "ozone-bar-closed",
								unit: "px",
								style: "marginBottom",
								startValue: 0,
								targetValue: -16,
								rate: 20,
								step: 2
							}, function () {
								doOpen();
							}).move();
						}
					}
				}
			},
			hideBar: function () {
				if (currentState === states.opening) {
					setTimeout(function () {
						bar.hideBar();
					}, 50);
				} else {
					if (currentState !== states.closing && currentState !== states.closed && currentState !== states.autoClosing) {
						currentState = states.closing;
						animate({
							elementId: "ozone-bar-open",
							unit: "px",
							style: "marginBottom",
							startValue: 0,
							targetValue: -46,
							rate: 10,
							step: 2
						}, function () {
							animate({
								elementId: "ozone-bar-closed",
								unit: "px",
								style: "marginBottom",
								startValue: -16,
								targetValue: 0,
								rate: 20,
								step: 2
							}, function () {
								currentState = states.closed;
							}).move();
						}).move();
					}
				}
			}
		};
	}());

}());
//@ sourceURL=ozone-bar.js
