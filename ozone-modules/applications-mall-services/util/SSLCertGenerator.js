/**
 *  Contains utility methods for generating SSL certificates
 *
 *  @module Ozone.Services.AppsMall
 *  @class Ozone.Services.AppsMall.SSLCertGenerator
 *  @submodule Server-Side
 */

var fs = require('fs');
var colorize = require('colorize');
var cconsole = colorize.console;

/**
 * Creates new array of items containing all unique values passed in, without duplicates.
 * @method eliminateDuplicates
 * @param arr {Array} an array of items
 * @return {Array} an array of unique items contained in the array passed in
 */
function eliminateDuplicates(arr) {
	var i,
		len=arr.length,
		out=[],
		obj={};
	 
	for (i=0;i<len;i++) {
		obj[arr[i]]=0;
	}
	for (i in obj) {
		out.push(i);
	}
	return out;
};

/**
 * 
 * @attribute nameCombinations {Object}
 * @private
 */
var nameCombinations = {};

/**
 * UNIX command to create directory and file structure for certificates
 * @attribute createFileStructure {String}
 * @private
 */
var createFileStructure = 'mkdir ./certificateGeneration &&' +
	'cp ./openssl.conf ./certificateGeneration && ' +
	'cd ./certificateGeneration && ' +
	'mkdir ./certs && ' +
	'mkdir ./p12 && ' +
	'mkdir ./pem && ' +
	'mkdir ./csr && ' +
	'mkdir ./newcerts && ' +
	'mkdir ./private && ' +	
	'echo 00 > serial && ' +
	'echo 00 > crlnumber && ' +
	'touch index.txt';


/**
 * A collection of commands for SSL certificate generation, where the keys are named ```create<cert_type>``` or ```remove<cert_type>```
 * @attribute commands {object}
 * @private
 */
var commands = {
	createCAKey: "openssl genrsa -des3 -passout pass:password -out  ./private/rootCA.key 2048",
	removeCAPassword: "openssl rsa -passin pass:password -in ./private/rootCA.key -out ./private/rootCA.key",
	createCACrt: "openssl req -config ./openssl.conf -new -x509 -subj '/C=US/L=Maryland/O=Testing Harness CA/CN=localhost\' -days 3650 -key ./private/rootCA.key -out ./certs/rootCA.crt",
	createServerPrivateKey: "openssl genrsa -des3 -passout pass:password -out private/localhost.key 2048",
	removeServerPrivateKeyPassword: "openssl rsa -passin pass:password -in ./private/localhost.key -out ./private/localhost.key",
	createServerCSR: "openssl req -config openssl.conf -new -subj '/C=US/L=Maryland/O=Testing Harness/CN=localhost' -key ./private/localhost.key -out ./csr/localhost.csr",
	createServerCrt: "openssl ca -batch -config openssl.conf -days 3650 -in ./csr/localhost.csr -out ./certs/localhost.crt -keyfile ./private/rootCA.key -cert ./certs/rootCA.crt -policy policy_anything",
	createClientPrivateKey: "openssl genrsa -des3 -passout pass:password -out ./private/client.key 2048",
	removeClientPrivateKeyPassword: "openssl rsa -passin pass:password -in ./private/client.key -out ./private/client.key",
	createClientCSR: "openssl req -config ./openssl.conf -new -subj '/C=US/L=Columbia/O=Testing Harness/CN=clientCN' -key ./private/client.key -out ./csr/client.csr",
	createClientCrt: "openssl ca -batch -config ./openssl.conf -days 3650 -in ./csr/client.csr -out ./certs/client.crt -keyfile ./private/rootCA.key -cert ./certs/rootCA.crt -policy policy_anything",
	createClientP12: "openssl pkcs12 -export -passout pass:password -in certs/client.crt -inkey ./private/client.key -certfile ./certs/rootCA.crt -out ./p12/client.p12",
	createClientPEM: "openssl pkcs12 -in ./p12/client.p12 -passin pass:password -out ./pem/client.pem -nodes"
};

