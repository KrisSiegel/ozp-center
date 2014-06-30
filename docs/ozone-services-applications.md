##Applications Service
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
