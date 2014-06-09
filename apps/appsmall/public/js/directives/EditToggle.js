'use strict';

directivesModule.directive('editToggle', function() {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            $(element).click(function() {
                var $formRoot = $(element).closest('.aml-custom-form');
                if ($formRoot.hasClass('editmode')) {
                    $formRoot.removeClass('editmode');
                    $(element).text('Edit');
                } else {
                    $formRoot.addClass('editmode');
                    $(element).text('Cancel');
                }
            });
        }
    }
});
