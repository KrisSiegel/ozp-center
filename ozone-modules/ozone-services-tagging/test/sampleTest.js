/**
 *  The Tagging module handles all RESTful calls for Tag and Topic objects.
 *
 *  Contents only accessible via RESTful APIs.
 *
 *  @module Ozone.Services.Tagging
 *  @class Ozone.Services.Tagging.UnitTest
 *  @submodule Server-Side
 */

var assert = require("assert")
  , expect = require('expect.js');

describe('Array', function(){
    describe('indexOf method', function(){
        it('should return -1 when the value is not present', function(){
            // using assert for testing
            assert.equal(-1, [1,2,3].indexOf(5));
            assert.equal(-1, [1,2,3].indexOf(0));

            // using expect for testing
            expect([1,2,3].indexOf(5)).to.be(-1);
            expect([1,2,3].indexOf(0)).to.be(-1);
        })
    })
})