/**
 * 
 *
 * @module directivesModule
 * @submodule SetModalDimensionsModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive: 
 *
 * Usage: ```<[element] set-modal-dimensions modal-height="[Int]" modal-width="[Int]"></[element]>```
 *
 * @class SetModalDimensionsDirective
 * @static
 */ 

/**
 * @class SetModalDimensionsDirective
 * @constructor
 * @param $timeout {Function} Angular wrapper for window.setTimeout - [API Documentation](https://docs.angularjs.org/api/ng/service/$timeout) 
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
