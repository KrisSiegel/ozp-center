##Ozone Platform Service Container and Session Providers
The service container is essentially an express.js application that allows for session stores to be easily swapped in and out. During the development phase of Apps Mall and the service container we had needs to use in memory, redis and memcached session stores so they were put into their own Ozone Modules to allow anyone to use in their deployments.

###Configuration
To pick which session provider you want to use and the related settings are controlled via the configuration files (```default.js``` or the specific environment file can be changed to support this).

####Common settings
There are a couple of common settings that all providers should obey and use. These are located within the ```server``` block and are as follows:

```
session: {
    secret: "OzoneSessionSecretHere",
    key: "OzoneSID",
    timeout: 86400000
}
```

####Specifying which provider to use
Under the ```ozoneModules``` object is where a session module is specified along with any services it registers. The following is an example as to what the whole ```ozoneModules``` block might look like with a session provider of ```ozone-session-memory```:

```
ozoneModules: {
    security: {
        module: "ozone-services-security",
        services: ["Security"]
    },
    session: {
        module: "ozone-session-memory",
        services: []
    },
    services: [
        { module: "ozone-api", services: [], require: false },
        { module: "applications-mall-services", services: [] },
        { module: "ozone-services-tagging", services: ["Tag", "TagTopic"] },
        { module: "ozone-services-applications", services: ["App"] },
        { module: "ozone-services-persistence", services: ["Persistence"] },
        { module: "ozone-services-personas", services: ["Personas"] },
        { module: "ozone-services-messaging", services: [] },
        { module: "ozone-services-client-configuration", services: [] },
        { module: "ozone-services-status", services: [] },
        { module: "ozone-services-importer-exporter", services: ["Importer", "Exporter"] },
        { module: "ozone-example-module", services: [] }
    ]
}
```

Simply change the module name to whichever one you would like to use.



###In-Memory Provider
The in memory provider is essentially what express.js bundles in and is shown in the example as to how to specify it.

###redis Provider
To use the redis provider will need the necessary connection information added into the ```session``` block of the configuration and should look like the following:

```
session: {
    secret: "OzoneSessionSecretHere",
    key: "OzoneSID",
    timeout: 86400000,
    redis: {
        host: "localhost",
        port: 6379
    }
}
```

###memcached Provider
To use the memcached provider will need the necessary connection information added into the ```session``` block of the configuration and should look like the following:

```
session: {
    secret: "OzoneSessionSecretHere",
    key: "OzoneSID",
    timeout: 86400000,
    memcached: {
        hosts: ["localhost:11211"]
    }
}
```
