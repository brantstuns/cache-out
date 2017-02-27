const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const rewire = require('rewire');
const index = rewire('./index');

describe('cache-out ', function() {
  beforeEach(function() {
    this.redisClientStub = {get: sinon.stub(), setex: sinon.stub()};
    this.unwireIndex = index.__set__('redis', this.redisClientStub);
  });

  afterEach(function() {
    this.unwireIndex();
  });
});