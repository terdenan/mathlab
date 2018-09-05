const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('./users');
const bcrypt = require('bcrypt');

const userModel = new UserModel();

passport.use('main', new LocalStrategy(
    async function(username, password, done) {
        try {
            const user = await userModel.getBy({email: username});
            if (!user) {
                return done(null, false);
            }
            const match = await bcrypt.compare(password, user.password);
            if (match && user.priority <= 1) {
                return done(null, user);
            }

            return done(null, false);
        } catch (e) {
            done(e, false);
        }
    }
));

passport.use('admin', new LocalStrategy(
    async function(username, password, done) {
        try {
            const user = await userModel.getBy({email: username});
            if (!user) {
                return done(null, false);
            }
            const match = await bcrypt.compare(password, user.password);
            if (match && user.priority == 2) {
                return done(null, user);
            }

            return done(null, false);
        } catch (e) {
            done(e, false);
        }
    }
));

passport.auth = function(router='main') {
    const levels = {
        'main':    [[0], '/sign-in'],
        'teacher': [[1], '/sign-in'],
        'user':    [[0,1], '/sign-in'],
        'admin':   [[2], '/admin/sign-in'],
    };
    const [priority, redirect_url] = levels[router]

    return function (req, res, next) {
        if (req.isAuthenticated() && priority.includes(req.user.priority)) {
            return next();
        }
        res.redirect(redirect_url);
    }
}

passport.checkIfAuthed = function() {
    const levels = {
        0: '/cabinet',
        1: '/teacher/cabinet',
        2: '/admin'
    };

    return function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        const priority = req.user.priority;
        res.redirect(levels[priority]);
    }
}

module.exports = passport;