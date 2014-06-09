'use strict';

directivesModule.directive('fadeShow', function(){
    function link(scope, element, attr){
        if (scope[attr.fadeShow]){
            element.addClass('animate-fade-active');
        }
        else {
            element.addClass('animate-fade-inactive');
        }
        element.addClass('animate-fade');
        scope.$watch(attr.fadeShow, function(show){
            if (show) {
                element.removeClass('animate-fade-inactive').addClass('animate-fade-active');
            }
            else {
                element.removeClass('animate-fade-active').addClass('animate-fade-inactive');
            }
        });
    }
    return {
        link: link,
        restrict: 'A'
    }
});
