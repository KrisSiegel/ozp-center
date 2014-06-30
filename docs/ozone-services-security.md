##Security Service
The security service is simply a connect middleware designed to intercept all communication to the service container. This type of usage allows most security services from other node.js groups to be easily integrated.

###Mock Security
The included mock security service simply allows anyone to specify a username and a role in which to apply. This should NEVER be used in production but is good enough for testing, development and even demonstrations.

Mock exposes some RESTful services to allow remote login as well as allowing users to access the roles service (only GET) without logging into the system.
