/**
 * 
 *
 * @module directivesModule
 * @submodule NgConfirmClickModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive: 
 *
 * Usage: ```<[element] ng-confirm-click="[String]"></[element]>```
 *
 * @class NgConfirmClickDirective
 * @static
 */ 

/**
 * @class NgConfirmClickDirective
 * @constructor
 */
var NgConfirmClickDirective = [function() {
    function link(scope, element, attr) {
        var msg = attr.ngConfirmClick || "Are you sure?";
        var clickAction = attr.confirmedClick;
        element.bind('click', function (event) {
            if(window.confirm(msg)) {
                scope.$eval(clickAction);
            }
        });
    }
    return {
        link: link
    }
}];

directivesModule.directive('ngConfirmClick', NgConfirmClickDirective);
