/**
    The node.js unit tests for the shouter.
*/
module.exports = (function (Ozone) {
    describe("ozone-example-module", function () {
        it("shout() returns shouted text", function () {
            var shout = require("../shouter").shout;
            expect(shout("test")).toBe("test!");
        });
    });
});
