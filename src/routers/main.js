const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const serveStatic = require('serve-static');
const passport = require('../models/passport');
const ObjectId = require('mongodb').ObjectID;
const moment = require('moment');


router.use(serveStatic('static/public'));

router.get('/', asyncHandler(async (req, res) => {
    const recentNews = await req.newsModel.getRecent(3);
    const teachers = await req.teacherInfo.getAll();
    res.render('main/index', {recentNews, teachers});
}));

router.get('/sign-in', passport.checkIfAuthed(), asyncHandler(async (req, res) => {
    res.render('main/sign-in', {message: req.flash('error')});
}));

router.get('/sign-up', passport.checkIfAuthed(), asyncHandler(async (req, res) => {
    res.render('main/sign-up');
}));

router.get('/recover', passport.checkIfAuthed(), asyncHandler(async (req, res) => {
    res.render('main/forgotten-password');
}));

router.get('/prices', asyncHandler(async (req, res) => {
    res.render('main/prices');
}));

router.get('/how-to-use', asyncHandler(async (req, res) => {
    res.render('main/how-to-use');
}));

router.get('/teacher/:id', asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.render('main/404')
        return;
    }
    const teacher = await req.userModel.getBy({_id: ObjectId(id)});
    if (!teacher) {
        res.render('main/404')
        return;
    }
    const profileInfo = await req.teacherInfo.getBy({_teacher_id: ObjectId(id)});
    res.render('main/teacher', {teacher, profileInfo});
}));

router.get('/news', asyncHandler(async (req, res) => {
    const news = await req.newsModel.getMany({}, {date: -1}, 100);
    res.render('main/news', {news})
}));

router.get('/teachers', passport.auth(), asyncHandler(async (req, res) => {
    const teachers = await req.teacherInfo.getAll();
    res.render('main/teachers', req.user);
}));

router.get('/request', passport.auth(), asyncHandler(async (req, res) => {
    res.render('main/request', req.user);
}));

router.get('/settings', passport.auth(), asyncHandler(async (req, res) => {
    res.render('main/settings', req.user);
}));

router.get('/log-out', (req, res) => {
    req.logout();
    res.redirect('/sign-in');
});

router.get('/news/:title', asyncHandler(async (req, res) => {
    const news = await req.newsModel.getBy({title: req.params.title});
    if (!news) {
        res.render('main/404')
        return;
    }
    const suggestedNews = await req.newsModel.getMany(
        {title: {"$ne": req.params.title}},
        { date: -1 },
        3
    );
    res.render('main/single-news', {data: news, news: suggestedNews})
}));

router.post('/login',  passport.authenticate('main', {
    failureRedirect: '/sign-in',
    failureFlash: 'fail'
}), (req, res) => {
    const priority = req.user.priority;
    if (priority == 0) {
        res.redirect('/cabinet');
    }
    else if (priority == 1) {
        res.redirect('/teacher/cabinet');
    }
});

router.get('/change-password', asyncHandler(async (req, res) => {
    const code = req.query.code;
    const user = await req.userModel.getBy({changePasswordCode: code});
    const now = moment(Date.now()).format();
    const code_valid_date = moment(user.changePasswordDuration).format();
    if (!user || now > code_valid_date) {
        res.render('main/change-password', { valid: false });
        return;
    }
    res.render('main/change-password', { valid: true });
}));

router.get('/email-confirm', asyncHandler(async (req, res) => {
    const code = req.query.code;
    const user = await req.userModel.getBy({emailConfirmCode: code});
    const now = moment(Date.now()).format();
    const code_valid_date = moment(user.emailConfirmDuration).format();
    if (!user || now > code_valid_date) {
        res.render('main/email-confirm', { valid: false });
        return;
    }
    await req.userModel.update(user._id, {confirmed: true});
    res.render('main/email-confirm', { valid: true });
}));

router.get('/cabinet', passport.auth(), asyncHandler(async (req, res) => {
    const courses = await req.courseModel.getMany({_student_id: req.user._id});
    const context = Object.assign({
        courses: courses,
        currentDate: Date.now()
    }, req.user);
    res.render('main/cabinet', context);
}));

router.get('/course/:id', passport.auth(), asyncHandler(async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
        res.render('main/404');
        return;
    }
    const courseId = ObjectId(req.params.id);
    const course = await req.courseModel.getBy({$and: [ { _id: courseId}, {_student_id: req.user._id} ]});
    if (!course) {
        res.status(403);
        res.render('main/permission-denied');
        return;
    }
    await req.messageModel.updateMany(
        { $and: [ { _course_id: courseId }, {_sender_id: course._teacher_id}, { read_state: false } ] },
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
    res.render('main/course', context);
}));

module.exports = router;