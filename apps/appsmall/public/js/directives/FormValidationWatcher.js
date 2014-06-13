/**
 * 
 *
 * @module directivesModule
 * @submodule FormValidationWatcherModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: 
 *
 * Usage: ```<form-validation-watcher></form-validation-watcher>```
 * 
 * @class FormValidationWatcherDirective
 * @static
 */ 

/**
 * @class FormValidationWatcherDirective
 * @constructor
 * @param $rootScope {Scope} Single root scope for application, and ancestor of all other scopes - [API Documentation](https://docs.angularjs.org/api/ng/service/$rootScope) 
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
