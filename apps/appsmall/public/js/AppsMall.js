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

