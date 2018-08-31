const ObjectId = require('mongodb').ObjectID;

module.exports = async (req, res) => {
    const fields = req.body;
    await req.userModel.update(req.user._id, fields);
    if (fields.fullname) {
        if (req.user.priority == 0) {
            await req.courseModel.updateMany(
                {_student_id: req.user._id},
                { student: fields.fullname}
            );
        }
        else {
            await req.courseModel.updateMany(
                {_teacher_id: req.user._id},
                { teacher: fields.fullname}
            );
        }
    }
    res.send('success');
}