const MongoClient = require('mongodb').MongoClient,
			ObjectId = require('mongodb').ObjectID,
			MongoStore = require('connect-mongo')(session),
			mongoose = require('mongoose');

const User = require('../db/models/user'),
			Bid = require('../db/models/bid'),
			Course = require('../db/models/course');
			
module.exports = function(app) {
	app.put('/api/profileInfo', function(req, res){
		User.update(
			{ _id: ObjectId(req.user._id) }, 
    	{ $set: req.body }, 
    	function(err){
      	if (err) {
      		console.log(err);
      		res
						.status(500)
						.send("Internal server error, try later");
						return;
      	}
      	res
      		.status(200)
      		.send("success");
      }
    );
	});

	app.put('/api/user', function(req, res){
		User.findOne({ email: req.body.email }, function(err, data){
			if (err) {
    		res
					.status(500)
					.send("Internal server error, try later");
					return;
    	}
    	if (data) {
    		res
					.status(400)
					.send("This email is not available");
					return;
    	}
    	bcrypt.hash(req.body.password, 10).then(function(hash) {
        var newUser = User({
          _id: new mongoose.Types.ObjectId,
          fullname: req.body.fullname,
          email: req.body.email,
          password: hash,
          phone: req.body.phone,
          sex: req.body.sex,
          grade: req.body.grade,
          confirmed: false,
          priority: 0
        });
        newUser.save(function(err){
          if(err) {
          	if (err) {
			    		console.log(err);
			    		res
								.status(500)
								.send("Internal server error, try later");
								return;
			    	}
          }
          req.logIn(newUser, function(err){
            if (err) {
			    		console.log(err);
			    		res
								.status(500)
								.send("Internal server error, try later");
								return;
			    	}
            res
            	.status(200)
            	.send({id: req.user._id, email: req.user.email});
          });
        }); 
      });
		});
	});
	
	app.put('/api/bid', function(req, res){
		var newBid = Bid({
	    student: req.user.fullname,
	    studentId: req.user._id,
	    subject: req.body.subject,
	    phone: req.user.phone,
	    prefDays: req.body.prefDays,
	    prefTime: req.body.prefTime,
	    target: req.body.target,
	    date: Date.now(),
	    status: "Pending"
	  });
	  newBid.save(function(err){
	    if (err) {
	  		console.log(err);
	  		res
					.status(500)
					.send("Internal server error, try later");
					return;
	  	}
	    res
	    	.status(200)
	    	.send('success');
	  });
	});
}