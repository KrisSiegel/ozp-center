'use strict';
// 
// directivesModule.directive('autoformatPhoneNumber', function() {
// 
//     var phoneNumberRegex = /^[0-9]{3}\-[0-9]{4}|[0-9]{3}\-[0-9]{3}\-[0-9]{4}$/;
// 
//     return {
//         require: 'ngModel',
//         restrict: 'A',
//         link: function(scope, element, attrs, ctrl) {
//             var onBlurFunction = function() {
//                 var phoneNumberString;
//                 var digits = ($(element).val() || '').replace(/[^0-9]/g,'');
//                 if (digits.length === 7) {
//                     phoneNumberString = digits.substring(0,3) + '-' + digits.substring(3);
//                 }
//                 else if (digits.length === 10) {
//                     phoneNumberString = digits.substring(0,3) + '-' + digits.substring(3,6) + '-' + digits.substring(6);
//                 }
//                 // if phone number has the correct number of digits, then rewrite input with number in correct format
//                 if (phoneNumberString) {
//                     $(element).val(phoneNumberString);
//                 }
//                 validationFunction(phoneNumberString);
//             };
// 
//             var validationFunction = function(value) {
//                 ctrl.$setValidity('custom', phoneNumberRegex.test(value));
//             };
// 
//             $(element).blur(onBlurFunction);
//             ctrl.$parsers.unshift(validationFunction);
//         }
//     };
// });
