/**
 * 
 *
 * @module directivesModule
 * @submodule MenuTabsIndicatorModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * @class MenuTabsIndicatorDirective
 * @static
 */ 

/**
 * @class MenuTabsIndicatorDirective
 * @constructor
 */
var MenuTabsIndicatorDirective = [function() {
    // validation state tracker for all tab indicators

    return {
        restrict: 'E',
        replace: true,
        template: '<span class="menu-tabs-indicator"></span>',
        scope: {
            tabPage: '@',
            validationState: '='
        },
        link: function(scope, element, attrs, ctrl) {
            var changeValidationState = function() {
                if (scope.validationState === true) {
                    $(element).addClass('tab-complete').removeClass('tab-incomplete');
                }
                else if (scope.validationState === false) {
                    $(element).addClass('tab-incomplete').removeClass('tab-complete');
                }
                else {
                    $(element).removeClass('tab-complete').removeClass('tab-incomplete');
                }
            }
            scope.$watch('validationState', changeValidationState)
        }
    };
}];

directivesModule.directive('menuTabsIndicator', MenuTabsIndicatorDirective);
