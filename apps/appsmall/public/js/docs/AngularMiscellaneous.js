//------- Dummy objects created solely for documentation purposes --------//

/**
 * Internal documentation for AngularJS quirks that could use additional documentation
 *
 * @module AppsMallUI.AngularMiscellaneous
 */

/**
 * _**This is not a real class**_, as Angular promises return plain old Javascript objects that can be invoked by
 * calling then() and passing in a function with parameters to capture the asynchronous return values.
 * Example: If you called an asynchronous function to get a generic value and wanted to access the return value
 * after the async call is complete, then the Angular promise would get invoked as below:
 * ```
 * SomeService.getGenericValue(someKey).then(function(genericValue) {
 *    console.log('Value returned from asynchronous function getGenericValue(): ' + JSON.stringify(genericValue));
 * }, function(errorCode) {
 *    console.log('getGenericValue() failed.  Error = ' + JSON.stringify(errorCode));
 * });
 * ```
 *
 * The then() method typically takes one or two parameters: the first parameter is a Function object that gets called on success, and
 * the second parameter is a Function object that gets called if the async call throws an error. (such as any HTTP status code 400 or greater)
 *
 * @class AppsMallUI.PromiseObject
 */
var PromiseObject = {};

/**
 * @method then
 * @for AppsMallUI.PromiseObject
 * @param callback {Function} if async call succeeds, this function is invoked with parameters returned from async method.
 * @param errback {Function} if async call fails, this function is invoked with Ajax or native JS error parameters.
 * @chainable
 * @return {PromiseObject} the promise object, for method chaining
 */
