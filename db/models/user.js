var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  fullname: String,
  email: String,
  password: String,
  avatarUrl: {type: String, default: "/images/profile.jpg"},
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

var User = mongoose.model('User', userSchema);

module.exports = User;