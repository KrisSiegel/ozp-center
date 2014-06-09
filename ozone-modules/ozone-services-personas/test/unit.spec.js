var assert = require("assert"),
    expect = require("expect.js"),
    request = require("supertest"),
    Ozone = {}, 
    Persistence, 
    express = require("express"),
    app = express(),
    samplePersona1 = require("./data/samplePersona1.json"),
    samplePersona2 = require("./data/samplePersona2.json"),
    basePersonaURL = "/api/personas/persona/",
    constants = require('../config/constants'),
    store = constants.database.store.personas,
    collection = constants.database.collection.persona,
    logger,
    Cookies,
    mockPersona = {};

/*
 * Before running our tests, set up our Persistence, and express routes
 */
if (typeof jasmine !== 'undefined') {
	beforeEach(function (done) {
	    setup(done);
	})
} else {
	before(function (done) {
	    setup(done);
	})
}

function setup(done) {
	app.configure(function () {
		app.use(express.logger('dev'));
		app.use(express.cookieParser());
        app.use(express.session({ secret: 'NotMuchSecret'} ));
		app.use(express.bodyParser());
    });

    Ozone = require('../../ozone-api')(app);
    logger = Ozone.logger;
    
    Ozone.configuration = {
        "Persistence": {
            "Module": "ozone-services-persistence-mongo",
            "Server": "localhost",
            "Port": 27017
        },
        "Security": {
        	"Module": "ozone-services-security-mock"
        }
    };

    // also import Persistence Services when running as stand-alone here, since it's not running as part of the Container.
    require('ozone-services-persistence')(function (ozone) {
        Persistence = Ozone.Service('Persistence');

        // also import Security Services when running as stand-alone here, since it's not running as part of the Container.
        require('ozone-services-security')(function (ozone) {

            require('../PersonasServicesApi.js')(function (ozone) {

                done();
            });
        });
        
    });

};

beforeEach(function () {
	var title;
	if (typeof jasmine !== 'undefined') { 
		title = jasmine.getEnv().currentSpec.description
	} else { 
		title = this.currentTest.title;
	}
    logger.info("=============== Running test: " + title + " =============== ")
})

describe('Get Current Persona', function () {
    describe('get current persona', function () {
        it('should get the current persona in the "persona" collection in MongoDB', function (done) {
        	
        	// first, do a "login" using the mock security service, to set the current persona in session.
        	request(app)
            .post('/api/security/mockLogin/me')
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body).not.to.have.property('error');
                logger.debug("res.headers: " + JSON.stringify(res.headers, null, 3));
                Cookies = res.headers['set-cookie'].pop().split(';')[0];
                logger.debug("cookies: " + Cookies);
                
                // get the current persona
                var req = request(app).get(basePersonaURL + 'current');
                req.cookies = Cookies;
                
                req.send(samplePersona1)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    logger.debug("get current persona, res.body: " + JSON.stringify(res.body, null , 3));
                    mockPersona = res.body;
                    done();
                });
            });
        })
    })
});

describe('Create Personas', function () {
    describe('create a persona', function () {
        it('should create a persona in the "persona" collection in MongoDB', function (done) {
        	request(app)
            .post(basePersonaURL)
            .send(samplePersona1)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body).not.to.have.property('error');
                expect(res.body).to.have.property('Created');
                expect(res.body.Created.username).to.be(samplePersona1.username);
                done();
            });
        })
    })
    describe('create another persona without an auth token', function () {
        it('should create another persona in the "persona" collection in MongoDB', function (done) {
        	request(app)
            .post(basePersonaURL)
            .send(samplePersona2)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body).not.to.have.property('error');
                expect(res.body).to.have.property('Created');
                expect(res.body.Created.username).to.be(samplePersona2.username);
                expect(res.body.Created).to.have.property('auth_token');
                done();
            });
        })
    })
})


