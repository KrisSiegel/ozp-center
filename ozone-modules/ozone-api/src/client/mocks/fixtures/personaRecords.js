Ozone.fixtures = Ozone.fixtures || {};

Ozone.fixtures.personaRecords = [
    {
        "username": "testOzoneAdmin1",
        "auth_token": "testOzoneAdmin1",
        "auth_service": "Mock",
        "meta": {
            "permissions": [
                "/Ozone/Personas/Permission/GrantPermission/"
            ]
        }
    },
    {
        "username": "testSystemAdmin1",
        "auth_token": "testSystemAdmin1",
        "auth_service": "Mock",
        "meta": {
            "permissions": [
                "/Ozone/System/Administration/",
                "/Ozone/Personas/Permission/GrantPermission/",
                "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/",
                "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectMallWideApplication/",
                "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectOrganizationOnlyApplication/",
                "/Ozone/Apps/App/AppsMall/Manage/Categories/",
                "/Ozone/Apps/App/AppsMall/Manage/Collections/",
                "/Ozone/Apps/App/AppsMall/Manage/Tags/",
                "/Ozone/Apps/App/AppsMall/GrantPermission/"
            ],
            "favoriteApps": [ "TestApp1", "TestApp2" ],
            "launchedApps": {
              "TestApp1": "2014-04-14T07:29:57.134Z",
              "TestApp2": "2014-04-14T07:30:00.157Z"
            }
        }
    },
    {
        "username": "testOzoneUser1",
        "auth_token": "testOzoneUser1",
        "auth_service": "Mock",
        "meta": {
            "permissions": [

            ]
        }
    },
    {
        "username": "testAppsMallUser1",
        "auth_token": "testAppsMallUser1",
        "auth_service": "Mock",
        "meta": {
            "permissions": [
                "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"
            ]
        }
    },
    {
        "username": "testAppsMallOrganizationModerator1",
        "auth_token": "testAppsMallOrganizationModerator1",
        "auth_service": "Mock",
        "meta": {
            "permissions": [
                "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/",
                "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectMallWideApplication/"
            ]
        }
    },
    {
        "username": "testAppsMallMallModerator1",
        "auth_token": "testAppsMallMallModerator1",
        "auth_service": "Mock",
        "meta": {
            "permissions": [
                "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/",
                "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectMallWideApplication/",
                "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectOrganizationOnlyApplication/",
                "/Ozone/Apps/App/AppsMall/Manage/Categories/",
                "/Ozone/Apps/App/AppsMall/Manage/Collections/",
                "/Ozone/Apps/App/AppsMall/Manage/Tags/",
                "/Ozone/Apps/App/AppsMall/GrantPermission/"
            ]
        }
    }
];
