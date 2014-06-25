/**
    module.exports.js is included last in the Ozone API when combined into one file.
    The purpose of this file is allow for the same code to work on the frontend and backend without modification.
    This will check to see if it's essentially within a node.js context and return the Ozone API appropriately since globals are not allowed.
*/
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = Ozone;
}
