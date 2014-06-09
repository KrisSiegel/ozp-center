var assert = require("assert"),
    expect = require("expect.js"),
    fs = require("fs"),
    Ozone = {}, 
    express = require("express"),
    app = express(),
    http = require('http'),
    socket,
    logger;


// call this setup method here manually because Jasmine doesn't have a "before all" method like mocha does.
setup();

function setup() {
    
	// this is global so it can be seen in ../public/js/messenger.js
	PORT = 3000;

	app.configure(function () {
	    app.use(express.logger('dev'));
	    app.use(express.bodyParser({
	    }));
	});

	Ozone = require('../../ozone-api')(app);
	logger = Ozone.logger;
	var httpServer = http.createServer(app);

	httpServer.listen(PORT);

	Ozone.Service("Server", {
		getHttpServer: function () {
			return httpServer;
		}
	});

	require('../app.js')(function () {

		// this is global so it can be seen in ../public/js/messenger.js
		io = require('socket.io-client');
		
	    //done();
	});
}

beforeEach(function(done) {
    // Setup
    socket = io.connect('http://localhost:' + PORT, {
        'reconnection delay' : 0
        , 'reopen delay' : 0
        , 'force new connection' : true
    });
    socket.on('connect', function() {
        logger.info('connected...');
        done();
    });
    socket.on('disconnect', function() {
    	logger.info('disconnected...');
    })
});

afterEach(function(done) {
    // Cleanup
    if(socket.socket.connected) {
    	logger.info('disconnecting...');
        socket.disconnect();
    } else {
        // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
    	logger.info('no connection to break...');
    }
    done();
});

beforeEach(function () {
	var title;
	if (typeof jasmine !== 'undefined') { 
		title = jasmine.getEnv().currentSpec.description
	} else { 
		title = this.currentTest.title;
	}
    logger.info("=============== Running test: " + title + " =============== ")
})

// these tests were copied from Ozone API client-api.spec.js
describe("Messaging tests", function () {
	describe("Tests from Ozone API", function () {
		var Messenger;
		it("should return a function", function () {
			//Ozone.config().setServicesUrl(testServicesUrl);
			Messenger = require('../public/js/messenger');
			expect(Messenger).to.be.a(Function);
			expect(Messenger.allChannels).to.be.ok();   
		});
		var messenger_p ;
		it("should be instantiable", function () {
			messenger_p = new Messenger();
			expect(messenger_p.sendMessage).to.be.a(Function);
		});
		function simpleMessenger (name) {
			this.receiveMessage = function (message) {
				logger.debug("chat client %s received message: %s", this.clientName, message);
				this.lastMessage = message;
			};
			this.messengerInit(name);
		};
		var clientA, clientB;
		var clientA_id = "x" + Math.random();
		var clientB_id = "x" + Math.random();
		it("should be inheritable", function () {
			simpleMessenger.prototype = messenger_p;
			clientA = new simpleMessenger(clientA_id);
			clientB = new simpleMessenger(clientB_id);
			expect(clientA.sendMessage).to.be.a(Function);
			expect(clientB.receiveMessage).to.be.a(Function);
		});
		it("should send a message from client A to client B", function (done) {
			var msg = "Hi from A";
			clientA.sendMessage(clientB_id, msg);
			setTimeout(function () {
				expect(clientB.lastMessage.message).to.be(msg);
				done();
			}, 500);
		});
	});
});
