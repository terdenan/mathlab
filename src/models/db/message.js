const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = mongoose.model('Message', {
    _course_id: Schema.Types.ObjectId,
    _sender_id: Schema.Types.ObjectId,
    message: String,
    attachment: [ {
        originalName: String,
        url: String,
        size: Number
    } ],
    read_state: Boolean, // 0 - unread, 1 - read
    date: {type: Date},
});

module.exports = Message;