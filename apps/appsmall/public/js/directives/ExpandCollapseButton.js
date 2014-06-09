'use strict';

directivesModule.directive('expandCollapseButton', function() {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            var $formRoot = $(element).closest('.aml-custom-form');
            var $mainFormBody = $formRoot.find('.aml-custom-form-body');
            $mainFormBody.fadeOut();
            $(element).click(function() {
                if ($formRoot.hasClass('expanded')) {
                    $formRoot.removeClass('expanded');
                    $mainFormBody.fadeOut();
                } else {
                    $formRoot.addClass('expanded');
                    $mainFormBody.fadeIn();
                }
            });
        }
    }
});
