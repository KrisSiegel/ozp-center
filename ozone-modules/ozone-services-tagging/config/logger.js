var winston = require('winston')
  , customLogLevels = {
		levels: {
			debug: 0,
		    info: 1,
		    warning: 2,
		    error: 3
		},
	    colors: {
	    	debug: 'grey',
	    	info: 'green',
	    	warning: 'orange',
	    	error: 'red'
	    }
	}
  , logger = new (winston.Logger)({
	  transports: [
	    new (winston.transports.Console)({
	    	'timestamp': true,
	    	/*
	    	function() { // timestamp function
	    		var currentdate = new Date(); 
	    		var datetime = currentdate.getFullYear() + "-"
	    					+ ("0" + (currentdate.getMonth()+1)).slice(-2) + "-"
	    	                + ("0" + currentdate.getDate()).slice(-2)  
	    	                + " "  
	    	                + ("0" + currentdate.getHours()).slice(-2) + ":"  
	    	                + ("0" + currentdate.getMinutes()).slice(-2) + ":" 
	    	                + ("0" + currentdate.getSeconds()).slice(-2) + "." 
	    	                + currentdate.getMilliseconds();
	    		return datetime;
	    	}, */
	    	colorize: true, 
	    	level: 'debug'
	    })
	  ],
	  levels: customLogLevels.levels,
	  colors: customLogLevels.colors
  });

module.exports = logger;