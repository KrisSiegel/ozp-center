/**
    An example module to be used with the example service.

    @module Ozone.Services.Example
    @class Ozone.Services.Example.Shouter
    @submodule Server-Side
*/
(function () {
    module.exports = {
        /**
            Adds a ! to the end of the input string and returns in.

            @method shout
            @param {String} text the text to add an ! to.
        */
        shout: function (text) {
            return (text + "!");
        }
    };
}());