var entries = process.argv.splice(2)[0] || 100;

cconsole.log('SSL/TLS Generation Tool');
cconsole.log('-----------------------------------------');

var names = [], userTable = [], nameIndex = 0, organizations = ['business1.com', 'business2.org', 'business3.com', 'business4.org', 'business5.com'];

fs.readFile('names.txt', 'utf8', function(err, data) {
	cconsole.log('#cyan[Loading and parsing random names for client certificates...]');
	if (err) throw err;
	var namesRawArray = data.split(' ');
	var namesArray = eliminateDuplicates(namesRawArray);
	cconsole.log('#cyan[Creating ' + entries + ' random first and last name combinations...]');
	for (var i = 0; i < entries; i++) {
		var firstNameIndex = Math.floor(Math.random() * namesArray.length);
		var firstName = namesArray[firstNameIndex];
		var lastNameIndex = Math.floor(Math.random() * namesArray.length);
		var lastName = namesArray[lastNameIndex];
		var fullName = firstName + '.' + lastName;
		if (!nameCombinations[fullName]) {
			nameCombinations[fullName] = true;
		}
		else {
			i--;
		}
	}
	names = Object.keys(nameCombinations);
	cconsole.log('#cyan[Generated ' + names.length + ' random names.]');
	
	for (var j = 0; j < names.length; j++) {
		var isAdmin = (Math.floor( Math.random() * 2 ) ? true : false);
		userTable.push({name: names[j], isAdmin: isAdmin});
	}
	
	// Write the new results to a file.
	fs.writeFile('../conf/users.json', JSON.stringify({users: userTable}, null, 4), function(err) {
		if(err) {
			cconsole.log(err);
		}
		else {
			cconsole.log("#cyan[User table saved to conf/users.json]");
		}
	});
	
	generateFileSystemStructure();
});

/**
 * Launches process to create file structure for all certificates
 * @method generateFileSystemStructure
 * @private
 */
