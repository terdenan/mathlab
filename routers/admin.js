const http = require('http'),
			express = require('express'),
			compression = require('compression'),
			passport = require('passport'),
			config = require('config.json')('./config.json'),
			serveStatic = require('serve-static'),
			multer = require('multer'),

			bcrypt = require('bcrypt'),
			helmet = require('helmet'),

			fs = require('fs'),
			xml2js = require('xml2js'),

			cookieParser = require('cookie-parser'),
			bodyParser = require('body-parser'),
			session = require('express-session'),
			flash = require('connect-flash'),
			cyrillicToTranslit = require('cyrillic-to-translit-js'),

			LocalStrategy = require('passport-local').Strategy,

			MongoClient = require('mongodb').MongoClient,
			ObjectId = require('mongodb').ObjectID,
			MongoStore = require('connect-mongo')(session),
			mongoose = require('mongoose'),

			moment = require('moment');

mongoose.Promise = require('bluebird');

const User = require('../db/models/user'),
	  Bid = require('../db/models/bid'),
	  News = require('../db/models/news'),
	  Course = require('../db/models/course');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
    	cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
    	cb(null, Date.now() + "-" + (file.originalname));
    }
});
upload = multer({ storage: storage });

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
		if (err && err != "timeError" && err != "dataError") {
			console.log(err);
			bot.sendMessage(298493325, "Monsieur, there is new error on server...");
		}
		res
			.status(statusCode)
			.send(errMessage);
	}
	admin.locals.moment = require('moment');

	admin.set('view engine', 'jade');
	admin.set('views', path.join(__dirname, '../views/admin'));
	admin.use(serveStatic('admin'));
	admin.use(compression());
	admin.use(helmet());

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

	admin.get('/sign-in', function(req, res){
		if (req.user) {
			res.redirect('/');
			return;
		}
		res
			.status(200)
			.render('./sign-in', {message: req.flash('error')});
	});

	admin.get('/', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		res
			.status(200)
			.render('./index');
	});

	admin.get('/bids', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		res
			.status(200)
			.render('./bids');
	});

	admin.get('/teachers', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		res
			.status(200)
			.render('./teachers');
	});

	admin.get('/news', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		res
			.status(200)
			.render('./news');
	});

	admin.get('/students', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		res
			.status(200)
			.render('./students');
	});

	admin.get('/courses', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		res
			.status(200)
			.render('./courses');
	});

	admin.get('/teacher-form', function(req, res){
		if (!req.user){
			res.redirect('/sign-in');
			return;
		}
		res
			.status(200)
			.render('./teacher-form');
	});

	admin.post('/api/note', upload.single('file'), function(req, res) {
		let title = cyrillicToTranslit().transform(req.body.title.toLowerCase(), '-');
		title = title.replace(/[^a-z0-9\-]/gi, "");
		var newPost = News({
          title: title,
          cyrillicTitle: req.body.title,
          description: req.body.description,
		  body: req.body.body,
		  photoUrl: "/uploads/" + req.file.filename,
		  date: Date.now()
        });
        newPost.save(function(err) {
        	if (err) {
	          	errorHandler(err, req, res, 500, "Internal server error, try later");
	          	return;
	        }

	        var parser = new xml2js.Parser();
			var builder = new xml2js.Builder();
			var sitemapPath = path.join(__dirname, "..", "public", "sitemap.xml");

			fs.readFile(sitemapPath, function(err, data) {
			    var obj = {
			        loc: "https://mathlab.kz/news/" + title,
			        lastmod: moment().format(),
			        changefreq: "monthly",
			        priority: "0.70"
			    };
			    parser.parseString(data, function (err, result) {
			        result.urlset.url.push(obj);
			        var newXml = builder.buildObject(result);
			        fs.writeFile(sitemapPath, newXml, function(err) {
			        	res
				        	.status(200)
				          	.send('success');
			        });
			    });
			});
        });
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
	});

	admin.post('/api/loadStudents', function (req, res){
	  User.
	    find({
	      $and: [ { _id: {$gt: mongoose.Types.ObjectId(req.body.lastID)} }, { priority: 0 } ]
	    }).
	    select('_id email fullname phone sex grade confirmed').
	    //limit(10).
	    exec(function(err, data){
	      if (err) {
        	errorHandler(err, req, res, 500, "Internal server error, try later");
        	return;
        }
	      res.send(data);
	    });
	});

	admin.post('/api/loadTeachers', function (req, res){
	  User.
	    find({
	      $and: [ { _id: {$gt: mongoose.Types.ObjectId(req.body.lastID)} }, { priority: 1 } ]
	    }).
	    select('_id email fullname phone sex subject').
	    //limit(10).
	    exec(function(err, data){
	      if (err) {
        	errorHandler(err, req, res, 500, "Internal server error, try later");
        	return;
        }
	      res.send(data);
	    });
	});

	admin.post('/api/loadCourses', function (req, res){
	  Course.
	    find({
	      _id: { $gt: mongoose.Types.ObjectId(req.body.lastID) }
	    }).
	    select('_id subject student teacher days time startingDate endingDate').
	    //limit(10).
	    exec(function(err, data){
	      if (err) {
        	errorHandler(err, req, res, 500, "Internal server error, try later");
        	return;
        }
	      res.send(data);
	    });
	});

	admin.post('/api/extendCourse', function (req, res){
	  Course.findOne({_id: mongoose.Types.ObjectId(req.body.courseId)}, function(err, data){
	    if (err) {
      	errorHandler(err, req, res, 500, "Internal server error, try later");
      	return;
      }
	    data.endingDate = moment(data.endingDate).add(1, 'months').toDate();
	    data.save(function(err){
	      if (err) {
        	errorHandler(err, req, res, 500, "Internal server error, try later");
        	return;
        }
	      res.send('Success');
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

	admin.post('/login',
	  passport.authenticate('local', { successRedirect: '/',
	                                   failureRedirect: '/sign-in',
	                                   failureFlash: "fail" })
	);

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
