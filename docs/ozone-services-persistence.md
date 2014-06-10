###Persistence
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

####Server-Side API
```Ozone.Service("Persistence").objectId()``` -> Returns a randomly generated id typically used for the data store.

```Ozone.Service("Persistence").Store(store)``` -> Returns Collection and Drive objects that act only within the specified store.

```Ozone.Service("Persistence").Store(store).Collection(collection).isImplemented()``` -> Returns whether the collection functionality has been implemented or not.

```Ozone.Service("Persistence").Store(store).Collection(collection).get(key, callback)``` -> Returns a specific collection's key's values within the callback's response.

```Ozone.Service("Persistence").Store(store).Collection(collection).query(selector, options, callback)``` -> An open-ended query method that allows authors of backend implementations to provide multiple ways of querying; there is no set structure here as it would be impossible to predict how others may need to use it. The provided way in the Mongo and Mock implementations is matching keys within the selector object to keys within a collection. Options, in the current implementation, allow for the specification of text searches in support of Mongo.

```Ozone.Service("Persistence").Store(store).Collection(collection).aggregate(aggregationArray, callback)``` -> A 1:1 wrap of the MongoDB aggregation; currently do not have this implemented in the Mock datastore. For more information see the MongoDB aggregation framework: http://docs.mongodb.org/manual/applications/aggregation/.

```Ozone.Service("Persistence").Store(store).Collection(collection).set(key, value, callback)``` -> Sets a new or existing key to the specified value.

```Ozone.Service("Persistence").Store(store).Collection(collection).remove(key, callback)``` -> Removes a specified key's value.

```Ozone.Service("Persistence").Store(store).Collection(collection).addIndex(index, options, callback)``` -> Adds an index to the backend implementation. This allows querying to work properly and quickly. Currently works like the MongoDB indexes; for more information see: http://docs.mongodb.org/manual/indexes/.

```Ozone.Service("Persistence").Store(store).Collection(collection).getIndexes(callback)``` -> Callback returns an array of indexes currently in use.

```Ozone.Service("Persistence").Store(store).Collection(collection).removeIndex(index, callback)``` -> Removes a specific index.

```Ozone.Service("Persistence").Store(store).Collection(collection).removeAllIndexes(callback)``` -> Removes all indexes. This is NOT a good idea to run outside of a development environment.

```Ozone.Service("Persistence").Store(store).Drive(drive).isImplemented()``` -> Returns whether the drive functionality has been implemented or not.

```Ozone.Service("Persistence").Store(store).Drive(drive).get(key, callback)``` -> Returns an associated blob based on the key within the callback's response.

```Ozone.Service("Persistence").Store(store).Drive(drive).set(key, blob, callback)``` -> Takes a key and a blob and sets the blob, within the data store, with that key. Callback is executed with response data if any.

```Ozone.Service("Persistence").Store(store).Drive(drive).remove(key, callback)``` -> Removes a specified blob and executes the callback with a status.

####RESTful Endpoints

```GET /api/store/:store/collection/:collection/:id``` -> Returns a specific collection record based on the id.

```GET /api/store/:store/collection/:collection/``` -> Returns the entire collection.

```GET /api/store/:store/collection/:collection/query/:criteria``` -> The :criteria in this context is any set of query string variables which are then transformed into JSON objects in the backend for querying. This returns all records that match the specified criteria.

```POST /api/store/:store/collection/:collection/``` -> Stores a new or existing object within the collection. Returns object with a key.

```PUT /api/store/:store/collection/:collection/``` -> Stores a new or existing object within the collection. Returns object with a key.

```DELETE /api/store/:store/collection/:collection/:id``` -> Deletes a specific record specified by the id.

```GET /api/store/:store/drive/:drive/:id``` -> Returns a blob with the same mimetype it was stored with.

```POST /api/store/:store/drive/:drive/``` -> Stores a blob within drive; returns a generated key.

```PUT /api/store/:store/drive/:drive/``` -> Stores a blob within drive; returns a generated key.

```DELETE /api/store/:store/drive/:drive/:id``` -> Deletes a specified blob.

####Client-Side API
```Ozone.Service("Persistence").Store(store)``` -> Returns Collection and Drive objects that act only within the specified store.

```Ozone.Service("Persistence").Store(store).Collection(collection).getCollectionPath()``` -> Returns the RESTful service path to the persistence service.

```Ozone.Service("Persistence").Store(store).Collection(collection).get(key, callback, context)``` -> The callback's response returns the specified value based on the key.

```Ozone.Service("Persistence").Store(store).Collection(collection).query(selector, options, callback, context)``` -> An open-ended query method that allows authors of backend implementations to provide multiple ways of querying; there is no set structure here as it would be impossible to predict how others may need to use it. The provided way in the Mongo and Mock implementations is matching keys within the selector object to keys within a collection. Options, in the current implementation, allow for the specification of text searches in support of Mongo.

```Ozone.Service("Persistence").Store(store).Collection(collection).set(key, value, callback, context)``` -> Sets a new or existing object to the specific value.

```Ozone.Service("Persistence").Store(store).Collection(collection).remove(key, callback, context)``` -> Removes a specified value.

```Ozone.Service("Persistence").Store(store).Drive(drive).getDrivePath()``` -> Returns the RESTful service path to the persistence service.

```Ozone.Service("Persistence").Store(store).Drive(drive).get(key, callback, context)``` -> The callback's response returns the specified value based on the key.

```Ozone.Service("Persistence").Store(store).Drive(drive).set(key, value, callback, context)``` -> Sets a new or existing object to the specific value.

```Ozone.Service("Persistence").Store(store).Drive(drive).remove(key, callback, context)``` -> Removes a specified value.
