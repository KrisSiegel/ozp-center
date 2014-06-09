
var assert = require("assert")
  , expect = require('expect.js');

describe('Array', function(){
	describe('#indexOf() assert', function(){
		it('should return -1 when the value is not present', function(){
			assert.equal(-1, [1,2,3].indexOf(5));
			assert.equal(-1, [1,2,3].indexOf(0));
		})
	})
	describe('#indexOf() expect', function(){
		it('should return -1 when the value is not present', function(){
			expect([1,2,3].indexOf(5)).to.be(-1);
			expect([1,2,3].indexOf(0)).to.be(-1);
		})
	})
})