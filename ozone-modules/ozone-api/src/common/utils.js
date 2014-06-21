/**
    @module Ozone
    @class Ozone
*/
Ozone.extend(function () {
    var isUndefinedOrNull = function (value) {
		if (value === undefined || value === null) {
			return true;
		}
		return false;
	};

	var isObject = function(input) {
		return (!isUndefinedOrNull(input) && Object.prototype.toString.call(input) === "[object Object]");
	};

	var isArray = function(input) {
		return (!isUndefinedOrNull(input) && Object.prototype.toString.call(input) === "[object Array]");
	};

    var isString = function (input) {
        return (!isUndefinedOrNull(input) && Object.prototype.toString.call(input) === "[object String]");
    };

	var isFunction = function(input) {
		return (!isUndefinedOrNull(input) && Object.prototype.toString.call(input) === "[object Function]");
	};

	var isEmptyObject = function(obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				return false;
			}
		}
		return true;
	};

	var compareArray = function (arr1, arr2) {
	    // if the other array is a falsy value, return
	    if (!arr2)
	        return false;

	    // compare lengths - can save a lot of time
	    if (arr1.length != arr2.length)
	        return false;

	    for (var i = 0, l=arr1.length; i < l; i++) {
	        // Check if we have nested arrays
	        if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
	            // recurse into the nested arrays
	            if (!compareArray(arr1[i], arr2[i]))
	                return false;
	        }
	        else if (arr1[i] != arr2[i]) {
	            // Warning - two different object instances will never be equal: {x:20} != {x:20}
	            return false;
	        }
	    }
	    return true;
	};

	var arrayContains = function (values, target) {
		if (Ozone.utils.isUndefinedOrNull(values)) {
			return false;
		}
		if (!Ozone.utils.isArray(values)) {
			values = [values];
		}
		for (var i = 0; i < values.length; ++i) {
			if (target.indexOf(values[i]) === -1) {
				return false;
			}
		}
		return true;
	};

	var isServerSide = function () {
		if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
		    return true;
		}
		return false;
	};

	var isClientSide = function () {
		return !isServerSide();
	};

	// performs deep (recursive) clone of object passed in
	var clone = function(obj) {
        if (isUndefinedOrNull(obj) || !isObject(obj)) {
            return obj;
        }
        var temp = obj.constructor(); // changed
        for (var key in obj) {
            temp[key] = clone(obj[key]);
        }
        return temp;
    }

    var murl = function (urlProp, postfixes, isClient) {
        if (isUndefinedOrNull(isClient)) {
            isClient = false;
        }

        // Start building the URL
        var url = "";
        // Just concatenate what you got
        if (!isUndefinedOrNull(urlProp)) {
            url = Ozone.config().getCommonProperty("urls")[urlProp];

            if (!isUndefinedOrNull(postfixes)) {
                if (!isArray(postfixes)) {
                    postfixes = [postfixes];
                }
                for (var i = 0; i < postfixes.length; ++i) {
                    url = url + postfixes[i];
                }
            }
        }
        url = url.replace("//", "/");
        if (isClient) {
            var abs = Ozone.config().getClientProperty("absoluteBaseUrl");
            if (abs === undefined) {
                abs = "";
            }
            // prepend the absoluteBaseUrl, just don't duplicate the '/'
            if (abs[abs.length - 1] === "/" && url[0] === "/") {
                url = abs.substring(0, abs.length - 1) + url;
            } else {
                url = abs + url;
            }
        }

        return url;
    };

    function capitalizeWord(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

	return {
		utils: {
            /**
                @method utils.murl
            */
            murl: murl,
            /**
                @method utils.isUndefinedOrNull
            */
			isUndefinedOrNull: isUndefinedOrNull,
            /**
                @method utils.isNullOrUndefined
            */
			isNullOrUndefined: isUndefinedOrNull,
            /**
                @method utils.isObject
            */
			isObject: isObject,
            /**
                @method utils.isArray
            */
			isArray: isArray,
            /**
                @method utils.isString
            */
            isString: isString,
            /**
                @method utils.isServerSide
            */
			isServerSide: isServerSide,
            /**
                @method utils.isClientSide
            */
			isClientSide: isClientSide,
            /**
                @method utils.compareArray
            */
			compareArray: compareArray,
            /**
                @method utils.arrayContains
            */
			arrayContains: arrayContains,
            /**
                @method utils.isFunction
            */
			isFunction: isFunction,
            /**
                @method utils.isEmptyObject
            */
			isEmptyObject: isEmptyObject,
            /**
                @method utils.clone
            */
			clone: clone,
            /**
                @method utils.capitalizeWord
            */
            capitalizeWord: capitalizeWord,
            argumentsToArray: function (args) {
				return Array.prototype.slice.call(args, 0);
			},
			safe: function (baseObj, jsonPath) {
				if (isUndefinedOrNull(baseObj)) {
					return undefined;
				}
				var index = 0, obj, split = (jsonPath || "").split("."), result = false, base;
				try {
				   if (split.length > 0) {
				       base = baseObj || window;
				       if (base.hasOwnProperty(split[index]) || isFunction(base[split[index]])) {
				           obj = base[split[index]];
				       }
				       for (index = 1; index < split.length; index += 1) {
				           if (obj.hasOwnProperty(split[index]) || isFunction(obj[split[index]])) {
				               obj = obj[split[index]];
				           } else {
				               obj = undefined;
				               break;
				           }
				       }
				       result = obj;
				   }
				} catch (e) {
				   // Do nothing here. This means we failed to safely get a value.
				}
				return result;
			},
			affixUrlWithProtocol: function (url, protocol) {
			    if (url !== undefined && protocol !== undefined) {
			    	if (protocol.indexOf(":") === -1) {
			    		protocol = protocol + ":";
			    	}
			        var foundProtocolIndex = url.indexOf("://");
			        if (foundProtocolIndex === -1) {
			            var foundSlashes = url.indexOf("//");
			            if (foundSlashes === -1) {
			                return protocol + "//" + url;
			            } else if (foundSlashes === 0) {
			                return protocol + url;
			            }
			        } else {
			            var urlNoProtocol = url.substring(foundProtocolIndex + 1, url.length);
			            return protocol + urlNoProtocol;
			        }
			    }
			},
			indexOf: function(array, object) {
				for (var i = 0; i < array.length; i++) {
					if (array[i] === object) { // only good for comparing strings & numbers
						return i;
					}
				}
				return -1;
			},
			getFromArrayWithField: function(array, field, value) {
				for (var i = 0; i < array.length; i++) {
					if (array[i][field] === value) {
						return array[i];
					}
				}
				return undefined;
			},
			removeFromArray: function(array, object) {
				for (var i = array.length - 1; i >= 0; i--) {
					if (array[i] === object) {
						array.splice(i, 1);
					}
				}
			},
			removeFromArrayWithField: function(array, field, value) {
				for (var i = array.length - 1; i >= 0; i--) {
					if (array[i][field] === value) {
						array.splice(i, 1);
					}
				}
			},
			convertStringToObject: function(input) {
				var obj;
				try {
					obj = JSON.parse(input);
				}
				catch(e) {
				}
				return obj;
			},
            // checks for valid ids
            isValidId: function(id) {
                return /^[0-9A-Fa-f]{24}$/.test(id);
            },
            // checks for valid ids
            isValidHash: function(id) {
                return /^[0-9A-Fa-f]{32}$/.test(id);
            },
			generateId: function() {
				var charSet = "abcdef0123456789";
				var result = [];
				for (var i = 0; i < 24; ++i) {
					result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
				}
				return result.join("");
			},
			generateFakeHash: function() {
    				var charSet = "abcdef0123456789";
    				var result = [];
    				for (var i = 0; i < 32; ++i) {
    					result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    				}
    				return result.join("");
    			},
			keys: function(obj) {
			    if (isObject(obj)) {
			        var keys = [];
			        for (var key in obj) {
			            if (obj.hasOwnProperty(key)) {
    			            keys.push(key);
			            }
			        }
			        return keys;
			    }
			    return [];
			},
			values: function(obj) {
			    if (isObject(obj)) {
			        var vals = [];
			        for (var key in obj) {
			            if (obj.hasOwnProperty(key)) {
			                vals.push(obj[key]);
		                }
			        }
			        return vals;
			    }
			    return [];
			},
			all: function(array) {
			    // returns true if all values in array are truthy
			    if (array.length === 0) {
			        return true;
			    }
			    return array.reduce(function(memo,v) { return memo && (v ? true : false); });
			}
		}
	};
}());

// Support for older code looking for Ozone.Utils instead of Ozone.utils.
// TODO: Drop this after refactoring.
Ozone.extend({
	Utils: Ozone.utils
});
