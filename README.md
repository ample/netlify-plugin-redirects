# netlify-plugin-redirects-csv

<img src="https://api.travis-ci.com/ample/netlify-plugin-redirects.svg?branch=main" />

Read a CSV file, parse the rows and write them to `_redirects` _before_ Netlify processes your build.

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

## Configuration

You can tell the plugin where to source your rules and where to write the parsed redirects via the following options, in your `netlify.toml` file...

- `source`: Specifies the location of your CSV file.
- `destination`: Specifies the file to which the parsed rules will be written.
- `defaultBranch`: The default branch for your repo. This value is used when context cannot be determined.

The default configuration, if none is specified, is:

```
[[plugins]]
  package = "./_plugins/netlify-plugin-redirects"
  [plugins.inputs]
    source = "./redirects.csv"
    destination = "./_redirects"
    defaultBranch = "master"
```

## License

This project is licensed under the [MIT License](https://github.com/ample/netlify-plugin-redirects/blob/main/LICENSE).
