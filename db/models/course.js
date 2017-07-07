var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var courseSchema = new Schema({
	subject: String,
	student: String,
	_student_id: Schema.Types.ObjectId,
	teacher: String,
	_teacher_id: Schema.Types.ObjectId,
	studentAvatarUrl: String,
	teacherAvatarUrl: String,
	days: String,
	time: String,
	comment: String,
	startingDate: {type: Date},
	endingDate: {type: Date}
});

var course = mongoose.model('course', courseSchema);

module.exports = course;