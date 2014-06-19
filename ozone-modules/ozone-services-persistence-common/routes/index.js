/**
    Simply wraps and calls the two files that setup the collection and drive RESTful routes.
*/
module.exports = exports = function (Ozone) {
    require('./collection')(Ozone);
    require('./drive')(Ozone);
};
