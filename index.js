// index.js
const Parser = require("./lib/parser");

module.exports = {
  onPreBuild: async ({ inputs }) => {
    await new Parser(inputs.source, inputs.destination).perform();
  },
};
