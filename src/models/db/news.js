const mongoose = require('mongoose');

const News = mongoose.model('News', {
    title: String,
    cyrillicTitle: String,
    description: String, 
    body: String,
    photoUrl: String,
    date: Date
});

module.exports = News;