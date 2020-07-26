const branchName = require("current-git-branch");

class Redirect {
  constructor(origin, destination, status, ctx, defaultBranch) {
    this.origin = this.scrubString(origin);
    this.destination = this.scrubString(destination);
    this.status = status;
    this.ctx = ctx;
    this.defaultBranch = defaultBranch || "master";
    return this.toString();
  }

  toString() {
    if (this.origin === this.destination) {
      return `${this.origin}\t${this.status}`;
    } else {
      return `${this.origin}\t${this.destination}\t${this.status}`;
    }
  }

  scrubString(str) {
    return this.encodeParams(this.replaceVars(str));
  }

  encodeParams(str) {
    const matches = str.match(/([^\?]*)\?(.*)$/);
    if (matches) {
      return `${matches[1]}?${encodeURIComponent(matches[2])}`;
    } else {
      return str;
    }
  }

  replaceVars(str) {
    const regex = /(\$\{env\:([^\}]*)\})/;
    const matches = str.match(regex);
    if (matches) {
      return str.replace(matches[1], process.env[matches[2]]);
    } else {
      return str;
    }
  }

  contextIncluded() {
    return !this.ctx || this.ctx.split(",").includes(this.getContext());
  }

  getContext() {
    if (
      process.env["CONTEXT"] === undefined ||
      process.env["CONTEXT"] === "production"
    ) {
      return process.env["BRANCH"] === undefined
        ? branchName()
        : process.env["BRANCH"];
    } else if (process.env["CONTEXT"] === "deploy-preview") {
      return this.defaultBranch;
    } else {
      return process.env["CONTEXT"];
    }
  }
}

module.exports = Redirect;
