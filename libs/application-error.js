'use strict';

class ApplicationError extends Error {
    constructor(message, status = 500) {
        super(message);
        this._status = status;
    }

    get status() {
        return this._status;
    }
}

module.exports = ApplicationError;