"use strict";
const { it, describe } = require("mocha");
const assert = require("assert");
const fs = require("fs");
const Parser = require("../lib/parser");
const Redirect = require("../lib/redirect");

describe("Parser", () => {
  before(() => {
    this.parser = new Parser(
      "./test/fixtures/redirects.csv",
      "./tmp/_redirects"
    );
  });

  it("sets up reasonable defaults", () => {
    assert.equal(new Parser().src, "./redirects.csv");
    assert.equal(new Parser().dest, "./_redirects");
  });

  it("parses CSV and returns an array of Redirect objects", async () => {
    const rows = await this.parser.parseCSV();
    assert.equal(Array.isArray(rows), true);
  });

  it("writes the _redirects file", () => {
    const path = this.parser.dest;

    try {
      if (fs.existsSync(path)) {
        console.log("delete");
        fs.unlinkSync(path);
      }
    } catch (err) {
      console.error(err);
    }

    assert.equal(fs.existsSync(path), false);
    this.parser.rows = [new Redirect("/a", "/b", "301")];
    this.parser.perform();
    setTimeout(function() {
      assert.equal(fs.existsSync(path), true);
    }, 1);
  });
});
