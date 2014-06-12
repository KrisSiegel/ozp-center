##Creating an Ozone Service Module
The new architecture of the Ozone Platform offers a modular approach not all that dissimilar to hapi.js. To demonstrate how this works let's explore an example ozone module.

###The Setup
First we create a new folder called ```ozone-example-module``` and place it inside of the ```ozone-modules``` folder. This is where all Ozone modules exist.

Then let's set up an appropriate ```main.js``` and ```package.json``` files. The ```package.json``` will point to ```main.js``` to allow execution without specifying a script name from within. This allows the ```require("./ozone-modules/ozone-example-module")``` to work.

###The Code
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

###The Configuration
There is one step left. To ensure we REALLY want to execute a module (multiple modules can be bundled but left unused in the Ozone Platform Service Container) we need to add it to the list of modules to execute on start-up. Simply open the configuration's environment file that you wish to modify (or change it in default.js to apply to all environments) and add your module's name to the ```ozoneModules``` array already defined within.

That's it!
