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
    this.redisOptions = {port: 1111, host: 'localhost', db: '0', password: ''};

    this.redisClientStub = sinon.stub();
    this.redisClientStub.prototype.get = sinon.stub();
    this.redisClientStub.prototype.setex = sinon.stub();

    this.consoleStub = {log: sinon.stub()}; // I know, I know... I just hate seeing it in the shell

    this.unwireIndex = index.__set__('redis', this.redisClientStub);
    this.unwireConsole = index.__set__('console', this.consoleStub);
  });

  afterEach(function() {
    this.unwireIndex();
    this.unwireConsole();
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
      index(this.requestClientStub, this.requestOptions, this.redisOptions)
        .then(() => {
          expect(this.redisClientStub.prototype.get).to.have.been.calledWith(this.requestOptions.url);
          done();
        });
    });

    describe('and something throws an error ', function () {
      it('it should just make the request and return the response', function (done) {
        this.redisClientStub.prototype.get.returnsPromise().rejects('the worst error ever');
        this.requestClientStub.returnsPromise().resolves(`{"nice": "service response when redis broke"}`);

        index(this.requestClientStub, this.requestOptions, this.redisOptions)
          .then(() => {
            expect(this.redisClientStub.prototype.get).to.have.been.calledWith(this.requestOptions.url);
            done();
          });
      });
    });

    describe('and there is no cached response in redis ', function () {
      it('it should call the passed request with the passed requestOptions', function (done) {
        this.redisClientStub.prototype.get.returnsPromise().resolves('');
        this.requestClientStub.returnsPromise().resolves(`{"nice": "service response"}`);
        this.redisClientStub.prototype.setex.returnsPromise().resolves('cached response in redis');

        index(this.requestClientStub, this.requestOptions, this.redisOptions)
          .then(() => {
            expect(this.requestClientStub).to.have.been.calledWith(this.requestOptions);
            done();
          });
      });
    });
  });
});