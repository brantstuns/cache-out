const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonStubPromise = require('sinon-stub-promise')
const rewire = require('rewire');
const index = rewire('../index');
chai.use(sinonChai);
sinonStubPromise(sinon);

describe('cache-out ', function() {
  beforeEach(function() {
    this.redisClientStub = sinon.stub();
    this.redisClientStub.prototype.get = sinon.stub();
    this.redisClientStub.prototype.setex = sinon.stub();
    this.unwireIndex = index.__set__('redis', this.redisClientStub);
  });

  afterEach(function() {
    this.unwireIndex();
  });

  describe('and the request is a GET ', function() {
    beforeEach(function () {
      this.requestClientStub = sinon.stub();
      this.requestOptions = {
        method: 'GET',
        url: 'veryreliableandfastserviceurl.com'
      };
    });

    it('it should call get on the redisClient with the endpoint', function (done) {
      this.redisClientStub.prototype.get.returnsPromise().resolves(`{"nice": "cached response"}`);
      index(this.requestClientStub, this.requestOptions,
        {port: 1111, host: 'localhost', db: '0', password: ''})
        .then(() => {
          expect(this.redisClientStub.prototype.get).to.have.been.calledWith(this.requestOptions.url);
          done();
        });
    });
  });
});