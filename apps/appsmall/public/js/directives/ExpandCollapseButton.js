/**
 * 
 *
 * @module directivesModule
 * @submodule ExpandCollapseButtonModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML class directive: Adds toggle functionality to button, so that parent class with ```aml-custom-form``` tag expands and collapses.
 *
 * Usage: ```<[element] class="expand-collapse-button"></[element]>```
 *
 * @class ExpandCollapseButtonDirective
 * @static
 */ 

/**
 * @class ExpandCollapseButtonDirective
 * @constructor
 */
var ExpandCollapseButtonDirective = [function() {
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
}];

directivesModule.directive('expandCollapseButton', ExpandCollapseButtonDirective);
