const mongoose = require('mongoose');

const CallbackRequest = mongoose.model('CallbackRequest', {
    name: {
        type: String,
        required: [true, 'Name required']
    },
    phone_number: {
        type: String,
        required: [true, 'Phone required']
    },
    preferred_teacher: {
        type: String,
        default: '',
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = CallbackRequest;