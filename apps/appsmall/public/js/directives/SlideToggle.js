'use strict';

directivesModule.directive('slideToggle', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        scope: {expanded: '='},
        link: function(scope, element, attrs) {
            var isExpanded = scope.expanded || false;

            var toggleExpand = function(){
                var target = document.querySelector(attrs.slideToggle);
                if(target === null) return;
                var content = document.querySelector(attrs.slideToggle + '-wrap');
                if(content === null) return;

                if(isExpanded) {
                    //timeout needed to ensure the elements have been compiled by angular and will have the proper height
                    $timeout(function(){
                        content.style.border = '1px solid rgba(0,0,0,0)';
                        var y = content.clientHeight;
                        content.style.border = 0;
                        target.style.height = y + 'px';
                    }, 1 )
                } else {
                    target.style.height = '0px';
                }
            }

            element.bind('click', function() {
                isExpanded = !isExpanded;
                toggleExpand();
            });
            scope.$watch('expanded', function(newVal){
                isExpanded = newVal || false;
                toggleExpand();
            });
            toggleExpand();
        }
    }
}]);
