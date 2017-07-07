var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
	_course_id: Schema.Types.ObjectId,
	_sender_id: Schema.Types.ObjectId,
	sender: String,
	message: String,
	attachment: [ {
		url: String,
		size: Number
	} ],
	read_state: Boolean, // 0 - unread, 1 - read
	date: {type: Date},
});

var message = mongoose.model('message', messageSchema);

module.exports = message;