const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      config = require('config.json')('./config.json'),
      mongoose = require('mongoose'),
      io = require('socket.io')(http),

      subdomain = require('express-subdomain'),
      admin = express(),
      teacher = express(),
      nodemailer = require('nodemailer');

const ObjectId = require('mongodb').ObjectID,
			Message = require('./db/models/message');

const	smtpTransport = nodemailer.createTransport("SMTP",{
			    service: "Gmail",
			    auth: {
			        user: "humbledevelopers@gmail.com",
			        pass: "87051605199Dd"
			    }
			});
const mailOptions = {
    from: '"Fred Foo 👻" <humbledevelopers@bgmail.com>', // sender address
    to: 'terdenan@gmail.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plain text body
    html: '<b>Hello world ?</b>' // html body
};

smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
});

app.use(subdomain('admin', admin));
app.use(subdomain('t', teacher));

app.use(function(req, res, next){
	res.io = io;
	next();
});
teacher.use(function(req, res, next){
	res.io = io;
	next();
});

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