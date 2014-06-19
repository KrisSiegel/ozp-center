/**
    An example ozone service module that simply outputs text.

    @module Ozone.Services.Example
    @class Ozone.Services.Example
    @submodule Server-Side
*/
(function () {
    module.exports = function (callback, Ozone) {
        var shout = require("./shouter").shout;

        /**
            Returns some text when calling the RESTful service

            @method /api/example/
        */
        Ozone.Routing.get("example/", function (req, res) {
            res.send(shout("Example module here"));
        });
    };
}());
