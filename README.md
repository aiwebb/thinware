# thinware

A thin middleware wrapper for connecting server-agnostic application logic to req/res/next plumbing.

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

Let's say we have some server-agnostic application logic in `lib/hello.js` that we want to expose via an API endpoint:

```js
module.exports = name => `Hello, ${name}!`
```

Here's what your endpoint might look like:

```js
app.get('say-hello', async (req, res) => {
  const hello = require('./lib/hello')

  try {
    const result = await hello(req.query.name)
    res.send(result)
  }
  catch (err) {
    res.status(500).send(err.message)
  }
})
```

And here's the equivalent with `thinware`:

```js
app.get('say-hello', thinware('./lib/hello', req => req.query.name))
```

### thinware.next()

By default, `next` is not used. To invoke `next` instead of `res.send`, use `thinware.next`:

```js
app.get('/important-data',
  // Invokes next() with result instead of res.send()
  thinware.next(verifyToken, req => req.headers['x-token']),

  // Invokes res.send() with result
  thinware(getData, req => req.query)
)
```

## errdrop support

When `thinware` returns errors via `res`, it checks for a `.status` property on the error before falling back to `500 Internal Server Error`.

This can be done manually, or with a module like [errdrop](https://github.com/aiwebb/errdrop):

```js
const Error = require('errdrop')

module.exports = name => {
  if (!name) {
    throw new Error.BadRequest('name is required')
  }

  return `Hello, ${name}!`
}
```