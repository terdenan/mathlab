const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/index');
const should = chai.should();

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

chai.use(chaiHttp);

it('/', async () => {
    const res = await chai.request(server)
                .get('/');
    res.should.have.status(200);
    res.res.text.should.have
        .string('<title>Портал  дистанционного и полудистанционного образования - MathLab.kz</title>');
});

it('/sign-in', async () => {
    const res = await chai.request(server)
                .get('/sign-in');
    res.should.have.status(200);
    res.res.text.should.have
        .string('<title>Авторизация</title>');
});

it('/sign-up', async () => {
    const res = await chai.request(server)
                .get('/sign-up');
    res.should.have.status(200);
    res.res.text.should.have
        .string('<title>Регистрация</title>');
});

it('/recover', async () => {
    const res = await chai.request(server)
                .get('/recover');
    res.should.have.status(200);
    res.res.text.should.have
        .string('<title>Восстановление забытого пароля</title>');
});

it('/prices', async () => {
    const res = await chai.request(server)
                .get('/prices');
    res.should.have.status(200);
    res.res.text.should.have
        .string('<title>Расценки и способы оплаты</title>');
});

it('/how-to-use', async () => {
    const res = await chai.request(server)
                .get('/how-to-use');
    res.should.have.status(200);
    res.res.text.should.have
        .string('<title>Как проходит обучение</title>');
});

it('/how-to-use', async () => {
    const res = await chai.request(server)
                .get('/how-to-use');
    res.should.have.status(200);
    res.res.text.should.have
        .string('<title>Как проходит обучение</title>');
});

it('/cabinet', async () => {
    const agent = chai.request.agent(server);
    const res = await agent
        .post('/login')
        .send({username: 'student1@mail.ru', password: 'secret'});
    res.should.have.status(200);
    res.res.text.should.have
        .string('<title>Личный кабинет</title>');
    res.req.should.have.cookie('connect.sid');
    res.req.path.should.be.equal('/cabinet');
    agent.close();
});

it('/teacher/cabinet', async () => {
    const agent = chai.request.agent(server);
    const res = await agent
        .post('/login')
        .send({username: 'teacher@mail.ru', password: 'secret'});
    res.should.have.status(200);
    res.res.text.should.have
        .string('<title>Личный кабинет</title>');
    res.req.should.have.cookie('connect.sid');
    res.req.path.should.be.equal('/teacher/cabinet');
    agent.close();
});

it('/course/:id', async() => {
    const agent = chai.request.agent(server);
    const res = await agent
        .post('/login')
        .send({username: 'student1@mail.ru', password: 'secret'});
    const student = await User.getBy({email: 'student1@mail.ru'});
    const course = await Course.getBy({_student_id: student._id});
    const res1 = await agent
        .get(`/course/${course._id}`);
    res1.should.have.status(200);
    res1.res.text.should.have
        .string(`<title>${course.subject} (${course.teacher})</title>`);
    agent.close();
});