module.exports = (function (Ozone) {
    describe("ozone-services-personas-importing", function(){
        var personaService = null;
        beforeEach(function (done) {
            Ozone.Service().on("ready", "Personas", function () {
                personaService = Ozone.Service('Personas');
                personaService.persona.query({},function(e,r){personaService.persona.delete(r.map(function(x){return x._id}), function(){
                    personaService.permissions.query({},function(e,r){personaService.permissions.delete(r.map(function(x){return x._id}), function(){
                        personaService.roles.query({},function(e,r){personaService.roles.delete(r.map(function(x){return x._id}), function(){
                            done();
                        })})
                    })});
                })});
            });
        });

        it("imports a json data set", function(done){
            var dataSet = require('./spec-data/testImport.json');
            personaService.import(dataSet, function(){
                personaService.roles.query({}, function(err, result){
                    expect(err).toBeUndefined();
                    expect(result.length).toBe(5);
                    personaService.permissions.query({}, function(err, result){
                        expect(err).toBeUndefined();
                        expect(result.length).toBe(9);
                        personaService.persona.query({}, function(err, result){
                            expect(err).toBeUndefined();
                            expect(result.length).toBe(6);
                            done();
                        });
                    });
                });
            });
        });

        it("imports overwrite current data, does not duplicate", function(done){
            var dataSet = require('./spec-data/testImport.json');
            personaService.import(dataSet, function(){
                personaService.import(dataSet, function(){
                    personaService.roles.query({}, function(err, result){
                        expect(err).toBeUndefined();
                        expect(result.length).toBe(5);
                        personaService.permissions.query({}, function(err, result){
                            expect(err).toBeUndefined();
                            expect(result.length).toBe(9);
                            personaService.persona.query({}, function(err, result){
                                expect(err).toBeUndefined();
                                expect(result.length).toBe(6);
                                done();
                            });
                        });
                    });
                });
            });
        });

        it('imports all the data of a role object', function(done){
            var dataSet = require('./spec-data/testImport.json');
            personaService.import(dataSet, function(){
                personaService.roles.query({role: "/Ozone/Apps/App/AppsMall/MallModerator/"}, function(err, result){
                    expect(err).toBeUndefined();
                    expect(result.length).toBe(1);
                    var role = result[0];
                    expect(role.role).toBe("/Ozone/Apps/App/AppsMall/MallModerator/");
                    expect(role.label).toBe("Mall Moderator");
                    expect(role.description).toBe("A mall wide moderator.");
                    expect(role.designation).toBe("AppsMall");
                    expect(role.rank).toBe(400);
                    expect(role.permissions.length).toBe(7);
                    expect(role.permissions.indexOf("/Ozone/Apps/App/AppsMall/GrantPermission/")).not.toBe(-1);
                    expect(role.createdBy).toBe("SYSTEM");
                    done(err);
                });
            });
        });

        it('imports all the data of a permission object', function(done){
            var dataSet = require('./spec-data/testImport.json');
            personaService.import(dataSet, function(){
                personaService.permissions.query({permission: "/Ozone/System/Administration/"}, function(err, result){
                    expect(err).toBeUndefined();
                    expect(result.length).toBe(1);
                    var permission = result[0];
                    expect(permission.permission).toBe("/Ozone/System/Administration/");
                    expect(permission.label).toBe("Ozone System Administration");
                    expect(permission.description).toBe("Permits useful functions to a system administrator.");
                    expect(permission.designation).toBe("Ozone");
                    expect(permission.rank).toBe(500);
                    expect(permission.createdBy).toBe("SYSTEM");
                    done(err);
                });
            });
        });

        it('imports all the data of a persona object', function(done){
            var dataSet = require('./spec-data/testImport.json');
            personaService.import(dataSet, function(){
                personaService.persona.query({username: "testSystemAdmin1"}, function(err, result){
                    expect(err).toBeUndefined();
                    expect(result.length).toBe(1);
                    var user = result[0];
                    expect(user.username).toBe("testSystemAdmin1");
                    expect(user.auth_token).toBe("testSystemAdmin1");
                    expect(user.auth_service).toBe("Mock");
                    expect(Object.keys(user.meta).length).toBe(4); //role is an auto-generated attribute on the creation of a user
                    expect(Object.keys(user.meta).indexOf("permissions")).not.toBe(-1);
                    expect(Object.keys(user.meta).indexOf("favoriteApps")).not.toBe(-1);
                    expect(Object.keys(user.meta).indexOf("launchedApps")).not.toBe(-1);
                    expect(user.meta.permissions.length).toBe(9);
                    expect(user.meta.permissions.indexOf("/Ozone/System/Administration/")).not.toBe(-1);
                    expect(user.meta.favoriteApps.length).toBe(2);
                    expect(user.meta.favoriteApps.indexOf('TestApp1')).not.toBe(-1);
                    expect(Object.keys(user.meta.launchedApps).length).toBe(2);
                    expect(Object.keys(user.meta.launchedApps).indexOf('TestApp2')).not.toBe(-1);
                    expect(user.meta.launchedApps.TestApp1).toBe('2014-04-14T07:29:57.134Z');
                    done(err);
                });
            });
        });
    });
    describe("ozone-services-personas-exporting", function() {
        var personaService = null;
        var find = function(arr, key, value){
            for(var i = 0; i < arr.length; i++){
                var obj = arr[i];
                console.log(obj)
               if(obj && obj[key] && obj[key] === value){
                   return obj;
               }
            }
            return null;
        }
        beforeEach(function (done) {
            Ozone.Service().on("ready", "Personas", function () {
                personaService = Ozone.Service('Personas')
                done();
            });
        });

        it('exports all of the persona data into one object: { Personas: [], Roles: [], Permissions: [] }', function(done){
            personaService.export(function(data){
                expect(Object.keys(data).indexOf('Personas')).not.toBe(-1);
                expect(Object.keys(data).indexOf('Roles')).not.toBe(-1);
                expect(Object.keys(data).indexOf('Permissions')).not.toBe(-1);
                done();
            });
        });

        it('exports all of the persona.persona data', function(done){
            personaService.export(function(data){
                expect(data['Personas'].length).toBe(6);
                var person = find(data['Personas'], 'username', 'testOzoneAdmin1');
                expect(person).not.toBeUndefined();
                expect(person.username).toBe('testOzoneAdmin1');
                expect(person.auth_token).toBe('testOzoneAdmin1');
                expect(person.auth_service).toBe('Mock');
                expect(Object.keys(person.meta).length).toBe(4);
                expect(Object.keys(person.meta).indexOf('permissions')).not.toBe(-1);
                expect(Object.keys(person.meta).indexOf('favoriteApps')).not.toBe(-1);
                expect(Object.keys(person.meta).indexOf('launchedApps')).not.toBe(-1);
                expect(Object.keys(person.meta).indexOf('role')).not.toBe(-1);
                expect(person.meta.permissions.length).toBe(1);
                expect(person.meta.favoriteApps.length).toBe(0);
                expect(person.meta.launchedApps.length).toBe(0);
                expect(person.meta.role).toBe('Ozone Administrator');
                expect(person.meta.permissions[0]).toBe('/Ozone/Personas/Permission/GrantPermission/');
                done();
            })
        });

        it('exports all of the persona.roles data', function(done){
            personaService.export(function(data){
                expect(data['Roles'].length).toBe(5);
                var role = find(data['Roles'], 'role', '/Ozone/Apps/App/AppsMall/MallModerator/');
                expect(role).not.toBeUndefined();
                expect(role.role).toBe('/Ozone/Apps/App/AppsMall/MallModerator/');
                expect(role.label).toBe('Mall Moderator');
                expect(role.description).toBe('A mall wide moderator.');
                expect(role.designation).toBe('AppsMall');
                expect(role.rank).toBe(400);
                expect(role.createdBy).toBe('SYSTEM');
                expect(role.permissions.length).toBe(7);
                expect(role.permissions.indexOf("/Ozone/Apps/App/AppsMall/GrantPermission/")).not.toBe(-1)
                expect(role.permissions.indexOf("/Ozone/Apps/App/AppsMall/Manage/Tags/")).not.toBe(-1)
                expect(role.permissions.indexOf("/Ozone/Apps/App/AppsMall/Manage/Collections/")).not.toBe(-1)
                expect(role.permissions.indexOf("/Ozone/Apps/App/AppsMall/Manage/Categories/")).not.toBe(-1)
                expect(role.permissions.indexOf("/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectMallWideApplication/")).not.toBe(-1)
                expect(role.permissions.indexOf("/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectOrganizationOnlyApplication/")).not.toBe(-1)
                expect(role.permissions.indexOf("/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/")).not.toBe(-1)
                done();
            });
        });

        it('exports all of the persona.permissions data', function(done){
            personaService.export(function(data){
                expect(data['Permissions'].length).toBe(9);
                var permission = find(data['Permissions'], 'permission', '/Ozone/System/Administration/');
                expect(permission).not.toBe(null);
                expect(permission.permission).toBe('/Ozone/System/Administration/');
                expect(permission.label).toBe('Ozone System Administration');
                expect(permission.description).toBe('Permits useful functions to a system administrator.');
                expect(permission.designation).toBe('Ozone');
                expect(permission.rank).toBe(500);
                expect(permission.createdBy).toBe('SYSTEM');
                done();
            });
        });
    });
    describe("ozone-services-personas", function () {
        var personaService = null;
        beforeEach(function (done) {
            Ozone.Service().on("ready", "Personas", function () {
                personaService = Ozone.Service('Personas');
                done();
            });
        });

        it("Ozone.Service.('Personas').roles.calculate() to be 'Mall Moderator'", function (done) {
            var personaPermissions = [
                "/Ozone/Apps/App/AppsMall/GrantPermission/",
                "/Ozone/Apps/App/AppsMall/Manage/Tags/",
                "/Ozone/Apps/App/AppsMall/Manage/Collections/",
                "/Ozone/Apps/App/AppsMall/Manage/Categories/",
                "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectMallWideApplication/",
                "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectOrganizationOnlyApplication/",
                "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"
            ];
            Ozone.Service("Personas").roles.calculate(personaPermissions, function (result) {
                expect(result).not.toBe(undefined);
                expect(result).not.toBe(null);
                expect(result).toBe("Mall Moderator");
                done();
            });
        });
        it("Ozone.Service.('Personas').roles.calculate() to be 'Organization Moderator'", function (done) {
            var personaPermissions = [
                "/Ozone/Apps/App/AppsMall/Manage/ApproveOrRejectMallWideApplication/",
                "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"
            ];
            Ozone.Service("Personas").roles.calculate(personaPermissions, function (result) {
                expect(result).not.toBe(undefined);
                expect(result).not.toBe(null);
                expect(result).toBe("Organization Moderator");
                done();
            });
        });
        it("Ozone.Service.('Personas').roles.calculate() to be 'Ozone User'", function (done) {
            var personaPermissions = [
                "/Ozone/Personas/Permission/User/",
                "/Ozone/Apps/App/AppsMall/Manage/SubmitApplication/"
            ];
            Ozone.Service("Personas").roles.calculate(personaPermissions, function (result) {
                expect(result).not.toBe(undefined);
                expect(result).not.toBe(null);
                expect(result).toBe("Apps Mall User");
                done();
            });
        });
        it("Ozone.Service.('Personas').permissions.query({ }, function () { }) works for fetching all permissions", function (done) {
            Ozone.Service("Personas").permissions.query({}, function (err, results) {
                expect(results).not.toBe(undefined);
                expect(results).not.toBe(null);
                expect(results.length).toBeGreaterThan(0);
                done(err);
            });
        });
        it("Ozone.Service.('Personas').permissions.query({ designation: 'AppsMall' }, function () { }) works for fetching 'AppsMall' permissions", function (done) {
            Ozone.Service("Personas").permissions.query({}, function (allErr, allResults) {
                expect(allResults).not.toBe(undefined);
                expect(allResults).not.toBe(null);
                expect(allResults.length).toBeGreaterThan(0);
                Ozone.Service("Personas").permissions.query({ designation: "AppsMall" }, function (err, results) {
                    expect(results).not.toBe(undefined);
                    expect(results).not.toBe(null);
                    expect(results.length).toBeGreaterThan(0);
                    expect(allResults.length).toBeGreaterThan(results.length);
                    done(err || allErr);
                });
            });
        });
        it("Ozone.Service.('Personas').permissions.query({ designation: 'AppsMall' }, function () { }) works for fetching 'Ozone' permissions", function (done) {
            Ozone.Service("Personas").permissions.query({}, function (allErr, allResults) {
                expect(allResults).not.toBe(undefined);
                expect(allResults).not.toBe(null);
                expect(allResults.length).toBeGreaterThan(0);
                Ozone.Service("Personas").permissions.query({ designation: "Ozone" }, function (err, results) {
                    expect(results).not.toBe(undefined);
                    expect(results).not.toBe(null);
                    expect(results.length).toBeGreaterThan(0);
                    expect(allResults.length).toBeGreaterThan(results.length);
                    done(err || allErr);
                });
            });
        });
        it("Ozone.Service('Personas').persona.query({ username: 'fkjsdfsdfwr' }, function () { }) returns nothing.", function (done) {
            Ozone.Service('Personas').persona.query({ username: 'fkjsdfsdfwr' }, function (err, result) {
                expect(err).toBeUndefined();
                expect(result.length).toBe(0);
                done(err);
            });
        });
        it("Ozone.Service('Personas').persona.query({ username: 'testOzoneUser1' }, function () { }) returns one persona.", function (done) {
            Ozone.Service('Personas').persona.query({ username: 'testOzoneUser1' }, function (err, result) {
                expect(err).toBeUndefined();
                expect(result.length).toBe(1);
                done(err);
            });
        });
        it("Ozone.Service('Personas').persona.create() works as expected", function (done) {
            Ozone.Service("Personas").persona.create({
                "username": "unitTestUser1",
                "auth_service": "UnitTests",
                "meta": {
                    "permissions": []
                }
            }, function (err, result) {
                done();
            });
        });
        it("Ozone.Service('Personas').persona.update() works as expected from previous test", function (done) {
            Ozone.Service("Personas").query({ username: "unitTestUser1" }, function (err, result) {
                Ozone.Service("Personas").persona.update(result[0]._id, {
                    "username": "unitTestUser1",
                    "auth_service": "UnitTests",
                    "meta": {
                        "permissions": []
                    }
                }, function (anErr, anotherResult) {
                    done();
                });
            });
        });
        it("Ozone.Service('Personas').persona.delete() works as expected from previous test", function (done) {
            Ozone.Service("Personas").query({ username: "unitTestUser1" }, function (err, result) {
                Ozone.Service("Personas").persona.delete(result[0]._id, function (anErr, anotherResult) {
                    done();
                });
            });
        });
    });
});
