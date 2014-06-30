module.exports = (function () {
    return {
        client: {
            absoluteBaseUrl: "",
            protocolAgnostic: true,
            serveMinified: false,
            cacheBuster: false
        },
        server: {
            host: "localhost",
            port: 3000,
            serveFullConfigToSysAdmins: true,
            staticPaths: [
                { urlProp: "libUrl", filePath: '/public/lib'},
                { urlProp: "apiClientUrl", filePath: '/ozone-modules/ozone-api'}
            ],
            autoImport: 'resources/autoImport/default.json',
            security: {
                module: "ozone-services-security-mock",
                newUserRole: "/Ozone/Apps/App/AppsMall/MallModerator/",
                firstNewUserRole: "/Ozone/Apps/App/AppsMall/MallModerator/",
                mock: {
                    autoLogin: undefined
                }
            },
            persistence: {
                store: "Ozone",
                mongo: {
                    servers: "localhost"
                },
                mock: { }
            },
            ozoneModules: {
                session: {
                    module: "ozone-session-memory",
                    services: []
                },
                services: [
                    { module: "ozone-services-persistence-mongo", services: ["Persistence"] },
                ]
            }
        },
        common: {
            logging: {
                level: "debug"
            },
            urls: {
                apiBaseUrl: "/api/",
                amlUrl: "/AppsMall/",
                hudUrl: "/",
                appBuilderUrl: "/AppBuilder/",
                apiClientUrl: "/api/client/",
                libUrl: "/lib/"
            },
            deployedTiers: [
                "client",
                "services",
                "database"
            ]
        }
    };
}());
