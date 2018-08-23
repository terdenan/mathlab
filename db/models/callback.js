var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var callbackSchema = new Schema({
    name: String,
    phone_number: String
});

var callback = mongoose.model('callback', callbackSchema);

module.exports = callback;