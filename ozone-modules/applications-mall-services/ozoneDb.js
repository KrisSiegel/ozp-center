var mongo = require('mongodb');
var debugging = true;


exports.init = function (dbname) {
	// Create and connect to MongoDB database.
	var Server = mongo.Server, Db = mongo.Db;
	var server = new Server('localhost', 27017, {auto_reconnect: true});
	var db = new Db(dbname, server, {journal: true});
	db.open(function () {});
	return db;
};

