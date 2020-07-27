"use strict";
const { it, describe } = require("mocha");
const assert = require("assert");

const branchName = require("current-git-branch");
const Redirect = require("../lib/redirect");

describe("Redirect", () => {
  before(() => {
    process.env["OLD_DOMAIN"] = "www.helloample.com";
    process.env["NEW_DOMAIN"] = "ample.co";

    this.origin = "https://${env:OLD_DOMAIN}/*";
    this.destination = "https://${env:NEW_DOMAIN}/:splat";
    this.status = "301!";
    this.ctx = "master";

    this.redirect = new Redirect(
      this.origin,
      this.destination,
      this.status,
      this.ctx
    );
  });

  describe("#toString()", () => {
    it("should return Netlify redirect rule", () => {
      assert.equal(
        this.redirect.toString(),
        "https://www.helloample.com/*\thttps://ample.co/:splat\t301!"
      );
    });

    it("should return abbreviated rule if origin & destination are equal and origin does not end w/ a splat", () => {
      let destination = this.redirect.destination;
      this.redirect.destination = this.redirect.origin;
      assert.equal(
        this.redirect.toString(),
        "https://www.helloample.com/*\t301!"
      );
      this.redirect.destination = destination;
    });

    it("should encode query string parameters", () => {
      this.redirect.destination = this.redirect.encodeParams(
        `${this.redirect.destination}?everThus=/to-deadbeats`
      );
      assert.equal(
        this.redirect.toString(),
        "https://www.helloample.com/*\thttps://ample.co/:splat?everThus=%2Fto-deadbeats\t301!"
      );
    });
  });

  describe("#replaceVars()", () => {
    it("should replace ENV vars", () => {
      assert.equal(
        this.redirect.replaceVars(this.destination),
        "https://ample.co/:splat"
      );
    });
  });

  describe("#encodeParam()", () => {
    it("should only encode certain value chars in key/value pair", () => {
      assert.equal(
        this.redirect.encodeParam("everThus=/to-deadbeats"),
        "everThus=%2Fto-deadbeats"
      );
      assert.equal(
        this.redirect.encodeParam("groupIds=:groupIds/something"),
        "groupIds=:groupIds%2Fsomething"
      );
    });
  });

  describe("#encodeParams()", () => {
    it("should encode query string params", () => {
      assert.equal(
        this.redirect.encodeParams(`https://ample.com/?everThus=/to-deadbeats`),
        "https://ample.com/?everThus=%2Fto-deadbeats"
      );
    });
    it("should not encode common characters like colon-placeholder", () => {
      assert.equal(
        this.redirect.encodeParams(
          `/signin?redirectUrl=/group-renew&groupIds=:groupIds`
        ),
        "/signin?redirectUrl=%2Fgroup-renew&groupIds=:groupIds"
      );
    });
  });

  describe("#getContext()", () => {
    describe("when CONTEXT == `production`", () => {
      before(() => {
        process.env["CONTEXT"] = "production";
      });
      it("it should return BRANCH if defined", () => {
        process.env["BRANCH"] = "main";
        assert.equal(this.redirect.getContext(), "main");
        delete process.env["BRANCH"];
      });
      it("it should return current branch if BRANCH undefined", () => {
        assert.equal(process.env["BRANCH"], undefined);
        assert.equal(this.redirect.getContext(), branchName());
      });
    });

    describe("when CONTEXT == `deploy-preview`", () => {
      before(() => {
        process.env["CONTEXT"] = "deploy-preview";
      });
      it("should return default branch", () => {
        assert.equal(this.redirect.getContext(), this.redirect.defaultBranch);
      });
    });

    describe("when CONTEXT == undefined", () => {
      before(() => {
        delete process.env["CONTEXT"];
      });
      it("should return current branch", () => {
        assert.equal(process.env["CONTEXT"], undefined);
        assert.equal(process.env["BRANCH"], undefined);
        assert.equal(this.redirect.getContext(), branchName());
      });
    });

    describe("when CONTEXT == something else", () => {
      before(() => {
        process.env["CONTEXT"] = "staging";
      });
      it("should return current branch", () => {
        assert.equal(this.redirect.getContext(), "staging");
      });
    });
  });
});
