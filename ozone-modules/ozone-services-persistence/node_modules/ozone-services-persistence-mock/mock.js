(function () {
    "use strict";

    module.exports = function (Ozone, callback) {
        var logger = Ozone.logger,
            collectionImp = {}, driveImp = {}, collectionHelper = require('./collectionHelper')(),
            driveHelper = require('./driveHelper')();
		collectionHelper.init(Ozone);
		driveHelper.init(Ozone);

        collectionImp.get = collectionHelper.get;
        collectionImp.query = collectionHelper.query;
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
                    return Ozone.Utils.generateId();
                }
            };
        
        callback(require('../../persistence-interface')(collectionImp, driveImp, objectId, Ozone));
    };
}());
