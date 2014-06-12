##Unit Testing Ozone Platform and Apps Mall
There are different types of unit tests contained within this project. Some unit tests are specifically for the Ozone Platform components and some are for Apps Mall since Apps Mall is treated as a separate application (althought it is bundled together within this repository).

###Ozone Platform Unit Testing
The following section outlines how to run the Ozone Platform unit tests and the naming conventions used to allow custom Ozone Modules to be unit tested with the rest.

####Naming convention
There is a naming convention to all spec files for testing. This allows us to treat each type of test separately in both reporting and context. They are and work as follows:
- *.node.spec.js - This is a type of test that is run against server-side code and does not need a web server started [but it is implied the Ozone API needs to be initialized along with the Ozone Modules].
- *.restful.spec.js - This is a type of test that is run against the running server's RESTful end points.
- *.client.spec.js - This is a type of test that is run in parallel to the running server. *This type is not yet functional as of this writing but it will be placed into a browser context to execute via terminal.*

When unit testing Ozone Modules the naming convention above will be used when looking at the module's specs folder and will automatically run the appropriate tests.

####Running the unit tests
Unit tests are run through jasmine-node and uses the spec configuration file. To start the unit tests simply run ```npm test```.

The testing will start-up the Ozone Platform Service Container, register all Ozone Modules and execute all found unit tests. This allows for testing of code directly within the service container's context along with testing RESTful services. Client testing will also be enabled through this mechanism but as mentioned above *client unit testing of Ozone Platform code does not yet work*.

###Apps Mall Unit Testing
This covers how to run the unit tests specific for Apps Mall.

####Apps Mall Service Testing
The Apps Mall service, which is bundled within the Ozone Platform Service Container, is automatically tested through the Ozone Platform Unit Testing outlined above as it follows the appropriate spec naming convention. So nothing additional needs to be done here.

####Apps Mall Frontend Testing
Angular unit tests are run through the Karma test runner, which launches a separate Chrome browser window.

Ensure that all three Karma-related npm modules have been installed: ```karma```, ```karma-jasmine```, and ```karma-chrome-launcher```.

To run the Angular unit tests run the ```./apps/appsmall/test/test.sh``` script from the Apps Mall root directory.  Test results will appear in the terminal window.

(If the above script produces a "karma: command not found" error, then you need to add the Karma bin directory to you path environment variable.  Find the Karma bin directory by typing in ```npm root -g``` to get the Node root pathname and appending ```/karma/bin``` to the root pathname. Add this directory to your path environment variable, and you should be able to run ```karma``` from the command line.)
