'use strict';

servicesModule.factory('Search', function($q, AppOrComponent, Tag) {

    // Performs query to retrieve apps (or components) as search results.
    var appOrComponentSearch = function(searchTerm, searchType, isAutocomplete) {
        if (_.contains(['app', 'component'], searchType)) {
            return AppOrComponent.query({
                type: searchType,
                name: searchTerm,
                autocomplete: isAutocomplete
            });
        }
        else {
            return $q.reject();
        }
    };

    // Returns promise that passes an object of the form {apps: <apps>, components: <components>} into the "then" callback.
    var nameSearch = function(searchTerm, searchType) {
        if (AppOrComponent.AllowComponents) {
            if ((searchType || '').startsWith('app')) {
                return appOrComponentSearch(searchTerm, 'app', true).then(function(result) {
                    JSON.stringify('+S search = ' + searchTerm + ', name result = ' + result)
                    return {apps: result};
                });
            }
            else if ((searchType || '').startsWith('component')) {
                return appOrComponentSearch(searchTerm, 'component', true).then(function(result) {
                    return {components: result};
                });
            }
            else {
                return $q.all([appOrComponentSearch(searchTerm, 'app', true), appOrComponentSearch(searchTerm, 'component', true)])
                         .then(function(results) {
                             // checking if results length matches promise array length
                             if (results.length === 2) {
                                 return {apps: results[0], components: results[1]};
                             }
                             return {};
                         });
            }
        }
        else {
            // return only app search, in same object format as standard nameSearch() call that searches apps and components.
            var deferred = $q.defer();
            appOrComponentSearch(searchTerm, 'app', true).then(function(result) {
                JSON.stringify('+S search = ' + searchTerm + ', name result = ' + result)
                deferred.resolve({ apps: result });
            });
            return deferred.promise;
        }
    }

    // Returns promise that passes an object of the form {apps: <apps>, components: <components>, tags: <tags>} into the "then" callback.
    var appAndTagNameSearch = function(searchTerm, searchType) {
        return nameSearch(searchTerm, searchType).then(function(appsAndComponentResultObj) {
            return Tag.searchTagsByNameSubstring(searchTerm).then(function(tagResults) {
                var uniqueTagNames = _(tagResults).pluck('tag').uniq().value();
                return Ozone.extend(appsAndComponentResultObj, {tags: uniqueTagNames});
            });
        });
    };

    return {
        appSearch: function(searchTerm) {
            return appOrComponentSearch(searchTerm, 'app', false);
        },
        componentSearch: function(searchTerm) {
            return appOrComponentSearch(searchTerm, 'component', false);
        },
        appNameSearch: function(searchTerm) {
            return appOrComponentSearch(searchTerm, 'app', true);
        },
        componentNameSearch: function(searchTerm) {
            return appOrComponentSearch(searchTerm, 'component', true);
        },
        nameSearch: nameSearch,
        appAndTagNameSearch: appAndTagNameSearch
    };
});
