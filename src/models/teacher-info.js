'use strict';

const DbModel = require('./common/dbModel');
const ApplicationError = require('libs/application-error');

class TeacherInfo extends DbModel {
    constructor() {
        super('teacher-info');
    }

    async create(data) {
        const isDataValid = data
            && true;

        if (isDataValid) {
            await this._insert(data);
            return data;
        }
        
        throw new ApplicationError('News data is invalid', 400);
    }

}

module.exports = TeacherInfo;