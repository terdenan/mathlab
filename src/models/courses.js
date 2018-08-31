'use strict';

const DbModel = require('./common/dbModel');
const ApplicationError = require('libs/application-error');

class Courses extends DbModel {
    constructor() {
        super('course');
    }

    async create(course) {
        const isDataValid = course
            && Object.prototype.hasOwnProperty.call(course, '_student_id')
            && Object.prototype.hasOwnProperty.call(course, '_teacher_id');

        if (isDataValid) {
            await this._insert(course);
            return course;
        }

        throw new ApplicationError('Course data is invalid', 400);
    }

    async update(course_id, fields) {
        try {
            await this._update({_id: course_id}, fields);
        } catch (e) {
            console.log(e);
            throw new ApplicationError('Error occured while updating course', 500);
        }
    }

    async updateMany(cond, fields) {
        try {
            await this._update(cond, fields, {multi: true });
        } catch (e) {
            console.log(e);
            throw new ApplicationError('Error occured while updating courses', 500);
        }
    }

}

module.exports = Courses;