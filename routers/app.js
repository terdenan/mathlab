const http = require('http'),
			express = require('express'),
			compression = require('compression'),
			passport = require('passport'),

			VK = require('vksdk'),
			vk = new VK({
			  'appId'     : 6088660,
			  'appSecret' : 'ynzLi2vKo1m66G8qsMk6',
			  'language'  : 'ru'
			});

			bcrypt = require('bcrypt'),

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
			Course = require('../db/models/course');

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
    clientID:     6088660,
    clientSecret: "ynzLi2vKo1m66G8qsMk6",
    callbackURL:  "http://localhost/auth/vkontakte/callback"
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

  			vk.request('users.get', {'user_ids' : profile.id, 'access_token' : accessToken, 'fields': 'photo_200'});
				vk.on('done:users.get', function(_o) {

					newUser.avatarUrl = _o.response[0].photo_200;
					newUser.save(function(err){
	  				if (err) return done(err);
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

module.exports = function(app, dir){
	app.locals.moment = require('moment');

	app.set('view engine', 'jade');
	app.set('views', path.join(__dirname, '../views/main'));
	app.use(express.static('public'));
	app.use(compression());

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

	app.get('/', function(req, res){
		res
			.status(200)
			.render('./index');
	});

	app.get('/sign-in', function(req, res){
		if (req.user) {
			res.redirect('/cabinet/' + req.user._id);
			return;
		}
		res
			.status(200)
			.render('./sign-in', {message: req.flash('error')});
	});

	app.get('/sign-up', function(req, res){
		if (req.user) {
			res.redirect('/cabinet/' + req.user._id);
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

	app.get('/prices', function(req, res){
		res
			.status(200)
			.render('./prices');
	});

	app.get('/cabinet/:id', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		if (!ObjectId.isValid(req.params.id)) {
			res
				.status(400)
				.send("Bad request");
			return;
		}
		User
			.findOne({_id: ObjectId(req.params.id)})
			.select("_id fullname email phone grade avatarUrl")
			.exec(function(err, user){
				if (err) {
					console.log(err);
					res
						.status(500)
						.send("Internal server error, try later");
						return;
				}
				Course
					.find({studentId: ObjectId(req.params.id)})
					.select("_id teacher teacherId date endingTime")
					.exec(function(err, courses){
						if (err) {
							console.log(err);
							res
								.status(500)
								.send("Internal server error, try later");
								return;
						}
						user.courses = courses;
						res
							.status(200)
							.render('./cabinet', user);
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
			.render('./request', {_id: (req.user._id).toString()});
	});

	app.get('/teachers', function(req, res){
		res
			.status(200)
			.render('./teachers', {_id: (req.user._id).toString()});
	});

	app.post('/login', function(req, res, next){
		passport.authenticate('local', function(err, user, info){
			if (err) return next(err);
			if (!user) return res.redirect('/sign-in');

			req.logIn(user, function(err) {
	      if (err) return next(err);
	      return res.redirect('/cabinet/' + user._id);
	    });

		})(req, res, next);
	});

  app.get('/auth/vkontakte', 
  	passport.authenticate('vkontakte', { scope: ['email'] }), function(req, res){
  	});

  app.get('/auth/vkontakte/callback', function(req, res, next){
  	passport.authenticate('vkontakte', function(err, user, info){
			if (err) return next(err);
			if (!user) return res.redirect('/sign-in');

			req.logIn(user, function(err) {
	      if (err) return next(err);
	      return res.redirect('/cabinet/' + user._id);
	    });

		})(req, res, next);
  });

	app.get('/log-out', function(req, res){
		req.session.destroy(function (err) {
			if (err) {
				console.log(err);
				res
					.status(500)
					.send("Internal server error, try later");
					return;
			}
		  res.redirect('/sign-in');
		});
	});

	require('./api')(app);

	app.get('*', function(req, res){
		res
			.status(404)
			.render('./404');
	});
};