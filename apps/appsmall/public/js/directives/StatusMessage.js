/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI. StatusMessageModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML element directive: Renders status bar that displays success messages in green and error messages in red.
 *
 * Usage: ```<status-message success-message=[{{String}}] error-message=[{{String}}] 
 *                           highlighted="true" highlighted-parent-class="container-class"></status-message>```
 * 
 * @class AppsMallUI. StatusMessageDirective
 * @static
 */ 

/**
 * @class AppsMallUI. StatusMessageDirective
 * @constructor
 */

/**
 * Error message that appears in red text when this value is not empty
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 1-way binding plus scoped watcher event)**_
 *
 * @attribute {String} error-message
 * @optional
 */

/**
 * Success message that appears in green text when this value is not empty
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 1-way binding plus scoped watcher event)**_
 *
 * @attribute {String} success-message
 * @optional
 */

/**
 * If true, status message background flashes green or red when updated
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 1-way binding)**_
 *
 * @attribute {Boolean} highlighted
 * @optional
 */
    
/**
 * CSS class of parent to be highlighted, if highlighted equals true.
 *
 * {{#crossLinkModule "AngularScope"}}{{/crossLinkModule}}: _**(scoped to directive as 1-way binding)**_
 *
 * @attribute {String} highlighted-parent-class
 * @optional
 */


var StatusMessageDirective = [function() {
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
}];

directivesModule.directive('statusMessage', StatusMessageDirective);
