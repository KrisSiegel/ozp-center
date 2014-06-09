#Ozone Platform and Apps Mall
An overarching project that contains the new Ozone Service Container, various Ozone Services, the Ozone API, Apps Mall and App Builder. The project was designed so that with just a few commands the entire system can be downloaded and operational but could also be broken up into small pieces depending on infrastructure needs.

##Requirements
* node.js 0.10.x
* npm
* bower (npm install -g bower)
* grunt (npm install -g grunt-cli)
* jasmine-node (npm install -g jasmine-node)
* MongoDB 2.4.x with text searching enabled (mock data store can be used in place of MongoDB)

##Getting Started
These steps will get you started from the git repo to a custom configured version running in your environment.
####The Setup
If node.js 0.10.x is installed on the system you can follow these steps to get everything up and running. **Note**: if you're running from a bundle that includes all dependencies then skip to step 6.

1. Pull down the latest from the master branch at ```git@github.com:applicationsmall/aml-center.git```
2. Install the necessary global prerequisites via ```npm run-script prerequisites-unix``` or ```npm run-script prerequisites-windows``` (alternatively manually run: ```npm install -g grunt-cli```, ```npm install -g bower```, ```npm install -g jasmine-node```, ```npm install -g karma```, ```npm install -g karma-jasmine```, and ```npm install -g karma-chrome-launcher```)
3. Run ```npm install```
4. Run ```bower install```
5. Run ```grunt build```
5. Ensure MongoDB is running (```grunt start-mongod``` will start a locally installed MongoDB instance with text searching enabled). Alternatively set the persistence service to use the mock data store.
6. Start the application with ```npm start```

####Configuration
The configuration works much like it does in a Ruby on Rails project in that there is the concept of a default set of configuration settings and then custom environment settings which can override any of the default settings.

The default configuration is located at ```config/default.js```. This configuration contains objects for client and server properties along with a common object for settings that may spread across both. Anything in the client object is served as text/javascript at the following URL: /config/default.js (this is configurable via the ```clientConfigPath``` property in the server configuration). Including this file after the Ozone API will automatically set the necessary configuration within the API.

Specifying an environment's configuration which overrides any entry within ```config/default.js``` works in two steps.

First, create the new environment under ```config/environments/MyEnvironment.js```. This file should return an object that directly matches the structure within ```config/default.js``` and any pieces that need to be configured should be done so in that place. Note that anything not specified simply means the values in ```config/default.js``` are used.

Second, update the ```package.json``` file's ```environment``` property with the name, minus the JavaScript extension, of the environment in which you'd wish you load.

Once those steps are completed then running ```npm start``` will load the ```config/default.js``` configuration then mix in anything in the specified environment's file.

####Verifying
Once running you can navigate to the following areas within your web browser (note: URLs listed are the default URLs and may not represent your configured paths):
* ```http://localhost:3000/``` -> Will load the Ozone HUD if you're logged in.
* ```http://localhost:3000/AppsMall/``` -> Will load Apps Mall if you're logged in (Alternatively ```http://localhost:3000/#App/AppsMall/``` will load Apps Mall inside of the Ozone HUD).

##Running unit tests
Ozone Apps Mall contain test suites for both the service layer and the Angular user interface, as described below:

####Service Layer Unit Tests
Unit tests are run through jasmine-node and require a running version of the server to verify RESTful services. To run the unit tests simply run ```npm test``` to start the server in a jasmine aware context, run all server side and RESTful unit tests and then end the server's process. Client side tests are currently outstanding and will become integrated into this process in the near future.

####Angular User Interface Unit Tests
Angular unit tests are run through the Karma test runner, which launches a separate Chrome browser window.  Make sure that all three Karma-related npm modules have been installed: ```karma```, ```karma-jasmine```, and ```karma-chrome-launcher```.

To run the Angular unit tests run the ```./apps/appsmall/test/test.sh``` script from the ozoneappsmall root directory.  Test results will appear in the terminal window.

(If the above script produces a "karma: command not found" error, then you need to add the Karma bin directory to you path environment variable.  Find the Karma bin directory by typing in ```npm root -g``` to get the Node root pathname and appending ```/karma/bin``` to the root pathname. Add this directory to your path environment variable, and you should be able to run ```karma``` from the command line.)

