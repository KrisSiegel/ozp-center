'use strict';

directivesModule.directive('formValidationWatcher', function($rootScope) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            tabPage: '@',
            formValidState: '='
        },
        link: function(scope, element, attrs, ctrl) {
            var watchFunction = function(value) {
                console.log('Tab page ' + scope.tabPage + ': formValidState = ' + value);
                $rootScope.$broadcast('formValidState', {
                    tabPage: scope.tabPage,
                    valid: value
                });
            };
            scope.$watch('formValidState', watchFunction);
        }
    };
});