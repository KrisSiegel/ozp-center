##Importer and Exporter Service
The importer and exporter service is designed to work with n number of registered Ozone services.

###Importing
Importing works by taking a JSON file (or a zip containing a JSON file) that is made up in the following structure:
```
{
    "Service1": {},
    "Service2": {}
}
```

The service then calls the import method registered with each specified service and passes it the data along with a path to the exploded zip file should the JSON be contained within. This allows for the importing of binary files for any service.

###Exporting
Exporting, as of this writing, currently does not function. It's eventually going to call an export method associated with each service you want data from and then combine it into a single JSON file with optionally bundling it into a zip with other binary files.
