const MongoClient = require('mongodb').MongoClient,
			ObjectId = require('mongodb').ObjectID,
			MongoStore = require('connect-mongo')(session),
			mongoose = require('mongoose');

const User = require('../db/models/user'),
			Bid = require('../db/models/bid'),
			Message = require('../db/models/message'),
			Course = require('../db/models/course');

const storage = multer.diskStorage({
		    destination: function (req, file, cb) {
		      cb(null, './public/uploads/')
		    },
		    filename: function (req, file, cb) {
		      cb(null, file.fieldname + '-' + Date.now())
		    }
			}),
			upload = multer({ storage: storage });
			
module.exports = function(app) {
	function errorHandler(err, req, res, statusCode, errMessage){
		if (err) console.log(err);
		res
			.status(statusCode)
			.send(errMessage);
	}
	app.put('/api/profileInfo', function(req, res){
		User.update(
			{ _id: ObjectId(req.user._id) }, 
    	{ $set: req.body }, 
    	function(err){
      	if (err) {
      		errorHandler(err, req, res, 500, "Internal server error, try later");
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
    		errorHandler(err, req, res, 500, "Internal server error, try later");
				return;
    	}
    	if (data) {
    		errorHandler(err, req, res, 400, "This email is not available");
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
          	errorHandler(err, req, res, 500, "Internal server error, try later");
          	return;
          }
          req.logIn(newUser, function(err){
            if (err) {
			    		errorHandler(err, req, res, 500, "Internal server error, try later");
			    		return;
			    	}
            res
            	.status(200)
            	.send({ email: req.user.email });
          });
        }); 
      });
		});
	});

	app.post('/api/sendMessage', upload.single('file'), function(req, res){
		var newMessage = Message({
	    _course_id: ObjectId(req.body.courseId),
	    _sender_id: ObjectId(req.user._id),
	    sender: req.user.fullname,
	    message: req.body.message,
	    read_state: false,
	    date: Date.now()
	  });
	  if (req.file) {
	  	newMessage.attachment.push({
		  	url: "/" + req.file.path,
		  	size: req.file.size
			});
	  }
	  newMessage.save(function(err){
	    if (err) {
	    	errorHandler(err, req, res, 500, "Internal server error, try later");
	    	return;
	    }
	    Course.findOne({ _id: ObjectId(req.body.courseId) }, 'teacherAvatarUrl', function(err, data){
	    	if (err) {
	    		errorHandler(err, req, res, 500, "Internal server error, try later");
	    		return;
	    	}
	    	var responseBody = {
	    		_id: newMessage._id,
	    		_course_id: newMessage._course_id,
			    _sender_id: newMessage._sender_id,
			    sender: newMessage.sender,
			    message: newMessage.message,
			    read_state: newMessage.read_state,
			    date: newMessage.date,
			    avatarUrl: data.teacherAvatarUrl
	    	};
	    	res
		    	.status(200)
		    	.send(responseBody);
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
	    status: "pending"
	  });
	  newBid.save(function(err){
	    if (err) {
	  		errorHandler(err, req, res, 500, "Internal server error, try later");
	  		return;
	  	}
	    res
	    	.status(200)
	    	.send('success');
	  });
	});
}