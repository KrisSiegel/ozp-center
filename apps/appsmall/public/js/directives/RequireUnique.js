directivesModule.directive('requireUnique', function() {
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
});