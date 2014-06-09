/**
 * 
 *
 * @module directivesModule
 * @submodule RequireUniqueModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * @class RequireUniqueDirective
 * @static
 */ 

/**
 * @class RequireUniqueDirective
 * @constructor
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
