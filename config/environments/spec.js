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
            port: 3005,
            serveFullConfigToSysAdmins: true,
            staticPaths: [
                { urlProp: "libUrl", filePath: '/public/lib'},
                { urlProp: "apiClientUrl", filePath: '/ozone-modules/ozone-api'}
            ],
            autoImport: 'resources/autoImport/default.json',
            security: {
                disableSecurityCheckOnRoutes: true,
                mock: {
                    autoLogin: "testSystemAdmin1"
                }
            },
            persistence: {
                store: "Ozone-Test",
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
                level: "error"
            },
            urls: {
                apiBaseUrl: "/api/",
                amlUrl: "/AppsMall/",
                hudUrl: "/",
                appBuilderUrl: "/AppBuilder/",
                apiClientUrl: "/api/client/",
                libUrl: "/lib/"
            }
        }
    };
}());
