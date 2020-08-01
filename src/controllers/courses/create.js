const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');

module.exports = async (req, res) => {
    const studentId = ObjectId(req.body.studentId);
    const teacherId = ObjectId(req.body.teacherId);
    const user = await req.userModel.getBy({_id: studentId});
    const teacher = await req.userModel.getBy({_id: teacherId});
    const newCourse = {
        subject: req.body.subject,
        student: req.body.student,
        _student_id: studentId,
        teacher: req.body.teacher,
        _teacher_id: teacherId,
        days: req.body.days,
        time: req.body.time,
        startingDate: Date.now(),
        endingDate: moment( Date.now() ).add(1, 'months').toDate(),
        studentAvatarUrl: user.avatarUrl,
        teacherAvatarUrl: teacher.avatarUrl
    }
    await req.courseModel.create(newCourse);
    res.status(200);
    res.send('success');
}
