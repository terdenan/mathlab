module.exports = function(api) {

	api.get('/getInfo', function(req, res){
		res
			.status(200)
			.send('It works!');
	});

	api.get('*', function(req, res){
		res
			.status(404)
			.send('Not found');
	});

}