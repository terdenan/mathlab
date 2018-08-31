'use strict';

const DbModel = require('./common/dbModel');
const ApplicationError = require('libs/application-error');

class CallbackRequests extends DbModel {
    constructor() {
        super('callback-request');
    }

    async create(callbackRequest) {
        const isDataValid = callbackRequest
            && Object.prototype.hasOwnProperty.call(callbackRequest, 'name')
            && typeof(callbackRequest.name) === 'string'
            && Object.prototype.hasOwnProperty.call(callbackRequest, 'phone_number')
            && typeof(callbackRequest.phone_number) === 'string';

        if (isDataValid) {
            await this._insert(callbackRequest);
            return callbackRequest;
        }
        
        throw new ApplicationError('callbackRequest data is invalid', 400);
    }

}

module.exports = CallbackRequests;