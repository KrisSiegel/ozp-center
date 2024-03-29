/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.NgConfirmClickModule
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
 * @class AppsMallUI.NgConfirmClickDirective
 * @static
 */ 

/**
 * @class AppsMallUI.NgConfirmClickDirective
 * @constructor
 */

/**
 * Message text for confirmation dialog; defaults to "Are you sure?" if empty.
 *
 * {{#crossLinkModule "AppsMallUI.AngularScope"}}{{/crossLinkModule}}: _**(1-way binding to ```attrs``` parameter) **_
 *
 * @attribute {String} ng-confirm-click
 * @optional
 */

/**
 * Method called only if user selects Confirm/OK in confirmation dialog
 *
 * {{#crossLinkModule "AppsMallUI.AngularScope"}}{{/crossLinkModule}}: _**(function call expression, must exist in parent scope)**_
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
