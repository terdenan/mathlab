const http = require('http'),
			express = require('express'),
			compression = require('compression'),
			passport = require('passport'),

			bcrypt = require('bcrypt'),

			cookieParser = require('cookie-parser'),
			bodyParser = require('body-parser'),
			session = require('express-session'),
			flash = require('connect-flash'),

			LocalStrategy = require('passport-local').Strategy,

			MongoClient = require('mongodb').MongoClient,
			ObjectId = require('mongodb').ObjectID,
			MongoStore = require('connect-mongo')(session),
			mongoose = require('mongoose'),

			moment = require('moment');

mongoose.Promise = require('bluebird');

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

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
    done(err, user);
  });
});

module.exports = function(admin){

	function errorHandler(err, req, res, statusCode, errMessage){
		if (err) console.log(err);
		res
			.status(statusCode)
			.send(errMessage);
	}
	admin.locals.moment = require('moment');

	admin.set('view engine', 'jade');
	admin.set('views', path.join(__dirname, '../views/admin'));
	admin.use(express.static('admin'));
	admin.use(compression());

	admin.use(cookieParser());
	admin.use(bodyParser.urlencoded({ extended: true }));
	admin.use(bodyParser.json());
	admin.use(session(
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
	admin.use(passport.initialize());
	admin.use(passport.session());

	admin.use(flash());

	admin.get('/', function(req, res){
		res
			.status(200)
			.render('./index');
	});

	admin.get('/bids', function(req, res){
		res
			.status(200)
			.render('./bids');
	});

	admin.get('/teacher-form', function(req, res){
		res
			.status(200)
			.render('./teacher-form');
	});

	admin.get('/api/bid', function(req, res){
		Bid.
	    find({
	      _id: {$lt: ObjectId(req.query.lastID)}
	    }).
	    select('_id student studentId subject prefDays prefTime date target phone status').
	    sort({date: -1}).
	    limit(10).
	    exec(function(err, data){
	      if (err) {
	      	errorHandler(err, req, res, 500, "Internal server error, try later");
	      	return;
	      }
	      res.send(data);
	    });
	});

	admin.post('/api/bid', function(req, res){
		Bid.update({ _id: ObjectId(req.body.id) }, req.body.fields, function(err){
			if (err) {
				errorHandler(err, req, res, 500, "Internal server error, try later");
	      return;
			}
			res
				.status(200)
				.send('success');
		});
	});

	admin.get('/api/teachers', function(req, res){
		User.find({priority: 1}, '_id fullname', function(err, data){
	    if (err) {
	    	errorHandler(err, req, res, 500, "Internal server error, try later");
	    	return;
	    }
	    res.send(data);
	  });
	});

	admin.put('/api/teacher', function(req, res){
		User.findOne({email: req.body.email}, function(err, user){
	    if (user) {
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
          sex: (req.body.sex == "Мужской") ? 0 : 1,
          confirmed: false,
          priority: 1,
          subject: req.body.subject
        });
        newUser.save(function(err){
          if(err) {
          	errorHandler(err, req, res, 500, "Internal server error, try later");
          	return;
          }
          res
          	.status(200)
          	.send('success');
        }); 
      });
	  });
	});

	admin.put('/api/course', function(req, res){
	  var newCourse = Course({
	    subject: req.body.subject,
	    student: req.body.student,
	    _student_id: ObjectId(req.body.studentId),
	    teacher: req.body.teacher,
	    _teacher_id: ObjectId(req.body.teacherId),
	    days: req.body.days,
	    time: req.body.time,
	    startingDate: Date.now(),
	    endingDate: moment( Date.now() ).add(1, 'months').toDate()
	  });
	  User.find({ $or: [ { _id: ObjectId(req.body.studentId) }, { _id: ObjectId(req.body.teacherId) } ] }, function(err, data){
	  	if (err) {
	  		errorHandler(err, req, res, 500, "Internal server error, try later");
	  		return;
	  	}
	  	if (data[0].priority == 0) {
	  		newCourse.studentAvatarUrl = data[0].avatarUrl;
	  		newCourse.teacherAvatarUrl = data[1].avatarUrl;
	  	} else {
	  		newCourse.studentAvatarUrl = data[1].avatarUrl;
	  		newCourse.teacherAvatarUrl = data[0].avatarUrl;
	  	}
	  	newCourse.save(function(err){
	  		if (err) {
	  			errorHandler(err, req, res, 500, "Internal server error, try later");
	  			return;
	  		}
	  		res
	  			.status(200)
	  			.send('success');
	  	});
	  });
	});

	admin.get('/log-out', function(req, res){
		req.session.destroy(function (err) {
			if (err) {
				errorHandler(err, req, res, 500, "Internal server error, try later");
				return;
			}
		  res.redirect('/sign-in');
		});
	});
};