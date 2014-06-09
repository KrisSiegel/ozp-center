Ozone.extend(function () {
    var getUrl = function() {
        var url = "http://" + Ozone.config().getServerProperty("host");
        url = url + ":" + Ozone.config().getServerProperty("port");
        url = url + Ozone.config().getServerProperty("apiBasePath");
        url = url + "apps/";
        return url;
    }

    var getRandomString = function(length) {
        var charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var result = [];
        for (var i = 0; i < length; ++i) {
            result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
        }
        return result.join("");
    }

    var getRandomWords = function(wordLengths) {
        // if value passed in is not an array, then convert to array or return empty string
        if (!Ozone.utils.isArray(wordLengths)) {
            var parsedValue = parseInt(wordLengths);
            if (isNaN(parsedValue)) {
                return '';
            }
            else {
                wordLengths = [parsedValue];
            }
        }
        return wordLengths.map(function(wordLength) { return getRandomString(wordLength); }).join(' ');
    }

    // Returns a number between min and max, in "step" sized increments.
    // (ex. if (0, 100, 5) is passed in, then a random multiple of five between 0 and 100 will be returned.)
    var getRandomNumberInRange = function(min, max, step) {
        if (isNaN(parseInt(min)) || isNaN(parseInt(max))) {
            return null;
        }
        if (isNaN(parseInt(step)) || (step <= 0)) {
            step = 1;
        }
        if (max < min) {
            var temp = max, max = min, min = temp;  // switch min and max values
        }
        var numStepAdjustedRandomValues = Math.floor((max - min) / step) + 1;
        var stepAdjustedRandomNumber = min + Math.round(Math.random() * numStepAdjustedRandomValues);
        return stepAdjustedRandomNumber * step;
    }

    var getRandomDate = function(date1, date2) {
        if (!((date1 instanceof Date) && (date2 instanceof Date))) {
            return null;
        }
        var randomRawDate = getRandomNumberInRange(date1.getTime(), date2.getTime());
        return new Date(randomRawDate);
    }

    var getRandomBoolean = function() {
        return (Math.random() >= 0.5);
    }

    var getRandomUrl = function(isHttps) {
        var protocol = (isHttps ? 'https://' : 'http://');
        return protocol + 'www.' + getRandomString(12) + '.com';
    }

    var getRandomImagePath = function() {
        return '/img/' + getRandomString(8) + '.png';
    }

    var getSubsetArray = function(array) {
        return (array || []).filter(getRandomBoolean);
    }

    var getSingleValueFromArray = function(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    return {
        mockHelper: {
            getUrl: getUrl,
            getRandomString: getRandomString,
            getRandomWords: getRandomWords,
            getRandomNumberInRange: getRandomNumberInRange,
            getRandomDate: getRandomDate,
            getRandomBoolean: getRandomBoolean,
            getRandomImagePath: getRandomImagePath,
            getSubsetArray: getSubsetArray,
            getSingleValueFromArray: getSingleValueFromArray,
            appsMallCustomMatchers: {},
            testHelperMethods: {},
            getRandomRecord: function(collectionType, subdata, initialValues) {
                var record = {};
                var dateCreated = getRandomDate((new Date('1-1-10')), new Date('1-1-14'));
                var dateUpdated = getRandomDate(dateCreated, new Date());
                switch(collectionType)
                {
                    // data record for random app
                    case 'Apps':
                        var randomAppName = getRandomString(9);
                        record = {
                            "name": randomAppName,
                            "shortname": randomAppName,
                            "version": ("" + getRandomNumberInRange(0.1, 9.9, 0.1)),
                            "type": "app",
                            "workflowState": "Published",
                            "workflowMesssage": "",
                            "accessible": getRandomBoolean(),
                            "users": getRandomNumberInRange(1, 999),
                            "rating": getRandomNumberInRange(1, 5),
                            "ratings": getRandomNumberInRange(1, 999),
                            "descriptionShort": getRandomString(20),
                            "description": getRandomString(20),
                            "organization": "Home",
                            "createdOn": dateCreated.toString(),
                            "updatedOn": dateUpdated.toString(),
                            "icon": getRandomImagePath(),
                            "featuredBanner": getRandomImagePath(),
                            "smallBanner": getRandomImagePath(),
                            "screenshot": getRandomImagePath(),
                            "documentationUrl": "https://www.owfgoss.org/" + getRandomString(9) + "/Favorites.png",
                            "badges": getSubsetArray(['A','B','C','D','E']),
                            "appUrl": "",
                            "featured": getRandomBoolean(),
                            "poc": getRandomString(12),
                            "email": (getRandomString(8) + "@test.com"),
                            "phone": ("" + getRandomNumberInRange(100,999) + '-' + getRandomNumberInRange(1000,9999)),
                            "images": {
                                "iconId": Ozone.utils.generateId(),
                                "smallBannerId": Ozone.utils.generateId(),
                                "featuredBannerId": Ozone.utils.generateId(),
                                "screenshotId": Ozone.utils.generateId()
                            }
                        };
                        break;
                    // data record for random tag
                    case 'Tags':
                        subdata = subdata || {type: 'Role'};
                        if (subdata.type === 'System') {
                            record = {
                                "level": subdata.type,
                                "uri": "/AppsMall/" + (subdata.appName || getRandomString(9)) + "/",
                                "tag": getRandomString(9),
                                "description": "",
                                "tooltip": getRandomString(15),
                                "creatorUserId": "System",
                                "created": dateCreated.toString(),
                                "modified": dateUpdated.toString(),
                                "visibility": {}
                            };
                        }
                        else if (subdata.type === 'Role') {
                            record = {
                                "level": subdata.type,
                                "uri": ("/AppsMall/Apps/" + (subdata.appName || getRandomString(9))),
                                "tag": getRandomString(9),
                                "description": "",
                                "creatorUserId": "System",
                                "created": dateCreated.toString(),
                                "modified": dateUpdated.toString(),
                                "visibility": {}
                            };
                        }
                        else {
                            return {};
                        }
                        break;
                    // data record for random persona
                    case 'Personas':
                        var roles = [];
                        subdata = subdata || {};
                        if (subdata.admin) {
                            roles.push("Admin");
                        }
                        else if (subdata.contentSteward) {
                            roles.push("ContentSteward");
                        }
                        record = {
                            "username": getRandomString(9),
                            "auth_token": getRandomString(20),
                            "auth_service": "sample",
                            "meta": {
                                "roles": roles
                            }
                        };
                        break;
                    // data record for random review
                    case 'Reviews':
                        subdata = subdata || {};
                         if (!subdata.username) {
                             subdata.username = getRandomString(9);
                         }
                         record = {
                            "ratingAsNumber": getRandomNumberInRange(1,5),
                            "username": subdata.username,
                            "reviewText": getRandomString(20)
                         };
                         break;
                    default:
                        return {};
                }
                // return mock record, with initial values replacing random values if applicable.
                if (Ozone.utils.isObject(initialValues) && !Ozone.utils.isEmptyObject(initialValues)) {
                    return Ozone.extend(initialValues, record);
                }
                return record;
            }
        }
    };
}());
