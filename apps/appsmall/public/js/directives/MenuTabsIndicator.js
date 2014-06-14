/**
 * 
 *
 * @module directivesModule
 * @submodule MenuTabsIndicatorModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: Listens for changes on a scoped boolean attribute, and changes CSS classes based on
 * validation state accordingly.
 *
 * Usage: ```<menu-tabs-indicator></menu-tabs-indicator>```
 * 
 * @class MenuTabsIndicatorDirective
 * @static
 */ 

/**
 * @class MenuTabsIndicatorDirective
 * @constructor
 */

/**
 * Validation state indicator.  If this value changes, then this element will change CSS classes from invalid
 * to valid, or vice versa.
 *
 *_**(2-way binding attribute with scoped watcher event; responds to modification)**_
 *
 * @attribute {Boolean} validation-state
 * @required
 */

/**
 * The tab page that this element watches.  Previously used for field referencing; deprecated because the 
 * watcher does all the work.
 *
 * _**(scoped to directive as 1-way binding)**_
 *
 * @attribute {Boolean} tab-page
 * @optional
 * @deprecated
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
