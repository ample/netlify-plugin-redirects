const csv = require("csvtojson");
const fs = require("fs");
const Redirect = require("../lib/redirect");

class Parser {
  constructor(
    src = "./redirects.csv",
    dest = "./_redirects",
    defaultBranch = "master",
    utils
  ) {
    this.src = src;
    this.dest = dest;
    this.defaultBranch = defaultBranch;
    this.rows;
    this.rowsProcessed = [];
    this.utils = utils;
    this.error;
  }

  stats() {
    if (!this.error) {
      return {
        title: "Redirects processed successfully",
        summary: `Wrote ${this.rowsProcessed.length} redirect rules to ${this.dest}.`,
        text: `In /_redirects:\n<ul>${this.rowsProcessed.map(
          (row) => `<li>${row.toString()}</li>`
        )}</ul>`,
      };
    } else {
      return {
        title: "Redirects plugin encountered errors",
        summary: this.error,
      };
    }
  }

  async perform() {
    await this.getRows().then((rows) => {
      rows
        .filter((row) => row.contextIncluded())
        .forEach((row) => this.rowsProcessed.push(row.toString()));
    });
    try {
      await fs.writeFile(this.dest, this.rowsProcessed.join("\n"), (err) => {
        if (err) throw new Error(err);
      });
    } catch (err) {
      this.error = err.message;
      this.utils.build.failBuild(err.message);
    }
  }

  async getRows() {
    if (!this.rows) {
      this.rows = await this.parseCSV();
    }
    return this.rows || [];
  }

  async parseCSV() {
    let rules = [];
    const opts = {
      output: "csv",
      noheader: true,
    };
    return await csv(opts)
      .fromFile(this.src)
      .then((json) => {
        return json.map((row) => {
          let [origin, destination, status, ctx] = row;
          return new Redirect(
            origin,
            destination,
            status,
            ctx,
            this.defaultBranch
          );
        });
      });
  }
}

module.exports = Parser;
