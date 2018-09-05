'use strict';

const DbModel = require('./common/dbModel');
const ApplicationError = require('libs/application-error');

class CallbackRequests extends DbModel {
    constructor() {
        super('callback-request');
    }

    async create(callbackRequest) {
        await this._insert(callbackRequest);
        return callbackRequest;
    }

}

module.exports = CallbackRequests;