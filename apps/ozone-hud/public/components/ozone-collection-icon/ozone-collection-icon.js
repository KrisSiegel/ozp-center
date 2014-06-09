(function () {

	var imgPath = Ozone.Service("Persistence").Store("apps").Drive("images").getDrivePath();

	microXTag.register("ozone-collection-icon", "collection-icon-tmpl", {
		lifecycle: {
			created: function () {
            }
        },
        methods: {
            setApps: function(newApps) {
                console.log("collection-icon.setApps");
                console.dir(newApps);
                // length of newApps should be < 6
                this.xtag.apps = newApps;
                this.render();
            },
            render: function () {
                var $row1 = $(this.el).find(".row1"),
                    $row2 = $(this.el).find(".row2");
                $row1.empty();
                $row2.empty();
                for (var i = 0; i < 6 && i < this.xtag.apps.length; i++) {
                    (i < 3 ? $row1 : $row2).append($('<img src="' + imgPath +  this.xtag.apps[i].images.iconId + '">'));
                }
                var sizePrefix = 'folder-icon-size';
                var $img = $(this.el).find('img');
                $img.removeClass($.map([1,2,3,4], function (num) {
                    return sizePrefix + num;
                }).join(' '))
                    .addClass(sizePrefix + (i <= 3 ? i : 4));
            }
        }
    })
})();
//@ sourceURL=ozone-collection-icon.js
