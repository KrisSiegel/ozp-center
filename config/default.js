module.exports = (function () {
    var pack = require('../package.json');

    return {
        client: {
            absoluteBaseUrl: "",
            forceInHud: false,
            allowComponents: false,
            protocolAgnostic: true,
            serveMinified: false,
            cacheBuster: false,
            canLogin: true,
            appsMall: {
                minifiedIncludes: [
                    "js/appsmall-includes.min.js"
                ],
                includes: pack.appsMallIncludes
            },
            hud: {
                minifiedIncludes: [
                    "hud-components.html"
                ],
                includes: pack.hudComponentPaths
            }
        },
        server: {
            host: "localhost",
            port: 3000,
            expressLogger: "dev",
            ssl: {
                port: undefined,
                key: undefined,
                ca: undefined,
                cert: undefined
            },
            requestSizeLimit: "100mb",
            uploadDir: require("os").tmpdir(),
            serveFullConfigToSysAdmins: false,
            session: {
                secret: "OzoneSessionSecretHere",
                key: "OzoneSID",
                timeout: 86400000,
                redis: {
                    host: "localhost",
                    port: 6379
                },
                memcached: {
                    hosts: ["localhost:11211"]
                },
                memory: { }
            },
            autoImport: {
                App: [],
                Tags: {'tag': [], 'topic': []}
            },
            persistence: {
                module: "ozone-services-persistence-mock",
                store: "Ozone",
                mongo: { },
                mock: { }
            },
            security: {
                disableSecurityCheckOnRoutes: false,
                newUserRole: "/Ozone/Apps/App/AppsMall/User/",
                firstNewUserRole: "/Ozone/Apps/App/AppsMall/MallModerator/",
                mock : {
                    baseURL: "security/mockLogin/",
                    auth_service: "Mock"
                }
            },
            ozoneModules: {
                security: {
                    module: "ozone-services-security-mock",
                    services: ["Security"]
                },
                session: {
                    module: "ozone-session-memory",
                    services: []
                },
                services: [
                    { module: "ozone-api", services: [], require: false },
                    { module: "applications-mall-services", services: [] },
                    { module: "ozone-services-tagging", services: ["Tag", "TagTopic"] },
                    { module: "ozone-services-applications", services: ["App"] },
                    { module: "ozone-services-persistence", services: ["Persistence"] },
                    { module: "ozone-services-personas", services: ["Personas"] },
                    { module: "ozone-services-messaging", services: [] },
                    { module: "ozone-services-client-configuration", services: [] },
                    { module: "ozone-services-status", services: [] },
                    { module: "ozone-services-importer-exporter", services: ["Importer", "Exporter"] },
                    { module: "ozone-example-module", services: [] }
                ]
            }
        },
        common: {
            logging: {
                level: "info"
            },
            urls: {
                apiBaseUrl: "/api/",
                amlUrl: "/AppsMall/",
                hudUrl: "/",
                appBuilderUrl: "/AppBuilder/",
                libUrl: "/lib/"
            }
        }
    };
}());
