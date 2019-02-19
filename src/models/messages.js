'use strict';

const DbModel = require('./common/dbModel');
const ApplicationError = require('libs/application-error');

class Messages extends DbModel {
    constructor() {
        super('message');
    }

    async create(message) {
        const isDataValid = message
            && true;

        if (isDataValid) {
            await this._insert(message);
            return message;
        }

        throw new ApplicationError('Course data is invalid', 400);
    }

    async update(message_id, fields) {
        try {
            await this._update({_id: message_id}, fields);
        } catch (e) {
            console.log(e);
            throw new ApplicationError('Error occured while updating message', 500);
        }
    }

    async updateMany(cond, fields) {
        try {
            await this._update(cond, fields, {multi: true });
        } catch (e) {
            console.log(e);
            throw new ApplicationError('Error occured while updating messages', 500);
        }
    }

    async isSender(userId, messageId) {
        try {
            const messageSenderId = await this.get(messageId);
            return userId === messageSenderId;
        } catch (e) {
            console.log(e);
            throw new ApplicationError('Error occured while performing isSender method', 500);
        }
    }

}

module.exports = Messages;