const csv = require("csvtojson");
const fs = require("fs");
const Redirect = require("../lib/redirect");

class Parser {
  constructor(src = "./redirects.csv", dest = "./_redirects") {
    this.src = src;
    this.dest = dest;
    this.rows;
  }

  perform() {
    const rows = this.getRows();
    fs.writeFile(this.dest, rows.join("\n"), (err) => {
      if (err) return console.error(err);
      console.log(`Wrote ${rows.length} redirect rules to ${this.dest}`);
    });
  }

  getRows() {
    if (!this.rows) {
      this.rows = this.parseCSV();
    }
    return this.rows;
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
          return new Redirect(origin, destination, status, ctx).toString();
        });
      });
  }
}

module.exports = Parser;
