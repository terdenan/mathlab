'use strict';

const DbModel = require('./common/dbModel');
const ApplicationError = require('libs/application-error');

class Users extends DbModel {
    constructor() {
        super('user');
    }

    async create(user) {
        const isDataValid = user
            && Object.prototype.hasOwnProperty.call(user, 'fullname')
            && typeof(user.fullname) === 'string'
            && Object.prototype.hasOwnProperty.call(user, 'email')
            && typeof(user.email) === 'string'
            && Object.prototype.hasOwnProperty.call(user, 'password')
            && typeof(user.password) === 'string'
            && Object.prototype.hasOwnProperty.call(user, 'phone')
            && typeof(user.phone) === 'string'
            && Object.prototype.hasOwnProperty.call(user, 'sex')
            && typeof(user.sex) === 'number';

        if (isDataValid) {
            await this._insert(user);
            return user;
        }

        throw new ApplicationError('User data is invalid', 400);
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