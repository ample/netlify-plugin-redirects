# netlify-plugin-redirects

[![build status](https://api.travis-ci.com/ample/netlify-plugin-redirects.svg)](https://travis-ci.com/github/ample/netlify-plugin-redirects) [![npm version](https://badge.fury.io/js/%40helloample%2Fnetlify-plugin-redirects.svg)](https://www.npmjs.com/package/@helloample/netlify-plugin-redirects)

Read a CSV file, parse the rows and write them to `_redirects` _before_ Netlify processes your build. Check out an example implementation [here](https://github.com/ample/netlify-plugin-redirects-demo). 

## Why?

Netlify's `_redirects` file does not support environment variables or context. With this build, you can specify environmentally specific redirect rules in a CSV file and then dynamically write those rules to `_redirects` before your site is deployed.

## Setup

Create a new file called `redirects.csv` and put it in the root of your application directory ([example](https://github.com/ample/netlify-plugin-redirects/blob/main/test/fixtures/redirects.csv)). Each row in your CSV file should contain the following columns:

| Source                             | Destination                           | Status                                                            | Context                                                                                                      |
| ---------------------------------- | ------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| This is the path you want to match | This is the destination for your rule | The status code associated with the rule, eg. `301`, `200!`, etc. | Comma delimited string of branch names for your deployment context, leave this column blank for "no context" |

If you have defined a context for a rule, it will only be rendered for when the current branch name is included within that column; if you have not defined a context, that rule will be deployed everywhere.

When referring to exported environment variables, you need to use the following convention in your CSV...

```
${env:SOME_ENV_VARIABLE}
```

## Install

Add the plugin to your `package.json` file... 

```
$ npm i @helloample/netlify-plugin-redirects -D
```

Create a new file at the root of your project called `redirects.csv` with your redirect rules (see [setup](https://github.com/ample/netlify-plugin-redirects/blob/main/README.md#setup) for more information on formatting your rules)... 

```
$ echo "/redirect-me,https://ample.co,301!" > ./redirects.csv
```

And add the plugin to your `netlify.toml` file (see [configuration](https://github.com/ample/netlify-plugin-redirects/blob/main/README.md#configuration) for available options)... 

```
[[plugins]]
  package = "@helloample/netlify-plugin-redirects"
```

Commit &amp; push changes back to your repository. Now go watch the next build on Netlify.  

## Configuration

You can tell the plugin where to source your rules and where to write the parsed redirects via the following options, in your `netlify.toml` file...

- `source`: Specifies the location of your CSV file.
- `destination`: Specifies the file to which the parsed rules will be written.
- `defaultBranch`: The default branch for your repo. This value is used when context cannot be determined.

The default configuration, if none is specified, is:

```
[[plugins]]
  package = "@helloample/netlify-plugin-redirects"
  [plugins.inputs]
    source = "./redirects.csv"
    destination = "./_redirects"
    defaultBranch = "master"
```

## License

This project is licensed under the [MIT License](https://github.com/ample/netlify-plugin-redirects/blob/main/LICENSE).
