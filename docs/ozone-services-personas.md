##Personas Service
Personas is the user concept for Ozone Platform. Each user has a persona which has information regarding their authentication mechanism, preferences and other general user information.

Since multiple authentication methods can be used with the Ozone Platform Personas will treat the combination of a user name and an authentication token as a unique pair to ensure both are required for login (for example this prevents users brought in via the mock security service from working with a real authentication service and vice versa).

####A basic Persona's format is as follows:
```
{
    "username": "testOzoneAdmin1",
    "auth_service": "Mock",
    "auth_token": "testOzoneAdmin1",
    "meta": {
        "permissions": [
            "/Ozone/Personas/Permission/GrantPermission/"
        ],
        "favoriteApps": null,
        "launchedApps": null,
        "role": "Ozone Administrator"
    },
    "_id": "536320bbad13b24176af54b8"
}
```

There are two other pieces to the Personas service: Permissions and Roles.

Permissions are URIs designed to avoid conflicts by mapping from the highest level to the lowest level. For instance Application A might want a read permission for reports and Application B might want a write permission for reports. To ensure these two don't conflict their permission would be structured as follows:

```
/Ozone/Apps/App/ApplicationA/Reports/Read/
/Ozone/Apps/App/ApplicationB/Reports/Write/
```

####The basic structure of a permission record is as follows:
```
{
    "permission": "/Ozone/System/Administration/",
    "label": "Ozone System Administration",
    "description": "Permits useful functions to a system administrator.",
    "designation": "Ozone",
    "rank": 500,
    "createdBy": "SYSTEM",
    "createdOn": "2014-05-02T04:36:11.064Z",
    "lastModified": "2014-05-02T04:36:11.064Z",
    "_id": "536320bbad13b24176af54aa"
}
```

Roles are simply a way of grouping permissions and are mostly for organizational purposes. Since having a single role wouldn't be flexible enough across multiple applications and multiple roles confusing they are instead calculated when displayed to the user based upon their permissions.

####The basic structure of a role record is as follows:
```
{
    "role": "/Ozone/Personas/Role/Administrator/",
    "label": "Ozone Administrator",
    "description": "An Ozone wide administrator.",
    "designation": "Ozone",
    "rank": 0,
    "permissions": [
        "/Ozone/Personas/Permission/GrantPermission/"
    ],
    "createdBy": "SYSTEM",
    "createdOn": "2014-05-02T04:36:11.075Z",
    "lastModified": "2014-05-02T04:36:11.075Z",
    "_id": "536320bbad13b24176af54b5"
}

```
