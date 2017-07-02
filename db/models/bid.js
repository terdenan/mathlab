var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var bidSchema = new Schema({
	student: String,
	studentId: String,
	subject: String,
	phone: String,
	prefDays: String,
	prefTime: String,
	date: {type: Date},
	target: String,
	status: String
});

var bid = mongoose.model('bid', bidSchema);

module.exports = bid;