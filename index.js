module.exports = (fn, args) => async (req, res) => {
  try {
    // Allow passing either a function or a path to a function-module
    if (typeof fn === 'string') {
      // Fix relative paths
      if (fn.startsWith('.')) {
        const path = require('path')
        fn = path.join(path.dirname(module.parent.filename), fn)
      }

      fn = await require(fn)
    }

    // Allow passing either an array of args or a function that produces them from req
    if (typeof args === 'function') {
      args = await args(req)
    }

    // Make sure args is wrapped in an array if it exists at all
    if (args && !Array.isArray(args)) {
      args = [args]
    }

    // Attempt to run the function and return the result
    const result = await fn.apply(null, args)
    res.send(result)
  }
  catch (err) {
    res.status(err.status || 500).send(err.message)
  }
}