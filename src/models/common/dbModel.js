'use strict';

class DbModel  {
    constructor(dbModelName) {
        const MongooseModel = require(`../db/${dbModelName}`);

        this._MongooseModel = MongooseModel;
    }

    async getAll() {
        const data = await this._MongooseModel
            .find()
            .lean()
            .exec();

        return data;
    }

    async get(_id) {
        const data = await this._MongooseModel
            .findOne({_id})
            .lean()
            .exec();
        return data;
    }

    async getBy(cond) {
        const data = await this._MongooseModel
            .findOne(cond)
            .lean()
            .exec();

        return data;
    }

    async getWithPopulationBy(cond, populationFields) {
        let request = this._MongooseModel.findOne(cond);

        for (const field of populationFields) {
            request = request.populate(field);
        }

        const data = await request
            .lean()
            .exec();

        return data;
    }

    async getMany(cond={}, sort={}, count=10) {
        const data = await this._MongooseModel
            .find(cond)
            .lean()
            .sort(sort)
            .limit(count)
            .exec();

        return data;
    }

    async new_getMany(cond = {}, sort, limit) {
        let query = this._MongooseModel
            .find(cond)
            .lean();

        if (sort) {
            query = query.sort(sort);
        }

        if (limit) {
            query = query.limit(limit);
        }

        const data = await query.exec();

        return data;
    }

    async getRecent(count, cond) {
        const data = await this._MongooseModel
            .find(cond)
            .lean()
            .sort({'date': -1})
            .limit(count)
            .exec();

        return data;
    }

    async deleteMany(cond) {
        await this._MongooseModel
            .deleteMany(cond);
    }

    async _insert(item) {
        const savedItem = await this._MongooseModel
            .create(item);

        return savedItem;
    }

    async _remove(_id) {
        await this._MongooseModel
            .remove({_id});
    }

    async _update(cond, set, multi={multi: false}) {
        await this._MongooseModel
            .update(cond, {$set: set}, multi);
    }
}

module.exports = DbModel;