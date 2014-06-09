var baseURL = require('../conf/version.json').rest.url,
    logger,
    appHandlers = require('../AppHandlers'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

module.exports = exports = function (Ozone) {

    var routing = Ozone.Routing;
    logger = Ozone.logger;
    appHandlers.init(Ozone);

    routing.post(baseURL + 'review', appHandlers.addReview);
    routing.get(baseURL + 'reviews', appHandlers.getReviews);
    routing.post /* Maybe PUT is better.  Wait until we move to Angular interface? */ (
    		baseURL + ':action/:id', appHandlers.updateAction
    );

    addMiscRoutes(routing);
};

function addMiscRoutes (routing) {
	// serving contents of config.json as static content, to be encapsulated within Angular service
	//var configJson = require('../conf/config.json');
	//routing.get(baseURL + 'config/urls', function(req,res) { res.send(configJson); });

    // get list of upload images. (TO DO: get list of uploaded images from persistence layer)
	routing.get(baseURL + 'image-list', function(req,res) {
		fs.readdir((__dirname + '/../public/img/'), function (err, files) {
		  if (err) {
		    logger.error(err);
		    res.send([]);
		  }
          else {
              res.send(files);
          }
		});
	});

    // adding static route to fetch upload images. (TO DO: fetch uploaded image from persistence layer)
	routing.get(baseURL + 'upload-image/:image', function (req, res) {
        logger.debug('Getting uploaded image ' + req.params.image);
        res.sendfile(__dirname + '/../public/img/' + req.params.image, {root: '/./'});

    });

	// file upload
	routing.post(baseURL + 'file-upload', function(req, res, next) {
	    // get the temporary location of the file
	    var tmp_path = req.files.image.path;
	    // set where the file should actually exists - in this case it is in the "images" directory
	    var target_path = __dirname + '/../public/img/';
	    var target_file_full_path = target_path + req.files.image.name;
        var target_url_route = encodeURIComponent(req.files.image.name);

		// create public directory if it doesn't exist
		mkdirp(target_path, function(mkdir_err) {
		    if (mkdir_err) {
		    	logger.error('mkdir error: ' + JSON.stringify(mkdir_err));
				res.send({error: mkdir_err});
		    }
		    else {
        	    // move the file from the temporary location to the intended location
        	    fs.rename(tmp_path, target_file_full_path, function(err) {
                    if (err) {
                        logger.error('file rename error: ' + JSON.stringify(mkdir_err));
                        logger.error('tmp_path = ' + tmp_path + ', target_file_full_path = ' + target_file_full_path);
        				res.send({error: err})
        			}
        			else {
        		        // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
        		        fs.unlink(tmp_path, function() {
        		            if (err) {
        						res.send({error: 'Error removing file from temp directory.'})
        					}
        					else {
        						res.send({url: target_url_route, filesize: req.files.image.size});
        					}

        		        });
        			}
        	    });
		    }
		});
	});
}
