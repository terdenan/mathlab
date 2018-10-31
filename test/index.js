process.env.NODE_ENV = 'test';

const NewsModel = require('../src/models/news');
const UserModel = require('../src/models/users');
const CourseModel = require('../src/models/courses');
const BidModel = require('../src/models/bids');
const MessageModel = require('../src/models/messages');
const CallbackModel = require('../src/models/callback-requests');
const TeacherInfoModel = require('../src/models/teacher-info');

const News = new NewsModel();
const User = new UserModel();
const Course = new CourseModel();
const Bid = new BidModel();
const Message = new MessageModel();
const Callback = new CallbackModel();
const TeacherInfo = new TeacherInfoModel();

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/index');
const should = chai.should();

chai.use(chaiHttp);
const agent = chai.request.agent(server)

const HASHED_PASSWORD = '$2b$10$/9ji326wT2lq3Ol.E/Cf9ex3KVGWTwqm9WcqNtttDy/e4OBY0eqQW';
const base_user = {
    fullname: 'Test',
    password: HASHED_PASSWORD,
    phone: '8(111)111-11-11',
    sex: 1,
};

describe('Mathlab tests', () => {
    before(async () => {
        const db = require('./populate_db');
        await db();
    });

    describe('Routes', () => {
        require('./routes_tests.js');
    });

    describe('API', () => {
        require('./api_tests.js');
    });

    after(async () => {
        await User.deleteMany();
        await Course.deleteMany();
        await TeacherInfo.deleteMany();
    });
});