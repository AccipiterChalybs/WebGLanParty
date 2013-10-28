var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var numPlayers=0;
var NUM_SNAPSHOTS=5;
var playerConnected=[];
var snapshotTimestamp=[];
var playerPositionX=[];
var playerPositionY=[];
var playerPositionZ=[];
var playerRotationY=[];

var numBullets=0;
var START_BULLET_LIFE=3000;
var BULLET_SPEED = 0.1;
var BULLET_HEADSTART_TIME = 100;
var COLLISION_DIST = 5;
var bulletPositionX=[];
var bulletPositionY=[];
var bulletPositionZ=[];
var bulletRotationX=[];
var bulletRotationY=[];
var bulletLife=[];

var LOOP_RATE=30;

var DECIMAL_ROUND_VALUE = 100; // = 10 ^ (x) where x is number of decimal points to keep

var lastTime=0;

// Log the requests
 app.use(express.logger('dev'));

// Serve static files
 app.use(express.static(path.join(__dirname, 'public')));

io.sockets.on('connection', function (socket) {

  //code to set up new connection
   socket.set('pid', numPlayers, function (data) {/*callback*/});
   socket.emit("id", numPlayers);
   
   playerConnected[numPlayers] = true;
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
    socket.on('nb', function(data){
          var id = data[0];
          bulletPositionX[numBullets]=data[2];
          bulletPositionY[numBullets]=data[3];
          bulletPositionZ[numBullets]=data[4];
          bulletRotationX[numBullets]=data[5];
          bulletRotationY[numBullets]=data[6];

          moveBullet(numBullets, BULLET_HEADSTART_TIME);

          bulletLife[numBullets] = START_BULLET_LIFE;

          numBullets++;
      });
    socket.on('disconnect', function () {
          socket.get('pid', function (err, pid) {
            playerConnected[pid] = false;
            io.sockets.emit('dc', pid);
          });
    });
});

// Route for everything else.
 app.get('*', function(req, res){
    res.send(404);//render('public/404.html');
   });

lastTime = new Date().getTime();

setInterval(function(){mainLoop()}, LOOP_RATE);

// Fire it up!
server.listen(8080);




function mainLoop()
{
    var dt = new Date().getTime() - lastTime;
    lastTime = new Date().getTime();
    moveBullets(dt);
    sendAllFullPos();
    sendAllBullets();
}

function moveBullets(dt)
{
     for (var b=0; b < numBullets; b++)
     {
        if (bulletLife[b]>0)
        {
            moveBullet(b, dt);
            for (var p=0; p<numPlayers; p++)
            {
                checkCollision(b, p);
            }
        }
     }    
}

function moveBullet(b, dt)
{
        bulletLife[b]-=dt;

        //rotations are in degress, so convert them into radians
        var horizontalMove = BULLET_SPEED * Math.cos(Math.PI*bulletRotationX[b]/180);

        bulletPositionY[b] += -1*BULLET_SPEED * Math.sin(Math.PI*bulletRotationX[b]/180) * dt;

        bulletPositionX[b] += horizontalMove * Math.sin(Math.PI*bulletRotationY[b]/180) * dt;

        bulletPositionZ[b] += -horizontalMove * Math.cos(Math.PI*bulletRotationY[b]/180) * dt;
}

function checkCollision(b, p)
{
    var distX = bulletPositionX[b] - playerPositionX[p][0];
    var distY = bulletPositionY[b] - playerPositionY[p][0];
    var distZ = bulletPositionZ[b] - playerPositionZ[p][0];

    if (Math.sqrt(distX*distX + distY * distY + distZ*distZ)<COLLISION_DIST)
    {
        io.sockets.emit("hit", p);
    }
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
        if (playerConnected[i])
        {
            io.sockets.emit('fPos', [i, new Date().getTime(), roundData(playerPositionX[i][0]), 
              roundData(playerPositionY[i][0]), roundData(playerPositionZ[i][0]), 
              roundData(playerRotationY[i][0]) ]);
        }
    }
}

 function sendAllBullets()
 {
     for (var b=0; b < numBullets; b++)
     {
        if (bulletLife[b]>0)
        {
            io.sockets.emit('bPos', [b, new Date().getTime(), roundData(bulletPositionX[b]), 
                      roundData(bulletPositionY[b]), roundData(bulletPositionZ[b]) ]);
        }
     }
 }

function roundData (value)
{
    value = value * DECIMAL_ROUND_VALUE;
    value = Math.round(value);
    value = value / DECIMAL_ROUND_VALUE;
    return value;
}
