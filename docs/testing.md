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
