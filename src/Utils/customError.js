class customApiError extends Error {
    constructor(
        statusCode,
        message,
        errros = [],
        stack = "",
    ) {
        super(message)
        this.statusCode = statusCode,
            this.message = message,
            this.data = null,
            this.errros = errros,
            this.message = false;

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}