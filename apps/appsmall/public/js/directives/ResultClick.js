/**
 * 
 *
 * @module directivesModule
 * @submodule ResultClickModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * @class ResultClickDirective
 * @static
 */ 

/**
 * @class ResultClickDirective
 * @constructor
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
