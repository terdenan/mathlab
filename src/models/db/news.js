const mongoose = require('mongoose');

const News = mongoose.model('News', {
    title: String,
    cyrillicTitle: String,
    description: String, 
    body: String,
    photoUrl: String,
    date: Date,
    lastUpdatedDate: {
        type: Date,
        default: null,
    },
});

module.exports = News;
