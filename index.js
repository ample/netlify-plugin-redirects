// index.js
const Parser = require("./lib/parser");

module.exports = {
  onPreBuild: async ({ utils, inputs }) => {
    try {
      const parser = new Parser(inputs.source, inputs.destination);
      if (await parser.perform()) {
        const stats = parser.stats();
        utils.status.show(stats);
        console.log(stats.summary);
      } else {
        throw new Error("There was a problem.");
      }
    } catch (err) {
      utils.build.failBuild(err.message);
    }
  },
};
