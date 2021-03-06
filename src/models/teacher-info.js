const moment = require('moment');
const path = require('path');

const ApplicationError = require('libs/application-error');
const DbModel = require('./common/dbModel');

const sitemapPath = path.join(process.cwd(), 'static', 'public', 'sitemap.xml');

class TeacherInfo extends DbModel {
    constructor() {
        super('teacher-info');
    }

    async create(data) {
        const isDataValid = data && true;

        if (isDataValid) {
            const savedData = await this._insert(data);

            return savedData;
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
            const res = await this._MongooseModel
                .findOneAndUpdate(
                    cond, 
                    { $push: { certificates: { $each: certificates } } },
                    { new: true },
                );

            return res;
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
                .populate('teacher');

            return res;
        } catch(e) {
            console.log(e)
            throw new ApplicationError('Error occured while getAll teacherInfo', 500);
        }
    }

}

module.exports = TeacherInfo;
