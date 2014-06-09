// Module dependencies
var ua = require('useragent');

/**
 * MetricsCollector constructor.
 * 
 * @class MetricsCollector
 * @constructor
 * @param {Object} db a MongoDB to use
 * @param {Object} max the maximum length of the buffer (optional)
 */
var MetricsCollector = function(db, max) {
    // Records buffer logs in batches
    this.buffer = [];
    this.metrics = db;
    this.max = max || 100;
};

MetricsCollector.prototype = {
    buffer: null,
    metrics: null,
    max: null
};

MetricsCollector.prototype._mergeObjects = function () {
	var o = {};
	for (var i = arguments.length - 1; i >= 0; i --) {
		var s = arguments[i];
		for (var k in s) o[k] = s[k];
	}
	return o;
};

/**
 * Collect metrics using Express' request object and additional input.
 * 
 * @method put
 * @param {Object} req Express request object
 * @param {Object} metricsParameters Additional metrics to collect
 */
MetricsCollector.prototype.put = function(req, metricsParameters) {
    
    var agent = ua.parse(req.headers['user-agent']);
    
    // Create the record
    var record = {
        ip: req.ip,
        browser: agent.toAgent(),
        xhr: req.xhr,
        host: req.host,
        contentType: req.get('Content-Type'),
        params: req.route.params,
        os: agent.os.toString()
    };
    
    var resultsObject = this._mergeObjects(record, metricsParameters);
    
    // If too long clean half of the buffer
    if (this.buffer.length === this.max) {
        this._cleanBuffer();
    }
    this.buffer.unshift(resultsObject);
};

/**
 * Clean the buffer & insert into the database
 * 
 * @method _cleanBuffer
 * @private
 */
MetricsCollector.prototype._cleanBuffer = function() {
    var records = this.buffer.splice((this.buffer.length / 2), this.buffer.length);
    this.metrics.collection('metrics', function(err, collection) {
        collection.insert(records, {safe:true}, function(err, result) {});
    });
};

/**
 * Returns the buffer
 * 
 * @method getBuffer
 * @return {Array} buffer the metrics buffer
 */
MetricsCollector.prototype.getBuffer = function () {
    return this.buffer;
};

// Node.js export
module.exports = MetricsCollector;