###Naming convention
There is a naming convention to all spec files for testing. This allows us to treat each type of test separately in both reporting and context. They are and work as follows:
- *.node.spec.js - This is a type of test that is run against server-side code and does not need a web server started [but it is implied the Ozone API needs to be initialized along with the Ozone Modules].
- *.restful.spec.js - This is a type of test that is run against the running server's RESTful end points.
- *.client.spec.js - This is a type of test that is run in parallel to the running server. This type is not yet functional as of this writing but it will be placed into a browser context to execute via terminal.

###Where we look for specs
We currently look at the specs/ folder at the root for any tests matching the above naming convention (tests that fall outside of the convention are ignored; server.spec.js is the kick-off for all unit tests). In addition all Ozone Modules which are defined within the configuration are iterated over and each module's specs/ folder is investigated, again, for files with the naming convention above and then executed.

##Creating an Ozone Service Module
The new architecture of the Ozone Platform offers a modular approach not all that dissimilar to hapi. To demonstrate how this works let's explore an example ozone module.

First we create a new folder called ```ozone-example-module``` and place it inside of the ```ozone-modules``` folder. This is where all Ozone modules exist.

Then let's set up an appropriate ```main.js``` and ```package.json``` files. The ```package.json``` will point to ```main.js``` to allow execution without specifying a script name from within. This allows the ```require("./ozone-modules/ozone-example-module")``` to work.

Now we're all set up so let's write our module! Inside of ```main.js``` we want to export a function which gets executed as part of the Ozone module registration process which will accept a callback and the server-side Ozone API. An example implementation for ```main.js``` is as follows:

```
(function () {
    module.exports = function (callback, Ozone) {
        Ozone.Routing.get("example/", function (req, res) {
            res.send("Example module here");
        });
    };
}());
```

This tells Ozone that we want to register a service that handles calls to ```/api/example/``` and respond with an "Example module here" message.

There is one step left. To ensure we REALLY want to execute a module (thusly allowing a bundle to contain more modules than what is run) we need to add it to the list of modules to execute on start-up. Simply open the configuration's environment file that you wish to modify (or change it in default.js to apply to all environments) and add your module's name to the ```OzoneModules``` array already defined within.

That's it!

##Extending the Ozone HUD
The Ozone HUD is the container in which applications run inside of to provide a consistent interface and access to common applications and utilities.  Ozone HUD components were initially implemented using the x-tag Web Component/polyfill framework from Mozilla.  When the team started experiencing a few issues with it, including older browser support, we decided that, in order to avoid having to rewrite the components, we would provide a lightweight replacement for x-tags.  That replacement is called micro-xtags.  You can refer to the documentation at x-tag.org for general information, but micro-xtags does not fully implement the x-tag functionality.

###If it's not xtags or Web Components, how is it different?
In a true Web component framework, a custom HTML element behaves fully like an HTML element as well has having JavaScript object-like functionalities, such as the ability to have custom methods.  In micro-xtags, generally speaking, this unity is broken.  The object you get from a call to microXTag.getComponent is an mxtElement wrapper for the custom tag.  For convenience, a number of DOM element methods have been added to the mxtElement type which will be applied to the wrapped DOM element, notably setAttribute and getAttribute, but if you use pure DOM methods to find a custom element (e.g., document.getElementsByTagName('ozone-example')), any custom methods you have defined (in the 'methods' section of the registration object) cannot be called on the element.  However, there is a convenience method, 'microXTag.getMxtFromElement' which can be called with the DOM element as the argument, to get the mxtElement to call its methods.

You may reference other custom tags within the HTML markup of your component; however, these references must contain the attribute 'x-micro-tags="true"' in order for them to be automatically stood up as micro-xtag objects.

There is no direct support for xtag-style event registration.  This may be done in traditional ways inside the 'inserted' lifecycle method.

So far, only the 'query', 'addClass' and 'removeClass' utility functions from xtags are implemented on the microXTag namespace.

If you are dynamically inserting a custom element into the page, you must ensure that the "inserted" callback of the corresponding JS object gets fired.  There are currently three ways of doing that:

1. Instead of using parentElement.appendChild(customRawElement), you can use microXTag.appendChild(parentElement, newMxtElement), where newMxtElement is the object returned from a getComponent or getMxtFromElement

2. Again, instead of appendChild, use the jQuery-style appendTo method of the mxtElement, newMxtElement.appendTo(parentElement).

