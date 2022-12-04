// const { ensureIndexes } = require("../models/Bootcamp")

class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
    }
}

module.exports = ErrorResponse