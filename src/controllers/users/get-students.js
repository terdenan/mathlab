const ObjectId = require('mongodb').ObjectID;

const DEFAULT_COUNT = 200;
const DEFAULT_LAST_ID = '000000000000000000000000';

module.exports = async (req, res) => {
    const last_id = ObjectId.isValid(req.query.lastID) ? req.query.lastID : DEFAULT_LAST_ID;
    const count = parseInt(req.query.count) || DEFAULT_COUNT;
    const students = await req.userModel.getMany(
        {$and: [ {_id: {$gt: ObjectId(last_id)} }, {priority: 0} ]},
        {},
        count
    );
    res.send(students);
}