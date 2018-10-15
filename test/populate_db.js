const moment = require('moment');

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

const HASHED_PASSWORD = '$2b$10$/9ji326wT2lq3Ol.E/Cf9ex3KVGWTwqm9WcqNtttDy/e4OBY0eqQW';
const base_user = {
    fullname: 'Test',
    password: HASHED_PASSWORD,
    phone: '8(111)111-11-11',
    sex: 1,
};

function get_course_fields(student, teacher) {
    const fields = {
        subject: teacher.subject,
        student: student.fullname,
        _student_id: student._id,
        teacher: teacher.fullname,
        _teacher_id: teacher._id,
        days: '',
        time: '',
        startingDate: Date.now(),
        endingDate: moment( Date.now() ).add(1, 'months').toDate(),
        studentAvatarUrl: student.avatarUrl,
        teacherAvatarUrl: teacher.avatarUrl
    }

    return fields;
}

module.exports = async () => {
    const admin_fields = Object.assign({email: 'admin@mail.ru', priority: 2}, base_user);
    const teacher_fields = Object.assign({email: 'teacher@mail.ru', priority: 1, subject: 'mathematics'}, base_user);
    const student1_fields = Object.assign({email: 'student1@mail.ru', priority: 0}, base_user);
    const student2_fields = Object.assign({email: 'student1@mail.ru', priority: 0}, base_user);
    const admin = await User.create(admin_fields);
    const teacher = await User.create(teacher_fields);
    const student1 = await User.create(student1_fields);
    const student2 = await User.create(student2_fields);

    const teacher_student1_course_fields = get_course_fields(student1, teacher);
    const teacher_student2_course_fields = get_course_fields(student2, teacher);
    const teacher_student1_course = await Course.create(teacher_student1_course_fields);
    const teacher_student2_course = await Course.create(teacher_student2_course_fields);

    const teacherInfo_fields = {
        _teacher_id: teacher._id,
        geoposition: '-',
        school: '-',
        experience: '-',
        photo_url: '-',
        bio: '-',
        about: '-',
        visible: true,
        certificates: [],
    };
    const teacherInfo = await TeacherInfo.create(teacherInfo_fields);
}