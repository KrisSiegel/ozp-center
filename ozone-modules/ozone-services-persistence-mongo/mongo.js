/**
    Provides the implementation for the PersistenceCommon interface.
*/
module.exports = (function (Ozone) {
    "use strict";

    var logger = Ozone.logger,
        collectionImp = {},
        driveImp = {},
        mongoConnect = require('./MongoConnect');

    mongoConnect.init(Ozone, function (err, openedDb) {
        if (err) {
            throw err;
        }
        setupImps();
    });

    function setupImps() {
        var collectionHelper = require('./collectionHelper')(Ozone),
            driveHelper = require('./driveHelper')(Ozone);

        collectionImp.get = collectionHelper.get;
        collectionImp.query = collectionHelper.query;
        collectionImp.aggregate = collectionHelper.aggregate;
        collectionImp.set = collectionHelper.set;
        collectionImp.remove = collectionHelper.remove;
        collectionImp.addIndex = collectionHelper.addIndex;
        collectionImp.getIndexes = collectionHelper.getIndexes;
        collectionImp.removeIndex = collectionHelper.removeIndex;
        collectionImp.removeAllIndexes = collectionHelper.removeAllIndexes;

        driveImp.get = driveHelper.get;
        driveImp.set = driveHelper.set;
        driveImp.remove = driveHelper.remove;

        var objectId = {
            getObjectId: function () {
                return require('mongodb').ObjectID().toHexString();
            }
        }
        Ozone.Service("Persistence", Ozone.Service("PersistenceCommon")(collectionImp, driveImp, objectId, Ozone));
    }
});
