/**
    @module Ozone.Services.App
    @submodule Server-Side
    @class Ozone.Services.App.RESTful
*/
var constants = require('../constants'),
    appsBaseURL = constants.rest.appsURL,
    componentsBaseURL = constants.rest.componentsURL,
    appsStore = constants.database.store.apps,
    appCollectionName = constants.database.collection.app,
    componentCollectionName = constants.database.collection.component,
    collectionName = constants.database.collection.collection;


module.exports = exports = function (Ozone) {

    var routing = Ozone.Routing,
        logger = Ozone.logger,
        Persistence = Ozone.Service("Persistence"),
        RoutesHelper = require('./RoutesHelper').init(Ozone);


    /* Either get all elements, or search for elements.
       Example URL: http://localhost:3000/api/apps/app                     (get all apps)
     */
     /**
         Gets all applications

         @method /api/apps/app GET
     */
    routing.get(appsBaseURL + appCollectionName, { loggedIn: true }, function (req, res) {
        RoutesHelper.get(appCollectionName, req, res);
    });

    /**
        Gets all components

        @method /api/components/component GET
    */
    routing.get(componentsBaseURL + componentCollectionName, { loggedIn: true }, function (req, res) {
        RoutesHelper.get(componentCollectionName, req, res);
    });

    /**
        Gets a specific application

        @method /api/apps/app/:id GET
    */
    routing.get(appsBaseURL + appCollectionName + '/:id', { loggedIn: true }, function (req, res, next) {
        RoutesHelper.getOne(appCollectionName, req, res, next);
    });

    /**
        Gets a specific component

        @method /api/components/component/:id GET
    */
    routing.get(componentsBaseURL + componentCollectionName + '/:id', { loggedIn: true }, function (req, res, next) {
        RoutesHelper.getOne(componentCollectionName, req, res, next);
    });

     /**
         Create an application using a JSON blob in the body.

         @method /api/apps/app/ POST
     */
    routing.post(appsBaseURL + appCollectionName, { loggedIn: true, permissions: ["/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"]  }, function (req, res, next) {
        RoutesHelper.post(appCollectionName, req, res, next);
    });

    /**
        Create a component using a JSON blob in the body.

        @method /api/components/component/ POST
    */
    routing.post(componentsBaseURL + componentCollectionName, { loggedIn: true, permissions: ["/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"]  }, function (req, res, next) {
        RoutesHelper.post(componentCollectionName, req, res, next);
    });

    /**
        Update an element. It will update only the fields that are in the json request, not replacing the whole object.

        @method /api/apps/app/:id PUT
     */
    routing.put(appsBaseURL + appCollectionName + '/:id', { loggedIn: true, permissions: ["/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"]  }, function (req, res, next) {
        RoutesHelper.put(appCollectionName, req, res, next);
    });

    /**
        Update an element. It will update only the fields that are in the json request, not replacing the whole object.

        @method /api/components/component/:id PUT
     */
    routing.put(componentsBaseURL + componentCollectionName + '/:id', { loggedIn: true, permissions: ["/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"]  }, function (req, res, next) {
        RoutesHelper.put(componentCollectionName, req, res, next);
    });

    /**
        Update an element. It will update only the fields that are in the json request, not replacing the whole object.

        @method /api/apps/app/:id POST
     */
    routing.post(appsBaseURL + appCollectionName + '/:id', { loggedIn: true, permissions: ["/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"]  }, function (req, res, next) {
        RoutesHelper.put(appCollectionName, req, res, next);
    });

    /**
        Update an element. It will update only the fields that are in the json request, not replacing the whole object.

        @method /api/components/component/:id POST
     */
    routing.post(componentsBaseURL + componentCollectionName + '/:id', { loggedIn: true, permissions: ["/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"]  }, function (req, res, next) {
        RoutesHelper.put(componentCollectionName, req, res, next);
    });

    /**
        Delete an element

        @method /api/apps/app/:id DELETE
     */
    routing.delete(appsBaseURL + appCollectionName + '/:id', { loggedIn: true, permissions: ["/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"]  }, function (req, res, next) {
        RoutesHelper.delete(appCollectionName, req, res, next);
    });

    /**
        Delete an element

        @method /api/components/component/:id DELETE
     */
    routing.delete(componentsBaseURL + componentCollectionName + '/:id', { loggedIn: true, permissions: ["/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"]  }, function (req, res, next) {
        RoutesHelper.delete(componentCollectionName, req, res, next);
    });

    /*  Collections for apps
     */
    routing.get(appsBaseURL + collectionName, { loggedIn: true }, function (req, res, next) {
        // get all
        Persistence.Store(appsStore).Collection(collectionName).get(function (err, result) {
            if (err) {
                logger.error("Error occurred while searching with Mongo - req.query: " + req.query + " err: " + err);
                res.send("Error occurred while searching - req.query: " + req.query + " err: " + err);
                return;
            }
            var elements = result.elements;

            logger.debug("RoutesHelper(AppsService)-->GET all collections-->Found " + elements.length + " elements.");
            res.send(elements);
        });

    });

    /*  Mass import of apps
     */
    routing.post(appsBaseURL + 'import', { loggedIn: true }, function (req, res, next) {
        var files = req.files,
        	uploadedFileData = files[Object.keys(files)[0]], // assume there is one file
        	fs = require('fs'),
        	data = fs.readFileSync(uploadedFileData.path); // read the uploaded file from the local temp directory (defined in express bodyParser's uploadDir setting).

        logger.debug("AppsService-->routes-->Mass Import-->files: " + JSON.stringify(files, null, 3));

        require('./importHelper')(data, function(err, results) {
        	// remove the file from the upload dir
            fs.unlinkSync(uploadedFileData.path);
            logger.debug("AppsService-->routes-->Mass Import-->deleted uploaded file from: " + uploadedFileData.path);

            if (err) {
                logger.error("AppsService-->routes-->Mass Import-->error while importing: " + JSON.stringify(err));
                res.send({error: "error while importing: " + JSON.stringify(err)});
                return next(err);
            }

            res.send(results);
        }, Ozone);
    });
};
