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

    async insertCertificates(cond, certificates) {
        try {
            await this._MongooseModel
                .update(
                    cond, 
                    { $push: { certificates: { $each: certificates } } },
                );
        } catch (e) {
            console.log(e);
            throw new ApplicationError('Error occured while inserting certificates', 500);
        }
    }

    async deleteCertificate(cond, certId) {
        try {
            const res = await this._MongooseModel
                .findOneAndUpdate(
                    cond, 
                    { $pull: { 'certificates': { _id: certId } } },
                );
            return res;
        } catch (e) {
            console.log(e);
            throw new ApplicationError('Error occured while deleting certificate', 500);
        }
    }

    async findOneAndUpdate(cond, update, opt) {
        try {
            const res = await this._MongooseModel
                .findOneAndUpdate(
                    cond, 
                    update,
                    opt,
                );
            if (!res) {
                return await this.getBy(cond);
            }
            
            return res;
        } catch (e) {
            console.log(e);
            throw new ApplicationError('Error occured while findOneAndUpdate', 500);
        }
    }

    async getAll() {
        try {
            const res = await this._MongooseModel
                .find()
                .populate('_teacher_id');

            return res;
        } catch(e) {
            console.log(e)
            throw new ApplicationError('Error occured while getAll teacherInfo', 500);
        }
    }

}

module.exports = TeacherInfo;