3. If you need to use an insertion method which may not be supported by micro-xtags, such ass insertBefore, you can use such a method to insert the raw element manually, but then you must call the onInsert method of the corresponding mxtElement object.


###The Setup
The following assumes we're creating a component called ozone-example and walks through setting up, registering the component and outputting "Hello, World!" within the HUD when navigating to ```http://localhost:3000/#/Example/```.

####Create the required files
Create the supporting files that will contain everything about the component. Navigate to ```public/ozone-hid/components/``` and create 3 files: ```ozone-example.html```, ```ozone-example.js``` and ```ozone-example.css```.

####Linking supporting files
Link to the supporting files from within the html page. Also we need to wrap our content in a template tag that has an id of ```ozone-example-tmpl```. Your HTML should look as follows (notice we're also hiding the content initially):

```
<script type="text/javascript" src="ozone-example.js"></script>
<link rel="stylesheet" href="ozone-example.css">
<!-- Use a script tag of type "text/template" in place of a template tag, since the behavior of the template tag is undefined on earlier browsers -->
<script type="text/template" id="ozone-example-tmpl">
<div id="ozone-example-block" style="display: none;">
    <h1>Hello, Example!</h1>
</div>
</script>
```

####Next let's set up the JavaScript registration
We need to tell the micro-xtags API to register a lifecycle for our component. In this example we will only use the "created" stage of the lifecycle but more exist and can be used by taking a look at x-tag documentation (www.x-tags.org).

The following code is a bare-bones example of our component's JavaScript to display "Hello, World!" when navigating to ```http://localhost:3000/#/Example/```:

```
(function () {
    microXTag.register("ozone-example", "ozone-example-tmpl", {
        lifecycle: {
            created: function() {
                component.init();
            }
        }
    });

    microXTag.ready(function () {
        microXTag.standUpTags(document.getElementsByTagName('ozone-example'));
    });

    var component = (function () {
        return {
            init: function () {
                pubsub.subscribe("navigate", function (hash) {
                    component.navigate(hash);
                });
            },
            navigate: function (hash) {
                if (hash !== undefined && hash.indexOf("#Example/") !== -1) {
                    component.showGui();
                } else {
                    component.hideGui();
                }
            },
            showGui: function () {
                var gui = document.getElementById("ozone-example-block");
                if (!Ozone.utils.isUndefinedOrNull(gui)) {
                    gui.style.display = "block";
                }
            },
            hideGui: function () {
                var gui = document.getElementById("ozone-example-block");
                if (!Ozone.utils.isUndefinedOrNull(gui)) {
                    gui.style.display = "none";
                }
            }
        };
    }());
}());
```

####Now what?
There are now two things we need to do to get your component included and rendered into the container.

First, pull the HTML part of the component in by adding it to the list of imported files in the call to microXTag.loadImports.  This will usually be called in the inline script on the main page.

Second, place your component's tag wherever you want / need within the container's ```index.html``` to use it! The typical thing to do, since it's hidden by default, is to simply drop the tag reference at the bottom with the rest of the components which are loaded on this page which looks like this: ```<ozone-example></ozone-example>```

####That's it!
Now load up your server and navigate to ```http://localhost:3000/#/Example/``` and you'll get a page that says "Hello, World!" in which you can do whatever you want.

####Wait, what's the pubsub stuff?
So to make true decoupled components you want to use messaging to handle cross communication to allow true component replacement. The basic solution used in the HUD is a simple implementation of a publish and subscribe pattern where one component can subscribe to a channel and receive information from another component via publish.

This should NOT be confused with Ozone messaging; this is ONLY a HUD paradigm to support cross component communication where server-side connection and persistence were not required. So while you can expose or make new ones there are some provided by xtagger and the default components which are as follows:

- Channel "navigate" -> Received anytime the hash in the URL is updated; each main HUD component should handle this channel and appropriately show or hide its content.
- Channel "showPersonaMenu" -> Shows the menu displayed typically when the user's name is clicked within the HUD.
- Channel "hidePersonaMenu" -> Hides the menu displayed typically displayed when the user's name is clicked within the HUD.
- Channel "addToPersonaMenu" -> Supports adding a new item to the persona menu and expects an object in the following format: ```{ label: "My Menu", channel: "My pubsub channel" }```.
- Channel "showBar" -> Shows the HUD bar.
- Channel "hideBar" -> Hides the HUD bar.
- Channel "showMask" -> Shows the mask displayed below a component. The following z-indexes should be kept in mind when working with the mask (always keep custom components above the mask's z-index and below the bar's z-mask):
    - A loaded application's z-index: 1000
    - The mask's z-index: 5000
    - The bar's mask: 9000
- Channel "hideMask" -> Hides the mask displayed below a component.

####I'm still confused
No worries; the full ozone-example component is included and registered, by default, in the Ozone build. So feel free to explore the code!

####Extras: animate.js
The HUD was designed to be as light weight and dependency-free as possible to support future inclusion into other web applications as a simple JavaScript include. Due to this, a simple way of animating things was created which consists of two methods available to all components:

```animate(options, callback, context).move()``` -> The animate method accepts a variety of options to specify a specific element by id or reference, the unit of movement, the style to affect, the target value of the style, direction, rate, step, etc; these are the basic items required of animation. Once the appropriate values are specified then calling move() will start the animation.

```animate(options, callback, context).cancel()``` -> The animate method signature is the same here but cancel will cancel the animation that is currently underway.

Example:
```
animate({
    elementId: "ozone-bar-closed",
    unit: "px",
    style: "marginBottom",
    startValue: -16,
    targetValue: 0,
    rate: 20,
    step: 2
}, function () {
    console.log("Moved!");
}).move();
```

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

##Bundled Ozone Service Modules
There are two types of bundled Ozone Service Modules; one of which acts as an interface hiding multiple implementations and the other which serves a very specific purpose. For instance the Persistence service module hides underlying implementations through MongoDB and an in-memory data store where as the Apps service module specifically stores and retrieves application records while using Persistence for storage.

###Persistence
The persistence service provides two implementations: a MongoDB and an in-memory mock implementation but the methods to access Persistence are the same regardless of the implementation.

####Configuration
The object that contains the necessary persistence properties is within the persistence object of the configuration. The available options are as follows:

Using MongoDB a connectionString can be utilized otherwise a list of servers can be specified with a user and password on to each server entry or by setting the user and password for all servers in the properties below:
```
persistence: {
    module: "ozone-services-persistence-mongo",
    store: "Ozone",
    mongo: {
        connectionString: undefined,
        servers: [
            { host: "localhost", port: 27017 }
        ],
        user: undefined,
        password: undefined
    }
}
```

Using in-memory mock database:
```
persistence: {
    module: "ozone-services-persistence-mock",
    store: "Ozone",
    mock: { }
}
```

####Creating a new persistence implementation
Since JavaScript doesn't really have interfaces like many object oriented languages it was decided to go through a common object that would act as an interface and accept an implementation.

1. Create a new dependency inside of the ozone-services-persistence module.
2. Implement all of the methods within the ```persistence-interface.js``` file.
3. Have your module return the ```persistence-interface.js``` file's results when requiring it and passing in your implementation.
4. Profit!

It's not too bad but it should be noted the API was mostly modeled after MongoDB so relational databases, while not impossible, may be more difficult to implement.

####Server-Side API
```Ozone.Service("Persistence").objectId()``` -> Returns a randomly generated id typically used for the data store.

```Ozone.Service("Persistence").Store(store)``` -> Returns Collection and Drive objects that act only within the specified store.

```Ozone.Service("Persistence").Store(store).Collection(collection).isImplemented()``` -> Returns whether the collection functionality has been implemented or not.

```Ozone.Service("Persistence").Store(store).Collection(collection).get(key, callback)``` -> Returns a specific collection's key's values within the callback's response.

```Ozone.Service("Persistence").Store(store).Collection(collection).query(selector, options, callback)``` -> An open-ended query method that allows authors of backend implementations to provide multiple ways of querying; there is no set structure here as it would be impossible to predict how others may need to use it. The provided way in the Mongo and Mock implementations is matching keys within the selector object to keys within a collection. Options, in the current implementation, allow for the specification of text searches in support of Mongo.

```Ozone.Service("Persistence").Store(store).Collection(collection).aggregate(aggregationArray, callback)``` -> A 1:1 wrap of the MongoDB aggregation; currently do not have this implemented in the Mock datastore. For more information see the MongoDB aggregation framework: http://docs.mongodb.org/manual/applications/aggregation/.

```Ozone.Service("Persistence").Store(store).Collection(collection).set(key, value, callback)``` -> Sets a new or existing key to the specified value.

```Ozone.Service("Persistence").Store(store).Collection(collection).remove(key, callback)``` -> Removes a specified key's value.

```Ozone.Service("Persistence").Store(store).Collection(collection).addIndex(index, options, callback)``` -> Adds an index to the backend implementation. This allows querying to work properly and quickly. Currently works like the MongoDB indexes; for more information see: http://docs.mongodb.org/manual/indexes/.

```Ozone.Service("Persistence").Store(store).Collection(collection).getIndexes(callback)``` -> Callback returns an array of indexes currently in use.

```Ozone.Service("Persistence").Store(store).Collection(collection).removeIndex(index, callback)``` -> Removes a specific index.

```Ozone.Service("Persistence").Store(store).Collection(collection).removeAllIndexes(callback)``` -> Removes all indexes. This is NOT a good idea to run outside of a development environment.

```Ozone.Service("Persistence").Store(store).Drive(drive).isImplemented()``` -> Returns whether the drive functionality has been implemented or not.

```Ozone.Service("Persistence").Store(store).Drive(drive).get(key, callback)``` -> Returns an associated blob based on the key within the callback's response.

```Ozone.Service("Persistence").Store(store).Drive(drive).set(key, blob, callback)``` -> Takes a key and a blob and sets the blob, within the data store, with that key. Callback is executed with response data if any.

```Ozone.Service("Persistence").Store(store).Drive(drive).remove(key, callback)``` -> Removes a specified blob and executes the callback with a status.

####RESTful Endpoints

```GET /api/store/:store/collection/:collection/:id``` -> Returns a specific collection record based on the id.

```GET /api/store/:store/collection/:collection/``` -> Returns the entire collection.

```GET /api/store/:store/collection/:collection/query/:criteria``` -> The :criteria in this context is any set of query string variables which are then transformed into JSON objects in the backend for querying. This returns all records that match the specified criteria.

```POST /api/store/:store/collection/:collection/``` -> Stores a new or existing object within the collection. Returns object with a key.

```PUT /api/store/:store/collection/:collection/``` -> Stores a new or existing object within the collection. Returns object with a key.

```DELETE /api/store/:store/collection/:collection/:id``` -> Deletes a specific record specified by the id.

```GET /api/store/:store/drive/:drive/:id``` -> Returns a blob with the same mimetype it was stored with.

```POST /api/store/:store/drive/:drive/``` -> Stores a blob within drive; returns a generated key.

```PUT /api/store/:store/drive/:drive/``` -> Stores a blob within drive; returns a generated key.

```DELETE /api/store/:store/drive/:drive/:id``` -> Deletes a specified blob.

####Client-Side API
```Ozone.Service("Persistence").Store(store)``` -> Returns Collection and Drive objects that act only within the specified store.

```Ozone.Service("Persistence").Store(store).Collection(collection).getCollectionPath()``` -> Returns the RESTful service path to the persistence service.

```Ozone.Service("Persistence").Store(store).Collection(collection).get(key, callback, context)``` -> The callback's response returns the specified value based on the key.

```Ozone.Service("Persistence").Store(store).Collection(collection).query(selector, options, callback, context)``` -> An open-ended query method that allows authors of backend implementations to provide multiple ways of querying; there is no set structure here as it would be impossible to predict how others may need to use it. The provided way in the Mongo and Mock implementations is matching keys within the selector object to keys within a collection. Options, in the current implementation, allow for the specification of text searches in support of Mongo.

```Ozone.Service("Persistence").Store(store).Collection(collection).set(key, value, callback, context)``` -> Sets a new or existing object to the specific value.

```Ozone.Service("Persistence").Store(store).Collection(collection).remove(key, callback, context)``` -> Removes a specified value.

```Ozone.Service("Persistence").Store(store).Drive(drive).getDrivePath()``` -> Returns the RESTful service path to the persistence service.

```Ozone.Service("Persistence").Store(store).Drive(drive).get(key, callback, context)``` -> The callback's response returns the specified value based on the key.

```Ozone.Service("Persistence").Store(store).Drive(drive).set(key, value, callback, context)``` -> Sets a new or existing object to the specific value.

```Ozone.Service("Persistence").Store(store).Drive(drive).remove(key, callback, context)``` -> Removes a specified value.

###Apps
The Apps service provides persistence of application records and some basic metrics. There exists a server-side and client-side API along with a set of RESTful endpoints to using the Apps service.

####Application JSON Structure
Below is the JSON structure for an application object. This can vary depending on certain custom fields but the persistence service allows that type of flexibility; these are the default fields. Note that the image fields require an ID that links to an image stored in the persistence drive.

```
{
  "_id": "531a954be8e6a9ad09603095",
  "name": "My App",
  "shortname": "MyApp",
  "version": "3",
  "type": "app",
  "workflowState": "Published",
  "workflowMesssage": "",
  "launchedCount": 2,
  "accessible": true,
  "rating": 4,
  "ratings": 16904,
  "descriptionShort": "Short description text here",
  "description": "Description text here",
  "organization": "Home",
  "createdOn": "2013-05-09T17:54:11Z",
  "updatedOn": "2013-05-09T17:54:17Z",
  "documentationUrl": "https://www.owfgoss.org/demodata/Favorites.png",
  "appUrl": "http://www.bing.com/",
  "featured": true,
  "poc": "John Doe",
  "email": "test@test.com",
  "phone": "555-6789",
  "images": {
    "iconId": "531a954ae8e6a9ad09603032",
    "smallBannerId": "531a954be8e6a9ad09603034",
    "largeBannerId": "531a954be8e6a9ad09603036",
    "screenshotId": "531a954be8e6a9ad09603039"
  }
}
```

####Server-Side API
```Ozone.Service("Apps").import(filePath, configDir, callback)``` -> Accepts an array of files to import, the configuration's base directory and a callback to execute when finished importing.

```Ozone.Service("Apps").export(callback)``` -> Returns an export of the current data within the service.

####RESTful Endpoints
```GET /api/apps/app/``` -> Returns all application records

```GET /api/apps/app/:id``` -> Returns the specified application record.

```GET /api/apps/app/?q=&shortname=&autocomplete=&tags=``` -> Returns the application records that are found from the specified query. The query parameters read as follows: q is the name of the app, shortname for a specific shortname, autocomplete to return a small subset of data and tags is an array of tags an application should be tagged with.

```POST /api/apps/app/``` -> Creates a new application record with a JSON payload.

```PUT /api/apps/app/``` -> Updates an existing application record with a JSON payload that contains an id.

```DELETE /api/apps/app/:id``` -> Deletes an application record.

```POST /api/apps/import/``` -> Accepts a file and attempts to import its data into the system.

####Client-Side API
```Ozone.Service("Apps").getServicePath()``` -> Returns a URL pointing to the RESTful endpoint of the Apps service based upon the configuration.

```Ozone.Service("Apps").getRedirectUrl(shortname)``` -> Returns a URL within the Ozone HUD using an application's shortname based upon the configuration. This is used for linking to an application to be loaded within the HUD. An example result may be: ```http://localhost:3000/#App/MyApplication/"```.

```Ozone.Service("Apps").launchAppByShortname(shortname)``` -> Takes an application's shortname and automatically launch it in a new tab within the Ozone HUD. This also logs the launch.

```Ozone.Service("Apps").redirectIntoHudWithoutLogging(shortname)``` -> Similar to ```launchAppByShortname(shortname)``` except it doesn't open it in a new tab and it does not log the redirection. Handy if a task, such as authentication, is required after launching an application.

```Ozone.Service("Apps").get(id, callback, context)``` -> Fetches an application record with a specific id and returns it to the specified callback method. The context of the call is optional and typically not necessary.

```Ozone.Service("Apps").query(selector, callback, context)``` -> Fetches one or more applications that meet a specific criteria within the selector object specified below (note: the autocomplete parameter forces the service to return a minimal set of records). Callback is executed and returns the array of records with context being optional.

```
{
    name: "My App",
    shortame: "MyApp",
    autocomplete: false,
    tags: ["Test", "Another"]
}
```

```Ozone.Service("Apps").create(app, callback, context``` -> Creates an application and automatically assigned it an id. The application JSON structure is very fluid in that there is little validation to prevent radically different formats from being inserted; this is done to support various application formats.

```Ozone.Service("Apps").update(app, callback, context)``` -> Same as create expect it expects an id to be present within the application record.

```Ozone.Service("Apps").delete(app, callback, context)``` -> Deletes an application record.

```Ozone.Service("Apps").updateLaunchedCount(shortname, callback)``` -> Increments the launch count for a specific application and executes a callback with an updated application record.

```Ozone.Service("Apps").import(file, callback, context)``` -> Accepts a file object to import. Supports a JSON file with application records or a zip file that contains JSON for application records and images to support the record.

###Tag
Tags consist of two components: a tag topic and a tag. A tag should be looked at as a resource which has a piece of meta data attached to it. For example an application, person or a sentence inside of a report could have a tag. A topic should be looked at as a definition that further describes where a tag came from, what type of category or topic it belongs to, etc. A list of categories, agencies or any other way of grouping a type of tag is where a tag topic fits in.

####A Tag Topic's JSON Structure
```
{
    "_id": "531a954ae8e6a9ad0960301f",
    "level": "System",
    "uri": "/AppsMall/Category/",
    "tag": "Fun Apps",
    "description": "Games and whatnot!",
    "creatorUserId": "System",
    "created": "2014-01-1T17:54:11Z",
    "modified": "2014-01-1T17:54:11Z",
    "visibility": {}
}
```

####A Tag's JSON Structure
```
{
    "_id": "531a954ae8e6a9ad0960302d",
    "uri": "/AppsMall/Apps/MyApp/",
    "topic": "/AppsMall/Category/",
    "tag": "Fun Apps",
    "creatorUserId": "System",
    "created": "2014-01-1T17:54:11Z",
    "modified": "2014-01-1T17:54:11Z",
    "visibility": {}
}
```

####What does this mean?
Looking at the examples above this demonstrates how the backend works. The Tag Topic with a tag of "Fun Apps" has a URI of "/AppsMall/Category/". This means we're defining a type of tag which would be a category in Apps Mall. In the Apps Mall application it would read from all tag topics with a URI of "/AppsMall/Category/" and display those as categories.

Looking at the tag example it shows that the URI is pointing to a resource (the "MyApp" application) and it has a tag. It also has a topic which is its way of saying "this tag was created from a category" and thusly allows the backend to provide further filtering and bucketing while being able to reuse the tagging system for almost any type of meta data attachments.

####Server-Side API


####RESTful Endpoints


####Client-Side API

###Personas
Personas is the user concept for Ozone Platform. Each user has a persona which has information regarding their authentication mechanism, preferences and other general user information.

Since multiple authentication methods can be used with the Ozone Platform Personas will treat the combination of a user name and an authentication token as a unique pair to ensure both are required for login (for example this prevents users brought in via the mock security service from working with a real authentication service and vice versa).

####A basic Persona's format is as follows:
```
{
    "username": "testOzoneAdmin1",
    "auth_service": "Mock",
    "auth_token": "testOzoneAdmin1",
    "meta": {
        "permissions": [
            "/Ozone/Personas/Permission/GrantPermission/"
        ],
        "favoriteApps": null,
        "launchedApps": null,
        "role": "Ozone Administrator"
    },
    "_id": "536320bbad13b24176af54b8"
}
```

There are two other pieces to the Personas service: Permissions and Roles.

Permissions are URIs designed to avoid conflicts by mapping from the highest level to the lowest level. For instance Application A might want a read permission for reports and Application B might want a write permission for reports. To ensure these two don't conflict their permission would be structured as follows:

```
/Ozone/Apps/App/ApplicationA/Reports/Read/
/Ozone/Apps/App/ApplicationB/Reports/Write/
```

####The basic structure of a permission record is as follows:
```
{
    "permission": "/Ozone/System/Administration/",
    "label": "Ozone System Administration",
    "description": "Permits useful functions to a system administrator.",
    "designation": "Ozone",
    "rank": 500,
    "createdBy": "SYSTEM",
    "createdOn": "2014-05-02T04:36:11.064Z",
    "lastModified": "2014-05-02T04:36:11.064Z",
    "_id": "536320bbad13b24176af54aa"
}
```

Roles are simply a way of grouping permissions and are mostly for organizational purposes. Since having a single role wouldn't be flexible enough across multiple applications and multiple roles confusing they are instead calculated when displayed to the user based upon their permissions.

####The basic structure of a role record is as follows:
```
{
    "role": "/Ozone/Personas/Role/Administrator/",
    "label": "Ozone Administrator",
    "description": "An Ozone wide administrator.",
    "designation": "Ozone",
    "rank": 0,
    "permissions": [
        "/Ozone/Personas/Permission/GrantPermission/"
    ],
    "createdBy": "SYSTEM",
    "createdOn": "2014-05-02T04:36:11.075Z",
    "lastModified": "2014-05-02T04:36:11.075Z",
    "_id": "536320bbad13b24176af54b5"
}

```

####Server-Side API

```Ozone.Service("Personas").persona.login(obj, req, res, next)``` ->
```Ozone.Service("Personas").persona.getById(userId, callback)``` ->
```Ozone.Service("Personas").persona.hasPermission(persona, permission)``` ->
```Ozone.Service("Personas").persona.query(selector, callback)``` ->
```Ozone.Service("Personas").persona.create(persona, callback)``` ->
```Ozone.Service("Personas").persona.update(personaId, persona, callback)``` ->
```Ozone.Service("Personas").persona.delete(personaId, callback)``` ->
```Ozone.Service("Personas").permissions.getById(permissionId, callback)``` ->
```Ozone.Service("Personas").permissions.query(selector, callback)``` ->
```Ozone.Service("Personas").permissions.create(permission, callback)``` ->
```Ozone.Service("Personas").permissions.update(permissionId, permission, callback)``` ->
```Ozone.Service("Personas").permissions.delete(permissionId, callback)``` ->
```Ozone.Service("Personas").roles.calculate(userPermissions, callback, fullPermissions, fullRoles, forceSync)``` ->
```Ozone.Service("Personas").roles.calculateSync(userPermissions, fullPermissions, fullRoles)``` ->
```Ozone.Service("Personas").roles.getById(roleId, callback)``` ->
```Ozone.Service("Personas").roles.query(selector, callback)``` ->
```Ozone.Service("Personas").roles.create(role, callback)``` ->
```Ozone.Service("Personas").roles.update(roleId, role, callback)``` ->
```Ozone.Service("Personas").roles.delete(roleId, callback)``` ->
```Ozone.Service("Personas").export()``` ->
```Ozone.Service("Personas").import()``` ->

####RESTful Endpoints


####Client-Side API

## Copyrights
> Software (c) 2014 [Computer Sciences Corporation](http://www.csc.com/ "CSC")

> The United States Government has unlimited rights in this software, pursuant to the contracts under which it was developed.  
 
The AML Center (under OZONE) is released to the public as Open Source Software, because it's the Right Thing To Do. Also, it was required by [Section 924 of the 2012 National Defense Authorization Act](http://www.gpo.gov/fdsys/pkg/PLAW-112publ81/pdf/PLAW-112publ81.pdf "NDAA FY12").

Released under the [Apache License, Version 2](http://www.apache.org/licenses/LICENSE-2.0.html "Apache License v2").


## Community
 
### OWF GOSS Board
OWF started as a project at a single US Government agency, but developed into a collaborative project spanning multiple federal agencies.  Overall project direction is managed by "The OWF Government Open Source Software Board"; i.e. what features should the core team work on next, what patches should get accepted, etc.  Gov't agencies wishing to be represented on the board should check http://owfgoss.org for more details.  Membership on the board is currently limited to Government agencies that are using OWF and have demonstrated willingness to invest their own energy and resources into developing it as a shared resource of the community.  At this time, the board is not considering membership for entities that are not US Government Agencies, but we would be willing to discuss proposals.
 
### Contributions

#### Non-Government
Contributions to the baseline project from outside the US Federal Government should be submitted as a pull request to the core project on GitHub.  Before patches will be accepted by the core project, contributors have a signed [Contributor License Agreement](https://www.ozoneplatform.org/ContributorLicenseAgreement1-3OZONE.docx) on file with the core team.  If you or your company wish your copyright in your contribution to be annotated in the project documentation (such as this README), then your pull request should include that annotation.
 
#### Government
Contributions from government agencies do not need to have a CLA on file, but do require verification that the government has unlimited rights to the contribution.  An email to goss-support@owfgoss.org is sufficient, stating that the contribution was developed by an employee of the United States Government in the course of his or her duties. Alternatively, if the contribution was developed by a contractor, the email should provide the name of the Contractor, Contract number, and an assertion that the contract included the standard "Unlimited rights" clause specified by [DFARS 252.227.7014](http://www.acq.osd.mil/dpap/dars/dfars/html/current/252227.htm#252.227-7014) "Rights in noncommercial computer software and noncommercial computer software documentation".
 
Government agencies are encouraged to submit contributions as pull requests on GitHub.
