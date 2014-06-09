/**
 * 
 *
 * @module directivesModule
 * @submodule DateDropdownsModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * @class DateDropdownsDirective
 * @static
 */ 

/**
 * @class DateDropdownsDirective
 * @constructor
 * @param FileUpload {Object} an Angular-injected instance of {{#crossLink "FileUploadService"}}{{/crossLink}}
 * @param Tag {Object} an Angular-injected instance of {{#crossLink "TagService"}}{{/crossLink}}
 */
var DateDropdownsDirective = [function() {
    var monthsOfYear = {
        January: 31,
        February: function(year) { return ((year % 4 === 0) ? 29 : 28); },
        March: 31,
        April: 30,
        May: 31,
        June: 30,
        July: 31,
        August: 31,
        September: 30,
        October: 31,
        November: 30,
        December: 31
    };
    return {
        restrict: 'E',
        template: '<div class="control-group-segment"><select name="months" ng-model="selectedMonth" ng-options="monthName as value for (monthName, value) in months" ng-change="setDayRangeAndDateField(true)" class="months-select"></select><span class="icon-group-segment icon-arrow-down icon-group-segment-month"></span></div>' +
                '<div class="control-group-segment"><select ng-model="selectedDay" ng-options="value for value in days" ng-change="setDateField()" class="days-select"></select><span class="icon-group-segment icon-arrow-down"></span></div>' +
                '<div class="control-group-segment"><select ng-model="selectedYear" ng-options="value for value in years" ng-change="setDayRangeAndDateField(true)" class="years-select"></select><span class="icon-group-segment icon-arrow-down icon-group-segment-year"></span></div>',
        scope: {
            app: '=',
            dateField: '@'
        },
        link: function(scope, element, attrs) {
            // set scope with day/month/year ranges
            scope.years = common.getRange(1900, (new Date()).getFullYear(), true);
            scope.months = _.keys(monthsOfYear);

            scope.setDayRangeAndDateField = function(assignDateField) {
                var selectedMonthName = scope.months[scope.selectedMonth];
                if (selectedMonthName) {
                    var numDays = monthsOfYear[selectedMonthName];
                    if (_.isFunction(numDays)) {
                        numDays = numDays(scope.selectedYear);
                    }
                    scope.days = common.getRange(1, numDays);
                }
                if (assignDateField) {
                    scope.setDateField();
                }
            }

            scope.setDateField = function() {
                scope.app[scope.dateField] = new Date(scope.selectedYear, scope.selectedMonth, scope.selectedDay);
            }

            // set to current date, or existing date from date field
            var updateDate = function(assignDateField) {
                var existingApp = scope.app || {};
                var selectedDate = new Date(existingApp[scope.dateField]);
                console.log('Date = ');
                console.log(existingApp[scope.dateField]);
                scope.selectedYear = selectedDate.getFullYear();
                scope.selectedMonth = (selectedDate.getMonth() || 0).toString();
                scope.setDayRangeAndDateField(assignDateField);
                scope.selectedDay = selectedDate.getDate();
            };

            if (_.isObject(scope.app)) {
                scope.app[scope.dateField] = scope.app[scope.dateField] || (new Date()).toString();
                updateDate(false);
            }

            var dateField = ('app.' + scope.dateField);
            console.log('Date field = ' + dateField);
            scope.$watch(dateField, function() { updateDate(false); });

        }
    };
}];

directivesModule.directive('dateDropdowns', DateDropdownsDirective);
