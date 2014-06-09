/**
 * 
 *
 * @module directivesModule
 * @submodule AppVersionModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * @class AppVersionDirective
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
