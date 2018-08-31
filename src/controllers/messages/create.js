const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

module.exports = async (req, res) => {
    const courseId = ObjectId(req.body.courseId)
    const newMessage = {
        _id: new mongoose.Types.ObjectId,
        _course_id: courseId,
        _sender_id: req.user._id,
        message: req.body.message,
        read_state: false,
        date: Date.now(),
    };
    if (req.file) {
        newMessage.attachment = [{
            originalName: req.file.originalname,
            url: '/attachments/' + req.file.filename,
            size: (req.file.size / 1024).toFixed(2)
        }];
    }
    await req.messageModel.create(newMessage);
    const course = await req.courseModel.getBy({_id: courseId});
    const responseBody = {
        _id: newMessage._id,
        _course_id: newMessage._course_id,
        _sender_id: newMessage._sender_id,
        _user_id: req.user._id,
        message: newMessage.message,
        read_state: newMessage.read_state,
        attachment: newMessage.attachment,
        date: newMessage.date,
    };
    if (req.user.priority == 0) {
        responseBody.avatarUrl = course.studentAvatarUrl;
        responseBody.sender = course.student;
    } else {
        responseBody.avatarUrl = course.teacherAvatarUrl;
        responseBody.sender = course.teacher;
    }
    res.render('./main/includes/message', responseBody);
}