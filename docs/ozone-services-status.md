##Ozone Status Service
The status service is simply meant to provide a means to determine what is and isn't started and some additional information that may be useful. It also has an option to serve the full configuration to the client for debugging purposes only (this requires a configuration change AND the required permission; both of which are neither a default to ensure this isn't accidentally enabled).

###/api/status
This route will return a JSON representation of the following:
* The current status of the services container
* A listing of all registered ozoneModules and each state (if applicable)
* The server's host and port
* The client configured URLs (if empty then defaults are assumed and used)
* All registered services within the Ozone.Service() API

####State
The state is always "Starting" or "Started" (anything else would...well not be served as a status). Once the registered services are told to start the the server finishes establishing it's http and / or https connections it will change to Started; it's unlikely but possible to receive the "Starting" message as the server starts very quickly.

####ozoneModules listing
This listing will display the data found in the configuration for each module (so the module name and its services that it registers). When the specified services are registered this listing will then include when a module has started. If a module does not have services that it registers it's technically not possible to know for sure when it's finished and ready so it will have a "Presumed" status indicating that we're presuming it's started.

####host and port
This is exactly as it says; it returns the host and port that node.js is currently hitting against.

####Client configured URLs
This will include the URLs for Apps Mall, Services, The HUD and App builder. If these are all empty then it's assumed we're in a combined bundle and default, relative paths are used.

####Registered services
Since anything can register and expose a service via Ozone.Service() each module can specify what services it registers. Then, once these services are registered, it will be output here along with being used to determine a module's status.

###/api/status/config
This service returns the **full** configuration being used by the service container. Anything in the ```default.js``` and the applicable environment file are combined and served at this address to allow a system administrator to see what the combined configuration looks like and to help with debugging.

Since this service has the potential to serve items we wouldn't normally want served it requires multiple steps to enable and use (nothing about this service is default and it's not even registered unless specified to be so). The following steps can be used to enable and use this RESTful endpoint:

* The ```server``` configuration block needs to have the following property marked true: ```serveFullConfigToSysAdmins``` (it's false by default). This will enable the service container to actually register this RESTful endpoint (otherwise it's not even registered).
* The user needs to have the system administrator permission associated with their persona ("/Ozone/System/Administration/"). This can be done through manual entry within MongoDB or adding it as part of a default or seeded data.
