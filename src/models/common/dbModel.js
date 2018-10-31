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

    async get(id) {
        const data = await this._MongooseModel
            .findOne({id})
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

    async getMany(cond={}, sort={}, count=10) {
        const data = await this._MongooseModel
            .find(cond)
            .lean()
            .sort(sort)
            .limit(count)
            .exec();
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
        await this._MongooseModel
            .create(item);
        const count = (await this.getMany()).length;
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