const mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;
const sendmail = require('libs/sendmail');
const jade = require('jade');
const config = require('config');

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

    const pastDatetime = new Date(Date.now() - 1000 * 60 * 10);
    const previousMessages = await req.messageModel.getMany(
        { $and: [ {_course_id: courseId}, {_sender_id: req.user._id}, {date: {$gt: pastDatetime} } ] });
    const emailContext = {
        message: newMessage.message,
        courseId: req.body.courseId,
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
    let interlocutor;
    if (req.user.priority == 0) {
        interlocutor = await req.userModel.getBy({_id: course._teacher_id});

        responseBody.avatarUrl = course.studentAvatarUrl;
        responseBody.sender = course.student;
        emailContext.fullname = course.teacher;
        emailContext.sender = course.student;
        emailContext.link = `https://mathlab.kz/teacher/course/${req.body.courseId}`
    } else {
        interlocutor = await req.userModel.getBy({_id: course._student_id});

        responseBody.avatarUrl = course.teacherAvatarUrl;
        responseBody.sender = course.teacher;
        emailContext.fullname = course.student;
        emailContext.sender = course.teacher;
        emailContext.link = `https://mathlab.kz/course/${req.body.courseId}`
    }

    if (previousMessages.length == 0) {
        const emailBody = jade.renderFile('src/views/main/mail-bodies/new-message.jade', emailContext);
        const emailOptions = {
            user: config.gmail.login,
            pass: config.gmail.password,
            to:   interlocutor.email,
            subject: 'Образовательный сервис MathLab | Новое сообщение',
            html:   emailBody,
        };
        await sendmail(emailOptions);
    }
    
    res.render('./main/includes/message', responseBody);
}