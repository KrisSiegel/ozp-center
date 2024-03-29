/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI.ChosenDropdownActiveTextModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML class directive: Adds Chosen dropdown functionality to a ```<select>``` element, with default text.
 *
 * Usage: ```<[element] class="chosen-dropdown-active-text"></[element]>```
 *
 * @class AppsMallUI.ChosenDropdownActiveTextDirective
 * @static
 */ 

/**
 * @class AppsMallUI.ChosenDropdownActiveTextDirective
 * @constructor
 * @param FileUpload {Object} an Angular-injected instance of {{#crossLink "AppsMallUI.FileUploadService"}}{{/crossLink}}
 * @param Tag {Object} an Angular-injected instance of {{#crossLink "AppsMallUI.TagService"}}{{/crossLink}}
 */
var ChosenDropdownActiveTextDirective = [function() {
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
}];

directivesModule.directive('chosenDropdownActiveText', ChosenDropdownActiveTextDirective);
