/**
 * 
 *
 * @module directivesModule
 * @submodule NgConfirmClickModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive: Adds a confirmation dialog to a button element.
 * 
 *
 * Usage: ```<[element] ng-confirm-click="[String]" confirmed-click="[Function]()"></[element]>```
 *
 * The Function in the confirmed-click attribute is actually a function call expression such as "save()"
 *
 * @class NgConfirmClickDirective
 * @static
 */ 

/**
 * @class NgConfirmClickDirective
 * @constructor
 */

/**
 * Message text for confirmation dialog; defaults to "Are you sure?" if empty.
 *
 * _**(static 1-way binding)**_
 *
 * @attribute {String} ng-confirm-click
 * @optional
 */

/**
 * Method called only if user selects Confirm/OK in confirmation dialog
 *
 * _**(function call expression, must exist in parent scope)**_
 *
 * @attribute {Function} confirmed-click
 * @required
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
