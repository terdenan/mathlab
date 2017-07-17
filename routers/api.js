const MongoClient = require('mongodb').MongoClient,
			ObjectId = require('mongodb').ObjectID,
			MongoStore = require('connect-mongo')(session),
			mongoose = require('mongoose'),
			fs = require('fs'),
			config = require('config.json')('./config.json'),

			async = require('async'),
			jade = require('jade'),
			moment = require('moment');

const User = require('../db/models/user'),
			Bid = require('../db/models/bid'),
			Message = require('../db/models/message'),
			Course = require('../db/models/course');

const storage = multer.diskStorage({
		    destination: function (req, file, cb) {
		      cb(null, './public/uploads/')
		    },
		    filename: function (req, file, cb) {
		      cb(null, Date.now() + "-" + (file.originalname));
		    }
			}),
			upload = multer({ storage: storage });
			
module.exports = function(app, bot) {
	function errorHandler(err, req, res, statusCode, errMessage){
		if (err && err != "timeError" && err != "dataError") {
			console.log(err);
			bot.sendMessage(298493325, "Monsieur, there is new error on server...");
		}
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

	app.post('/api/profileInfo', function(req, res){
		var request = req.body;
		User.update(
			{ _id: ObjectId(req.user._id) }, 
    	{ $set: request }, 
    	function(err){
      	if (err) {
      		errorHandler(err, req, res, 500, "Internal server error, try later");
					return;
      	}
      	if (req.body.fullname){
      		Course.update(
	      		{ _student_id: ObjectId(req.user._id) },
	      		{ $set: { student: req.body.fullname } },
	      		{ multi: true },
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
      	}
      	else {
      		res
	      		.status(200)
	      		.send("success");
      	}
      }
    );
	});

	app.post('/api/changePassword', function(req, res){
		bcrypt.compare(req.body.oldPassword, req.user.password).then(function(result){
	    if (!result) {
	    	errorHandler(null, req, res, 400, "Incorrect password");
	    	return;
	    }
	    else {
	      bcrypt.hash(req.body.newPassword, 10).then(function(hash) {
	        User.update(
	        	{ _id: ObjectId(req.user._id) },
	          { $set: { password: hash } }, 
	          function(err){
	            if (err) {
			      		errorHandler(err, req, res, 500, "Internal server error, try later");
								return;
			      	}
	            res
	            	.status(200)
	            	.send("success");
	          });
	      });
	    }
	  });
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
    		var code = require('md5')(Date.now());
        var newUser = User({
          _id: new mongoose.Types.ObjectId,
          fullname: req.body.fullname,
          email: req.body.email,
          password: hash,
          phone: req.body.phone,
          sex: req.body.sex,
          grade: req.body.grade,
          confirmed: false,
          priority: 0,
          emailConfirmCode: code,
          emailConfirmDuration: Date.now() + 24 * 60 * 60 * 1000
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
			    	var emailBody = jade.renderFile('./views/main/mail-bodies/email-confirm.jade', { code: code, email: req.user.email, fullname: req.user.fullname });
						var send = require('gmail-send')({
						  user: config.gmail.login,
						  pass: config.gmail.password,
						  to:   req.user.email,
						  subject: 'Подтверждение адреса электронной почты',
						  html:   emailBody
						});
						send({}, function(err, res){
							if (err) {
					  		errorHandler(err, req, res, 500, "Internal server error, try later");
					  		return;
					  	}
						});
						var message = 'New user:\nGiven name: ' + newUser.fullname + 
																	 '\nEmail: ' + newUser.email + 
																	 '\nThrough VK: no\n';
		  			bot.sendMessage(298493325, message);
		  			bot.sendMessage(66075583, message);
		  			bot.sendMessage(288260717, message);
            res
            	.status(200)
            	.send({ email: req.user.email });
          });
        }); 
      });
		});
	});

	app.post('/api/getMessages', function(req, res){
		Course.findOne({ _id: ObjectId(req.body.courseId) }, function(err, data){
			if (err) {
				errorHandler(err, req, res, 500, "Internal server error, try later");
	  		return;
			}
			var responseBody = req.user;
			responseBody.courseInfo = data;
			Message
				.find({ $and: [ { _course_id: ObjectId(req.body.courseId) }, { _id: { $lt: ObjectId(req.body.lastId) } } ] })
				.sort({ date: -1 })
				.limit(15)
				.exec(function(err, data){
					if (err) {
						errorHandler(err, req, res, 500, "Internal server error, try later");
		  			return;
					}
					responseBody.messages = data.reverse();
					var htmlBody = jade.renderFile('./views/main/includes/messages.jade', responseBody);
					res
						.status(200)
						.send(htmlBody);
				});
		});
	});

	app.post('/api/sendMessage', upload.array('file', 5), function(req, res){
		var newMessage = Message({
	    _course_id: ObjectId(req.body.courseId),
	    _sender_id: ObjectId(req.user._id),
	    message: req.body.message,
	    read_state: false,
	    date: Date.now()
	  });
	  async.waterfall([
	  	function(callback){
	  		var arr = req.files, length = (req.files).length;
	  		if (!length) callback(null);
	  		arr.forEach(function(item, i, arr){
	  			newMessage.attachment.push({
				  	originalName: (item.filename).substr(14),
				  	url: "/uploads/" + item.filename,
				  	size: (item.size / 1024).toFixed(2)
					});
	  			if (i == length - 1) callback(null);
	  		});
	  	}
	  	], 
	  	function(err){
	  		if (err) {
	  			errorHandler(err, req, res, 500, "Internal server error, try later");
	  			return;
	  		}
	  		newMessage.save(function(err){
		    if (err) {
		    	errorHandler(err, req, res, 500, "Internal server error, try later");
		    	return;
		    }
		    Course.findOne({ _id: ObjectId(req.body.courseId) }, 'studentAvatarUrl student', function(err, data){
		    	if (err) {
		    		errorHandler(err, req, res, 500, "Internal server error, try later");
		    		return;
		    	}
		    	var responseBody = {
		    		_id: newMessage._id,
		    		_course_id: newMessage._course_id,
				    _sender_id: newMessage._sender_id,
				    sender: data.student,
				    _user_id: req.user._id,
				    message: newMessage.message,
				    read_state: newMessage.read_state,
				    attachment: newMessage.attachment,
				    date: newMessage.date,
				    avatarUrl: data.studentAvatarUrl
		    	};
		    	res
			    	.status(200)
			    	.render('./includes/message', responseBody);
		    });
		  });
	  });
	});

	app.post('/api/sendConfirmationEmail', function(req, res){
		async.waterfall([
			function(callback){
				var code = require('md5')(Date.now());
				User.findOne({ _id: ObjectId(req.user._id) }, 'lastEmailDate email fullname', function(err, data){
					if (err) {
						callback(err);
						return;
					}
					if (data.lastEmailDate && moment(Date.now()).format() < moment(data.lastEmailDate).add(15, 'm').format()) {
						callback('timeError');
						return;
					}
					User.update(
						{ _id: ObjectId(req.user._id) },
						{ $set: {emailConfirmCode: code, emailConfirmDuration: Date.now() + 24 * 60 * 60 * 1000, lastEmailDate: Date.now() } },
						function(err){
							if (err) {
								callback(err);
								return;
							}
							var emailBody = jade.renderFile('./views/main/mail-bodies/email-confirm.jade', { code: code, email: data.email, fullname: data.fullname });
							var send = require('gmail-send')({
							  user: config.gmail.login,
							  pass: config.gmail.password,
							  to:   data.email,
							  subject: 'Подтверждение адреса электронной почты',
							  html:   emailBody
							});
							send({}, function(err, res){
								if (err) {
						  		callback(err);
						  		return;
						  	}
						  	callback(null);
							});
						});
				});
			}
			], 
			function(err){
				if (err){
					if (err == 'timeError') errorHandler(err, req, res, 400, "Time is not over");
					else errorHandler(err, req, res, 500, "Internal server error, try later");
					return;
				}
				res
					.status(200)
					.send('success');
		});
	});

	app.put('/api/recoverPassword', function(req, res){
		bcrypt.hash(req.body.newPassword, 10).then(function(hash) {
     	User.update(
				{ changePasswordCode: req.body.code }, 
	    	{ $set: {password: hash, changePasswordDuration: Date.now() } }, 
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
	});

	app.post('/api/recoverPassword', function(req, res){
		async.waterfall([
			function(callback){
				var code = require('md5')(Date.now());
				User.findOne({ email: req.body.email }, 'lastEmailDate', function(err, data){
					if (err) {
						callback(err);
						return;
					}
					if (!data) {
						callback('dataError');
						return;
					}
					if (data.lastEmailDate && moment(Date.now()).format() < moment(data.lastEmailDate).add(15, 'm').format()) {
						callback('timeError');
						return;
					}
					User.update(
						{ email: req.body.email },
						{ $set: {changePasswordCode: code, changePasswordDuration: Date.now() + 24 * 60 * 60 * 1000, lastEmailDate: Date.now() } },
						function(err){
							if (err) {
								callback(err);
								return;
							}
							var emailBody = jade.renderFile('./views/main/mail-bodies/change-password.jade', { code: code });
							var send = require('gmail-send')({
							  user: config.gmail.login,
							  pass: config.gmail.password,
							  to:   req.body.email,
							  subject: 'Смена забытого пароля',
							  html:    emailBody
							});
							send({}, function(err, res){
								if (err) {
						  		callback(err);
						  		return;
						  	}
						  	callback(null);
							});
						});
				});
			}
			], 
			function(err){
				if (err){
					if (err == 'timeError') errorHandler(err, req, res, 403, "Time is not over");
					else if (err == 'dataError') errorHandler(err, req, res, 400, "Email is not valid");
					else errorHandler(err, req, res, 500, "Internal server error, try later");
					return;
				}
				res
					.status(200)
					.send('success');
		});
	});

	app.post('/api/changeAvatar', upload.single('file'), function(req, res){
		User.update(
			{ _id: ObjectId(req.user._id) }, 
    	{ $set: { avatarUrl: "/uploads/" + req.file.filename } }, 
    	function(err){
      	if (err) {
      		errorHandler(err, req, res, 500, "Internal server error, try later");
					return;
      	}
      	Course.update(
      		{ _student_id: ObjectId(req.user._id) },
      		{ $set: { studentAvatarUrl: "/uploads/" + req.file.filename } },
      		{ multi: true },
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
      }
    );
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
	  	var message = 'New bid:\nStudent: ' + newBid.student + 
	  												'\nPhone: ' + newBid.phone + 
	  												'\nSubject: ' + newBid.subject +
	  												'\nPreferred days: ' + newBid.prefDays +
	  												'\nPreferred time: ' + newBid.prefTime +
	  												'\nTarget: ' + newBid.target + '\n';
		  bot.sendMessage(298493325, message);
		  bot.sendMessage(66075583, message);
		  bot.sendMessage(288260717, message);
	    res
	    	.status(200)
	    	.send('success');
	  });
	});
}