##Getting Started
The Quick Start in the previous section is good at simply jumping into things; this guide will help get your environment setup and go through a few additional details that may be helpful.

###Installing the prerequisites
The following will go over the prerequisites that are required for running and building the application. There are two ways to get the prerequisites onto your system; you can manually install them or use our shortcut (which should work on most systems). However, both methods require node.js and MongoDB to be installed.

####node.js
The current application is built to require node.js 0.10.x; it does not function properly under 0.8.x or earlier and is untested against 0.11.x and above (but is expected to work).

To install go to [nodejs.org](http://nodejs.org/) for installation instructions for your target environment.

Once installed be sure to run ```npm install``` to grab the project's dependencies (including development dependencies) to continue with the instructions below. Alternatively this can be skipped if you've downloaded a release bundle as it included all of the dependencies.

####MongoDB
MongoDB 2.4.x and above is required as Apps Mall makes use of its text indexing capabilities. Note that in 2.4.x and 2.5.x text indexing must be manually enabled; in 2.6.x it is enabled by default.

For systems running 2.4.x or 2.5.x see the following MongoDB help page for enabling text search: http://docs.mongodb.org/v2.4/tutorial/enable-text-search/. Note that the textSearchEnabled parameter needs to be added to both mongod and mongos configuration files should that method be used. For developers using 2.4.x or 2.5.x there is a grunt task shortcut that can be used to start a local mongod instance with text searching by simply running ```grunt mongod```.

To install go to [mongodb.org](http://www.mongodb.org/) for installation instructions for your target environment.

####Shortcut
To make our development easier when moving to new environments we created two shortcuts that should work for a large majority of users. As long as node.js and MongoDB are installed one of these commands will install the rest of the prerequisites on most systems:

* ```npm run-script prerequisites-unix``` will attempt to install the rest of the prerequisites into a unix environment using sudo for the global items.
* ```npm run-script prerequisites-windows``` will attempt to install the rest of the prerequisites into a windows environment for the global items.

####Manual Install
The remaining prerequisites are all installed via npm globally onto the system and added to the PATH. Below is a list of the items that need to be installed and their related npm command to do so.

* bower (npm install -g bower)
* grunt (npm install -g grunt-cli)
* jasmine-node (npm install -g jasmine-node)
* karma (npm install -g karma)
* karma-jasmine (npm install -g karma-jasmine)
* karma-chrome-launcher (npm install -g karma-chrome-launcher)
* yuidoc (npm install -g yuidocjs)

###Building
Since Apps Mall and the Ozone Platform pieces are node.js components and thusly are entirely written in JavaScript there isn't a compile step but there is a concatenation and a minification set of steps contained with a build command.

Once the installation steps are completed then ```grunt build``` needs to be run to combine and minify the necessary files that create the server-side and client-side Ozone Platform APIs. Alternatively this can be skipped if you're using the downloaded release bundle.

To get up and running this is all that needs to be done prior to simply running the application. For additional information regarding building and deploying Apps Mall see the [Building and Deploying Apps Mall and Ozone Platform](build-deploy.md) documentation.

###Start
Now that the installation and the building steps are completed you are ready to go! Simply run ```npm start``` and you'll be on your way.

To run the server-side unit tests to verify that everything is functioning as expected you can also run ```npm test```.
