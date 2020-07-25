const csv = require("csvtojson");
const fs = require("fs");
const Redirect = require("../lib/redirect");

class Parser {
  constructor(
    src = "./redirects.csv",
    dest = "./_redirects",
    defaultBranch = "master"
  ) {
    this.src = src;
    this.dest = dest;
    this.defaultBranch = defaultBranch;
    this.rows;
  }

  async perform() {
    const rows = await this.getRows();
    fs.writeFile(this.dest, rows.join("\n"), (err) => {
      if (err) return console.error(err);
      console.log(`Wrote ${rows.length} redirect rules to ${this.dest}`);
    });
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
          ).toString();
        });
      });
  }
}

module.exports = Parser;
