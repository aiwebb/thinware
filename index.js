const thinware = (origFn, origArgs, useNext) => async (req, res, next) => {
  // Each middleware invocation should use its own copy of original arguments -
  // this is a somewhat unintuitive requirement. Without it, when fn & args are
  // modified below, they are actually modifying the variables to which all
  // future invocations are lexically bound. That is, to say the least, very
  // undesirable behavior for middleware.
  let fn   = origFn
  let args = origArgs

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

    if (next && useNext) {
      next(null, result)
    }
    else {
      res.send(result)
    }
  }
  catch (err) {
    if (next && useNext) {
      next(err)
    }
    else {
      res.status(err.status || 500).send(err.message)
    }
  }
}

thinware.next = (origFn, origArgs) => thinware(origFn, origArgs, true)

// This module should not be cached - it'll break relative path usage
delete require.cache[__filename]

module.exports = thinware