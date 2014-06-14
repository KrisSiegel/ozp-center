/**
 * 
 *
 * @module directivesModule
 * @submodule NgValidFuncModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive: 
 *
 * Usage: ```<[element] ng-valid-func="[Function]"></[element]>```
 *
 * @class NgValidFuncDirective
 * @static
 */ 

/**
 * @class NgValidFuncDirective
 * @constructor
 */

/**
 * Function for performing form validation outside of ng-form scope.  Sets ```ng-invalid-custom``` CSS class 
 * on form control if invalid.
 *
 * _**(static 1-way binding)**_
 *
 * @attribute {Function} ng-valid-func
 * @optional
 */

var NgValidFuncDirective = [function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            ctrl.$parsers.unshift(function(viewValue) {
                if (attrs.ngValidFunc && scope[attrs.ngValidFunc] && scope[attrs.ngValidFunc](viewValue, scope, element, attrs, ctrl)) {
                    ctrl.$setValidity('custom', true);
                } else {
                    ctrl.$setValidity('custom', false);
                }
                return element.val();
            });
        }
    };
}];

// controller function based validation.  (RWP: currently not hooked into app submission page, but here just in case we need this directive in the future.)
directivesModule.directive('ngValidFunc', NgValidFuncDirective);
