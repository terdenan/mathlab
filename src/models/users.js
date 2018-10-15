'use strict';

const DbModel = require('./common/dbModel');
const ApplicationError = require('libs/application-error');

class Users extends DbModel {
    constructor() {
        super('user');
    }

    async create(user) {
        const doc = await this._insert(user);
        return doc;
    }

    async update(user_id, fields) {
        try {
            await this._update({_id: user_id}, fields);
        } catch (e) {
            console.log(e);
            throw new ApplicationError('Error occured while updating user', 500);
        }
    }

}

module.exports = Users;