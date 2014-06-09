var common = (function () {

    // String.prototype custom functions for OWF
    if (typeof String.prototype.startsWith != 'function') {
      String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
      };
    }
    if (typeof String.prototype.endsWith != 'function') {
      String.prototype.endsWith = function (str){
        return this.slice(-str.length) == str;
      };
    }

    return {
        // assigns values to array "in-place" -- without assigning a new array object.
        assignToArrayInPlace: function (arrayToAssign, values) {
            arrayToAssign.length = 0;
            _.each(values, function(value) { arrayToAssign.push(value); });
        },
        // assigns newly updated values to object "in-place" -- without creating or re-assigning a new object.
        assignToObjectInPlace: function (originalObject, newObject) {
            _.each(newObject, function(val, key) {
                originalObject[key] = val;
            });
        },
        removeFromArrayInPlace: function (arrayToAssign, valueToRemove) {
            var elementIndex = arrayToAssign.indexOf(valueToRemove);
            if (elementIndex >= 0) {
                arrayToAssign.splice(elementIndex, 1);
            }
        },
        // clones object and removes Angular scope attributes that can cause errors on back end
        // DEPRECATED - use angular.copy() instead
        cloneWithoutScopeAttributes: function (originalObject) {
            var newObject = _.clone(originalObject);
            _.chain(originalObject)
             .keys()
             .each(function(key) {
                 if (key.startsWith('$')) {
                     delete newObject[key];
                 }
             });
            return newObject;
        },
        // checks for valid ids
        isValidId: function(id) {
            return /^[0-9A-Fa-f]{24}$/.test(id);
        },
        // generating id that will pass validation check above
        generateId: function() {
            var id = '';
            for (var i=0; i<24; i++) {
                id += Math.floor(Math.random() * 16).toString(16);
            }
            return id;
        },
        getDateSorterFunction: function(dateField, isDescending) {
            return function(obj1, obj2) {
              var lessThanSortValue = -1, greaterThanSortValue = 1;
              if (isDescending) {
                  lessThanSortValue = 1;
                  greaterThanSortValue = -1;
              }
              var d1 = new Date(obj1[dateField]);
              var d2 = new Date(obj2[dateField]);
              // if ascending: return (less than = -1, equal = 0, greater than = 1)
              // if descending: return (less than = 1, equal = 0, greater than = -1)
              return (d1 < d2) ? lessThanSortValue : ((d1 > d2) ? greaterThanSortValue : 0);
            };
        },
        getSorterFunction: function(field, defaultValue, isDescending) {
            return function(obj1, obj2) {
              var lessThanSortValue = -1, greaterThanSortValue = 1;
              if (isDescending) {
                  lessThanSortValue = 1;
                  greaterThanSortValue = -1;
              }
              var value1 = (obj1[field] || defaultValue), value2 = (obj2[field] || defaultValue);
              // if ascending: return (less than = -1, equal = 0, greater than = 1)
              // if descending: return (less than = 1, equal = 0, greater than = -1)
              return (value1 < value2) ? lessThanSortValue : ((value1 > value2) ? greaterThanSortValue : 0);
            };
        },
        // Return an array of consecutive numbers, ascending or descending, within the range.  Both endpoints are included.
        getRange: function(min, max, isDescending) {
            var array = [];
            min = parseInt(min), max = parseInt(max);
            if ((min > max) || isNaN(min) || isNaN(max)) {
                return [];
            }
            if (isDescending) {
                for(var i = max; i >= min; i--) {
                    array.push(i);
                }
            }
            else {
                for (var i = min; i <= max; i++) {
                    array.push(i);
                }
            }
            return array;
        },
        convertBooleanText: function(value) {
            if (_.isBoolean(value)) {
                return value;
            }
            return ((value || '').toString().toLowerCase() === "true");
        },
        humanizedArrayString: function(array, useOrAsJoinerWord) {
            var joinerWord = (useOrAsJoinerWord ? 'or' : 'and');
            if (array.length > 2) {
                return array.slice(0,-1).join(', ') + ', ' + joinerWord + ' ' + _.last(array);
            }
            else if (array.length === 2) {
                return (array[0].toString() + ' ' + joinerWord + ' ' + array[1].toString());
            }
            return array.toString();
        },
        rangeBounds: function(value, min, max) {
            if (value < min) {
                return min;
            } else if (value > max) {
                return max;
            }
            return value;
        }
    };
}())
