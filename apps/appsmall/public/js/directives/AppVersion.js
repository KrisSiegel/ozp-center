/**
 * 
 *
 * @module directivesModule
 * @submodule AppVersionModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * Assigns version number passed in to the DOM node text.
 * @class AppVersionDirective
 * @deprecated
 * @static
 */ 

/**
 * @class AppVersionDirective
 * @constructor
 * @param {Number} version
 */
var AppVersionDirective = ['version', function(version) {
    return function(scope, elm, attrs) {
        elm.text(version);
    };
}];

directivesModule.directive('appVersion', AppVersionDirective);
