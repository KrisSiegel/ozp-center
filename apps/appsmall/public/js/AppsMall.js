'use strict';

if (Ozone.config().getClientProperty("forceInHud") && (window === top)) {
    Ozone.Service("Apps").redirectIntoHudWithoutLogging("AppsMall");
}

var amlLogo = document.getElementById("appsmall-logo-link");
if (amlLogo) {
    amlLogo.addEventListener("click", function (event) {
        if (event.preventDefault) {
            event.preventDefault();
        };
        location.href = Ozone.utils.murl("amlUrl");
    }, false);
}

// Declare app level module which depends on filters, and services
var amlApp = angular.module('amlApp', ['amlApp.filters', 'amlApp.services', 'amlApp.controllers', 'amlApp.directives', 'ui.bootstrap', 'ngRoute', 'localytics.directives'])
                    .config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {

    // //The routes that our angular app will handle
    // $routeProvider.when('/AppsMall/', {
    //     templateUrl: '/index.html',
    //     controller: "AppController"
    // }).when('/AppsMall/manage/', {
    //     templateUrl: '/manage/index.html',
    //     controller: "AppSubmissionController"
    // }).when('/AppsMall/manage/tags/', {
    //     templateUrl: '/manage/tags/index.html',
    //     controller: "TagManagerController"
    // }).when('/AppsMall/manage/apps/submission/', {
    //     templateUrl: '/manage/apps/submission/index.html',
    //     controller: "AppSubmissionController"
    // }).when('/AppsMall/manage/apps/submission/:shortname/', {
    //     templateUrl: '/manage/apps/submission/index.html',
    //     controller: "AppSubmissionController"
    // }).otherwise({
    //     templateUrl: '/404.html'
    // });

    $routeProvider.when('/', {
        templateUrl: '/index.html',
        controller: "AppController"
    }).otherwise({
        templateUrl: '/404.html'
    });

    $locationProvider.html5Mode(false);

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);


// contains variable declaration -- this must be the first controller loaded from script tags

/**
 * Object for managing Angular controllers
 *
 * @module controllersModule
 * @requires amlApp.controllers
 */
var controllersModule = angular.module('amlApp.controllers', ['ui.bootstrap']);

/**
 * Object for managing Angular services
 *
 * @module servicesModule
 * @requires amlApp.services
 */
var servicesModule = angular.module('amlApp.services', ['ngResource']).value('version', '0.1');

/**
 * Object for managing Angular directives
 *
 * @module directivesModule
 * @requires amlApp.directives
 */
var directivesModule = angular.module('amlApp.directives', []);


//------- Dummy objects created solely for documentation purposes --------//

/**
 * Internal documentation for AngularJS quirks that could use additional documentation
 *
 * @module AngularMiscellaneous
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
 * the second parameter is a Function object that gets called if the async call throws an error. (such as any HTTP status code greater than 400)
 *
 * @class PromiseObject
 */
var PromiseObject = {};

/**
 * @method then
 * @param callback {Function} if async call succeeds, this function is invoked with parameters returned from async method.
 * @param errback {Function} if async call fails, this function is invoked with Ajax or native JS error parameters.
 * @chainable
 * @return {PromiseObject} the promise object, for method chaining
 */

