class ExpressError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        this.message = message;
    }
}

module.exports = ExpressError;