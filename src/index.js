const http = require('http');
const https = require('https');
const fs = require('fs');
const config = require('config');
const express = require('express');
const subdomain = require('express-subdomain');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');
const marked = require('marked');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const helmet = require('helmet');
const compression = require('compression');
const flash = require('connect-flash');
const socketIO = require('socket.io');
const telegramBot = require('libs/telegram-bot');

const ApplicationError = require('libs/application-error');
const isProduction = process.env.NODE_ENV === 'production';
const NewsModel = require('./models/news');
const UserModel = require('./models/users');
const CourseModel = require('./models/courses');
const BidModel = require('./models/bids');
const MessageModel = require('./models/messages');
const CallbackModel = require('./models/callback-requests');
const sockioModel = require('./models/sockio');


mongoose.connect(config.mongo.uri, {useNewUrlParser: true}, (err) => {
    if (err) {
        console.log(err);
        throw new ApplicationError('Can\'t connect to MongoDB');
    }
});
mongoose.Promise = global.Promise;


const app = express();
const httpServer = http.createServer(app);
const io = sockioModel(httpServer);

const mainRouter = require('./routers/main');
const apiRouter = require('./routers/api');
const adminRouter = require('./routers/admin');
const teacherRouter = require('./routers/teacher');

app.set('view engine', 'jade');
app.set('views', 'src/views');
app.use((req, res, next) => {
    req.newsModel = new NewsModel();
    req.userModel = new UserModel();
    req.courseModel = new CourseModel();
    req.bidModel = new BidModel();
    req.messageModel = new MessageModel();
    req.callbackModel = new CallbackModel();
    res.io = io;
    req.telegramBot = telegramBot;
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    secret: config.mongoStore.secret,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    },
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => {
    done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const userModel = new UserModel();
        const user = await userModel.getBy({_id: id});
        done(null, user)
    } catch (e) {
        throw new ApplicationError(err, 500);
    }
});
app.use(compression());
app.use(helmet());
app.use(flash());
app.use(cookieParser());
app.locals.moment = moment;
app.locals.marked = marked;

app.use('', mainRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);
app.use('/teacher', teacherRouter);


httpServer.listen(config.server.httpPort, () => {
    console.log('Running');
});

module.exports = app;