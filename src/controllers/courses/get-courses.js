const ObjectId = require('mongodb').ObjectID;

const DEFAULT_COUNT = 100;
const DEFAULT_LAST_ID = '000000000000000000000000';

module.exports = async (req, res) => {
    const last_id = req.query.lastID || DEFAULT_LAST_ID;
    const count = parseInt(req.query.count) || DEFAULT_COUNT;

    const courses = await req.courseModel.getMany(
        {_id: {$gt: ObjectId(last_id)} },
        {},
        count
    );
    res.send(courses);
}