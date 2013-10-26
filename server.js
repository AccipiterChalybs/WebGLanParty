var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var numPlayers=0;
var playerPositionX=[];
var playerPositionY=[];
var playerPositionZ=[];

// Log the requests
 app.use(express.logger('dev'));

// Serve static files
 app.use(express.static(path.join(__dirname, 'public')));

io.sockets.on('connection', function (socket) {
   socket.emit("id", numPlayers);
   playerPositionX[numPlayers]=0;
   playerPositionY[numPlayers]=0;
   playerPositionZ[numPlayers]=0;
   numPlayers++;
   for (var i=0; i<numPlayers; i++)
   {
      socket.emit('fPos', [i, playerPositionX[i], playerPositionY[i], playerPositionZ[i]]);
   }
   socket.on('chat', function(data) {io.sockets.emit("chat", data)});
   socket.on('fPos', function(data){
          playerPositionX=data[0];
          playerPositionY=data[1]
          playerPositionZ=data[2];
          io.sockets.emit('fPos', data)
      });
});

// Route for everything else.
 app.get('*', function(req, res){
    res.send(404);//render('public/404.html');
   });

// Fire it up!
server.listen(8080);
