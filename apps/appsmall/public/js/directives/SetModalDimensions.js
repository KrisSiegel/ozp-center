/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI. SetModalDimensionsModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive: Set dimensions of Bootstrap modal after it has been loaded.
 *
 * Usage: ```<[element] set-modal-dimensions modal-height="[Number]" modal-width="[Number]"></[element]>```
 *
 * @class AppsMallUI. SetModalDimensionsDirective
 * @static
 */ 

/**
 * @class AppsMallUI. SetModalDimensionsDirective
 * @constructor
 * @param $timeout {Function} Angular wrapper for window.setTimeout - [API Documentation](https://docs.angularjs.org/api/ng/service/$timeout) 
 */

/**
 * Width value that modal will get resized to when loaded
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding)**_
 *
 * @attribute {Number} modal-width
 * @required
 */

/**
 * Height value that modal will get resized to when loaded
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 2-way binding)**_
 *
 * @attribute {Number} modal-height
 * @required
 */

var SetModalDimensionsDirective = ['$timeout', function($timeout) {
    function link(scope, element, attrs){
        $timeout(function() {
            $(element).find('.modal-image').css('height', scope.modalHeight).css('width', scope.modalWidth);
            $(element).closest('.modal.fade.in').css('height', scope.modalHeight).css('width', scope.modalWidth).css('max-height', '100%').css('max-width', '100%');
        }, 250);
    }

    return {
        scope: {
            modalHeight: "=",
            modalWidth: "="
        },
        restrict: 'A',
        link: link
    };
}];

directivesModule.directive('setModalDimensions', SetModalDimensionsDirective);
