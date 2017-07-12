const http = require('http'),
			express = require('express'),
			compression = require('compression'),
			passport = require('passport'),
			fs = require('fs'),
			config = require('config.json')('./config.json'),

			async = require('async'),
			bcrypt = require('bcrypt'),
			multer = require('multer'),
			jade = require('jade'),
			helmet = require('helmet'),

			path = require('path'),
			cookieParser = require('cookie-parser'),
			bodyParser = require('body-parser'),
			session = require('express-session'),
			flash = require('connect-flash'),

			LocalStrategy = require('passport-local').Strategy,
			VKontakteStrategy = require('passport-vkontakte').Strategy,

			MongoClient = require('mongodb').MongoClient,
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
		      cb(null, Date.now() + "-" + (file.originalname));
		    }
			}),
			upload = multer({ storage: storage });

module.exports = function(teacher){
	function errorHandler(err, req, res, statusCode, errMessage){
		if (err && err != "timeError" && err != "dataError") console.log(err);
		res
			.status(statusCode)
			.send(errMessage);
	}

	teacher.locals.moment = require('moment');

	teacher.set('view engine', 'jade');
	teacher.set('views', path.join(__dirname, '../views/teacher'));
	teacher.use(express.static('public'));
	teacher.use(compression());
	teacher.use(helmet());

	teacher.use(cookieParser());
	teacher.use(bodyParser.urlencoded({ extended: true }));
	teacher.use(bodyParser.json());
	teacher.use(session(
		{ 
			secret: 'keyboard cat',
			store: new MongoStore ({
			  mongooseConnection: mongoose.connection
			}),
			cookie: {httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7},
			resave: true,
    	saveUninitialized: true
		}
	));
	teacher.use(passport.initialize());
	teacher.use(passport.session());

	teacher.use(flash());

	teacher.use(function(req, res, next){
		if (req.user && req.user.priority == 0) {
			req.session.destroy(function (err) {
				if (err) {
					errorHandler(err, req, res, 500, "Internal server error, try later");
					return;
				}
			  res.redirect('/sign-in');
			});
		}
		else next();
	});

	teacher.get('/cabinet', function(req, res){
		res.redirect('/');
	});

	teacher.get('/sign-in', function(req, res){
		if (req.user) {
			res.redirect('/');
			return;
		}
		res
			.status(200)
			.render('./sign-in', {message: req.flash('error')});
	});

	teacher.get('/teachers', function(req, res){
		if (!req.user) {
			res.redirect('/sign-in');
			return;
		}
		res
			.status(200)
			.render('./teachers', req.user);
	});

	teacher.get('/settings', function(req, res){
		if (!req.user) {
			res.redirect('/sign-in');
			return;
		}
		res
			.status(200)
			.render('./settings', req.user);
	});

	teacher.get('/recover', function(req, res){
		if (req.user) {
			res.redirect('/cabinet');
			return;
		}
		res
			.status(200)
			.render('./forgotten-password');
	});

	teacher.get('/', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		Course
			.find({ _teacher_id: ObjectId(req.user._id) })
			.select("_id subject student _student_id studentAvatarUrl startingDate endingDate")
			.exec(function(err, courses){
				if (err) {
					errorHandler(err, req, res, 500, "Internal server error, try later");
					return;
				}
				var user = req.user;
				user.courses = courses;
				user.currentDate = Date.now();
				res
					.status(200)
					.render('./cabinet', user);
			});
	});

	teacher.get('/change-password', function(req, res){
		User.findOne({ changePasswordCode: req.query.code }, 'changePasswordDuration', function(err, data){
			if (err) {
				errorHandler(err, req, res, 500, "Internal server error, try later");
				return;
			}
			if (!data || moment(Date.now()).format() > moment(data.changePasswordDuration).format()){
				res
					.status(200)
					.render('./change-password', { valid: false });
				return;
			}
			res
				.status(200)
				.render('./change-password', { valid: true });
		});
	});

	teacher.get('/course/:id', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		if (!ObjectId.isValid(req.params.id)) {
			errorHandler(null, req, res, 400, "This URL isn't valid");
			return;
		}
		Course.findOne({ _id: ObjectId(req.params.id) }, function(err, data){
			if (err) {
				errorHandler(err, req, res, 500, "Internal server error, try later");
				return;
			}
			if (!data) {
				res
					.status(403)
					.render('permission-denied');
				return;
			}
			var responseBody = req.user;
			responseBody.courseInfo = data;
			Message.update({ $and: [ { _course_id: ObjectId(req.params.id) }, {_sender_id: data._student_id}, { read_state: false } ] }, 
				{ $set: { read_state: true } }, { multi: true }, function(err){
					Message
						.find({ _course_id: ObjectId(req.params.id) })
						.sort({ date: -1 })
						.limit(15)
						.exec(function(err, data){
							if (err) {
								errorHandler(err, req, res, 500, "Internal server error, try later");
								return;
							}
							(res.io.in(req.params.id)).emit('markReaded');
							responseBody.messages = data.reverse();
							responseBody.currentDate = Date.now();
							res
								.status(200)
								.render('./course', responseBody);
						});
			});
		});
	});

	teacher.post('/login',
	  passport.authenticate('local', { successRedirect: '/',
	                                   failureRedirect: '/sign-in',
	                                   failureFlash: "fail" })
	);

	teacher.get('/log-out', function(req, res){
		req.session.destroy(function (err) {
			if (err) {
				errorHandler(err, req, res, 500, "Internal server error, try later");
				return;
			}
		  res.redirect('/sign-in');
		});
	});

	teacher.post('/api/getMessages', function(req, res){
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
					var htmlBody = jade.renderFile('./views/teacher/includes/messages.jade', responseBody);
					res
						.status(200)
						.send(htmlBody);
				});
		});
	});

	teacher.post('/api/sendMessage', upload.array('file', 5), function(req, res){
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
		    Course.findOne({ _id: ObjectId(req.body.courseId) }, 'teacherAvatarUrl teacher', function(err, data){
		    	if (err) {
		    		errorHandler(err, req, res, 500, "Internal server error, try later");
		    		return;
		    	}
		    	var responseBody = {
		    		_id: newMessage._id,
		    		_course_id: newMessage._course_id,
				    _sender_id: newMessage._sender_id,
				    sender: data.teacher,
				    _user_id: req.user._id,
				    message: newMessage.message,
				    read_state: newMessage.read_state,
				    attachment: newMessage.attachment,
				    date: newMessage.date,
				    avatarUrl: data.teacherAvatarUrl
		    	};
		    	res
			    	.status(200)
			    	.render('./includes/message', responseBody);
		    });
		  });
	  });
	});

	teacher.post('/api/profileInfo', function(req, res){
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
	      		{ _teacher_id: ObjectId(req.user._id) },
	      		{ $set: { teacher: req.body.fullname } },
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

	teacher.post('/api/changeAvatar', upload.single('file'), function(req, res){
		User.update(
			{ _id: ObjectId(req.user._id) }, 
    	{ $set: { avatarUrl: "/uploads/" + req.file.filename } }, 
    	function(err){
      	if (err) {
      		errorHandler(err, req, res, 500, "Internal server error, try later");
					return;
      	}
      	Course.update(
      		{ _teacher_id: ObjectId(req.user._id) },
      		{ $set: { teacherAvatarUrl: "/uploads/" + req.file.filename } },
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

	teacher.post('/api/changePassword', function(req, res){
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

	teacher.put('/api/recoverPassword', function(req, res){
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

	teacher.post('/api/recoverPassword', function(req, res){
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
							var emailBody = jade.renderFile('./views/teacher/mail-bodies/change-password.jade', { code: code });
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

	teacher.get('*', function(req, res){
		res
			.status(404)
			.render('./404');
	});
};