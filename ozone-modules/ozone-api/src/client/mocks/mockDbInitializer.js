Ozone.extend(function () {

    var pack = {
      "name": "OzoneAppsMallTest",
      "version": "2.0.0",
      "clientApiPaths": [
        "node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js",
        "ozone-modules/ozone-api/src/main.js",
        "ozone-modules/ozone-api/src/common/utils.js",
        "ozone-modules/ozone-api/src/client/utils.js",
        "ozone-modules/ozone-api/src/common/config.js",
        "ozone-modules/ozone-api/src/common/logger.js",
        "ozone-modules/ozone-api/src/common/service.js",
        "ozone-modules/ozone-api/src/client/ajax.js",
        "ozone-modules/ozone-api/src/client/services/*.js",
        "ozone-modules/ozone-api/src/client/legacy/*.js"
      ],
      "clientMockApiPaths": [
        "node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js",
        "ozone-modules/ozone-api/src/main.js",
        "ozone-modules/ozone-api/src/common/utils.js",
        "ozone-modules/ozone-api/src/client/utils.js",
        "ozone-modules/ozone-api/src/common/config.js",
        "ozone-modules/ozone-api/src/common/logger.js",
        "ozone-modules/ozone-api/src/common/service.js",
        "ozone-modules/ozone-api/src/client/mocks/fixtures/*.js",
        "ozone-modules/ozone-api/src/client/mocks/*.js",
        "ozone-modules/ozone-api/src/client/legacy/*.js"
      ],
      "serverApiPaths": [
        "ozone-modules/ozone-api/src/main.js",
        "ozone-modules/ozone-api/src/common/utils.js",
        "ozone-modules/ozone-api/src/common/config.js",
        "ozone-modules/ozone-api/src/common/logger.js",
        "ozone-modules/ozone-api/src/common/service.js",
        "ozone-modules/ozone-api/src/server/*.js",
        "ozone-modules/ozone-api/src/module.exports.js"
      ],
        "hudComponentPaths": [
        "components/ozone-bar/ozone-bar.html",
        "components/ozone-mask/ozone-mask.html",
        "components/ozone-app/ozone-app.html",
        "components/ozone-apps/ozone-apps.html",
        "components/ozone-example/ozone-example.html",
        "components/ozone-apps-grid/ozone-apps-grid.html",
        "components/ozone-apps-appinfo/ozone-apps-appinfo.html",
        "components/ozone-collection/ozone-collection.html",
        "components/ozone-persona-permissions/ozone-persona-permissions.html"
      ],
      "appsMallIncludes": [
        "js/AppsMall.js",
        "js/Bind.js",
        "js/common.js",
        "js/directives/AmlApp.js",
        "js/directives/AmlNavLinks.js",
        "js/directives/AppBadges.js",
        "js/directives/AppDraggable.js",
        "js/directives/AppDroppable.js",
        "js/directives/AppVersion.js",
        "js/directives/AppsMallSearchBar.js",
        "js/directives/AutoformatPhoneNumber.js",
        "js/directives/ChosenDropdown.js",
        "js/directives/ChosenDropdownActiveText.js",
        "js/directives/DateDropdowns.js",
        "js/directives/DynamicCarousel.js",
        "js/directives/EditToggle.js",
        "js/directives/ExpandCollapseButton.js",
        "js/directives/FadeShow.js",
        "js/directives/FileUpload.js",
        "js/directives/FileUploadArray.js",
        "js/directives/FormValidationWatcher.js",
        "js/directives/HelpOverlay.js",
        "js/directives/InteractiveAppBadges.js",
        "js/directives/InteractiveStarRating.js",
        "js/directives/MarkdownTextArea.js",
        "js/directives/MenuTabsIndicator.js",
        "js/directives/NgConfirmClick.js",
        "js/directives/NgValidFunc",
        "js/directives/RatingCountBar.js",
        "js/directives/Resizing.js",
        "js/directives/ResultClick.js",
        "js/directives/SetModalDimensions.js",
        "js/directives/SlideToggle.js",
        "js/directives/Slideable.js",
        "js/directives/StarRating.js",
        "js/directives/StatusMessage.js",
        "js/directives/TrendRating.js",
        "js/filters.js",
        "js/services/App.js",
        "js/services/AppOrComponent.js",
        "js/services/AppWorkflow.js",
        "js/services/Component.js",
        "js/services/Dropdown.js",
        "js/services/FileUpload.js",
        "js/services/OzoneCommon.js",
        "js/services/Persona.js",
        "js/services/Review.js",
        "js/services/Search.js",
        "js/services/Tag.js",
        "js/services/AppSelectionMessage.js",
        "js/controllers/AdminAppController.js",
        "js/controllers/AdminTopicsController.js",
        "js/controllers/AppController.js",
        "js/controllers/AppSubmissionController.js",
        "js/controllers/TagController.js",
        "js/controllers/AppModalInstanceController.js",
        "js/controllers/ImageModalInstanceController.js"
      ]
    };

    var testConfig = {
        client: {
            absoluteBaseUrl: "/",
            forceInHud: false,
            allowComponents: true,
            protocolAgnostic: true,
            serveMinified: false,
            cacheBuster: false,
            canLogin: true,
            appsMall: {
                minifiedIncludes: [
                    "js/appsmall-includes.min.js"
                ],
                includes: pack.appsMallIncludes
            },
            hud: {
                minifiedIncludes: [
                    "hud-components.html"
                ],
                includes: pack.hudComponentPaths
            }
        },
        common: {
            logging: {
                level: "info"
            },
            urls: {
                apiBaseUrl: "/api/",
                amlUrl: "/AppsMall/",
                hudUrl: "/",
                appBuilderUrl: "/AppBuilder/",
                libUrl: "/lib/"
            }
        }
    };
    // 
    // // pre-loaded ids for all fixtures, which should change after every test in beforeEach method
    //  PersonaIds = [], preLoadedIds.Apps = [], preLoadedIds.Tags = [];
    // 
    // var loadFixtureFromService = function(services) {
    //     if (_.isObject(services.Apps) && _.isEmpty(preLoadedIds.Apps)) {
    //         console.log('Loading app data from fixture.');
    //         services.Apps.saveAll(fixtures.Apps).then(function(savedApps) {
    //             console.log('Initialized app data from fixture.');
    //             preLoadedIds.Apps = _.pluck(savedApps,  '_id');
    //         });
    //     }
    // 
    //     if (_.isObject(services.Tags) && _.isEmpty(preLoadedIds.Tags)) {
    //         console.log('Loading tag data from fixture.');
    //         services.Tags.createAllTags(fixtures.Tags).then(function(savedTags) {
    //             console.log('Initialized tag data from fixture.');
    //             preLoadedIds.Tags = _.pluck(savedTags,  '_id');
    //         });
    //     }
    // 
    //     // if (_.isObject(services.Personas) && _.isEmpty(preLoadedIds.Personas)) {
    //     //     console.log('Loading persona data from fixture.');
    //     //     services.Personas.createAllTags(fixtures.Personas).then(function(savedPersonas) {
    //     //         preLoadedIds.Personas = _.pluck(savedPersonas,  '_id');
    //     //         console.log('Initialized persona data from fixture.');
    //     //     });
    //     // }
    // }

    // load Ozone services for testing here
    Ozone.config(testConfig);

	return {
	    mockDbInitializer: {
	    }
	};
}());
