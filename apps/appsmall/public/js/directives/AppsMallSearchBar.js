/**
 * 
 *
 * @module directivesModule
 * @submodule AppsmallSearchBarModule
 * @requires amlApp.directives
 */
'use strict';

/**
 * @class AppsmallSearchBarDirective
 * @static
 */ 

/**
 * @class AppsmallSearchBarDirective
 * @constructor
 */
var AppsmallSearchBarDirective = [function() {
    return {
        restrict: 'E',
        replace: true,
        transclude: 'element',
        template: '<form class="form-search"><div class="searchbar-container"><i class="icon-search"></i>' +

            '<input type="text" class="input-large" placeholder="Search" autofocus id="apps_mall_search" data-placeholder="Search" ng-model="searchValue" ' +
            'typeahead="searchResult as searchResult.app for searchResult in getSearchResults($viewValue)"' +
            'typeahead-on-select="executeSearch($item)" typeahead-template-url="template/searchTemplate.html"></input>' +
       ' </div></form>',
        link: function(scope, element, attrs) { }
    };
}];

directivesModule.directive('appsmallSearchBar', AppsmallSearchBarDirective);
