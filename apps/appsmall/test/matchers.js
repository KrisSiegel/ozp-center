var fieldMatchingTest = function(record1, record2, field) {
    // RWP TEMP: needs custom message
    var areObjects = Ozone.utils.isObject(record1) && Ozone.utils.isObject(record2);
    return areObjects && !Ozone.utils.isUndefinedOrNull(record1[field]) && !Ozone.utils.isUndefinedOrNull(record2[field]) && (record1[field] === record2[field]);
};

Ozone.mockHelper.appsMallCustomMatchers = {
    toBeEmpty: function() {
        return (Ozone.utils.isUndefinedOrNull(this.actual) || Ozone.utils.isEmptyObject(this.actual));
    },
    toBeRecordWithIdField: function() {
        return (Ozone.utils.isObject(this.actual) && _.chain(this.actual).values().map(function(value) { return Ozone.utils.isValidId(value); }).any().value());
    },
    toBeAnArrayOfSize: function(size) {
        return Ozone.utils.isArray(this.actual) && (this.actual.length === size);
    },
    toHaveFieldMatching: function(record, field) {
        return fieldMatchingTest(this.actual, record, field);
    },
    toHaveIdEqualTo: function(idValue) {
        return (this.actual._id === idValue);
    },
    toHaveRecordWithFieldMatching: function(record, field) {
        return _.any(this.actual, function(record2) { 
            return fieldMatchingTest(record2, record, field);
        }); 
    },
    toHaveRecordWithIdMatching:  function(record) {
        return _.any(this.actual, function(record2) {
            return fieldMatchingTest(record2, record, '_id');
        }); 
    },
    toHaveRecordWithFieldEqualTo: function(value, field) {
        var recordToMatch = {};
        recordToMatch[field] = value;
        return _.any(this.actual, function(record2) { 
            return fieldMatchingTest(record2, recordToMatch, field);
        }); 
    },
    toBeNonMatchingSubstringOf: function(largerString) {
        var areStrings = ((typeof(this.actual) === 'string') && (typeof(largerString) === 'string'))
        return (areStrings && (this.actual.length < largerString.length) && (largerString.startsWith(this.actual)));
    },
    toStartWith: function(substring) {
        return (this.actual || '').startsWith(substring);
    },
    toContainAllOf: function(array) {
        var itemsInBothArrays = _.intersection(this.actual, array);
        return ((array.length > 0) && (itemsInBothArrays.length === array.length))
    },


    // toContainRecordWithFieldAndValue: function(fieldName, fieldValue) {
    //     return this.actual.filter(function(record) { return (record[fieldName] === fieldValue); }).length > 0;
    // }
};
