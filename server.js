var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var numPlayers=0;
var NUM_SNAPSHOTS=5;
var snapshotTimestamp=[];
var playerPositionX=[];
var playerPositionY=[];
var playerPositionZ=[];
var playerRotationY=[];

// Log the requests
 app.use(express.logger('dev'));

// Serve static files
 app.use(express.static(path.join(__dirname, 'public')));

io.sockets.on('connection', function (socket) {

  //code to set up new connection
   socket.set('pid', numPlayers);
   socket.emit("id", numPlayers);
   
   snapshotTimestamp[numPlayers]=[];
   playerPositionX[numPlayers]=[];
   playerPositionY[numPlayers]=[];
   playerPositionZ[numPlayers]=[];
   playerRotationY[numPlayers]=[];

   snapshotTimestamp[numPlayers][0]=new Date().getTime();
   playerPositionX[numPlayers][0]=0;
   playerPositionY[numPlayers][0]=0;
   playerPositionZ[numPlayers][0]=0;
   playerRotationY[numPlayers][0]=0;

   numPlayers++;

   sendFullPos(socket);


   socket.on('chat', function(data) {io.sockets.emit("chat", data)});
   socket.on('fPos', function(data){
          var id = data[0];
          var snapshot=NUM_SNAPSHOTS-1;
          while (snapshot>0)
          {
              snapshotTimestamp[id][snapshot] = snapshotTimestamp[id][snapshot-1];
              otherPosX[id][snapshot] = otherPosX[id][snapshot-1];
              otherPosY[id][snapshot] = otherPosX[id][snapshot-1];
              otherPosZ[id][snapshot] = otherPosX[id][snapshot-1];
              otherRotY[id][snapshot] = otherPosX[id][snapshot-1];
          }
          snapshotTimestamp[id][0] = data[1];
          playerPositionX[id][0]=data[2];
          playerPositionY[id][0]=data[3];
          playerPositionZ[id][0]=data[4];
          playerRotationY[id][0]=data[5];
      });
    socket.on('disconnect', function () {
          io.sockets.emit('dc', socket.get('pid'));
    });

    setInterval(mainLoop, 50);
});

// Route for everything else.
 app.get('*', function(req, res){
    res.send(404);//render('public/404.html');
   });

// Fire it up!
server.listen(8080);




function mainLoop()
{
    sendAllFullPos();
}

function sendFullPos(socket)
{  
   for (var i=0; i<numPlayers; i++)
   {
      socket.emit('fPos', [i, new Date().getTime(), playerPositionX[i], playerPositionY[i], 
                               playerPositionZ[i], playerRotationY[i]]);
   }
}

function sendAllFullPos()
{
    io.sockets.emit('fPos', [i, new Date().getTime(), playerPositionX[i], playerPositionY[i], 
                               playerPositionZ[i], playerRotationY[i]]);
}