const subdomain = require('express-subdomain'),
			express = require('express'),
			api = express.Router();

module.exports = function(app){

	app.set('view engine', 'jade');
	app.use(express.static('public'));
	app.use(subdomain('api', api));

	require('./api')(api);

	app.get('*', function(req, res){
		res
			.status(404)
			.render('./404');
	});
};