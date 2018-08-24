const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      config = require('config.json')('./config.json'),
      mongoose = require('mongoose'),
      io = require('socket.io')(http),
      compression = require('compression'),

      subdomain = require('express-subdomain'),
      admin = express(),
      teacher = express();

const ObjectId = require('mongodb').ObjectID,
			Message = require('./db/models/message');

const TelegramBot = require('node-telegram-bot-api'),
			bot = new TelegramBot(config.telegram.token, {polling: true});


app.use(subdomain('admin', admin));
app.use(subdomain('t', teacher));
app.use(compression());

app.use(function(req, res, next){
	res.io = io;
	next();
});
teacher.use(function(req, res, next){
	res.io = io;
	next();
});

require('./db/db');

require('./routers/app')(app, bot);
require('./routers/admin')(admin);
require('./routers/teacher')(teacher);

require('./routers/telegramBot')(bot);

io.on('connection', function(socket){
	socket.on('setRoom', function(courseId){
		socket.join(courseId);
	});
	socket.on('sendMessage', function(data){
		socket.broadcast.to(data.courseId).emit('newMessage', data.message);
	});
	socket.on('accepted', function(data){
		Message.update({ _id: ObjectId(data._message_id) }, 
				{ $set: { read_state: true } }, function(err){
					if (err) {
						console.log(err);
					}
					socket.broadcast.to(data.courseId).emit('markReaded');
		});
	});
});

http.listen(config.httpPort, function(){
  console.log('MathLab is listening on port ' + config.httpPort);
});