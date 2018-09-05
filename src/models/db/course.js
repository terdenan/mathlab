const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Course = mongoose.model('Course', {
    subject: String,
    student: String,
    _student_id: Schema.Types.ObjectId,
    teacher: String,
    _teacher_id: Schema.Types.ObjectId,
    studentAvatarUrl: String,
    teacherAvatarUrl: String,
    days: String,
    time: String,
    comment: String,
    startingDate: Date,
    endingDate: Date
});

module.exports = Course;