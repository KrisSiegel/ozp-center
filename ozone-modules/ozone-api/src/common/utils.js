/**
    @module Ozone
    @class Ozone.utils
*/
Ozone.extend(function () {
	var methods = {
		utils: {
            /**
				murl takes the url property within the configuration, any additions needed to it and outputs
				a url.

                @method murl
                @param {String} urlProp the url property to use from the configuration
                @param {Array} postfixes an array of items to postfix to a url
                @param {String} hostRole indicates what tier this URL is targeting, viz. "servicesHost" or "staticHost"
            */
            murl: function (urlProp, postfixes, hostRole) {
                if (methods.utils.isUndefinedOrNull(hostRole)) {
                    hostRole = "";
                }

                // Start building the URL
                var url = "";
                // Just concatenate what you got
                if (!methods.utils.isUndefinedOrNull(urlProp)) {
                    url = Ozone.config().getCommonProperty("urls")[urlProp];

                    if (!methods.utils.isUndefinedOrNull(postfixes)) {
                        if (!methods.utils.isArray(postfixes)) {
                            postfixes = [postfixes];
                        }
                        for (var i = 0; i < postfixes.length; ++i) {
                            url = url + postfixes[i];
                        }
                    }
                }
                url = url.replace("//", "/");
                if (hostRole) {
                    var abs = Ozone.config().getClientProperty(hostRole);
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
            },
            /**
				A simple check for whether an object is undefined or null. JavaScript provices the === operator for
				exact matches but is annoying to constantly repeat within code. obj != null technically checks for
				null or undefined in JavaScript but this behavior is not obvious at all. Hence this method.

                @method isUndefinedOrNull
                @param {Object} obj an object to check whether it's undefined or null.
            */
			isUndefinedOrNull: function (value) {
                if (value === undefined || value === null) {
                    return true;
                }
                return false;
            },
            /**
				An alias to isUndefinedOrNull

                @method isNullOrUndefined
                @param {Object} obj an object to check whether it's undefined or null.
            */
			isNullOrUndefined: function (value) {
                if (value === undefined || value === null) {
                    return true;
                }
                return false;
            },
            /**
				Checks whether the passed in input is an object or not.

                @method isObject
				@param {Object} input possible object
            */
			isObject: function(input) {
                return (!methods.utils.isUndefinedOrNull(input) && Object.prototype.toString.call(input) === "[object Object]");
            },
            /**
				Checks whether the passed in input is an array or not.

                @method isArray
				@param {Array} input possible array
            */
			isArray: function(input) {
                return (!methods.utils.isUndefinedOrNull(input) && Object.prototype.toString.call(input) === "[object Array]");
            },
            /**
				Checks whether the passed in input is a string or not.

                @method isString
				@param {String} input possible string
            */
            isString: function (input) {
                return (!methods.utils.isUndefinedOrNull(input) && Object.prototype.toString.call(input) === "[object String]");
            },
            /**
				Checks whether we're running on the server side or not.

                @method isServerSide
            */
			isServerSide: function () {
                if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
                    return true;
                }
                return false;
            },
            /**
				Checks whether we're running on the client side or not.

                @method isClientSide
            */
			isClientSide: function () {
                return !methods.utils.isServerSide();
            },
            /**
				Does a deep array comparison to determine if the arrays hold the same values or not.

                @method compareArray
				@param {Array} arr1 first array
				@param {Array} arr2 second array
            */
			compareArray: function (arr1, arr2) {
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
                        if (!methods.utils.compareArray(arr1[i], arr2[i]))
                            return false;
                    }
                    else if (arr1[i] != arr2[i]) {
                        // Warning - two different object instances will never be equal: {x:20} != {x:20}
                        return false;
                    }
                }
                return true;
            },
            /**
				Checks whther the array contains an object or not

                @method arrayContains
				@param {Array} values the array of values
				@param {Object} target the target value
            */
			arrayContains: function (values, target) {
                if (methods.utils.isUndefinedOrNull(values)) {
                    return false;
                }
                if (!methods.utils.isArray(values)) {
                    values = [values];
                }
                for (var i = 0; i < values.length; ++i) {
                    if (target.indexOf(values[i]) === -1) {
                        return false;
                    }
                }
                return true;
            },
            /**
				Checks whether the supplied input is a function or not.

                @method isFunction
				@param {Method} input the possible method
            */
			isFunction: function(input) {
                return (!methods.utils.isUndefinedOrNull(input) && Object.prototype.toString.call(input) === "[object Function]");
            },
            /**
				Checks whether a JavaScript object is empty or not.

                @method isEmptyObject
				@param {Object} obj the object to check
            */
			isEmptyObject: function(obj) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        return false;
                    }
                }
                return true;
            },
            /**
				Creates a clone of an object

                @method clone
				@param {Object} obj the object to clone
            */
			clone: function(obj) {
                if (methods.utils.isUndefinedOrNull(obj) || !methods.utils.isObject(obj)) {
                    return obj;
                }
                var temp = obj.constructor(); // changed
                for (var key in obj) {
                    temp[key] = methods.utils.clone(obj[key]);
                }
                return temp;
            },
            /**
				Simple method to capitalize the first letter of each word.

                @method capitalizeWord
				@param {String} s the string to modify
            */
            capitalizeWord: function(s) {
                return s.charAt(0).toUpperCase() + s.slice(1);
            },
            /*
				Converts the JavaScript arguments object into a real array rather than a pseudo array

                @method argumentsToArray
				@param {Arguments} args the JavaScript arguments object to convert into a real array
            */
            argumentsToArray: function (args) {
				return Array.prototype.slice.call(args, 0);
			},
            /*
				Provides safe access to deeply nested keys without doing multiple undefined or null checks.
				Example:
				var obj = {
					test: {
						testing: {
							value: "win"
						}
					}
				};
				Ozone.utils.safe(obj, "test.testing.value"); // returns "win"
				Ozone.utils.safe(obj, "something.whatever.another"); // returns undefined

                @method safe
				@param {Object} baseObj the base object to check
				@param {String} jsonPath the path to the key to get
            */
			safe: function (baseObj, jsonPath) {
				if (methods.utils.isUndefinedOrNull(baseObj)) {
					return undefined;
				}
				var index = 0, obj, split = (jsonPath || "").split("."), result = false, base;
				try {
				   if (split.length > 0) {
				       base = baseObj || window;
				       if (base.hasOwnProperty(split[index]) || methods.utils.isFunction(base[split[index]])) {
				           obj = base[split[index]];
				       }
				       for (index = 1; index < split.length; index += 1) {
				           if (obj.hasOwnProperty(split[index]) || methods.utils.isFunction(obj[split[index]])) {
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
            /*
				Affixes a protocol onto a URL

                @method affixUrlWithProtocol
				@param {String} url the base url to use
				@param {String} protocol the protocol to attach to the url
            */
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
            /*
				Checks the indexOf an object within an array

                @method indexOf
				@param {Array} array the array
				@param {Object} object the object
            */
			indexOf: function(array, object) {
				for (var i = 0; i < array.length; i++) {
					if (array[i] === object) { // only good for comparing strings & numbers
						return i;
					}
				}
				return -1;
			},
            /*
                @method getFromArrayWithField
				@param {Array} array the array
				@param {String} field the key
				@param {Object} value the value
            */
			getFromArrayWithField: function(array, field, value) {
				for (var i = 0; i < array.length; i++) {
					if (array[i][field] === value) {
						return array[i];
					}
				}
				return undefined;
			},
            /*
                @method removeFromArray
				@param {Array} array the array
				@param {Object} object the object to remove
            */
			removeFromArray: function(array, object) {
				for (var i = array.length - 1; i >= 0; i--) {
					if (array[i] === object) {
						array.splice(i, 1);
					}
				}
			},
            /*
                @method removeFromArrayWithField
				@param {Array} array the array
				@param {String} field the key
				@param {Object} value the value
            */
			removeFromArrayWithField: function(array, field, value) {
				for (var i = array.length - 1; i >= 0; i--) {
					if (array[i][field] === value) {
						array.splice(i, 1);
					}
				}
			},
            /*
                @method convertStringToObject
				@param {String} input the string to convert
            */
			convertStringToObject: function(input) {
				var obj;
				try {
					obj = JSON.parse(input);
				}
				catch(e) {
				}
				return obj;
			},
            /*
                @method isValidId
				@param {String} id the id to validate
            */
            isValidId: function(id) {
                return /^[0-9A-Fa-f]{24}$/.test(id);
            },
            /*
                @method isValidHash
				@param {String} id the hash to validate
            */
            isValidHash: function(id) {
                return /^[0-9A-Fa-f]{32}$/.test(id);
            },
            /*
				Generates a random id

                @method generateId
            */
			generateId: function() {
				var charSet = "abcdef0123456789";
				var result = [];
				for (var i = 0; i < 24; ++i) {
					result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
				}
				return result.join("");
			},
            /*
				Generates a random, fake hash

                @method generateFakeHash
            */
			generateFakeHash: function() {
    				var charSet = "abcdef0123456789";
    				var result = [];
    				for (var i = 0; i < 32; ++i) {
    					result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
    				}
    				return result.join("");
    			},
            /*
				Gets the keys within a JavaScript object

                @method keys
				@param {Object} obj a JavaScript object to grab keys from
            */
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
            /*
				Gets the values within a JavaScript object

                @method values
				@param {Object} obj a JavaScript object to grab values from
            */
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
            /*
				Checks whether all values within an array are truthy

                @method all
				@param {Array} array an array
            */
			all: function(array) {
			    // returns true if all values in array are truthy
			    if (array.length === 0) {
			        return true;
			    }
			    return array.reduce(function(memo,v) { return memo && (v ? true : false); });
			}
		}
	};

    return methods;
}());

// Support for older code looking for Ozone.Utils instead of Ozone.utils.
// TODO: Drop this after refactoring.
Ozone.extend({
	Utils: Ozone.utils
});
