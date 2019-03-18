"use strict";

const mocha = require("mocha");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { app, runServer, closeServer } = require("../server");
chai.use(chaiHttp);
const expect = chai.expect;

describe("integration test", function() {
  before(runServer);
  after(closeServer);
  it("test root endpoint", function() {
    chai
      .request(app)
      .get("/")
      .then(res => {
        expect(res).to.have.status(200);
      });
  });
});
