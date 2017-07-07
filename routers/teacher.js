const http = require('http'),
			express = require('express'),
			compression = require('compression'),
			passport = require('passport'),

			async = require('async'),
			bcrypt = require('bcrypt'),
			multer = require('multer'),

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
		if (err) console.log(err);
		res
			.status(statusCode)
			.send(errMessage);
	}

	teacher.locals.moment = require('moment');

	teacher.set('view engine', 'jade');
	teacher.set('views', path.join(__dirname, '../views/teacher'));
	teacher.use(express.static('public'));
	teacher.use(compression());

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
			res.redirect('/');
			return;
		}
		res
			.status(200)
			.render('./teachers', req.user);
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
				res
					.status(200)
					.render('./cabinet', user);
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
			var responseBody = req.user;
			responseBody.courseInfo = data;
			Message
				.find({ _course_id: ObjectId(req.params.id) })
				.sort({ date: -1 })
				.limit(15)
				.exec(function(err, data){
					if (err) {
						errorHandler(err, req, res, 500, "Internal server error, try later");
						return;
					}
					responseBody.messages = data.reverse();
					res
						.status(200)
						.render('./course', responseBody);
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

	teacher.post('/api/sendMessage', upload.array('file', 5), function(req, res){
		var newMessage = Message({
	    _course_id: ObjectId(req.body.courseId),
	    _sender_id: ObjectId(req.user._id),
	    sender: req.user.fullname,
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
				  	url: "/uploads/" + item.filename,
				  	size: item.size
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
		    Course.findOne({ _id: ObjectId(req.body.courseId) }, 'studentAvatarUrl', function(err, data){
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
				    avatarUrl: data.studentAvatarUrl
		    	};
		    	res
			    	.status(200)
			    	.render('./includes/message', responseBody);
		    });
		  });
	  });
	});

	teacher.get('*', function(req, res){
		res
			.status(404)
			.render('./404');
	});
};