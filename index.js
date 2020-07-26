// index.js
const Parser = require("./lib/parser");

module.exports = {
  onPreBuild: async ({ utils, inputs }) => {
    try {
      const parser = new Parser(inputs.source, inputs.destination);
      if (await parser.perform()) {
        const stats = parser.stats();
        console.log(stats.summary);
        utils.status.show(stats);
      } else {
        throw new Error("There was a problem.");
      }
    } catch (err) {
      utils.build.failBuild(err.message);
    }
  },
};
