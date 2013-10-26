var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// Log the requests
 app.use(express.logger('dev'));

// Serve static files
 app.use(express.static(path.join(__dirname, 'public')));

io.sockets.on('connection', function (socket){
   socket.emit('chat',  'world' );
   socket.on('inc', function(data) {io.sockets.emit("chat", data)});
});

// Route for everything else.
 app.get('*', function(req, res){
    res.send(404);//render('public/404.html');
   });

// Fire it up!
server.listen(8080);
