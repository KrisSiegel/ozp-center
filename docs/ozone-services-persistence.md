##Persistence Service
The persistence service provides two implementations: a MongoDB and an in-memory mock implementation but the methods to access Persistence are the same regardless of the implementation.

####Configuration
The object that contains the necessary persistence properties is within the persistence object of the configuration. The available options are as follows:

Using MongoDB a connectionString can be utilized otherwise a list of servers can be specified with a user and password on to each server entry or by setting the user and password for all servers in the properties below:
```
persistence: {
    module: "ozone-services-persistence-mongo",
    store: "Ozone",
    mongo: {
        connectionString: undefined,
        servers: [
            { host: "localhost", port: 27017 }
        ],
        user: undefined,
        password: undefined
    }
}
```

Using in-memory mock database:
```
persistence: {
    module: "ozone-services-persistence-mock",
    store: "Ozone",
    mock: { }
}
```

####Creating a new persistence implementation
Since JavaScript doesn't really have interfaces like many object oriented languages it was decided to go through a common object that would act as an interface and accept an implementation.

1. Create a new dependency inside of the ozone-services-persistence module.
2. Implement all of the methods within the ```persistence-interface.js``` file.
3. Have your module return the ```persistence-interface.js``` file's results when requiring it and passing in your implementation.
4. Profit!

It's not too bad but it should be noted the API was mostly modeled after MongoDB so relational databases, while not impossible, may be more difficult to implement.
