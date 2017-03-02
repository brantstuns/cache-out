const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sinonStubPromise = require('sinon-stub-promise')
const rewire = require('rewire');
const index = rewire('../index');
chai.use(sinonChai);
sinonStubPromise(sinon);

describe('When calling cache-out ', function () {
  beforeEach(function () {
    this.redisOptions = {port: 1111, host: 'localhost', db: '0', password: ''};

    this.defaultTTL = 86400;

    this.redisClientStub = sinon.stub();
    this.redisClientStub.prototype.get = sinon.stub();
    this.redisClientStub.prototype.setex = sinon.stub();

    this.consoleStub = {log: sinon.stub()}; // I know, I know... I just hate seeing it in the shell

    this.unwireIndex = index.__set__('redis', this.redisClientStub);
    this.unwireConsole = index.__set__('console', this.consoleStub);
  });

  afterEach(function () {
    this.unwireIndex();
    this.unwireConsole();
  });

  describe('and the request is a GET ', function () {
    beforeEach(function () {
      this.requestClientStub = sinon.stub();
      this.requestOptions = {
        method: 'GET',
        url: 'veryreliableandfastserviceurl.com'
      };
    });

    it('it should call get on the redisClient with the endpoint', function () {
      this.redisClientStub.prototype.get.returnsPromise().resolves(`{"nice": "cached response"}`);
      return index(this.requestClientStub, this.requestOptions, this.redisOptions)
        .then(() => {
          expect(this.redisClientStub.prototype.get).to.have.been.calledWith(this.requestOptions.url);
        });
    });

    describe('and something throws an error ', function () {
      it('it should just make the request and return the response', function () {
        const url = this.requestOptions.url;

        this.redisClientStub.prototype.get.returnsPromise().rejects('the worst error ever');
        this.requestClientStub.returnsPromise().resolves(`{"nice": "service response when redis broke"}`);

        return index(this.requestClientStub, this.requestOptions, this.redisOptions)
          .then(() => {
            expect(this.redisClientStub.prototype.get).to.have.been.calledWith(url);
          });
      });
    });

    describe('and there is no cached response in redis ', function () {
      it('it should call the passed request with the passed requestOptions', function () {
        this.redisClientStub.prototype.get.returnsPromise().resolves('');
        this.requestClientStub.returnsPromise().resolves(`{"nice": "service response"}`);
        this.redisClientStub.prototype.setex.returnsPromise().resolves('cached response in redis');

        return index(this.requestClientStub, this.requestOptions, this.redisOptions)
          .then(() => {
            expect(this.requestClientStub).to.have.been.calledWith(this.requestOptions);
          });
      });

      it('it should cache the service response in redis using setex', function () {
        const url = this.requestOptions.url;
        const res = {body: 'service response', statusCode: 200};
        const stringifiedRes = JSON.stringify(res);

        this.redisClientStub.prototype.get.returnsPromise().resolves('');
        this.requestClientStub.returnsPromise().resolves(res);
        this.redisClientStub.prototype.setex.returnsPromise().resolves('cached response in redis');

        return index(this.requestClientStub, this.requestOptions, this.redisOptions)
          .then(() => {
            expect(this.redisClientStub.prototype.setex).to.have.been.calledWith(url, this.defaultTTL, stringifiedRes);
          });
      });

      it('it should call setex with the passed time to live for the cached response', function () {
        const url = this.requestOptions.url;
        const res = {body: 'service response', statusCode: 200};
        const stringifiedRes = JSON.stringify(res);

        this.redisClientStub.prototype.get.returnsPromise().resolves('');
        this.requestClientStub.returnsPromise().resolves(res);
        this.redisClientStub.prototype.setex.returnsPromise().resolves('cached response in redis');

        return index(this.requestClientStub, this.requestOptions, this.redisOptions, 1111)
          .then(() => {
            expect(this.redisClientStub.prototype.setex).to.have.been.calledWith(url, 1111, stringifiedRes);
          });
      });

    });
  });
});