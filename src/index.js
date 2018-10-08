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
const isProduction = process.env.NODE_ENV === 'production';

const logger = require('libs/logger');
const ApplicationError = require('libs/application-error');
const NewsModel = require('./models/news');
const UserModel = require('./models/users');
const CourseModel = require('./models/courses');
const BidModel = require('./models/bids');
const MessageModel = require('./models/messages');
const CallbackModel = require('./models/callback-requests');
const TeacherInfo = require('./models/teacher-info');
const sockioModel = require('./models/sockio');


mongoose.connect(config.mongo.uri, {useNewUrlParser: true}, (err) => {
    if (err) {
        console.log(err);
        throw new ApplicationError('Can\'t connect to MongoDB');
    }
});
mongoose.Promise = global.Promise;


const app = express();
let httpServer = undefined;
let httpsServer = undefined;
let io = undefined;
if (isProduction) {
    const protocolSecrets = {
        key: fs.readFileSync(config.sslcert.key),
        cert: fs.readFileSync(config.sslcert.cert),
    };
    
    httpsServer = https.createServer(protocolSecrets, app);
    httpServer = http
        .createServer((req, res) => {
            res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
            res.end();
        });
    io = sockioModel(httpsServer);
}
else {
    httpServer = http
        .createServer(app);
    io = sockioModel(httpServer);
}

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
    req.teacherInfo = new TeacherInfo();
    res.io = io;
    req.telegramBot = telegramBot;
    next();
});
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({limit: '50mb'}));
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


app.use((err, req, res, next) => {
    if (isProduction) {
        logger.log({
            level: 'error',
            user: req.user ? req.user.email : 'unauthorized user',
            url: `${req.method} ${req.url}`,
            message: err,
        });
    }
    else {
        console.log(err);
        if (err instanceof ApplicationError) {
            res.status(err.status);
            res.send(err.messages)
            return;
        }
    }
    res.status(500);
    res.send('There is an error occured on server. Try later.');
});

httpServer.listen(config.server.httpPort, () => {
    console.log('Running http server');
});

if (isProduction) {
    httpsServer.listen(config.server.httpsPort, () => {
        console.log('Running https server');
    });
}

module.exports = app;