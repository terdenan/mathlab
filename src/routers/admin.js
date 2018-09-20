const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const serveStatic = require('serve-static');
const passport = require('../models/passport');
const ObjectId = require('mongodb').ObjectID;

router.use(serveStatic('static/admin'));

router.get('/sign-in', passport.checkIfAuthed(), asyncHandler(async (req, res) => {
    res.render('admin/sign-in', {message: req.flash('error')});
}));

router.post('/login',  passport.authenticate('admin', { 
    successRedirect: './',
    failureRedirect: '/admin/sign-in',
    failureFlash: 'fail'
}));

router.get('/', passport.auth('admin'), asyncHandler(async (req, res) => {
    res.render('admin/index');
}));

router.get('/bids', passport.auth('admin'), asyncHandler(async (req, res) => {
    res.render('admin/bids');
}));

router.get('/teachers', passport.auth('admin'), asyncHandler(async (req, res) => {
    res.render('admin/teachers');
}));

router.get('/teacher/:id', passport.auth('admin'), asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.send(`ObejctId '${id}' is not valid`);
        return;
    }
    const teacher = await req.userModel.getBy({_id: ObjectId(id)});
    if (!teacher) {
        res.send(`There is no teacher mathcing id '${id}'`);
        return;
    }
    res.render('admin/edit-public-page', {teacher});
}));

router.get('/news', passport.auth('admin'), asyncHandler(async (req, res) => {
    res.render('admin/news');
}));

router.get('/students', passport.auth('admin'), asyncHandler(async (req, res) => {
    res.render('admin/students');
}));

router.get('/courses', passport.auth('admin'), asyncHandler(async (req, res) => {
    res.render('admin/courses');
}));

router.get('/teacher-form', passport.auth('admin'), asyncHandler(async (req, res) => {
    res.render('admin/teacher-form');
}));

router.get('/log-out', (req, res) => {
    req.logout();
    res.redirect('/admin/sign-in');
});

module.exports = router;