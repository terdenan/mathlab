const MongoClient = require('mongodb').MongoClient,
			ObjectId = require('mongodb').ObjectID,
			MongoStore = require('connect-mongo')(session),
			mongoose = require('mongoose');

const User = require('../db/models/user'),
			Course = require('../db/models/course');

module.exports = function(app) {
	app.put('/api/profileInfo', function(req, res){
		User.update(
			{ _id: ObjectId(req.user._id) }, 
    	{ $set: req.body }, 
    	function(err){
      	if (err) {
      		res
						.status(500)
						.send("Internal server error, try later");
						return;
      	}
      	res
      		.status(200)
      		.send("Success");
      }
    );
	});
}