// async.Handler.js
const asyncHandler = (requestHandle) => {
    return (req, res, next) => {
        Promise.resolve(requestHandle(req, res, next))
            .catch((err) => next(err));
    };
};

// Use CommonJS export
module.exports = asyncHandler;
