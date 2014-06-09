Ozone.extend(function () {
    var serviceNameLookupByUrl;

    var getRouteObjectFromUrl = function(options) {
        var routeParams = Ozone.extend(Ozone.utils.clone(options), {url: '', method: 'GET', query: {}, route: []});
        var urlWithoutServiceRoot;
        // lazy loading service URL lookup hash so that config object gets initialized first
        if (Ozone.utils.isUndefinedOrNull(serviceNameLookupByUrl)) {
            serviceNameLookupByUrl = Ozone.ServiceLookup(true);
        }
        for (var lookupUrl in serviceNameLookupByUrl) {
            if (options.url.startsWith(lookupUrl)) {
                routeParams.collection = serviceNameLookupByUrl[lookupUrl];
                urlWithoutServiceRoot = options.url.replace(lookupUrl, '');
            }
        }
        if (routeParams.collection && urlWithoutServiceRoot) {
            routeParams.route = urlWithoutServiceRoot.split('/').filter(function(value) { return (value !== ''); });
        }
        return routeParams;
    }

    var handleParamsAsDefaultResource = function(routeParams) {
        switch(routeParams.method) {
            case 'GET':
                if ((routeParams.route.length > 1) && (Ozone.utils.isValidId(routeParams.route[1]))) {
                    return Ozone.mockDb.getSingleRecord(routeParams.collection, routeParams.route[1]);
                }
                else if (routeParams.route.length <= 1) {
                    if (Ozone.utils.isEmptyObject(routeParams.query)) {
                        return Ozone.mockDb.getAllRecords(routeParams.collection);
                    }
                    else {
                        return Ozone.mockDb.query(routeParams.collection, routeParams.query);
                    }
                }
                break;

            case 'PUT':
                return Ozone.mockDb.update(routeParams.collection, options.data);
                break;

            case 'POST':
                return Ozone.mockDb.create(routeParams.collection, options.data);
                break;

            case 'DELETE':
                if ((routeParams.route.length > 1) && (Ozone.utils.isValidId(routeParams.route[1]))) {
                    return Ozone.mockDb.delete(routeParams.collection, routeParams.route[1]);
                }
                break;
        }
        return null;
    }

    return {
        ajax: function (options) {
            if (options === undefined || options.method === undefined || options.url === undefined) {
                return;
            }
            try {
                var routeObj = getRouteObjectFromUrl(options);
                var routeParams = routeObj.route || [];
                switch(routeParams.collection) {
                    case "Apps":
                        break;

                    case "Components":
                        break;

                    case "Persistence":
                        // concatenate entire route component into collection name, minus id field if applicable
                        var newRouteParams = [];
                        var lastRouteParam = routeParams[routeParams.length - 1];
                        if (Ozone.utils.isValidId(lastRouteParam)) {
                            newRouteParams.push(routeParams.pop());  // move id parameter from old params array to new params array
                        }
                        routeObj.collection = routeParams.join('|');
                        routeObj.route = newRouteParams;
                        break;
                        
                    case "Personas":
                        // update current persona
                        if ((routeParams.length > 1) && (routeParams[0] === 'persona') && (routeParams[1] === 'current')) {
                            routeParams.splice(0, 2) // remove first two elements
                            if (routeParams.method === 'POST') {
                                options.tmp_id = options._id;
                                options._id = 'null';
                                return Ozone.mockDb.update('CurrentPersona', options.data);
                            }
                            else if (routeParams.method === 'GET') {
                                var persona = Ozone.mockDb.getSingleRecord('CurrentPersona', 'null');
                                persona._id = persona.tmp_id;
                                return persona;
                            }
                        }
                        break;

                    case "Tags":
                        break;

                    case "AppsMall":
                        break;
                }
                if (routeObj) {
                    return handleParamsAsDefaultResource(routeObj);
                }
            } 
            catch (ex) {
                if (options.error !== undefined || options.failure !== undefined) {
                    (options.error || options.failure).apply((options.context || this), [ex]);
                }
            }
        }
    };
}());
