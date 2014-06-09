(function () {
    module.exports = function (callback, Ozone) {
        var shout = require("./shouter").shout;

        Ozone.Routing.get("example/", function (req, res) {
            res.send(shout("Example module here"));
        });
    };
}());