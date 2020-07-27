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

    it("should encode query string parameters", () => {
      this.redirect.destination = this.redirect.encodeParams(
        `${this.redirect.destination}?everThus=/to-deadbeats`
      );
      assert.equal(
        this.redirect.toString(),
        "https://www.helloample.com/*\thttps://ample.co/:splat?everThus=%2Fto-deadbeats\t301!"
      );
    });

    describe("for role-based redirect rules", () => {
      let origOrigin, origDestination, origStatus;

      beforeEach(() => {
        origOrigin = this.redirect.origin;
        origDestination = this.redirect.destination;
        origStatus = this.redirect.status;
        this.redirect.status = "200! Role=user";
      });

      afterEach(() => {
        this.redirect.origin = origOrigin;
        this.redirect.destination = origDestination;
        this.redirect.status = origStatus;
      });

      describe("with trailing wildcard character on origin", () => {
        before(() => {
          this.redirect.origin = "/something/*";
        });

        describe("and matching routes", () => {
          before(() => {
            this.redirect.destination = this.redirect.origin;
          });
          it("should abbreviate return value", () => {
            assert.equal(
              this.redirect.toString(),
              "/something/*\t200! Role=user"
            );
          });
        });

        describe("and non-matching routes", () => {
          it("should not abbreviate return value", () => {
            this.redirect.destination = "https://www.ample.co/:splat";
            assert.equal(
              this.redirect.toString(),
              "/something/*\thttps://www.ample.co/:splat\t200! Role=user"
            );
          });
        });
      });

      describe("without trailing wildcard character on origin", () => {
        describe("and matching routes", () => {
          describe("with trailing slash", () => {
            before(() => {
              this.redirect.origin = "/something/";
              this.redirect.destination = "/something/";
            });
            it("should not abbreviate return value AND should strip trailing slash from both paths", () => {
              assert.equal(
                this.redirect.toString(),
                "/something\t/something\t200! Role=user"
              );
            });
          });
          describe("without trailing slash", () => {
            before(() => {
              this.redirect.origin = "/something";
              this.redirect.destination = "/something";
            });

            it("should not abbreviate return value", () => {
              assert.equal(
                this.redirect.toString(),
                "/something\t/something\t200! Role=user"
              );
            });
          });
        });
      });
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
