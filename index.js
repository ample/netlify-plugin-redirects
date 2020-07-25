// index.js
const Parser = require("./lib/parser");

module.exports = {
  onPreBuild: async () => {
    await new Parser().perform();
  },
};
