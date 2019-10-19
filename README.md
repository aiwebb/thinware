# thinware

A thin middleware wrapper for connecting server-agnostic application logic to req/res plumbing.

```js
thinware(
  fn,  // or path to module that returns a function
  args // or function that produces args from req
)
```

## Installation
```bash
# npm
npm i --save thinware

# yarn
yarn add thinware
```


## Example

### lib/hello.js
```js
module.exports = name => `Hello, ${name}!`
```

### server.js
```js
// (app setup omitted)

const thinware = require('thinware')

app.get('say-hello',
  thinware('./lib/hello', req => [req.query.name])
))
```


## errdrop support

When `thinware` returns errors via `res`, it checks for a `.status` property on the error before falling back to `500 Internal Server Error`.

This can be done manually, or with a module like [errdrop](https://github.com/aiwebb/errdrop):

```js
const Error = require('errdrop')

module.exports = name => {
  if (!name) {
    throw Error.BadRequest('name is required')
  }

  return `Hello, ${name}!`
}
```