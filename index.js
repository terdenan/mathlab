const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      config = require('config.json')('./config.json'),
      mongoose = require('mongoose'),
      io = require('socket.io')(http),

      subdomain = require('express-subdomain'),
      admin = express();

app.use(subdomain('admin', admin));

require('./db/db');

require('./routers/app')(app);
require('./routers/admin')(admin);

io.on('connection', function(socket){
});

http.listen(config.httpPort, function(){
  console.log('MathLab is listening on port ' + config.httpPort);
});