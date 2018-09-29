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

const agent = chai.request.agent(server)

describe('/api', () => {

    const base_user = {
        fullname: 'Test',
        password: HASHED_PASSWORD,
        phone: '8(111)111-11-11',
        sex: 1,
    };

    describe('/user POST', () => {
        before(async () => {
            const student = Object.assign({email: 'student0@mail.ru', priority: 0}, base_user);
            await User.create(student);
        });

        after(async () => {
            await User.deleteMany();
        });

        it('it should not POST a user with duplicate email', async () => {
            const newUser = {
                fullname: 'Test',
                email: 'student0@mail.ru',
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
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('confirmed').equal(false);
            res.body.should.have.property('priority').equal(0);
            res.body.should.have.property('emailConfirmCode');
            res.body.should.have.property('emailConfirmDuration');
            res.body.should.have.property('lastEmailDate');
        })
    });

    describe('/teacher POST', () => {

        before(async () => {
            const admin = Object.assign({email: 'admin@mail.ru', priority: 2}, base_user);
            const teacher = Object.assign({email: 'teacher0@mail.ru', priority: 1}, base_user);
            await User.create(admin);
            await User.create(teacher);

            const res = await agent
                .post('/admin/login')
                .send({username: 'admin@mail.ru', password: 'secret'});
            res.req.should.have.cookie('connect.sid');
            res.req.path.should.be.equal('/admin/');
        });

        after(async () => {
            await User.deleteMany();
        });

        it('it should not POST a user with duplicate email', async () => {
            const newUser = {
                fullname: 'Test',
                email: 'teacher0@mail.ru',
                password: 'secret',
                subject: 'mathematics',
                phone: '8(111)111-11-11',
                sex: 1,
            }
            const res = await agent
                .post('/api/teacher')
                .send(newUser);
            res.should.have.status(400);
        });

        it('it should not POST a user without required fields', async () => {
            const newUser = {
                fullname: 'Test',
                email: 'teacher@mail.ru',
                phone: '8(111)111-11-11',
                sex: 1,
            }
            const res = await agent
                .post('/api/teacher')
                .send(newUser);
            res.should.have.status(400);
        });

        it('it should not POST a user with invalid fields', async () => {
            const newUser = {
                fullname: 'Test',
                email: 'teacher@mail.ru',
                password: 'secret',
                subject: 'mathematics',
                phone: '8(111)111-11-11',
                sex: undefined,
            }
            const res = await agent
                .post('/api/teacher')
                .send(newUser);
            res.should.have.status(400);
        });

        it('it should POST a user', async () => {
            const newUser = {
                fullname: 'Test',
                email: 'teacher@mail.ru',
                password: 'secret',
                subject: 'mathematics',
                phone: '8(111)111-11-11',
                sex: 1,
            }
            const res = await agent
                .post('/api/teacher')
                .send(newUser);
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('confirmed').equal(true);
            res.body.should.have.property('lastEmailDate');
            res.body.should.have.property('priority').equal(1);
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

            // const res2 = await agent_teacher
            //     .post('/login')
            //     .send({username: 'teacher@mail.ru', password: 'secret'});
            // res.req.path.should.be.equal('/teacher/cabinet/');
        });

        it('it should UPDATE a student\'s profile info', async () => {
            const res1 = await agent_student
                .post('/login')
                .send({username: 'student@mail.ru', password: 'secret'});
            res1.req.path.should.be.equal('/cabinet');
            res1.req.should.have.cookie('connect.sid');

            const fields = {phone: '8(222)222-22-22'};
            const res2 = await agent_student
                .put('/api/profileInfo')
                .send(fields);
            res2.should.have.status(200);

            const updated_user = await User.getBy({email: 'student@mail.ru'});
            updated_user.phone.should.be.equal('8(222)222-22-22');
        });

        it('it should UPDATE a teacher\'s profile info', async () => {
            const res1 = await agent_teacher
                .post('/login')
                .send({username: 'teacher@mail.ru', password: 'secret'});
            res1.req.path.should.be.equal('/teacher/cabinet');
            res1.req.should.have.cookie('connect.sid');

            const fields = {fullname: 'New Name', phone: '8(222)222-22-22'};
            const res2 = await agent_teacher
                .put('/api/profileInfo')
                .send(fields);
            res2.should.have.status(200);

            const updated_user = await User.getBy({email: 'teacher@mail.ru'});
            updated_user.fullname.should.be.equal('New Name');
            updated_user.phone.should.be.equal('8(222)222-22-22');
        });

        after(async () => {
            await User.deleteMany();
        });

        it('it shouldn\'t UPDATE unchangeable fields', async () => {
            const res1 = await agent_student
                .post('/login')
                .send({username: 'student@mail.ru', password: 'secret'});
            res1.req.path.should.be.equal('/cabinet');
            res1.req.should.have.cookie('connect.sid');

            const fields = {fullname: 'New Name', password: 'new_secret'};
            const res2 = await agent_student
                .put('/api/profileInfo')
                .send(fields);
            res2.should.have.status(400);

            const updated_user = await User.getBy({email: 'student@mail.ru'});
            updated_user.fullname.should.be.equal('Test');
        });
        
    });


    describe('/students GET', () => {

        before(async () => {
            const admin = Object.assign({email: 'admin@mail.ru', priority: 2}, base_user);
            const student1 = Object.assign({email: 'student1@mail.ru', priority: 0}, base_user);
            const student2 = Object.assign({email: 'student2@mail.ru', priority: 0}, base_user);
            await User.create(admin);
            await User.create(student1);
            await User.create(student2);

            const res = await agent
                .post('/admin/login')
                .send({username: 'admin@mail.ru', password: 'secret'});
            res.req.path.should.be.equal('/admin/');
        });

        after(async () => {
            await User.deleteMany();
        });

        it('it should GET all the students', async () => { 
            const res = await agent
                .get('/api/students');
            res.body.should.be.a('array');
            res.body.length.should.be.equal(2);
        });        

        it('it should GET list of students with specified "count"', async () => { 
            const res = await agent
                .get('/api/students?count=1');
            res.body.should.be.a('array');
            res.body.length.should.be.equal(1);
        });

        it('it should GET list of students with specified "lastID"', async () => { 
            const res = await agent
                .get('/api/students?lastID=ffffffffffffffffffffffff');
            res.body.should.be.a('array');
            res.body.length.should.be.equal(0);
        });
    });

    describe('/callback POST', () => {

        afterEach(async () => {
            await Callback.deleteMany();
        });

        it('it should POST a callback request', async () => {
            const callback = {
                name: 'test',
                phone: '8(111)111-11-11'
            }
            const res = await chai.request(server)
                .post('/api/callback')
                .send(callback);

            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('name');
            res.body.should.have.property('phone_number');
        });
        it('it should not POST a callback request with undefined data', async () => {
            const callback = undefined;
            const res = await chai.request(server)
                .post('/api/callback')
                .send(callback);
            res.should.have.status(400);
        });
        it('it should not POST a callback request with invalid fields', async () => {
            const callback = { name: 'test', phone: undefined };
            const res = await chai.request(server)
                .post('/api/callback')
                .send(callback);
            res.should.have.status(400);
        });
        it('it should not POST a callback request without required fields', async () => {
            const callback = { name: 'test' };
            const res = await chai.request(server)
                .post('/api/callback')
                .send(callback);
            res.should.have.status(400);
        });
    });

});