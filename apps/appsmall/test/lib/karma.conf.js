module.exports = function(config) {
    config.set({
        basePath : '../../../..',

        files : [
            'public/lib/jquery/jquery.min.js',
            'ozone-modules/ozone-api/client-mock-api.js',
            'ozone-modules/ozone-api/src/client/mocks/mockDbInitializer.js',
            'apps/appsmall/spec/lib/jasmine-jquery.js',
            'public/lib/moment/moment.js',
            'public/lib/showdown/src/showdown.js',
            'apps/appsmall/public/js/common.js',
            'public/lib/lodash/dist/lodash.compat.js',
            'public/lib/angular/angular.js',
            'public/lib/angular-route/angular-route.js',
            'public/lib/angular-resource/angular-resource.js',
            'apps/appsmall/test/lib/angular/angular-mocks.js',
            'public/lib/angular-bootstrap/ui-bootstrap.js',
            'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
            'apps/appsmall/public/ext-lib/handlebars/handlebars.js',
            'public/lib/angular-chosen-localytics/chosen.js',
            'apps/appsmall/public/js/AppsMall.js',

            'apps/appsmall/public/js/services/App.js',
            'apps/appsmall/public/js/services/AppOrComponent.js',
            'apps/appsmall/public/js/services/AppSelectionMessage.js',
            'apps/appsmall/public/js/services/AppWorkflow.js',
            'apps/appsmall/public/js/services/Component.js',
            'apps/appsmall/public/js/services/Dropdown.js',
            'apps/appsmall/public/js/services/FileUpload.js',
            'apps/appsmall/public/js/services/OzoneCommon.js',
            'apps/appsmall/public/js/services/Persona.js',
            'apps/appsmall/public/js/services/Review.js',
            'apps/appsmall/public/js/services/Search.js',
            'apps/appsmall/public/js/services/Tag.js',

            'apps/appsmall/public/js/controllers/AdminAppController.js',
            'apps/appsmall/public/js/controllers/AdminTopicsController.js',
            'apps/appsmall/public/js/controllers/AppController.js',
            'apps/appsmall/public/js/controllers/AppModalInstanceController.js',
            'apps/appsmall/public/js/controllers/ImageModalInstanceController.js',
            'apps/appsmall/public/js/controllers/AppSubmissionController.js',
            'apps/appsmall/public/js/controllers/TagController.js',
            'apps/appsmall/public/js/controllers/TagManagerController.js',

            'apps/appsmall/public/js/filters.js',

            'apps/appsmall/public/js/directives/AmlApp.js',
            'apps/appsmall/public/js/directives/AmlNavLinks.js',
            'apps/appsmall/public/js/directives/AppBadges.js',
            'apps/appsmall/public/js/directives/AppDraggable.js',
            'apps/appsmall/public/js/directives/AppDroppable.js',
            'apps/appsmall/public/js/directives/AppVersion.js',
            'apps/appsmall/public/js/directives/AppsMallSearchBar.js',
            'apps/appsmall/public/js/directives/ChosenDropdown.js',
            'apps/appsmall/public/js/directives/ChosenDropdownActiveText.js',
            'apps/appsmall/public/js/directives/DateDropdowns.js',
            'apps/appsmall/public/js/directives/DynamicCarousel.js',
            'apps/appsmall/public/js/directives/EditToggle.js',
            'apps/appsmall/public/js/directives/ExpandCollapseButton.js',
            'apps/appsmall/public/js/directives/FadeShow.js',
            'apps/appsmall/public/js/directives/FileUpload.js',
            'apps/appsmall/public/js/directives/FileUploadArray.js',
            'apps/appsmall/public/js/directives/FormValidationWatcher.js',
            'apps/appsmall/public/js/directives/HelpOverlay.js',
            'apps/appsmall/public/js/directives/InteractiveAppBadges.js',
            'apps/appsmall/public/js/directives/InteractiveStarRating.js',
            'apps/appsmall/public/js/directives/MarkdownTextArea.js',
            'apps/appsmall/public/js/directives/MenuTabsIndicator.js',
            'apps/appsmall/public/js/directives/NgConfirmClick.js',
            'apps/appsmall/public/js/directives/NgValidFunc.js',
            'apps/appsmall/public/js/directives/RatingCountBar.js',
            'apps/appsmall/public/js/directives/Resizing.js',
            'apps/appsmall/public/js/directives/ResultClick.js',
            'apps/appsmall/public/js/directives/SetModalDimensions.js',
            'apps/appsmall/public/js/directives/SlideToggle.js',
            'apps/appsmall/public/js/directives/Slideable.js',
            'apps/appsmall/public/js/directives/StarRating.js',
            'apps/appsmall/public/js/directives/StatusMessage.js',
            'apps/appsmall/public/js/directives/TrendRating.js',

            'apps/appsmall/test/matchers.js',
            'apps/appsmall/test/controllers/**/*.js',
            'apps/appsmall/test/directives/**/*.js',
            'apps/appsmall/test/services/**/*.js'
        ],

        autoWatch : true,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        exclude: [
            'apps/appsmall/public/ext-lib/angular/angular-loader*.js',
            'apps/appsmall/public/ext-lib/angular/angular-*.min.js*'
        ],

        plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
        ],

        junitReporter : {
          outputFile: 'test_out/unit.xml',
          suite: 'unit'
        }
    });
}
