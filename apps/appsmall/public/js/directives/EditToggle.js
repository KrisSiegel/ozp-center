/**
 * 
 *
 * @module directivesModule
 * @submodule EditToggleModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML class directive: Toggles editmode class when button is clicked
 *
 * Usage: ```<[element] class="edit-toggle"></[element]>```
 *
 * @class EditToggleDirective
 * @static
 */ 

/**
 * @class EditToggleDirective
 * @constructor
 */
var EditToggleDirective = [function() {
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
}];

directivesModule.directive('editToggle', EditToggleDirective);
