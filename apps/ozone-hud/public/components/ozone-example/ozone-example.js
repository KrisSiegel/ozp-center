(function () {
    microXTag.register("ozone-example", "ozone-example-tmpl", {
            lifecycle: {
                created: function() {
                    component.init();
                }
            }
    });

    microXTag.ready(function () {
        microXTag.standUpTags(document.getElementsByTagName('ozone-example'));
    });

    var component = (function () {
        return {
            init: function () {
                pubsub.subscribe("navigate", function (hash) {
                    component.navigate(hash);
                });
            },
            navigate: function (hash) {
                if (hash !== undefined && hash.indexOf("#Example/") !== -1) {
                    component.showGui();
                } else {
                    component.hideGui();
                }
            },
            showGui: function () {
                var gui = document.getElementById("ozone-example-block");
                if (!Ozone.utils.isUndefinedOrNull(gui)) {
                    gui.style.display = "block";
                    //document.getElementById("ozone-example-block").style.display = "block";
                }
            },
            hideGui: function () {
                var gui = document.getElementById("ozone-example-block");
                if (!Ozone.utils.isUndefinedOrNull(gui)) {
                    gui.style.display = "none";
                }
            }
        };
    }());
}());
