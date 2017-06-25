const subdomain = require('express-subdomain'),
			express = require('express'),
			api = express.Router(),
			compression = require('compression'),
			passport = require('passport'),
			cookieParser = require('cookie-parser'),
			bodyParser = require('body-parser'),
			session = require('express-session'),
			flash = require('connect-flash'),
			LocalStrategy = require('passport-local').Strategy,
			VKontakteStrategy = require('passport-vkontakte').Strategy;

passport.use(new LocalStrategy(
  function(username, password, done) {
  	if (username != 'denis' || password != '123123') return done(null, false, {message: 'Incorrect'});
		return done(null, {'username': username, 'password': password});

  }
));

passport.use(new VKontakteStrategy(
  {
    clientID:     VKONTAKTE_APP_ID, // VK.com docs call it 'API ID', 'app_id', 'api_id', 'client_id' or 'apiId'
    clientSecret: VKONTAKTE_APP_SECRET,
    callbackURL:  "http://localhost:3000/auth/vkontakte/callback"
  },
  function myVerifyCallbackFn(accessToken, refreshToken, params, profile, done) {
  	//CODE
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(id, done) {
	done(null, {'username': 'denis', 'password': '123123'});
});

module.exports = function(app){

	app.set('view engine', 'jade');
	app.use(express.static('public'));
	app.use(subdomain('api', api));
	app.use(compression());

	app.use(cookieParser());
	app.use(bodyParser());
	app.use(session({ secret: 'keyboard cat' }));
	app.use(passport.initialize());
	app.use(passport.session());

	app.use(flash());

	app.get('/', function(req, res){
		res
			.status(200)
			.render('./index');
	});

	app.get('/sign-in', function(req, res){
		res
			.status(200)
			.render('./sign-in', {message: req.flash('error')});
	});

	app.get('/sign-up', function(req, res){
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

	app.get('/cabinet', function(req, res){
		res
			.status(200)
			.render('./cabinet', {fullname: "Denis Tereschenko", email: "terdenan@gmail.com", 
				grade: "11", photoURL: "/images/teacher-img-1.jpg", phone: "+7 777 756-90-36",
				courses: [
					{
						id: "123123",
						teacherId: "123456",
						teacher: "Галия Мрзановна",
						subject: "Математика"
					},
					{
						id: "123123",
						teacherId: "123456",
						teacher: "Галия Мрзановна",
						subject: "Математика"
					},
				]});
	});

	app.get('/success', function(req, res){
		console.log(req.user);
		/*req.session.destroy(function (err) {
	    res.redirect('/sign-in');
	  });*/
		res.send("NICE!!!");
	});

	app.post('/login', passport.authenticate('local', 
	{ 
		successRedirect: '/success',
  	failureRedirect: '/sign-in',
  	failureFlash: true 
  }));

  app.get('/auth/vkontakte', passport.authenticate('vkontakte'));

  app.get('/auth/vkontakte/callback',
	  passport.authenticate('vkontakte', {
	    successRedirect: '/',
	    failureRedirect: '/login' 
	  })
	);

	app.get('*', function(req, res){
		res
			.status(404)
			.render('./404');
	});

	require('./api')(api);
};