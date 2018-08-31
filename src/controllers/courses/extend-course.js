const moment = require('moment');
const ObjectId = require('mongodb').ObjectID;

module.exports = async (req, res) => {
    const course_id = ObjectId(req.body.courseId);
    const course = await req.courseModel.getBy({_id: course_id});
    const endingDate = moment(course.endingDate).add(1, 'months').toDate();
    await req.courseModel.update(course_id, {endingDate: endingDate});
    res.status(200);
    res.send('success');
}