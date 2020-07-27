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
    const trailingChar = (str) => str.slice(-1);
    const hasSlash = (str) => trailingChar(str) == "/";
    const hasRole = () => this.status.includes("Role");
    const hasSplat = () => trailingChar(this.origin) == "*";
    const hasMatch = () => this.origin === this.destination;

    if (hasMatch() && hasRole() && hasSplat()) {
      return `${this.origin}\t${this.status}`;
    } else if (hasMatch() && hasRole() && !hasSplat()) {
      // if match + role + trailing slash... strip slashes
      let origin = hasSlash(this.origin)
        ? this.origin.slice(0, -1)
        : this.origin;
      let destination = hasSlash(this.destination)
        ? this.destination.slice(0, -1)
        : this.destination;
      return `${origin}\t${destination}\t${this.status}`;
    } else {
      return `${this.origin}\t${this.destination}\t${this.status}`;
    }
  }

  scrubString(str) {
    return this.encodeParams(this.replaceVars(str));
  }

  encodeParams(str) {
    const encode = (str) => {
      return str.split("&").map(this.encodeParam).join("&");
    };
    const matches = str.match(/([^\?]*)\?(.*)$/);
    if (matches) {
      return `${matches[1]}?${encode(matches[2])}`;
    } else {
      return str;
    }
  }

  encodeParam(str) {
    return str
      .split("=")
      .map((e, i) => {
        if (i == 1) {
          const unsafe = /[^a-zA-Z0-9-:=]/g;
          return e.replace(unsafe, (e) => encodeURIComponent(e));
        } else {
          return e;
        }
      })
      .join("=");
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
