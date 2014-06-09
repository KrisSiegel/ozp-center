Ozone.Service("Components", (function () {
    var service = {
        getServicePath: function () {
            return Ozone.utils.murl("apiBaseUrl", "/components/", true);
        },
        get: function (id, callback, context) {
            if (Ozone.utils.isUndefinedOrNull(context) && !Ozone.utils.isFunction(callback)) { // get all
                context = callback;
                callback = id;
            }

            if (!Ozone.utils.isFunction(callback)) {
                throw "No callback defined";
            }

            var url = this.getServicePath() + "component/";
            if (id !== undefined && !Ozone.utils.isFunction(id)) {
                url = url + id;
            }

            //---  Ozone.ajax replacement code ---//
            if (id !== undefined && !Ozone.utils.isFunction(id)) {
                var clonedComponent = Ozone.mockDb.getSingleRecord('Components', id);
                return callback.apply((context || this), [clonedComponent]);
            }
            else {
                var clonedComponents = Ozone.mockDb.getAllRecords('Components');
                return callback.apply((context || this), [clonedComponents]);
            }
            //---  Ozone.ajax replacement code ---//
        },
        query: function (selector, callback, context) {
            if (!Ozone.utils.isFunction(callback)) {
                throw "No callback defined";
            }
            if (!Ozone.utils.isObject(selector)) {
                throw "No selector defined";
            }

            // currently, available fields for query are: component name (in component collection), tag (in tag collection).
            var queryObj = {};
            if (selector.name) {
                queryObj.q = selector.name;
            }
            if (selector.autocomplete) {
                queryObj.autocomplete = 'true';
            }
            if (selector.tags) { // is array
                queryObj.tag = selector.tags.join();
            }
            if (selector.workflowState) {
                queryObj.workflowState = selector.workflowState;
            }
            Ozone.logger.debug("in component query, queryObj: " + JSON.stringify(queryObj, null, 3));

            var url = this.getServicePath() + "component/";

            //---  Ozone.ajax replacement code ---//
            delete queryObj.autocomplete;
            var filteredComponentValues = Ozone.mockDb.query('Components', queryObj);

            if (selector.autocomplete) {
                var componentAutocompleteNames = filteredComponentValues.map(function(component) {
                    return (component.name || '');
                });
                return callback.apply((context || this), [componentAutocompleteNames]);
            }
            else {
                return callback.apply((context || this), [filteredComponentValues]);
            }
            //---  Ozone.ajax replacement code ---//
        },
        create: function (component, callback, context) {
            if (!Ozone.utils.isFunction(callback)) {
                throw "No callback defined";
            }
            if (Ozone.utils.isUndefinedOrNull(component)) {
                throw "No component defined";
            }

            var url = this.getServicePath() + "component/";

            //---  Ozone.ajax replacement code ---//
            var createdComponent = Ozone.mockDb.create('Components', component);
            if (createdComponent) {
                return callback.apply((context || this), [createdComponent]);
            }
            //---  Ozone.ajax replacement code ---//
        },
        update: function (component, callback, context) {
            if (!Ozone.utils.isFunction(callback)) {
                throw "No callback defined";
            }
            if (Ozone.utils.isUndefinedOrNull(component)) {
                throw "No component defined";
            }

            var id = (component.id || component._id);
            if (id === undefined) {
                throw "component has no id";
            }
            var url = this.getServicePath() + "component/" + id;

            //---  Ozone.ajax replacement code ---//
            var updatedComponent = Ozone.mockDb.update('Components', component, id);
            if (updatedComponent) {
                return callback.apply((context || this), [updatedComponent]);
            }
            //---  Ozone.ajax replacement code ---//
        },
        del: function (component, callback, context) {
            if (!Ozone.utils.isFunction(callback)) {
                throw "No callback defined";
            }
            if (Ozone.utils.isUndefinedOrNull(component)) {
                throw "No component defined";
            }

            var id = (component.id || component._id);
            if (id === undefined) {
                throw "component has no id";
            }
            var url = this.getServicePath() + "component/" + id;

            //---  Ozone.ajax replacement code ---//
            var isDeleted = Ozone.mockDb.delete('Components', id);
            if (isDeleted) {
                return callback.apply((context || this), [component]);
            }
            //---  Ozone.ajax replacement code ---//
        }
    };

    // Support of IE8 and it's terrible understanding of ECMAScript
    service["delete"] = service.del;

    return service;
}()));
