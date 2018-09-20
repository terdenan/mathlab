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

    async update(cond, fields) {
        try {
            await this._update(cond, fields);
        } catch (e) {
            console.log(e);
            throw new ApplicationError('Error occured while updating teacherInfo', 500);
        }
    }

}

module.exports = TeacherInfo;