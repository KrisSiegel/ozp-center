'use strict';

directivesModule.directive('statusMessage', function() {
    return {
        restrict: 'E',
        transclude: true,
        template: '<span class="status-message"></span>',
        scope: {
            errorMessage: '@',
            successMessage: '@',
            highlighted: '@',
            highlightedParentClass: '@'
        },
        link: function(scope, element, attrs) {

            // function invoked when status message changes
            var colorChangeFunc = function(newColor, newText) {
                    var $highlightElement = $(undefined);
                    if (attrs.highlighted) {
                        attrs.highlightedParentClass = attrs.highlightedParentClass || 'control-group';
                        $highlightElement = $(element).closest('.' + attrs.highlightedParentClass);
                    }
                    $(element).text(newText).css('color', newColor);

                    // if element to highlight is found, then highlight border around that element.
                    if ($highlightElement.length > 0) {
                        var originalColor = $highlightElement.css('backgroundColor');
                        $highlightElement.css('backgroundColor', newColor).animate({
                            backgroundColor: (originalColor || "0")
                        }, 2000);

                    }
                }

            scope.$watch('errorMessage', function() {
                var errorMsg = $(element).attr('error-message');
                if (!_.isEmpty(errorMsg)) {
                    colorChangeFunc('red', errorMsg);
                }
            });
            scope.$watch('successMessage', function() {
                var successMsg = $(element).attr('success-message');
                if (!_.isEmpty(successMsg)) {
                    colorChangeFunc('green', successMsg);
                }
            });
        }
    }
});
