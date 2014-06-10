##Getting Started
These steps will get you started from the git repo to a custom configured version running in your environment.
####The Setup
If node.js 0.10.x is installed on the system you can follow these steps to get everything up and running. **Note**: if you're running from a bundle that includes all dependencies then skip to step 6.

1. Pull down the latest from the master branch at ```git@github.com:ozone-development/aml-center.git```
2. Install the necessary global prerequisites via ```npm run-script prerequisites-unix``` or ```npm run-script prerequisites-windows``` (alternatively manually run: ```npm install -g grunt-cli```, ```npm install -g bower```, ```npm install -g jasmine-node```, ```npm install -g karma```, ```npm install -g karma-jasmine```, and ```npm install -g karma-chrome-launcher```)
3. Run ```npm install```
4. Run ```bower install```
5. Run ```grunt build```
5. Ensure MongoDB is running (```grunt start-mongod``` will start a locally installed MongoDB instance with text searching enabled). Alternatively set the persistence service to use the mock data store.
6. Start the application with ```npm start```