var generateFileSystemStructure = function() {
	cconsole.log('#yellow[Generating file system structure...]');
	var exec = require('child_process').exec;
	exec(createFileStructure, function callback(error, stdout, stderr) {
		if (!error) {
			process.chdir('./certificateGeneration');
			createCAKey();
		}
		else cconsole.log('PWD: ' + __dirname + ' #red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that creates Certificate Authority key
 * @method createCAKey
 * @private
 */
var createCAKey = function() {
	cconsole.log('Creating #green[CA] key...');
	var exec = require('child_process').exec;
	exec(commands.createCAKey, function callback(error, stdout, stderr) {
	    if (!error) removeCAPassword();
	    else cconsole.log('PWD: ' + __dirname + ' #red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that removes Certificate Authority password
 * @method removeCAPassword
 * @private
 */
var removeCAPassword = function() {
	cconsole.log('Removing #green[CA] password...');
	var exec = require('child_process').exec;
	exec(commands.removeCAPassword, function callback(error, stdout, stderr) {
	    if (!error) createCACrt();
	    else cconsole.log('PWD: ' + __dirname + ' #red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that creates server certificate
 * @method createCACrt
 * @private
 */
var createCACrt = function() {
	cconsole.log('Creating #green[CA] certificate...');
	var exec = require('child_process').exec;
	exec(commands.createCACrt, function callback(error, stdout, stderr) {
	    if (!error) createServerPrivateKey();
	    else cconsole.log('PWD: ' + __dirname + ' #red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that creates server private key
 * @method createServerPrivateKey
 * @private
 */
var createServerPrivateKey = function() {
	cconsole.log('Removing #green[server] private key...');
	var exec = require('child_process').exec;
	exec(commands.createServerPrivateKey, function callback(error, stdout, stderr) {
	    if (!error) removeServerPrivateKeyPassword();
	    else cconsole.log('PWD: ' + __dirname + ' #red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that removes private key password
 * @method removeServerPrivateKeyPassword
 * @private
 */
var removeServerPrivateKeyPassword = function() {
	cconsole.log('Removing #green[server] private key password...');
	var exec = require('child_process').exec;
	exec(commands.createServerPrivateKey, function callback(error, stdout, stderr) {
	    if (!error) createServerCSR();
	    else cconsole.log('PWD: ' + __dirname + ' #red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that creates server CSR (Certificate Signing Request)
 * @method createServerCSR
 * @private
 */
var createServerCSR = function() {
	cconsole.log('Creating #green[server] CSR...');
	var exec = require('child_process').exec;
	exec(commands.createServerCSR, function callback(error, stdout, stderr) {
	    if (!error) createServerCrt();
	    else cconsole.log('PWD: ' + __dirname + ' #red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that creates server certificate
 * @method createServerCrt
 * @private
 */
var createServerCrt = function() {
	cconsole.log('Creating #green[server] certificate...');
	var exec = require('child_process').exec;
	exec(commands.createServerCrt, function callback(error, stdout, stderr) {
	    if (!error) createClientPrivateKey();
	    else cconsole.log('#red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that creates private key
 * @method createClientPrivateKey
 * @private
 */
var createClientPrivateKey = function() {
	cconsole.log('Creating #cyan[client] private key for #bold[' + names[nameIndex] + ']...');
	var exec = require('child_process').exec;
	exec(commands.createClientPrivateKey.replace(/client/g, names[nameIndex]), function callback(error, stdout, stderr) {
	    if (!error) removeClientPrivateKeyPassword();
	    else cconsole.log('PWD: ' + __dirname + ' #red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that removes client private key password
 * @method removeClientPrivateKeyPassword
 * @private
 */
var removeClientPrivateKeyPassword = function() {
	cconsole.log('\tRemoving #cyan[client] private key password.');
	var exec = require('child_process').exec;
	exec(commands.removeClientPrivateKeyPassword.replace(/client/g, names[nameIndex]), function callback(error, stdout, stderr) {
	    if (!error) createClientCSR();
	    else cconsole.log('#red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that creates client CSR (Certificate Signing Request)
 * @method createClientCSR
 * @private
 */
var createClientCSR = function() {
	cconsole.log('\tCreating #cyan[client] CSR.');
	var exec = require('child_process').exec;
	exec(commands.createClientCSR.replace(/clientCN/g, names[nameIndex] + '@' + organizations[Math.floor(Math.random() * 5)]).replace(/client/g, names[nameIndex]), function callback(error, stdout, stderr) {
	    if (!error) createClientCrt();
	    else cconsole.log('#red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that creates client certificate
 * @method createClientCrt
 * @private
 */
var createClientCrt = function() {
	cconsole.log('\tCreating #cyan[client] certificate.');
	var exec = require('child_process').exec;
	exec(commands.createClientCrt.replace(/client/g, names[nameIndex]), function callback(error, stdout, stderr) {
	    if (!error) createClientP12();
	    else cconsole.log('#red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that creates P12 certificate
 * @method createClientP12
 * @private
 */
var createClientP12 = function() {
	cconsole.log('\tCreating #cyan[client] P12 certificate.');
	var exec = require('child_process').exec;
	exec(commands.createClientP12.replace(/client/g, names[nameIndex]), function callback(error, stdout, stderr) {
	    if (!error) createClientPEM();
	    else cconsole.log('#red[Error:] ' + stderr);
	});
};

/**
 * Spawns child process to run command that creates PEM certificate
 * @method createClientPEM
 * @private
 */
var createClientPEM = function() {
	cconsole.log('\tCreating #cyan[client] PEM certificate.');
	var exec = require('child_process').exec;
	exec(commands.createClientPEM.replace(/client/g, names[nameIndex]), function callback(error, stdout, stderr) {
	    if (!error) {
	    	if (nameIndex < (entries - 1)) {
	    		nameIndex++;
	    		createClientPrivateKey()
	    	}
	    }
	    else cconsole.log('#red[Error:] ' + stderr);
	});
};