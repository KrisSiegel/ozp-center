/**
 * 
 *
 * @module AppsMallUI.directivesModule
 * @submodule AppsMallUI. ChosenDropdownModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * HTML class directive: Adds Chosen dropdown functionality to a ```<select>``` element.  The element can be either single-select or multiple-select.
 *
 * Usage: ```<[element] class="chosen-dropdown"></[element]>```
 *
 * @class AppsMallUI. ChosenDropdownDirective
 * @static
 */ 

/**
 * @class AppsMallUI. ChosenDropdownDirective
 * @constructor
 */
var ChosenDropdownDirective = [function() {
    return {
        restrict: 'C',
        link: function(scope, element, attrs) {
            var chosenOpts = {};
            if (attrs.activeText) {
                chosenOpts.no_results_text = 'Press Enter to add new tag';
            }
            $(element).chosen(chosenOpts);
            // get the chosen object
            var chosenObj = $(element).data('chosen');

            if (attrs.activeText) {
                // If the active-text attribute was selected: bind the keyup event that adds a default select option to the search box input
                var $textInput = chosenObj.dropdown.closest(".chzn-container").find('input:text');

                // event bound to Chosen textbox that adds user-selected value to dropdown and Angular controller values when the user clicks Enter.
                var textInputEventFunc = function(e) {
                    // (e.which === 13) checks for Enter button keyup
                    if ((e.which === 13) && !_.isEmpty(this.value)) {
                        var optionsObj = scope.$eval(attrs.chosenField), modelObj = scope.$eval(attrs.ngModel);
                        if (!modelObj) {
                            scope.$eval(attrs.ngModel + ' = []');
                            modelObj = scope.$eval(attrs.ngModel);
                        }
                        if (_.isArray(optionsObj) && _.isArray(modelObj)) {
                            if (!_.contains(modelObj, this.value)) {
                                //$(element).find('option.user-selected-option').remove();
                                var option = $('<option></option>').val(this.value).text(this.value);
                                $(element).prepend(option);

                                // select newly added option
                                $(element).find(option).prop('selected', true);
                                modelObj.push(this.value);
                            }
                            if (!_.contains(optionsObj, this.value)) {
                                optionsObj.push(this.value);
                            }

                            // trigger the update
                            $(element).trigger("liszt:updated");
                        }
                    }
                    else {
                       return true;
                    }
                };

                $textInput.on('keyup', textInputEventFunc);
            }

            if (attrs.chosenField) {
                scope.$watch(attrs.chosenField, function() {
                    element.trigger('liszt:updated');
                });
            }
            if(attrs.ngModel){
                scope.$watch(attrs.ngModel, function(){
                    element.trigger('liszt:updated');
                });
            }
        }
    };
}];

directivesModule.directive('chosenDropdown', ChosenDropdownDirective);
