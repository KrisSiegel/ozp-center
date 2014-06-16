##Configuration
The configuration works much like it does in a Ruby on Rails project in that there is the concept of a default set of configuration settings and then custom environment settings which can override any of the default settings.

The default configuration is located at ```config/default.js```. This configuration contains objects for client and server properties along with a common object for settings that may spread across both. Anything in the client object is served as text/javascript at the following URL: /config/default.js (this is configurable via the ```clientConfigPath``` property in the server configuration). Including this file after the Ozone API will automatically set the necessary configuration within the API.

Specifying an environment's configuration which overrides any entry within ```config/default.js``` works in two steps.

First, create the new environment under ```config/environments/MyEnvironment.js```. This file should return an object that directly matches the structure within ```config/default.js``` and any pieces that need to be configured should be done so in that place. Note that anything not specified simply means the values in ```config/default.js``` are used.

Second, update the ```package.json``` file's ```environment``` property with the name, minus the JavaScript extension, of the environment in which you'd wish you load.

Once those steps are completed then running ```npm start``` will load the ```config/default.js``` configuration then mix in anything in the specified environment's file.
