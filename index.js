const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      config = require('config.json')('./config.json'),
      mongoose = require('mongoose');
      io = require('socket.io')(http);

require('./db/db');

require('./routers/app')(app);

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(config.httpPort, function(){
  console.log('MathLab is listening on port ' + config.httpPort);
});