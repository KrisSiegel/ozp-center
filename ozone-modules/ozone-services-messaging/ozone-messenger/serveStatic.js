/*********************************************************************
  Serve up a client script from within this module.

  When this script is run as a Node.js module, it will intercept the
  request handler, check whether the request is asking for a
  particular file it is responsible for.  If a matched URL is found,
  it will use the pathMap (provided by the customer code) to identify
  the file within the module that should be served up, and serves it up.

  Inspired by socket.io, with hints taken from lib/static.js and lib/manager.js
*********************************************************************/

var fs = require('fs');

function createFileSenderCB(req, res) {
	return function (err, data) {
		res.writeHead(200);
		res.end(data);
	};
}

module.exports = {
	/*
	  Set up the request handler interception, get a mapping of URL
	  requests to file names
	 */
	init: function (server, pathLookup) {
		this.pathLookup = pathLookup;
		this.server = server;
		var self = this;

		// reset listeners
		this.oldListeners = server.listeners('request').splice(0);
		server.removeAllListeners('request');

		// One request handler
		server.on('request', function (req, res) {
			self.handleRequest(req, res);
		});
	},
	handleRequest: function (req, res) {
		var data = this.checkRequest(req); // Do we handle this specially, or let the standard HTTP listeners handle it?

		if (!data) {
			for (var i = 0, l = this.oldListeners.length; i < l; i++) {
				this.oldListeners[i].call(this.server, req, res);
			}

			return;
		}
		// If we made it here, we need to send the appropriate file
		var filename = this.pathLookup[req.url];
		fs.readFile(__dirname + '/' + filename, createFileSenderCB(req, res));
	},
	checkRequest: function (req) {
		var url = req.url;
		console.log("Checking URL " + url);
		if (url in this.pathLookup) {
			return true;
		}
		return false;
	}
};
