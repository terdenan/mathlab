'use strict';

const DbModel = require('./common/dbModel');
const ApplicationError = require('libs/application-error');

class Bids extends DbModel {
    constructor() {
        super('bid');
    }

    async create(bid) {
        const isDataValid = bid
            && Object.prototype.hasOwnProperty.call(bid, 'studentId')
            && Object.prototype.hasOwnProperty.call(bid, 'subject')
            && Object.prototype.hasOwnProperty.call(bid, 'phone')

        if (isDataValid) {
            await this._insert(bid);
            return bid;
        }
        
        throw new ApplicationError('News data is invalid', 400);
    }

    async update(cond, set) {
        await this._update(cond, set);
    }

}

module.exports = Bids;