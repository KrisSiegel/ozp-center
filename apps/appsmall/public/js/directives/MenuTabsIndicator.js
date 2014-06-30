/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.MenuTabsIndicatorModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: Listens for changes on a scoped boolean attribute, and changes CSS classes based on
 * validation state accordingly.
 *
 * Usage: ```<menu-tabs-indicator></menu-tabs-indicator>```
 * 
 * @class AppsMallUI.MenuTabsIndicatorDirective
 * @static
 */ 

/**
 * @class AppsMallUI.MenuTabsIndicatorDirective
 * @constructor
 */

/**
 * Validation state indicator.  If this value changes, then this element will change CSS classes from invalid
 * to valid, or vice versa.
 *
 *{{#crossLinkModule "AppsMallUI.AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding plus scoped watcher event)**_
 *
 * @attribute {Boolean} validation-state
 * @required
 */

/**
 * The tab page that this element watches.  Previously used for field referencing; deprecated because the 
 * watcher does all the work.
 *
 * {{#crossLinkModule "AppsMallUI.AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 1-way binding)**_
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
