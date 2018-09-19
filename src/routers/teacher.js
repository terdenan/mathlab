const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const serveStatic = require('serve-static');
const passport = require('../models/passport');
const ObjectId = require('mongodb').ObjectID;

router.use(serveStatic('static/public'));

router.get('/sign-in', passport.checkIfAuthed(), asyncHandler(async (req, res) => {
    res.render('teacher/sign-in', {message: req.flash('error')});
}));

router.get('/cabinet', passport.auth('teacher'), asyncHandler(async (req, res) => {
    const courses = await req.courseModel.getMany({$and: [ {_teacher_id: req.user._id}, {endingDate: {$gt: Date.now()}} ]}, {}, 100);
    const context = Object.assign({
        courses: courses,
        currentDate: Date.now()
    }, req.user);
    res.render('teacher/cabinet', context);
}));

router.get('/course/:id', passport.auth('teacher'), asyncHandler(async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.render('teacher/404');
        return;
    }
    const courseId = ObjectId(req.params.id);
    const course = await req.courseModel.getBy({$and: [ {_id: courseId}, {_teacher_id: req.user._id} ]});
    if (!course) {
        res.status(403);
        res.render('teacher/permission-denied');
    }
    await req.messageModel.updateMany(
        { $and: [ { _course_id: courseId }, {_sender_id: course._student_id}, { read_state: false } ] },
        { read_state: true }
    );
    const messages = await req.messageModel.getMany(
        { _course_id: courseId },
        {date: -1},
        15
    );
    const context = Object.assign({
        courseInfo: course,
        messages: messages.reverse()
    }, req.user);
    (res.io.in(req.params.id)).emit('markReaded');
    res.render('teacher/course', context);
}));

router.get('/teachers', passport.auth('teacher'), asyncHandler(async (req, res) => {
    res.render('teacher/teachers', req.user);
}));

router.get('/settings', passport.auth('teacher'), asyncHandler(async (req, res) => {
    res.render('teacher/settings', req.user);
}));

router.get('/log-out', (req, res) => {
    req.logout();
    res.redirect('/sign-in');
});

module.exports = router;