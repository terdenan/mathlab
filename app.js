const express = require('express'),
			subdomain = require('express-subdomain'),
			router = express.Router();

module.exports = function(app){

	app.set('view engine', 'jade');
	app.use(express.static('public'));
	app.use(subdomain('teacher', router));

	app.get('/redirect', function(req, res){
		console.log('Here');
		res.redirect('http://teacher.mysite.com');
	});

	router.get('/asd', function(req, res){
		console.log('Here2');
		res.send('asdasd');
	});

	app.get('*', function(req, res){
		res.status(404).render('./404');
	});
};