#OZP Center
The OZP Center project provides access to, and facilitates the discovery of, web applications through a store front. Apps Mall is built on top of the Ozone Platform Service Container and various Ozone Services that provide modularity and an API all services can consume and export at each level (server-side, RESTful and client-side API levels).

##Components
OZP Center consists of two major tools:
* Marketplace - the search and discovery capability of OZP
* HALO - the Home Application LayOut - the home page for users, primarily for favoriting applications for quick launch.

##Prerequisites
The requirements below are required to go from cloning the repository to running the application and unit tests. The last 5 prerequisites (jasmine-node, karma, karma-jarmine, karma-chrome-launcher and yuidoc) are either required if you wish you run the unit tests or generate the related JavaScript documentation. The only exception in this list is MongoDB can be replaced with an in-memory mock data store.
* node.js 0.10.x
* bower
* grunt
* MongoDB 2.4.x or higher with text searching enabled
* jasmine-node
* karma
* karma-jasmine
* karma-chrome-launcher
* yuidoc

##Quick Start from Repository
If the requirements are all installed then follow these 6 steps to quickly get up and running (if not then read the [Getting Started](docs/getting-started.md) to make sure your environment is setup).
* Run ```npm install```
* Run ```bower install```
* Run ```grunt build```
* Ensure MongoDB is running (```grunt mongod``` is a quick shortcut to start mongod with text indexing with Mongo 2.4 or 2.5)
* Run ```npm start```
* Verify your server is running by visiting http://localhost:3000/

You are now running the OZP Center. Now what? Check out the additional documentation resources below.

##Documentation
The documentation below outlines everything needed to configure, deploy, extend and consume the OZP Center and Ozone Platform components.

* [Getting Started](docs/getting-started.md)
* [Architecture Design](docs/design.md)
* [Configuring OZP Center and Ozone Platform](docs/configuration.md)
* [Building and Deploying the OZP Center and Ozone Platform](docs/build-deploy.md)
* [Ozone Platform API](docs/ozone-api.md)
* [Creating a new Ozone Module](docs/creating-ozone-module.md)
* Bundled Ozone Platform Services
    * [Ozone Persistence Service](docs/ozone-services-persistence.md)
    * [Ozone Applications Service](docs/ozone-services-applications.md)
    * [Ozone Tagging Service](docs/ozone-services-tagging.md)
    * [Ozone Personas Service](docs/ozone-services-personas.md)
    * [Ozone Security Service](docs/ozone-services-security.md)
    * [Ozone Importer and Exporter Service](docs/ozone-services-importer-exporter.md)
    * [Ozone Messaging Service](docs/ozone-services-messaging.md)
    * [Ozone Session Providers](docs/ozone-session-providers.md)
    * [Ozone Status Service](docs/ozone-services-status.md)
* [Extending the Ozone HUD](docs/ozone-hud.md)
* [Testing OZP Center and Ozone Platform](docs/testing.md)

##Code and API Documentation
All documentation for the code or the API exists within the code itself as comments using a yuidoc format. This allows for all code and API documentation to be generated upon build. The generated documentation is generated with the ```grunt build``` command and is available at the following path within the project [once generated]: ```docs/code/index.html```.

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
