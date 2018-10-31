const mongoose = require('mongoose');

const User = mongoose.model('User', {
    fullname: String,
    email: String,
    password: String,
    avatarUrl: {
        type: String, 
        default: "/images/profile.jpg"
    },
    phone: String,
    sex: Number, // 0 - Male, 1 - Female
    grade: String,
    confirmed: Boolean,
    priority: Number, // 0 - student, 1 - teacher, 2 - admin
    subject: String,
    vk_id: Number,
    emailConfirmCode: String,
    emailConfirmDuration: Date,
    lastEmailDate: Date,
    changePasswordCode: String,
    changePasswordDuration: Date
});

module.exports = User;