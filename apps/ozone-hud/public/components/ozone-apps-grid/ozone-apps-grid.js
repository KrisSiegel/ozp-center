(function () {
	//xtagger.ready(function () {
		microXTag.register("ozone-apps-grid", "apps-grid-tmpl", {
			lifecycle: {
				created: function() {
					//this.appendChild(xtagger.getImport("ozone-apps-grid").cloneNode(true));
                    this.xtag.data = {};
					appsGrid.init();
				}
			},
			methods: {
				clearElements: function () {
					$(this.getElement()).find('.ozone-apps-appcontainer').empty();
				},
				appendElement: function (appinfo) {
					var data = this.xtag.data;
					if (!data.container) {
						data.container = microXTag.query(this, '.ozone-apps-appcontainer')[0];
					}
                    microXTag.appendChild(data.container, appinfo);
				},
				getNumRows: function () {
					var $container = $(this.xtag.data.container);
					var gridHeight = this.getContainerAvailableHeight();
					var $appinfo = $container.find('ozone-apps-appinfo');
					var appDisplayHeight =
						$appinfo.find('.application-container').first().outerHeight();
					Ozone.logger.debug("grid height is " + gridHeight);
					Ozone.logger.debug("appHeight is " + appDisplayHeight);
					return Math.floor(gridHeight / appDisplayHeight);
				},
				getContainerAvailableHeight: function () {
					var paging = $('.page-toggle');

					// calculate the available height of container as: top of container --> start of paging
					// assume the top of container is the bottom of the switch-wrapper (header bar that has "Application Launcher", "Favorite Apps/Recently Opened")
					// since the actual top pixel of the container can change as we resize the window
					var switchWrapper = $('#switch-wrapper');
					var switchWrapperBottom = switchWrapper.offset().top + switchWrapper.outerHeight();
					var pagingTop = paging.offset().top;
					containerAvailableHeight = pagingTop - switchWrapperBottom;
					containerAvailableHeight -= 25; // a little margin for paging dots
					//Ozone.logger.debug("containerAvailableHeight: " + containerAvailableHeight);
					return containerAvailableHeight;
				},
				addTailElements: function () {
					var data = this.xtag.data;
					// Just throw 'em all in for now, since we haven't figured
					// out how to calculate the height
					$(data.container).append(data.elementsToAdd);
				}
			}
		});
	//}, this);

	var appsGrid = (function () {

		return {
			init: function () {

				$(window).resize(function() {
					//resize just happened, pixels changed
					var firstAppInfo = $('.application-container').first();
					var grid = xtag.query(document, '#ozone-apps-main-grid')[0];
					var container = xtag.query(grid, '.ozone-apps-appcontainer')[0];
					if (grid.getContainerAvailableHeight) {
						var containerAvailableHeight = grid.getContainerAvailableHeight();
						var canFitRows = Math.floor(containerAvailableHeight / firstAppInfo.outerHeight());
						console.log("we can fit rows: " + canFitRows);

						if (canFitRows > 0) { // we always want to show at least one row of apps
							var newHeight = canFitRows * firstAppInfo.outerHeight();
							$(container).height(newHeight);
						}
					}
				});
			}
		};
	}());
}());
//@ sourceURL=ozone-apps-grid.js
