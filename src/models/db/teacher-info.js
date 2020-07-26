const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherInfoSchema = new Schema({
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    geoposition: {
        type: String,
        default: '',
    },
    school: {
        type: String,
        default: '',
    },
    experience: {
        type: String,
        default: '',
    },
    photo_url: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        default: '',
    },
    about: {
        type: String,
        default: '',
    },
    visible: {
        type: Boolean,
        default: false,
    },
    certificates: [{
        title: String,
        url: String,
    }],
    transliterated_fullname: {
        type: String,
        default: null,
    },
    lastUpdatedDate: {
        type: Date,
        default: null,
    },
});

const TeacherInfo = mongoose.model('TeacherInfo', teacherInfoSchema);

module.exports = TeacherInfo;
