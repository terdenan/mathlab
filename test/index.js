process.env.NODE_ENV = 'test';

const NewsModel = require('../src/models/news');
const UserModel = require('../src/models/users');
const CourseModel = require('../src/models/courses');
const BidModel = require('../src/models/bids');
const MessageModel = require('../src/models/messages');
const CallbackModel = require('../src/models/callback-requests');

const News = new NewsModel();
const User = new UserModel();
const Course = new CourseModel();
const Bid = new BidModel();
const Message = new MessageModel();
const Callback = new CallbackModel();

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../src/index');
const should = chai.should();

const HASHED_PASSWORD = '$2b$10$/9ji326wT2lq3Ol.E/Cf9ex3KVGWTwqm9WcqNtttDy/e4OBY0eqQW';

chai.use(chaiHttp);

describe('/api', () => {

    const base_user = {
        fullname: 'Test',
        password: HASHED_PASSWORD,
        phone: '8(111)111-11-11',
        sex: 1,
    };

    describe('/user POST', () => {
        before(async () => {
            const student = Object.assign({email: 'student@mail.ru', priority: 0}, base_user);
            await User.create(student);
        });

        after(async () => {
            await User.deleteMany();
        });

        it('it should not POST a user with duplicate email', async () => {
            const newUser = {
                fullname: 'Test',
                email: 'student@mail.ru',
                password: 'secret',
                phone: '8(111)111-11-11',
                sex: 1,
            }
            const res = await chai.request(server)
                .post('/api/user')
                .send(newUser);
            res.should.have.status(400);
        });

        it('it should not POST a user without required fields', async () => {
            const newUser = {
                fullname: 'Test',
                email: 'student@mail.ru',
                phone: '8(111)111-11-11',
                sex: 1,
            }
            const res = await chai.request(server)
                .post('/api/user')
                .send(newUser);
            res.should.have.status(400);
        });

        it('it should not POST a user with invalid fields', async () => {
            const newUser = {
                fullname: 'Test',
                email: 'student@mail.ru',
                password: 'secret',
                phone: 81234567890,
                sex: 1,
            }
            const res = await chai.request(server)
                .post('/api/user')
                .send(newUser);
            res.should.have.status(400);
        });

        it('it should POST a user', async () => {
            const newUser = {
                fullname: 'Test',
                email: 'test@mail.ru',
                password: 'secret',
                phone: '8(111)111-11-11',
                sex: 1,
            }
            const res = await chai.request(server)
                .post('/api/user')
                .send(newUser);
            res.body.should.be.a('object');
            res.body.should.have.property('confirmed').equal(false);
            res.body.should.have.property('emailConfirmCode');
            res.body.should.have.property('emailConfirmDuration');
            res.body.should.have.property('lastEmailDate');
        })
    });

    describe('/profileInfo PUT', () => {
        const agent_student = chai.request.agent(server);
        const agent_teacher = chai.request.agent(server);

        before(async () => {
            const student = Object.assign({email: 'student@mail.ru', priority: 0, grade: '10'}, base_user);
            const teacher = Object.assign({email: 'teacher@mail.ru', priority: 1}, base_user);
            await User.create(student);
            await User.create(teacher);

            const res1 = await agent_student
                .post('/login')
                .send({username: 'student@mail.ru', password: 'secret'});
            res.req.path.should.be.equal('/cabinet/');
            const res2 = await agent_teacher
                .post('/login')
                .send({username: 'teacher@mail.ru', password: 'secret'});
            res.req.path.should.be.equal('/teacher/cabinet/');
        });
        
    });

    describe('/students GET', () => {
        const agent_admin = chai.request.agent(server);

        before(async () => {
            const admin = Object.assign({email: 'admin@mail.ru', priority: 2}, base_user);
            const student1 = Object.assign({email: 'student1@mail.ru', priority: 0}, base_user);
            const student2 = Object.assign({email: 'student2@mail.ru', priority: 0}, base_user);
            await User.create(admin);
            await User.create(student1);
            await User.create(student2);

            const res = await agent_admin
                .post('/admin/login')
                .send({username: 'admin@mail.ru', password: 'secret'});
            res.req.path.should.be.equal('/admin/');
        });

        after(async () => {
            await User.deleteMany();
        });

        it('it should GET all the students', async () => { 
            const res = await agent_admin
                .get('/api/students');
            res.body.should.be.a('array');
            res.body.length.should.be.equal(2);
        });        

        it('it should GET list of students with specified "count"', async () => { 
            const res = await agent_admin
                .get('/api/students?count=1');
            res.body.should.be.a('array');
            res.body.length.should.be.equal(1);
        });

        it('it should GET list of students with specified "lastID"', async () => { 
            const res = await agent_admin
                .get('/api/students?lastID=ffffffffffffffffffffffff');
            res.body.should.be.a('array');
            res.body.length.should.be.equal(0);
        });
    });

    describe('/callback POST', () => {

        afterEach(async () => {
            await Callback.deleteMany();
        });

        it('it should POST a callback request', (done) => {
            const callback = {
                name: 'test',
                phone: '8(111)111-11-11'
            }
            chai.request(server)
                .post('/api/callback')
                .send(callback)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.body.should.have.property('phone_number');
                    done();
                });
        });
        it('it should not POST a callback request with undefined data', (done) => {
            const callback = undefined;
            chai.request(server)
                .post('/api/callback')
                .send(callback)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
        it('it should not POST a callback request with invalid fields', (done) => {
            const callback = { name: 'test', phone: undefined };
            chai.request(server)
                .post('/api/callback')
                .send(callback)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
        it('it should not POST a callback request without required fields', (done) => {
            const callback = { name: 'test' };
            chai.request(server)
                .post('/api/callback')
                .send(callback)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });

});