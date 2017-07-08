const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      config = require('config.json')('./config.json'),
      mongoose = require('mongoose'),
      io = require('socket.io')(http),

      subdomain = require('express-subdomain'),
      admin = express(),
      teacher = express();

app.use(function(req, res, next){
	res.io = io;
	next();
});
teacher.use(function(req, res, next){
	res.io = io;
	next();
});
app.use(subdomain('admin', admin));
app.use(subdomain('t', teacher));

require('./db/db');

require('./routers/app')(app);
require('./routers/admin')(admin);
require('./routers/teacher')(teacher);

io.on('connection', function(socket){
	socket.on('setRoom', function(courseId){
		socket.join(courseId);
	});
	socket.on('sendMessage', function(data){
		socket.broadcast.to(data.courseId).emit('newMessage', data.message);
	});
});

http.listen(config.httpPort, function(){
  console.log('MathLab is listening on port ' + config.httpPort);
});