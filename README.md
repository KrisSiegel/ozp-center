#Apps Mall
The Apps Mall project provides access to, and facilitates the discovery of, web applications through a store front. Apps Mall is built on top of the Ozone Platform Service Container and various Ozone Services that provide modularity and an API all services can consume and export at each level (server-side, RESTful and client-side API levels).

##Requirements
The requirements below are required to go from cloning the repository to running the application and unit tests. The last 3 requirements (jasmine-node, karma-jarmine and karma-chrome-launcher) are ONLY required if you wish you run the unit tests. The only exception in this list is MongoDB can be replaced with an in-memory mock data store.
* node.js 0.10.x
* bower (npm install -g bower)
* grunt (npm install -g grunt-cli)
* MongoDB 2.4.x or higher with text searching enabled
* jasmine-node (npm install -g jasmine-node)
* karma-jasmine (npm install -g karma-jasmine)
* karma-chrome-launcher (npm install -g karma-chrome-launcher)

##Quick Start
If the requirements are all installed then follow these 4 steps to quickly get up and running.
1. Run ```npm install```
2. Run ```bower install```
3. Ensure MongoDB is running (```grunt mongod``` is a quick shortcut to start mongod with text indexing)
4. Run ```npm start```
5. Verify your server is running by visiting http://localhost:3000/

You are now running Apps Mall. Now what? Check out the additional documentation resources below.

##Documentation
The documentation below outlines everything needed to configure, deploy, extend and consume Apps Mall and Ozone Platform components.

* [Getting Started](docs/getting-started.md)
* [Architecture Design](docs/design.md)
* [Configuring Apps Mall and Ozone Platform](docs/configuration.md)
* [Deploying Apps Mall and Ozone Platform](docs/deployment.md)
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
* [Testing Apps Mall and Ozone Platform](docs/testing.md)

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
