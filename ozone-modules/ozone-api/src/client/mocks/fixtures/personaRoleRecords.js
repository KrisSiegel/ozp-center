Ozone.fixtures = Ozone.fixtures || {};

Ozone.fixtures.personaRoleRecords = {
    "/Ozone/Apps/App/AppsMall/MallModerator/": {
        "label": "Mall Moderator",
        "description": "A mall wide moderator.",
        "designation": "AppsMall",
        "rank": 400,
        "permissions": [
            "/Ozone/Apps/App/AppsMall/GrantPermission/",
            "/Ozone/Apps/App/AppsMall/Manage/Tags/",
            "/Ozone/Apps/App/AppsMall/Manage/Collections/",
            "/Ozone/Apps/App/AppsMall/Manage/Categories/",
            "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectMallWideApplication/",
            "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectOrganizationOnlyApplication/",
            "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"
        ],
        "createdBy": "SYSTEM"
    },
    "/Ozone/Apps/App/AppsMall/OrganizationModerator/": {
        "label": "Organization Moderator",
        "description": "An organization wide moderator.",
        "designation": "AppsMall",
        "rank": 450,
        "permissions": [
            "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectMallWideApplication/",
            "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"
        ],
        "createdBy": "SYSTEM"
    },
    "/Ozone/Personas/Role/Administrator/": {
        "label": "Ozone Administrator",
        "description": "An Ozone wide administrator.",
        "designation": "Ozone",
        "rank": 0,
        "permissions": [
            "/Ozone/Personas/Permission/GrantPermission/"
        ],
        "createdBy": "SYSTEM"
    },
    "/Ozone/Personas/Role/User/": {
        "label": "Ozone User",
        "description": "An Ozone wide user.",
        "designation": "Ozone",
        "rank": 9999,
        "permissions": [

        ],
        "createdBy": "SYSTEM"
    },
    "/Ozone/Apps/App/AppsMall/User/": {
        "label": "Apps Mall User",
        "description": "An Apps Mall user.",
        "designation": "AppsMall",
        "rank": 9999,
        "permissions": [
            "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"
        ],
        "createdBy": "SYSTEM"
    }
};
