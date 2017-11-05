var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var newsSchema = new Schema({
  title: String,
  cyrillicTitle: String,
  description: String, 
  body: String,
  photoUrl: String,
  date: Date
});

var News = mongoose.model('News', newsSchema);

module.exports = News;