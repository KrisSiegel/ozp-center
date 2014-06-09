Ozone.extend(function () {
    var mockDb = (function() {
        var mockStore = {};

        // RWP TEMP: delimiter used for composite keys; this is a bit hacky but shouldn't ever cause a test with randomly generated fields to fail.
        var compositeKeyFieldDelimiter = '~!~!~';

        // key field that uniquely identifies a record within the collection.
        // Values should be the field name string for standard key fields, and arrays for composite keys.
        // (RWP: Reviews has appid as the key field, because the real client-api passes in appid as a query parameter to the server.)
        var keyFieldsForCollection = {
            Personas: 'username',
            PersonaRoles: 'label',
            PersonaPermissions: 'label',
            CurrentPersona: 'null',
            Reviews: ['app', 'user']
        };

        // initialize collection if it doesn't already exist in mock DB, and return true if collection didn't already exist.
        var initializeCollectionIfEmpty = function(collectionName) {
            if (Ozone.utils.isUndefinedOrNull(mockStore[collectionName])) {
                mockStore[collectionName] = {};
                return true;
            }
            return false;
        };

        var isComposite = function(collectionName) {
            return Ozone.utils.isArray(keyFieldsForCollection[collectionName]);
        }

        var query = function(collectionName, selector) {
            initializeCollectionIfEmpty(collectionName);
            if (!Ozone.utils.isObject(selector)) {
                return [];
            }
            var records = Ozone.utils.values(mockStore[collectionName]);

            var filteredRecordValues = records.filter(function(record) {
                for (var selectorKey in selector) {
                    var selectorValue = selector[selectorKey];

                    // if selector field is q (for name-querying field): perform name query on start of string instead of querying on 'q'.
                    if (selectorKey === 'q') {
                        if (!(record.name || '').toLowerCase().startsWith(selectorValue.toLowerCase())) {
                            return false;
                        }
                    }
                    else if (selectorKey !== 'autocomplete') {
                        // if user selects id as a query field, then query by key fields (typically '_id')
                        if (selectorKey === 'id') {
                            selectorKey = getKeyFieldFromRecord(collectionName);
                        }

                        // selector test: record must have selectorKey as attribute, and attribute must equal selectorValue.
                        if (!(record[selectorKey] === selectorValue)) {
                            return false;
                        }
                    }
                }
                return true;
            });
            return Ozone.utils.clone(filteredRecordValues);
        };

        var save = function(collectionName, record) {
            var recordId;
            initializeCollectionIfEmpty(collectionName);
            if (!Ozone.utils.isObject(record)) {
                return null;
            }

            var keyField = getKeyFieldFromRecord(collectionName, record);

            // generate random id for empty key (or keys, if record has composite key)
            var tmpKeyField = keyField;
            if (!Ozone.utils.isArray(tmpKeyField)) {
                tmpKeyField = [keyField];
            }
            for (var i = 0, len = tmpKeyField.length; i < len; i++) {
                if (Ozone.utils.isUndefinedOrNull(record[tmpKeyField[i]])) {
                    record[tmpKeyField[i]] = Ozone.utils.generateId();
                }
            }

            var key = getStringifiedKey(collectionName, record);
            mockStore[collectionName][key] = Ozone.utils.clone(record);
            return record;
        };

        var getAllRecords = function(collectionName) {
            if (initializeCollectionIfEmpty(collectionName)) {
                return [];
            }
            return Ozone.utils.values(mockStore[collectionName]);
        };

        var deleteSingleRecord = function(collectionName, id) {
            if (initializeCollectionIfEmpty(collectionName)) {
                return false;
            }
            var recordExists = !Ozone.utils.isUndefinedOrNull(mockStore[collectionName][id]);
            delete mockStore[collectionName][id];
            return recordExists;
        };

        var getAllIds = function(collectionName) {
            if (Ozone.utils.isArray(collectionName)) {
                var idObj = {};
                for (var i = 0, len = collectionName.length; i < len; i++) {
                    idObj[collectionName[i]] = getAllIds(collectionName[i]);
                }
                return idObj;
            }
            var allRecords = getAllRecords(collectionName);
            return allRecords.map(function(record) { return getStringifiedKey(collectionName, record); });
        }

        // Returns key field name, or array if key is composite.
        var getKeyFieldFromRecord = function(collectionName) {
            if (keyFieldsForCollection.hasOwnProperty(collectionName)) {
                return keyFieldsForCollection[collectionName];
            }
            return '_id';
        };

        var getStringifiedKey = function(collectionName, record) {
            keyValue = getKeyFieldFromRecord(collectionName);
            if (Ozone.utils.isArray(keyValue)) {
                return keyValue.map(function(singleKeyValue) { return (record[singleKeyValue] || '').toString(); }).join(compositeKeyFieldDelimiter);
            }
            else {
                return record[keyValue].toString();
            }
        };

        var fixtureLookup = {
            Apps: 'appRecords',
            Tags: 'tagRecords',
            TagTopics: 'tagTopicRecords',
            Personas: 'personaRecords',
            PersonaRoles: 'personaRoleRecords',
            PersonaPermissions: 'personaPermissionRecords',
            Reviews: 'reviewRecords'
        }

        var loadFixture = function(collectionName) {
            fixtureName = fixtureLookup[collectionName];
            if (fixtureName) {
                mockStore[collectionName] = {};
                if (Ozone.utils.isObject(Ozone.fixtures[fixtureName])) {
                    mockStore[collectionName] = Ozone.utils.clone(Ozone.fixtures[fixtureName]);
                }
                else if (Ozone.utils.isArray(Ozone.fixtures[fixtureName])) {
                    var itemArray = Ozone.fixtures[fixtureName];
                    for (var i = 0, len = itemArray.length; i < len; i++) {
                        var record = Ozone.utils.clone(itemArray[i]);
                        if (Ozone.utils.isObject(record)) {
                            if (Ozone.utils.isUndefinedOrNull(record._id)) {
                                record._id = Ozone.utils.generateId();
                            }
                            var fixtureKey = getStringifiedKey(collectionName, record);
                            mockStore[collectionName][fixtureKey] = record;
                        }
                    }
                }
            }
            return mockStore[collectionName];
        };

        return  {
            loadFixture: loadFixture,
            loadFixtures: function(fixtureNames) {
                if (Ozone.utils.isArray(fixtureNames)) {
                    return fixtureNames.map(function(fixtureName) { return loadFixture(fixtureName); });
                }
            },
            getKeyFieldFromRecord: getKeyFieldFromRecord,
            getAllIds: getAllIds,
            getAllRecords: getAllRecords,
            getSingleRecord: function(collectionName, id) {
                if (initializeCollectionIfEmpty(collectionName)) {
                    return {};
                }
                return mockStore[collectionName][id] || {};
            },
            create: save,
            update: function(collectionName, record, id) {
                if (isComposite(collectionName)) {
                    return save(collectionName, record);
                }
                var keyField = getKeyFieldFromRecord(collectionName);
                record[keyField] = id;
                return save(collectionName, record);
            },
            query: query,
            delete: deleteSingleRecord,
            deleteSingleRecord: deleteSingleRecord,
            deleteAllRecords: function(collectionName) {
                mockStore[collectionName] = {};
                return true;
            },
            deleteAllCollections: function() {
                for (var collectionName in mockStore) {
                    mockStore[collectionName] = {};
                }
                return true;
            }
        }
    }());

    return {
        fixtures: {},
        mockDb: mockDb
    };
}());
