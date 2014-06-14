/**
 * 
 *
 * @module directivesModule
 * @submodule RequireUniqueModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML attribute directive: Performs ngModel validation check by calling function from parent scope
 *
 * Usage: ```<[element] require-unique="[Function]"></[element]>```
 *
 * @class RequireUniqueDirective
 * @static
 */ 

/**
 * @class RequireUniqueDirective
 * @constructor
 */

/**
 * Validation function from parent scope used to determine uniqueness; return value gets boolean evaluated
 *
 * _**(must exist in parent scope)**_
 *
 * @attribute {Function} require-unique
 * @required
 */

var RequireUniqueDirective = [function() {
    console.log('require unique hit');
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel){
            if(!_.isEmpty(attrs.requireUnique) && _.isFunction(scope[attrs.requireUnique])){
                scope.$watch(attrs.ngModel, function(){
                    ngModel.$setValidity('requireUnique', scope[attrs.requireUnique]())
                });
            }
        }
    }
}];

directivesModule.directive('requireUnique', RequireUniqueDirective);
