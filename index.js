const express = require('express'),
      app = express(),
      http = require('http'),
      config = require('config.json')('./config.json');

require('./app')(app);

app.listen(config.httpPort, function () {
	console.log('MathLab is listening at ' + config.httpPort);
})