/**
 *  Utility methods used by AppsMall service layer
 *
 *  @module Ozone.Services.AppsMall
 *  @class Ozone.Services.AppsMall.ObjectUtility
 *  @submodule Server-Side
 */

exports.isEmptyObject = function(obj) {
  return !Object.keys(obj).length;
};