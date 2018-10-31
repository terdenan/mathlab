const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Bid = mongoose.model('Bid', {
    student: String,
    studentId: Schema.Types.ObjectId,
    subject: String,
    phone: String,
    prefDays: String,
    prefTime: String,
    date: {
        type: Date,
        default: Date.now
    },
    target: String,
    status: String
});

module.exports = Bid;