describe('Get Personas', function () {
    describe('get one persona using the userId', function () {
        it('should return one persona using the userId', function (done) {
        	// find the _id by using the name
            Persistence.Store(store).Collection(collection).query({
                'username': samplePersona1.username
            }, function (err, results) {
                var item = results.elements[0];
                samplePersona1._id = item._id;
                request(app)
                .get(basePersonaURL + samplePersona1._id)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    expect(res.body.length).to.be(1);
                    expect(res.body[0]._id).to.be(samplePersona1._id.toHexString());
                    //logger.debug("res.body " + JSON.stringify(res.body, undefined, 3));
                    done();
                });
            });
        })
    })
    describe('get persona using the userId as a param', function () {
        it('should return persona using the userId as a param', function (done) {
        	// find the _id by using the name
            Persistence.Store(store).Collection(collection).query({
                'username': samplePersona2.username
            }, function (err, results) {
                var item = results.elements[0];
                samplePersona2._id = item._id;
                request(app)
                .get(basePersonaURL + '?userId=' + samplePersona2._id)
                .end(function (err, res) {
                    expect(res).to.exist;
                    expect(res.status).to.be(200);
                    expect(res.body).not.to.have.property('error');
                    expect(res.body.length).to.be(1);
                    expect(res.body[0]._id).to.be(samplePersona2._id.toHexString());
                    //logger.debug("res.body " + JSON.stringify(res.body, undefined, 3));
                    done();
                });
            });
        	
        	
        })
    })
    describe('get persona using the userId & username', function () {
        it('should return persona using the userId & username', function (done) {
        	request(app)
            .get(basePersonaURL + '?userId=' + samplePersona2._id + '&username=' + samplePersona2.username)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body).not.to.have.property('error');
                expect(res.body.length).to.be(1);
                expect(res.body[0]._id).to.be(samplePersona2._id.toHexString());
                //logger.debug("res.body " + JSON.stringify(res.body, undefined, 3));
                done();
            });
        })
    })
    describe('get persona using the userId & username & auth_token', function () {
        it('should return persona using the userId & username & auth_token', function (done) {
        	request(app)
            .get(basePersonaURL + '?userId=' + samplePersona1._id + '&username=' + samplePersona1.username +
            		'&auth_token=' + samplePersona1.auth_token)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body).not.to.have.property('error');
                expect(res.body.length).to.be(1);
                expect(res.body[0]._id).to.be(samplePersona1._id.toHexString());
                //logger.debug("res.body " + JSON.stringify(res.body, undefined, 3));
                done();
            });
        })
    })
    describe('get persona using the userId & username & auth_token & auth_service', function () {
        it('should return persona using the userId & username & auth_token & auth_service', function (done) {
        	request(app)
            .get(basePersonaURL + '?userId=' + samplePersona1._id + '&username=' + samplePersona1.username +
            		'&auth_token=' + samplePersona1.auth_token + '&auth_service=' + samplePersona1.auth_service)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body).not.to.have.property('error');
                expect(res.body.length).to.be(1);
                expect(res.body[0]._id).to.be(samplePersona1._id.toHexString());
                //logger.debug("res.body " + JSON.stringify(res.body, undefined, 3));
                done();
            });
        })
    })
    describe('get persona using the userId & wrong username', function () {
        it('should NOT return any persona using the userId & wrong username', function (done) {
        	request(app)
            .get(basePersonaURL + '?userId=' + samplePersona1._id + '&username=' + samplePersona2.username)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body).not.to.have.property('error');
                expect(res.body.length).to.be(0);
                //logger.debug("res.body " + JSON.stringify(res.body, undefined, 3));
                done();
            });
        })
    })
})

describe('Delete Personas', function () {
    describe('delete a persona', function () {
        it('delete the ' + samplePersona1._id + ' persona', function (done) {
        	request(app)
            .del(basePersonaURL + samplePersona1._id)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body).not.to.have.property('error');
                expect(res.body).to.have.property('Deleted');
                expect(res.body.Deleted).to.be(1);
                done();
            });
        })
    })
    describe('delete another persona', function () {
        it('should delete the ' + samplePersona2._id + ' persona', function (done) {
        	request(app)
            .del(basePersonaURL + samplePersona2._id)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body).not.to.have.property('error');
                expect(res.body).to.have.property('Deleted');
                expect(res.body.Deleted).to.be(1);
                done();
            });
        })
    })
    describe('try to delete the persona again', function () {
        it('will not delete since the ' + samplePersona2._id + ' persona does not exist', function (done) {
        	request(app)
            .del(basePersonaURL + samplePersona2._id)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body).not.to.have.property('error');
                expect(res.body).to.have.property('Deleted');
                expect(res.body.Deleted).to.be(0);
                done();
            });
        })
    })
    describe('delete the created mock persona', function () {
        it('should delete the ' + mockPersona._id + ' persona', function (done) {
        	request(app)
            .del(basePersonaURL + mockPersona._id)
            .end(function (err, res) {
                expect(res).to.exist;
                expect(res.status).to.be(200);
                expect(res.body).not.to.have.property('error');
                expect(res.body).to.have.property('Deleted');
                expect(res.body.Deleted).to.be(1);
                done();
            });
        })
    })
})
