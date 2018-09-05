const ObjectId = require('mongodb').ObjectID;

const DEFAULT_COUNT = 15;
const DEFAULT_LAST_ID = '000000000000000000000000';

module.exports = async (req, res) => {
    const course_id = ObjectId(req.query.courseId);
    const last_id = req.query.lastId || DEFAULT_LAST_ID;
    const count = parseInt(req.query.count) || DEFAULT_COUNT;

    const messages = await req.messageModel.getMany(
        { $and: [ { _course_id: course_id }, { _id: { $lt: ObjectId(last_id) } } ] },
        {date: -1},
        count
    );
    res.send(messages);
}