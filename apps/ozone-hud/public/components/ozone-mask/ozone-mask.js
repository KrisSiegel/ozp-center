(function () {
	//xtagger.ready(function () {
		microXTag.register("ozone-mask", "ozone-mask-tmpl", {
			lifecycle: {
				created: function() {
					//this.appendChild(xtagger.getImport("ozone-mask").cloneNode(true));
					pubsub.subscribe("showMask", function () {
						document.getElementById("ozone-mask").style.display = "block";
					});
					pubsub.subscribe("hideMask", function () {
						var maskDisplay = document.getElementById("ozone-mask").style.display;
						if (maskDisplay !== undefined && maskDisplay.length > 0) {
							pubsub.publish("hideBar");
						}
						document.getElementById("ozone-mask").style.display = "none";
					});
				}
			}
		});

        microXTag.ready(function () {
            microXTag.standUpTag(document.getElementsByTagName("ozone-mask")[0])
        });

	//}, this);
}());
//@ sourceURL=ozone-mask.js
