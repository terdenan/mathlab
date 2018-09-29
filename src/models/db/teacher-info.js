const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeacherInfo = mongoose.model('TeacherInfo', {
    _teacher_id: Schema.Types.ObjectId,
    geoposition: String,
    school: String,
    photo_url: String,
    bio: String,
    about: String,
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