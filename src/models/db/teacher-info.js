const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeacherInfo = mongoose.model('TeacherInfo', {
    _teacher_id: Schema.Types.ObjectId,
    geoposition: {
        type: String,
        default: '',
    },
    school: {
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
});

module.exports = TeacherInfo;