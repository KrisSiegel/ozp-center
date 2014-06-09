(function () {
	xtagger.ready(function () {
		xtag.register("ozone-notifications", {
			lifecycle: {
				created: function() {
					this.appendChild(xtagger.getImport("ozone-notifications").cloneNode(true));
					notifications.init();
				}
			}
		});
	}, this);

	var notifications = (function () {
		
		return {
			init: function () {
				pubsub.subscribe("navigate", function (hash) {
					notifications.navigate(hash);
				});
				notifications.navigate(window.location.hash);

				document.getElementById("ozone-notifications-close").addEventListener("click", function (event) {
					if (event.preventDefault) {
						event.preventDefault();
					};

					pubsub.publish("showApp");

					return false;
				}, false);
			},
			navigate: function (hash) {
				if (hash !== undefined && hash.indexOf("#Notifications/") !== -1) {
					notifications.showGui();
				} else {
					notifications.hideGui();
				}
			},
			hideGui: function () {
				document.getElementById("ozone-notifications").style.display = "none";
			},
			showGui: function () {
				pubsub.publish("showMask");
				document.getElementById("ozone-notifications").style.display = "block";
			}
		};
	}());
}());