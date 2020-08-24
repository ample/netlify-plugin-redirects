// index.js
const Parser = require("./lib/parser")

module.exports = {
  onBuild: async ({ utils, inputs }) => {
    const parser = new Parser(inputs.source, inputs.destination, inputs.defaultBranch, utils)
    await parser.perform()
    const stats = parser.stats()
    console.log(stats.summary)
    utils.status.show(stats)
  }
}
