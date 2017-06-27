var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema({
	subject: String,
	student: String,
	studentId: String,
	teacher: String,
	teacherId: String,
	days: String,
	time: String,
	comment: String,
	date: {type: Date},
	endingTime: {type: Date}
});

var course = mongoose.model('course', courseSchema);

module.exports = course;