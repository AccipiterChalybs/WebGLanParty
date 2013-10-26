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
   socket.set('pid', numPlayers, function (data) {/*callback*/});
   socket.emit("id", numPlayers);
   
   snapshotTimestamp[numPlayers]=[];
   playerPositionX[numPlayers]=[];
   playerPositionY[numPlayers]=[];
   playerPositionZ[numPlayers]=[];
   playerRotationY[numPlayers]=[];

   for (var i=0; i<NUM_SNAPSHOTS; i++)
   {
       snapshotTimestamp[numPlayers][i]=new Date().getTime();
       playerPositionX[numPlayers][i]=0;
       playerPositionY[numPlayers][i]=0;
       playerPositionZ[numPlayers][i]=0;
       playerRotationY[numPlayers][i]=0;
   }

   numPlayers++;

   sendFullPos(socket);


   socket.on('chat', function(data) {io.sockets.emit("chat", data)});
   socket.on('fPos', function(data){
          var id = data[0];
          var snapshot=NUM_SNAPSHOTS-1;
          while (snapshot>0)
          {
              snapshotTimestamp[id][snapshot] = snapshotTimestamp[id][snapshot-1];
              playerPositionX[id][snapshot] = playerPositionX[id][snapshot-1];
              playerPositionY[id][snapshot] = playerPositionY[id][snapshot-1];
              playerPositionZ[id][snapshot] = playerPositionZ[id][snapshot-1];
              playerRotationY[id][snapshot] = playerRotationY[id][snapshot-1];
              snapshot--;
          }
          snapshotTimestamp[id][0] = data[1];
          playerPositionX[id][0]=data[2];
          playerPositionY[id][0]=data[3];
          playerPositionZ[id][0]=data[4];
          playerRotationY[id][0]=data[5];
      });
    socket.on('disconnect', function () {
          socket.get('pid', function (data) {
            io.sockets.emit('dc', data);
          });
    });
});

// Route for everything else.
 app.get('*', function(req, res){
    res.send(404);//render('public/404.html');
   });


setInterval(function(){mainLoop()}, 50);

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
      socket.emit('fPos', [i, new Date().getTime(), playerPositionX[i][0], playerPositionY[i][0], 
                               playerPositionZ[i][0], playerRotationY[i][0]]);
   }
}

function sendAllFullPos()
{
    for (var i=0; i<numPlayers; i++)
    {
        io.sockets.emit('fPos', [i, new Date().getTime(), playerPositionX[i][0], playerPositionY[i][0], 
                               playerPositionZ[i][0], playerRotationY[i][0]]);
    }
}