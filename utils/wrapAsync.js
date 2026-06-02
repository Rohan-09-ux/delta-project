function wrapAsync(fn) {
    return function(req, res, next) {
        // Make sure to `.catch()` any errors that get thrown inside the async function
        fn(req, res, next).catch(next);
    };
}

module.exports = wrapAsync;