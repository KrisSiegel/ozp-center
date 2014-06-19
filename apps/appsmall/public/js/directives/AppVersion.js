/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.AppVersionModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * Assigns version number passed in to the DOM node text.
 * @class AppsMallUI.AppVersionDirective
 * @deprecated
 * @static
 */ 

/**
 * @class AppsMallUI.AppVersionDirective
 * @constructor
 * @param {Number} version
 */
var AppVersionDirective = ['version', function(version) {
    return function(scope, elm, attrs) {
        elm.text(version);
    };
}];

directivesModule.directive('appVersion', AppVersionDirective);
