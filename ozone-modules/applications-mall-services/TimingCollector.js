var TimingCollector = function() {};

TimingCollector.prototype = {
	req: null,
	currentStart: null,
	currentEnd: null,
	timerQueue: [],
	debugging: false
};

TimingCollector.prototype.start = function () {
	this.currentStart = new Date();
};

TimingCollector.prototype.stop = function (req) {
	this.req = req;
	this.currentEnd = new Date();
	return this.save();
};

TimingCollector.prototype.save = function () {
	var timingObj = {
		queryUrl: this.req.originalUrl,	
		requestStarted: this.currentStart,
		requestEnded: this.currentEnd,
		requestLasted: (this.currentEnd - this.currentStart) / 1000
	}
	this.timerQueue.push(timingObj);
	return timingObj;
};

TimingCollector.prototype.get = function () {
	return this.timerQueue;
};

//Node.js module export
module.exports = TimingCollector;