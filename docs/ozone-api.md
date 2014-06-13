##Ozone API
The new Ozone API has two main components: a server-side and a client-side version. Both versions utilize a majority of the same source code with exceptions depending on the environment.

###Server-Side and Client-Side Available
```Ozone.extend(source, target)``` -> Provides the ability to extend the Ozone object when the target parameter is elided otherwise mixes the source with the target.

####Ozone.config()
The configuration method is the centralized place where all Ozone parts (server-side API and services and client-side components) get and set their configuration parameters.

```Ozone.config(conf, environment)``` -> Sets the conf parameter as the configuration object; mixes with optional environment parameter.

```Ozone.config()``` -> Returns a set of accessor methods once a configuration is already set.

```Ozone.config().getConfig()``` -> Returns the raw configuration object.

```Ozone.config().getProperty(side, prop)``` -> Returns a property, safely, after being provided the configuration's root object and the target property.

```Ozone.config().getCommonConfig()``` -> Returns the common configuration object.

```Ozone.config().getCommonProperty(prop)``` -> Returns a property, safely, from the common configuration object.

```Ozone.config().getServerConfig()``` -> Returns the server configuration object.

```Ozone.config().getServerProperty(prop)``` -> Returns a property, safely, from the server configuration object.

```Ozone.config().getClientConfig()``` -> Returns the client configuration object.

```Ozone.config().getClientProperty(prop)``` -> Returns a property, safely, from the client configuration object.

####Ozone.logger

```Ozone.logger.debug(obj)``` -> Executes the debug logger.

```Ozone.logger.info(obj)``` -> Executes the info logger.

```Ozone.logger.warning(obj)``` -> Executes the warning logger.

```Ozone.logger.error(obj)``` -> Executes the error logger.

####Ozone.utils
```Ozone.utils.isUndefinedOrNull(obj)``` -> Returns whether an object is undefined or null or not.

```Ozone.utils.isObject(obj)``` -> Returns whether an item passed in is an object or not.

```Ozone.utils.isArray(arr)``` -> Returns whether an item passed in is an array or not.

```Ozone.utils.isString(obj)``` -> Returns whether an item passed in is a string or not.

```Ozone.utils.isFunction(func)``` -> Returns whether an item passed in is a function or not.

```Ozone.utils.isEmptyObject(obj)``` -> Returns whether an item passed in is an empty object or not.

```Ozone.utils.safe(baseObj, jsonPath)``` -> Returns, safely, a property at any depth of a base object. Returns ```undefined``` if not value is found.

```Ozone.utils.affixUrlWithProtocol(url, protocol)``` -> Returns a url affixed with the specified protocol.

```Ozone.utils.murl(urlProperty, urlParts, isClientSide)``` -> Returns a URL based upon the values specified under common -> urls in the configuration. Designed to create good URLs for the server or client side in which they can be used at any position (so absolute URLs for the client side, relative for the server).

```Ozone.utils.isServerSide()``` -> Since many of these methods can be run in either context it's useful to know whether you're running server-side or client-side which is what this method returns.

####Ozone.Service()
```Ozone.Service(name, service)``` -> When both parameters are provided then the specified service is "registered". Subsequent calls to ```Ozone.Service(name)``` will return the provided service object. This enabled custom plug and play services to be provided without modifying the Ozone API and works on the client and server sides.

```Ozone.Service().on(event, serviceName, callback)``` -> This is the eventing mechanism of the service register; at the moment the only event supported is ```"ready"``` and provides a way to safely conduct service to service communication to ensure a service is started up being using it.

```Ozone.Service().registeredServices``` -> This property should not be used and may be deprecated in a future release but provides a way of seeing and accessing all available and registered services.

###Server-Side Available
```Ozone.load(appBasePath, modules)``` -> Will take the base path of the node application and 1 or many modules to load from a path of ```appBasePath/ozone-modules/modules[i]```. All loaded ozone modules are provided with the Ozone object (aka the server-side API).

```Ozone.Routing.method(path, access, callback)``` -> Exposes all supposed HTTP methods for creating RESTful endpoints. Using the configuration property of ```apiBasePath``` all specified paths have that automatically prepended. The access parameter is optional and supports specifying requirements for a route to succeed (example: ```{ loggedIn: true, permissions: ["THIS", "THAT"] }```). Some examples of using the routing methods:

```
Ozone.Routing.get("/test/", { loggedIn: true }, function (req, res) {
    res.send("Success!");
});
```

```
Ozone.Routing.get("/helloWorld/", function (req, res) {
    res.send("Hello, World!");
});
```

###Client-Side Available
```Ozone.ajax(options)``` -> Allows for calls via ajax without additional third party libraries. It automatically handles the necessary CORs functionality and redirection for 401 errors. The options object can contain the following (note: error and failure provide the same function but were aliased to consistency with third party libraries):

```
Ozone.ajax({
    url: "http://localhost:3000/api/helloWorld",
    method: "GET",
    timeout: 2000,
    withCredentials: true,
    type: "json",
    context: this,
    data: { text: "Hello, World!" },
    success: function (status, response) { },
    error: function (status, response) { },
    failure: function (status, response) { }
});
```
