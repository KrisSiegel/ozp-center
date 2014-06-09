'use strict';

directivesModule.directive('chosenDropdownActiveText', function($timeout) {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            var $element = $(element);
            $(element).chosen({
                no_results_text: 'Press Enter to add new tag'
            });
            // get the chosen object
            var chosenObj = $element.data('chosen');


            if (attrs.chosenField) {
                scope.$watch(attrs.chosenField, function() {
                    element.trigger('liszt:updated');
                });
            }
        }
    };
});
