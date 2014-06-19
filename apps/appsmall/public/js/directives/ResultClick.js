/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.ResultClickModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute or class directive: Resets tabs when search results change
 *
 * Usage: ```<[element] result-click></[element]>```
 * Alternate Usage: ```<[element] class="result-click"></[element]>```
 *
 * @class AppsMallUI.ResultClickDirective
 * @static
 */ 

/**
 * @class AppsMallUI.ResultClickDirective
 * @constructor
 */

/**
 * An App object from the parent scope
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(must exist in parent scope)**_
 *
 * @attribute {Object} currentApp
 * @required
 */

/**
 * Search results from parent scope
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(must exist in parent scope)**_
 *
 * @attribute {Array} searchResults
 * @required
 */

/**
 * Function in parent tabs to reset modal
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(must exist in parent scope)**_
 *
 * @attribute {Array} resetModalTabs
 * @required
 */

var ResultClickDirective = [function() {
    return {
        link: function(scope, element, attrs) {
            scope.$watch("searchResults", function(newValue, oldValue) {
                if (scope.currentApp && scope.currentApp.name == newValue) {
                    resetModalTabs();
                    //$("div.detailed-app").modal({ backdrop: true, keyboard: true, show: true });
                }
            })
        }
    }
}];

var resetModalTabs = function() {
    $(".detailed-app-0").find(".nav-tabs").find(".active").removeClass("active");
    $(".detailed-app-0").find(".tab-content").find(".active").removeClass("active");
    $(".overview-tab, .overview-content").addClass("active");
};

directivesModule.directive('resultClick', ResultClickDirective);
