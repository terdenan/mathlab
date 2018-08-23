const http = require('http'),
			express = require('express'),
			compression = require('compression'),
			passport = require('passport'),
			fs = require('fs'),
			config = require('config.json')('./config.json'),
			serveStatic = require('serve-static'),
			marked = require('marked'),
			jade = require('jade'),

			VK = require('vksdk'),
			vk = new VK({
			  'appId'     : config.vk.appId,
			  'appSecret' : config.vk.appSecret,
			  'language'  : config.vk.language
			});

			bcrypt = require('bcrypt'),
			multer = require('multer'),
			moment = require('moment'),
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
			News = require('../db/models/news'),
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

module.exports = function(app, bot){
	passport.use(new LocalStrategy(
	  function(login, password, done) {
	  	User.findOne({email: login}, function(err, user) {
				if (err) return done(err);
				if (!user) return done(null, false);

	      bcrypt.compare(password, user.password).then(function(result) {
	        if (!result) return done(null, false);
	        else return done(null, user);
	      });

	    });
	  }
	));

	passport.use(new VKontakteStrategy(
	  {
	    clientID:     config.vk.appId,
	    clientSecret: config.vk.appSecret,
	    callbackURL:  "https://mathlab.kz/auth/vkontakte/callback"
	  },
	  function myVerifyCallbackFn(accessToken, refreshToken, params, profile, done) {
	  	User.findOne( { $or: [ { vk_id: profile.id }, { email: params.email } ] }, function(err, user){
	  		if (err) return done(err);
	  		if (!user) {
	  			var newUser = User({
	  				_id: new mongoose.Types.ObjectId,
	  				fullname: profile.displayName,
	  				email: params.email || "",
	  				confirmed: true,
	  				priority: 0,
	  				vk_id: profile.id
	  			});
	  			newUser.sex = (profile.gender == "male") ? 0 : 1;
	  			vk.request('users.get', {'user_ids' : profile.id, 'access_token' : accessToken, 'fields': 'photo_200'}, function(_o) {
						newUser.avatarUrl = _o.response[0].photo_200;
						newUser.save(function(err){
		  				if (err) return done(err);
		  				var message = 'New user:\nGiven name: ' + newUser.fullname + '\nEmail: ' + newUser.email + '\nThrough VK: yes\n';
		  				bot.sendMessage(298493325, message);
		  				// bot.sendMessage(66075583, message);
		  				// bot.sendMessage(288260717, message);
		  				done(null, newUser);
		  			});
					});
	  		}
	  		else {
	  			user.email = params.email || "";
	  			user.vk_id = profile.id;
	  			user.confirmed = true;
	  			user.save(function(err){
	  				if (err) return done(err);
	  				done(null, user);
	  			});
	  		}
	  	});
	  }
	));

	passport.serializeUser(function(user, done) {
	  done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
	    done(err, user);
	  });
	});

	function errorHandler(err, req, res, statusCode, errMessage){
		if (err && err != "timeError" && err != "dataError") {
			console.log(err);
			bot.sendMessage(298493325, "Monsieur, there is new error on server...");
		}
		res
			.status(statusCode)
			.send(errMessage);
	}

	app.set('trust proxy', true);
	app.use(function(req, res, next){
		if (req.headers.host.slice(0, 4) === 'www.') {
    	var newHost = req.headers.host.slice(4);
    	return res.redirect(301, req.protocol + '://' + newHost + req.originalUrl);
    }
    next();
	});

	app.locals.moment = require('moment');
	app.locals.marked = marked;

	app.set('view engine', 'jade');
	app.set('views', path.join(__dirname, '../views/main'));
	app.use(serveStatic('public'));
	app.use(compression());
	app.use(helmet());

	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(session(
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
	app.use(passport.initialize());
	app.use(passport.session());

	app.use(flash());

	app.use(function(req, res, next){
		if (req.user && req.user.priority != 0) {
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

	app.get('/', function(req, res){
		News
			.find()
			.sort({ date: -1 })
			.limit(3)
			.exec(function(err, news){
				res
					.status(200)
					.render('./index', {data: news});
			});
	});

	app.get('/sign-in', function(req, res){
		if (req.user) {
			res.redirect('/cabinet');
			return;
		}
		res
			.status(200)
			.render('./sign-in', {message: req.flash('error')});
	});

	app.get('/sign-up', function(req, res){
		if (req.user) {
			res.redirect('/cabinet');
			return;
		}
		res
			.status(200)
			.render('./sign-up');
	});

	app.get('/how-to-use', function(req, res){
		res
			.status(200)
			.render('./how-to-use');
	});

	app.get('/news', function(req, res){
		News
			.find({})
			.select('title cyrillicTitle description photoUrl date')
			.sort({ date: -1 })
			.exec(function(err, news) {
				if (err) {
					errorHandler(err, req, res, 500, "Internal server error, try later");
					return;
				}
				res
					.status(200)
					.render('./news', {news: news});
			});
	});

	app.get('/news/:title', function(req, res){
		News.findOne({title: req.params.title}, function(err, data) {
			if (err) {
				errorHandler(err, req, res, 500, "Internal server error, try later");
				return;
			}
			if (!data) {
				res
					.status(404)
					.render('./404');
				return;
			}
			News
				.find({title: {"$ne": req.params.title}})
				.sort({ date: -1 })
				.limit(3)
				.exec(function(err, news){
					res
						.status(200)
						.render('./single-news', {data: data, news: news});
				});
		});
	});

	app.get('/prices', function(req, res){
		res
			.status(200)
			.render('./prices');
	});

	app.get('/recover', function(req, res){
		if (req.user) {
			res.redirect('/cabinet');
			return;
		}
		res
			.status(200)
			.render('./forgotten-password');
	});

	app.get('/change-password', function(req, res){
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

	app.get('/email-confirm', function(req, res){
		User.findOne({ emailConfirmCode: req.query.code }, 'emailConfirmDuration',function(err, data){
			if (err) {
				errorHandler(err, req, res, 500, "Internal server error, try later");
				return;
			}
			if (!data || moment(Date.now()).format() > moment(data.emailConfirmDuration).format()){
				res
					.status(200)
					.render('./email-confirm', { valid: false } );
				return;
			}
			User.update(
				{ emailConfirmCode: req.query.code }, 
	    	{ $set: { confirmed: true, emailConfirmDuration: Date.now() } }, 
	    	function(err){
	      	if (err) {
	      		errorHandler(err, req, res, 500, "Internal server error, try later");
						return;
	      	}
	      	res
						.status(200)
						.render('./email-confirm', { valid: true } );
	      }
	    );
		});
	});

	app.get('/cabinet', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		Course
			.find({ _student_id: ObjectId(req.user._id) })
			.select("_id subject teacher _teacher_id teacherAvatarUrl startingDate endingDate")
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

	app.get('/course/:id', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		if (!ObjectId.isValid(req.params.id)) {
			errorHandler(null, req, res, 400, "This URL isn't valid");
			return;
		}
		Course.findOne({ $and: [ { _id: ObjectId(req.params.id) }, { _student_id: ObjectId(req.user._id)} ] }, function(err, data){
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
			Message.update({ $and: [ { _course_id: ObjectId(req.params.id) }, {_sender_id: data._teacher_id}, { read_state: false } ] }, 
				{ $set: { read_state: true } }, { multi: true }, function(err){
				if (err) {
					errorHandler(err, req, res, 500, "Internal server error, try later");
					return;
				}
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

	app.get('/settings', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		res
			.status(200)
			.render('./settings', req.user);
	});

	app.get('/request', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		res
			.status(200)
			.render('./request', req.user);
	});

	app.get('/teachers', function(req, res){
		if (!req.user) {
			res.redirect('/');
			return;
		}
		res
			.status(200)
			.render('./teachers', req.user);
	});

	app.post('/login',
	  passport.authenticate('local', { successRedirect: '/cabinet',
	                                   failureRedirect: '/sign-in',
	                                   failureFlash: "fail" })
	);

  app.get('/auth/vkontakte', 
  	passport.authenticate('vkontakte', { scope: ['email'] }), function(req, res){
  	});

  app.get('/auth/vkontakte/callback', function(req, res, next){
  	passport.authenticate('vkontakte', function(err, user, info){
			if (err) return next(err);
			if (!user) return res.redirect('/sign-in');

			req.logIn(user, function(err) {
	      if (err) return next(err);
	      return res.redirect('/cabinet');
	    });

		})(req, res, next);
  });

	app.get('/log-out', function(req, res){
		req.session.destroy(function (err) {
			if (err) {
				errorHandler(err, req, res, 500, "Internal server error, try later");
				return;
			}
		  res.redirect('/sign-in');
		});
	});

	require('./api')(app, bot);

	app.get('*', function(req, res){
		res
			.status(404)
			.render('./404');
	});
};
