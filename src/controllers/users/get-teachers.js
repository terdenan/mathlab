const ObjectId = require('mongodb').ObjectID;

const DEFAULT_COUNT = 10;
const DEFAULT_LAST_ID = '000000000000000000000000';

module.exports = async (req, res) => {
    const last_id = req.query.lastID || DEFAULT_LAST_ID;
    const count = parseInt(req.query.count) || DEFAULT_COUNT;

    const teachers = await req.userModel.getMany(
        {$and: [ {_id: {$gt: ObjectId(last_id)} }, {priority: 1} ]},
        {},
        count
    );
    res.send(teachers);
}