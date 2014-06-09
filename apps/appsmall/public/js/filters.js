'use strict';

/* Filters */

angular.module('amlApp.filters', [])
       .filter('interpolate', ['version', function(version) {
            return function(text) {
                return String(text).replace(/\%VERSION\%/mg, version);
            }
       }])
       // Filter out the tag that refers to the currently selected organization
       .filter('hideOrg', function () {
           return function (tags, orgname) {
               return _.reject(tags, function (tag) {
                   return tag.name === orgname && tag.type === '/AppsMall/Organization/';
               });
           }
       });
