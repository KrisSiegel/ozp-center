/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.FormValidationWatcherModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: Form validation state watcher that sends Angular broadcast message when state changes
 *
 * Usage: ```<form-validation-watcher></form-validation-watcher>```
 * 
 * @class AppsMallUI.FormValidationWatcherDirective
 * @static
 */ 

/**
 * @class AppsMallUI.FormValidationWatcherDirective
 * @constructor
 * @param $rootScope {Scope} Single root scope for application, and ancestor of all other scopes - [API Documentation](https://docs.angularjs.org/api/ng/service/$rootScope) 
 */

/**
 * Form validation state.  This directive sends a broadcast when this value changes from true to false, or vice versa.
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding)**_
 *
 * @attribute {Boolean} form-valid-state
 * @optional
 */

/**
 * Name of tab page, which gets broadcast out in message when applicable
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 1-way binding)**_
 *
 * @attribute {String} tab-page
 * @optional
 */

var FormValidationWatcherDirective = ['$rootScope', function($rootScope) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            tabPage: '@',
            formValidState: '='
        },
        link: function(scope, element, attrs, ctrl) {
            var watchFunction = function(value) {
                console.log('Tab page ' + scope.tabPage + ': formValidState = ' + value);
                $rootScope.$broadcast('formValidState', {
                    tabPage: scope.tabPage,
                    valid: value
                });
            };
            scope.$watch('formValidState', watchFunction);
        }
    };
}];

directivesModule.directive('formValidationWatcher', FormValidationWatcherDirective);
