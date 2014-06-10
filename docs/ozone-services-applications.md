###Apps
The Apps service provides persistence of application records and some basic metrics. There exists a server-side and client-side API along with a set of RESTful endpoints to using the Apps service.

####Application JSON Structure
Below is the JSON structure for an application object. This can vary depending on certain custom fields but the persistence service allows that type of flexibility; these are the default fields. Note that the image fields require an ID that links to an image stored in the persistence drive.

```
{
  "_id": "531a954be8e6a9ad09603095",
  "name": "My App",
  "shortname": "MyApp",
  "version": "3",
  "type": "app",
  "workflowState": "Published",
  "workflowMesssage": "",
  "launchedCount": 2,
  "accessible": true,
  "rating": 4,
  "ratings": 16904,
  "descriptionShort": "Short description text here",
  "description": "Description text here",
  "organization": "Home",
  "createdOn": "2013-05-09T17:54:11Z",
  "updatedOn": "2013-05-09T17:54:17Z",
  "documentationUrl": "https://www.owfgoss.org/demodata/Favorites.png",
  "appUrl": "http://www.bing.com/",
  "featured": true,
  "poc": "John Doe",
  "email": "test@test.com",
  "phone": "555-6789",
  "images": {
    "iconId": "531a954ae8e6a9ad09603032",
    "smallBannerId": "531a954be8e6a9ad09603034",
    "largeBannerId": "531a954be8e6a9ad09603036",
    "screenshotId": "531a954be8e6a9ad09603039"
  }
}
```

####Server-Side API
```Ozone.Service("Apps").import(filePath, configDir, callback)``` -> Accepts an array of files to import, the configuration's base directory and a callback to execute when finished importing.

```Ozone.Service("Apps").export(callback)``` -> Returns an export of the current data within the service.

####RESTful Endpoints
```GET /api/apps/app/``` -> Returns all application records

```GET /api/apps/app/:id``` -> Returns the specified application record.

```GET /api/apps/app/?q=&shortname=&autocomplete=&tags=``` -> Returns the application records that are found from the specified query. The query parameters read as follows: q is the name of the app, shortname for a specific shortname, autocomplete to return a small subset of data and tags is an array of tags an application should be tagged with.

```POST /api/apps/app/``` -> Creates a new application record with a JSON payload.

```PUT /api/apps/app/``` -> Updates an existing application record with a JSON payload that contains an id.

```DELETE /api/apps/app/:id``` -> Deletes an application record.

```POST /api/apps/import/``` -> Accepts a file and attempts to import its data into the system.

####Client-Side API
```Ozone.Service("Apps").getServicePath()``` -> Returns a URL pointing to the RESTful endpoint of the Apps service based upon the configuration.

```Ozone.Service("Apps").getRedirectUrl(shortname)``` -> Returns a URL within the Ozone HUD using an application's shortname based upon the configuration. This is used for linking to an application to be loaded within the HUD. An example result may be: ```http://localhost:3000/#App/MyApplication/"```.

```Ozone.Service("Apps").launchAppByShortname(shortname)``` -> Takes an application's shortname and automatically launch it in a new tab within the Ozone HUD. This also logs the launch.

```Ozone.Service("Apps").redirectIntoHudWithoutLogging(shortname)``` -> Similar to ```launchAppByShortname(shortname)``` except it doesn't open it in a new tab and it does not log the redirection. Handy if a task, such as authentication, is required after launching an application.

```Ozone.Service("Apps").get(id, callback, context)``` -> Fetches an application record with a specific id and returns it to the specified callback method. The context of the call is optional and typically not necessary.

```Ozone.Service("Apps").query(selector, callback, context)``` -> Fetches one or more applications that meet a specific criteria within the selector object specified below (note: the autocomplete parameter forces the service to return a minimal set of records). Callback is executed and returns the array of records with context being optional.

```
{
    name: "My App",
    shortame: "MyApp",
    autocomplete: false,
    tags: ["Test", "Another"]
}
```

```Ozone.Service("Apps").create(app, callback, context``` -> Creates an application and automatically assigned it an id. The application JSON structure is very fluid in that there is little validation to prevent radically different formats from being inserted; this is done to support various application formats.

```Ozone.Service("Apps").update(app, callback, context)``` -> Same as create expect it expects an id to be present within the application record.

```Ozone.Service("Apps").delete(app, callback, context)``` -> Deletes an application record.

```Ozone.Service("Apps").updateLaunchedCount(shortname, callback)``` -> Increments the launch count for a specific application and executes a callback with an updated application record.

```Ozone.Service("Apps").import(file, callback, context)``` -> Accepts a file object to import. Supports a JSON file with application records or a zip file that contains JSON for application records and images to support the record.
