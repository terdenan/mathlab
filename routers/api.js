module.exports = function(api) {

	api.use(function(req, res, next){
		res.set('Access-Control-Allow-Origin', '*');
		next();
	});

	api.get('/getInfo', function(req, res){
		res
			.status(200)
			.send('It works!');
	});

	api.get('*', function(req, res){
		console.log('here');
		res
			.status(404)
			.send('Not found');
	});

}