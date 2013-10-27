var SERVER_ADDRESS = 'http://ec2-54-215-232-7.us-west-1.compute.amazonaws.com/';
var socket;

var chatMessage = "";
var inputConsole;
var chatConsole;
var shiftDown = false;
var typingMessage = false;

var leftPressed = false;
var rightPressed = false;
var upPressed = false;
var downPressed = false;
var spacePressed = false;
var leftMouseDown = false;
var middleMouseDown = false;
var rightMouseDown = false;

var gl; //webGL object
var canvas; //HTML5 canvas object that uses webGL

var vertexBuffer=[]; //buffer to hold vertices
var normalBuffer=[]; //buffer to hold vertex normals
var textureBuffer=[]; //buffer to hold texture coordinates
var tangentBuffer=[];
var indexBuffer=[]; //buffer to hold vertex indices

var glProgram; //program holding the shaders

var vertexPositionAttribute; //pointer to vertexPosition in the shader
var vertexNormalAttribute; //pointer to vertexNormal in the shader
var vertexTextureAttribute; //pointer to vertexTexture in the shader
var vertexTangentAttribute;

var pUniform; //perspective matrix
var nUniform; //normal matrix
var mvUniform; //model-view matrix

var samplerUniform;
var normalMapUniform;

var lightNum=2;
var lightPositionUniform=[];
var lightMaterialUniform=[];
var lightDistanceUniform=[];
var LIGHT_HEIGHT=21;
var LIGHT_DIST=[200,                //player light
                142];               //power ups
var lightMaterial=[1.0,1.0,1.0,     //player light
                   0.0,0.0,1.0,    //power up 1 (speed up)
                   1.0,0.0,0.0,
                   0.0,0.0,0.0,    //power-up 1
                   1.0,1.0,1.0,    //power-up 1
                   1.0,1.0,0.0];

var lightingDisabledUniform;
var texCoordAddUniform;

var kernelUniform;
var bloomBufferSizeUniform;

var perspectiveMatrix; //perspective matrix

var lastUpdateTime = 0; //time of the last frame, used for game logic.
var text;
var texture=[]; //holds all textures
var image=[]; //holds all images for textures
var leftPressed=false, upPressed=false, rightPressed=false, downPressed=false; //holds key presses: false means key is not pressed, true means key is being pressed down

var fuzzyBear=0;

var CAMERA_MAX=400;

var startX=8, startY=7;

var A_STAR_DIST=10;
var aStarSuccess=false;
    var open=[];
    var fScore=[];
    var gScore=[];
    var nodeParentX=[];
    var nodeParentY=[];
var E_MOVE_EPSILON=0.2;
var MOVES_UNTIL_RECALCULATE_PATH=5;

paused=false;

var RENDER_TIME_DELAY = 100; // render this many milliseconds back to reduce lag.

//score
var score=0;

//textures
var RIFLE_TEXTURE=0;
var PLAYER_TEXTURE=1;
var BACKGROUND_TEXTURE=2;

//objects
var MAX_OBJ=3;

RIFLE_OBJ=0;
PLAYER_OBJ=1;
BG_OBJ=2;

//audio
var soundPlayer=[];
var AUDIO_MUSIC = 0;
var AUDIO_ITEM = 1;
var AUDIO_HIT_BY_ENEMY = 2;

//camera vars
var CAMERA_Y_ROTATION_SPEED=0.2;
var CAMERA_X_ROTATION_SPEED=0.2;
var CAMERA_MOVE_SPEED = 0.05;
var CAMERA_X_BOUND=88;
var camRotX = 0;
var camRotY = 0;
var camX=0; camY=0; camZ=0;

//player vars
var playerName="";
var playerId=0; //initialize it to this for now.
var MIN_POS_Y=11;
var posX=0,posY=MIN_POS_Y, posZ=0;
var PlayerYAccel=0;
var JUMP_ACCEL=1;

var xRotation=0.0;
var yRotation=0.0;
var playerObj=RIFLE_OBJ;
var playerTexture=RIFLE_TEXTURE;

//other player vars
var otherPlayerObj=PLAYER_OBJ;
var otherPlayerDisconnected=[];
var NUM_SNAPSHOTS = 5;
var snapshotTimestamp=[];
var otherPosX=[];
var otherPosY=[];
var otherPosZ=[];
var otherRotY=[];
var otherPlayerTexture=PLAYER_TEXTURE;
var numPlayers=0;

//bullet vars
var numBullets=0;
var bSnapshotTimestamp=[];
var bPosX=[];
var bPosY=[];
var bPosZ=[];
var reloadTime=0;
var bulletObj = RIFLE_OBJ;
var bulletTexture = RIFLE_TEXTURE;

//background vars
var backgroundObj=BG_OBJ;
var backgroundTexture=BACKGROUND_TEXTURE;
var MAP_SCALE=10;

//light vars
var lightTime=0;
var LIGHT_MOVE_RADIUS = 50;
var LIGHT_MOVE_SPEED = 0.0005;

var fps=0;
var lastFPSCheck;

function start()
{
    socket = io.connect(SERVER_ADDRESS);
    socket.on('id', function (data) {
        playerId = data;
    });
    socket.on('fPos', function (data) {

        var incId = data[0];
        while (incId+1 > numPlayers)
        {
           snapshotTimestamp[numPlayers]=[];
           otherPosX[numPlayers]=[];
           otherPosY[numPlayers]=[];
           otherPosZ[numPlayers]=[];
           otherRotY[numPlayers]=[];
           numPlayers++;
        }
        if (incId!=playerId)
        {
            var snapshot=NUM_SNAPSHOTS-1;
            while (snapshot>0)
            {
                snapshotTimestamp[incId][snapshot] = snapshotTimestamp[incId][snapshot-1];
                otherPosX[incId][snapshot] = otherPosX[incId][snapshot-1];
                otherPosY[incId][snapshot] = otherPosY[incId][snapshot-1];
                otherPosZ[incId][snapshot] = otherPosZ[incId][snapshot-1];
                otherRotY[incId][snapshot] = otherRotY[incId][snapshot-1];
                snapshot--;
            }
            snapshotTimestamp[incId][0] = data[1];
            otherPosX[incId][0] = data[2];
            otherPosY[incId][0] = data[3];
            otherPosZ[incId][0] = data[4];
            otherRotY[incId][0] = data[5];
        }
        else
        {
       //     posX = data[1];
      //      posY = data[2];
      //      posZ = data[3];
        }
    });
    socket.on('bPos', function (data) {

        var incId = data[0];
        while (incId+1 > numBullets)
        {
           bSnapshotTimestamp[numBullets]=[];
           bPosX[numBullets]=[];
           bPosY[numBullets]=[];
           bPosZ[numBullets]=[];
           numBullets++;
        }
        var snapshot=NUM_SNAPSHOTS-1;
        while (snapshot>0)
        {
            bSnapshotTimestamp[incId][snapshot] = bSnapshotTimestamp[incId][snapshot-1];
            bPosX[incId][snapshot] = bPosX[incId][snapshot-1];
            bPosY[incId][snapshot] = bPosY[incId][snapshot-1];
            bPosZ[incId][snapshot] = bPosZ[incId][snapshot-1];
            snapshot--;
        }
        bSnapshotTimestamp[incId][0] = data[1];
        bPosX[incId][0] = data[2];
        bPosY[incId][0] = data[3];
        bPosZ[incId][0] = data[4];
    });
    socket.on('dc', function (data) {
        otherPlayerDisconnected[data]=true;
    })
    socket.on('chat', function (data) {
        writeTex(chatConsole, data);
    });

    inputConsole = document.getElementById("InputBox");    
    chatConsole = document.getElementById("ChatBox");

    canvas = document.getElementById("glCanvas");

    document.onkeydown = function(event) {
        keyDown(event);
    };   
    document.onkeyup = function(event) {
        keyUp(event);
    };

    document.onmousedown = function(event)
    {
        mouseDown(event);
    };

    document.onmouseup = function(event)
    {
        mouseUp(event);
    };

    //from http://www.html5rocks.com/en/tutorials/pointerlock/intro/
    var pointerLockValid = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;
    canvas.requestPointerLock = canvas.requestPointerLock ||
                     canvas.mozRequestPointerLock ||
                     canvas.webkitRequestPointerLock;
    // Ask the browser to lock the pointer
    canvas.requestPointerLock();

    // Hook pointer lock state change events
    document.addEventListener('pointerlockchange', changeCallback, false);
    document.addEventListener('mozpointerlockchange', changeCallback, false);
    document.addEventListener('webkitpointerlockchange', changeCallback, false);

    // Hook mouse move events
    document.addEventListener("mousemove", this.moveCallback, false);



    initWebGL(canvas);      // Initialize the GL context

    // Only continue if WebGL is available and working

    if (gl) 
    {
        gl.clearColor(0.0, 0.0, 0.0, 0.0);                      
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);    
        gl.cullFace(gl.BACK);                           
        gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      

        initSound();

        initShaders();

        initBuffers();

        initGame();
        setInterval(drawScene, 15);
    }
    else
    {
        placeHolder = document.getElementById("placeHolderA");
        placeHolder.style.visibility = "visible";
    }
}

function lockPointer()
{
    canvas.requestPointerLock = canvas.requestPointerLock ||
                     canvas.mozRequestPointerLock ||
                     canvas.webkitRequestPointerLock;
    // Ask the browser to lock the pointer
    canvas.requestPointerLock();
}

function keyDown(event)
{
    var keyCode = event.keyCode;
    if (event.keyCode == 8)
    {
        event.preventDefault(); 
    }

    if (typingMessage)
    {
        if (event.keyCode == 16)
        {
            shiftDown = true;
        }
        else if (keyCode>=48 && keyCode<=57 || keyCode == 188 || keyCode==190 || keyCode == 191)
        {
            var nextCharacter;
            switch (keyCode)
            {
                case 48:
                    nextCharacter = (shiftDown) ? ")" : "0";
                    break;
                case 49:
                    nextCharacter = (shiftDown) ? "!" : "1";
                    break;
                case 50:
                    nextCharacter = (shiftDown) ? "@" : "2";
                    break;
                case 51:
                    nextCharacter = (shiftDown) ? "#" : "3";
                    break;
                case 52:
                    nextCharacter = (shiftDown) ? "$" : "4";
                    break;
                case 53:
                    nextCharacter = (shiftDown) ? "%" : "5";
                    break;
                case 54:
                    nextCharacter = (shiftDown) ? "^" : "6";
                    break;
                case 55:
                    nextCharacter = (shiftDown) ? "&" : "7";
                    break;
                case 56:
                    nextCharacter = (shiftDown) ? "*" : "8";
                    break;
                case 57:
                    nextCharacter = (shiftDown) ? "(" : "9";
                    break;
                case 188:
                    nextCharacter = (shiftDown) ? "<" : ",";
                    break;
                case 190:
                    nextCharacter = (shiftDown) ? ">" : ".";
                    break;
                case 191:
                    nextCharacter = (shiftDown) ? "?" : "/";
                    break;
            }
            chatMessage = chatMessage + nextCharacter;
            clearTex(inputConsole);
            writeTex(inputConsole, chatMessage);
        }
        else if (keyCode>=65 && keyCode<=90)
        {
            var nextCharacter = String.fromCharCode(keyCode);
            if (!shiftDown) nextCharacter = nextCharacter.toLowerCase();
            chatMessage = chatMessage+nextCharacter;
            clearTex(inputConsole);
            writeTex(inputConsole, chatMessage);    
        }
    }
    else //game playing
    {
        var keyCode = event.keyCode;
        if (keyCode == 37 || keyCode == 65) //left / A
        {
            leftPressed=true;
        }
        if (keyCode == 38 || keyCode == 87) //up / W
        {
            upPressed=true;
        }
        if (keyCode == 39 || keyCode == 68) //right / D
        {
            rightPressed=true;
        }
        if (keyCode == 40 || keyCode == 83) //down / S
        {
            downPressed=true;
        }
        if (keyCode==32)
        {
            spacePressed=true;
        }
        if (keyCode == 89) //y key pressed - switch to chat mode
        {
            chatMessage = ""; //clear chat just in case
            typingMessage = true;
        }
    }
}

function keyUp(event)
{
    var keyCode = event.keyCode;
    if (typingMessage)
    {
        if (keyCode == 13) //enter
        {
            sendChatMessage(chatMessage);
            chatMessage="";
            //message is sent, so stop typing
            typingMessage = false;
        }
        else if (keyCode==8)
        {
            chatMessage = chatMessage.substring(0,chatMessage.length-1);
            console.log(chatMessage);    
        }
        else if (keyCode==16)
        {
            shiftDown=false;
        }
        else if (keyCode==32)
        {
            chatMessage = chatMessage + " ";
        }
        clearTex(inputConsole);
        writeTex(inputConsole, chatMessage);    
    }
    else
    {
        if (keyCode == 37 || keyCode == 65) //left
        {
            leftPressed=false;
        }
        if (keyCode==38 || keyCode == 87) //up
        {
            upPressed=false;
        }
        if (keyCode==39 || keyCode == 68) //right
        {
            rightPressed=false;
        }
        if (keyCode==40 || keyCode == 83) //down
        {
            downPressed=false;
        }
        if (keyCode==32)
        {
            spacePressed=false;
        }
    }
}

function mouseDown(event)
{
    switch (event.button)
    {
        case 0:
            leftMouseDown = true;
            break;
        case 1:
            middleMouseDown = true;
            break;
        case 2:
             rightMouseDown = true;
             break;
    }
}

function mouseUp(event)
{
    switch (event.button)
    {
        case 0:
            leftMouseDown = false;
            break;
        case 1:
            middleMouseDown = false;
            break;
        case 2:
             rightMouseDown = false;
             break;
    }
}

function sendChatMessage(messageText)
{
    socket.emit('chat',  messageText);
}

function clearTex( textBox )
{
    while(textBox.childNodes.length>=1)
    {
        textBox.removeChild(textBox.firstChild)
    }
}

function writeTex(textBox, stringS)
{
    textBox.appendChild(textBox.ownerDocument.createTextNode(stringS));
    var linebreak = document.createElement('br');
    textBox.appendChild(linebreak);
}

/* From http://www.html5rocks.com/en/tutorials/pointerlock/intro/
 */
function changeCallback()
{
  if (document.pointerLockElement === canvas ||
      document.mozPointerLockElement === canvas ||
      document.webkitPointerLockElement === canvas) {
      // Pointer was just locked
      // Enable the mousemove listener
      document.addEventListener("mousemove", this.moveCallback, false);
    } else {
      // Pointer was just unlocked
      // Disable the mousemove listener
      document.removeEventListener("mousemove", this.moveCallback, false);
    }
}

/* Partly From http://www.html5rocks.com/en/tutorials/pointerlock/intro/
 */
function moveCallback(e) {
  var movementX = e.movementX ||
      e.mozMovementX          ||
      e.webkitMovementX       ||
      0;
  var movementY = e.movementY ||
      e.mozMovementY      ||
      e.webkitMovementY   ||
      0;

   yRotation+=movementX*CAMERA_Y_ROTATION_SPEED; //movement on x = rotation around y axis
   xRotation+=movementY*CAMERA_X_ROTATION_SPEED; //movement on y = rotation around x axis
//keep it in bounds
   if (xRotation>CAMERA_X_BOUND) xRotation = CAMERA_X_BOUND;
   if (xRotation<-CAMERA_X_BOUND) xRotation = -CAMERA_X_BOUND;
}

/* Code From:
 * https://developer.mozilla.org/en-US/docs/Web/WebGL/Getting_started_with_WebGL
 */
function initWebGL(canvas) {
    // Initialize the global variable gl to null.
    gl = null;

    try {
        // Try to grab the standard context. If it fails, fallback to experimental.
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch(e) {}
}



function initSound()
{
   soundPlayer[0] = document.getElementById("music1");
}

function playSound(sound)
{
    switch(sound)
    {
        case AUDIO_ITEM:
            soundPlayer[AUDIO_ITEM].currentTime=0;
            soundPlayer[AUDIO_ITEM].play(0);
            break;
   }
}



function initShaders() {
  var vertexShader = getShader(gl, "shader-vs");
  var fragmentShader = getShader(gl, "shader-fs");
   

  glProgram = gl.createProgram();
  gl.attachShader(glProgram, vertexShader);
  gl.attachShader(glProgram, fragmentShader);
  gl.linkProgram(glProgram);
   
  if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
   
  gl.useProgram(glProgram);
   
  vertexPositionAttribute = gl.getAttribLocation(glProgram, "vertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
  
  vertexNormalAttribute = gl.getAttribLocation(glProgram, "vertexNormal");
  gl.enableVertexAttribArray(vertexNormalAttribute);
  
  vertexTextureAttribute = gl.getAttribLocation(glProgram, "vertexTexture");
  gl.enableVertexAttribArray(vertexTextureAttribute);

  //vertexTangentAttribute = gl.getAttribLocation(glProgram, "vertexTangent");
 //gl.enableVertexAttribArray(vertexTangentAttribute);
  
  pUniform = gl.getUniformLocation(glProgram, "uPMatrix"); //perspective matrix
  nUniform = gl.getUniformLocation(glProgram, "normalMatrix"); //normal matrix
  mvUniform = gl.getUniformLocation(glProgram, "uMVMatrix"); //model-view matrix
  
  lightPositionUniform[0] = gl.getUniformLocation(glProgram, "lightPosition");
  lightPositionUniform[1] = gl.getUniformLocation(glProgram, "lightPosition2");
  lightPositionUniform[2] = gl.getUniformLocation(glProgram, "lightPosition3");
  lightMaterialUniform[0] = gl.getUniformLocation(glProgram, "lightMaterial");
  lightMaterialUniform[1] = gl.getUniformLocation(glProgram, "lightMaterial2");
  lightMaterialUniform[2] = gl.getUniformLocation(glProgram, "lightMaterial3");
  lightDistanceUniform[0] = gl.getUniformLocation(glProgram, "lightDistance");
  lightDistanceUniform[1] = gl.getUniformLocation(glProgram, "lightDistance2");
  gl.uniform1f(lightDistanceUniform[0], LIGHT_DIST[0]);
  gl.uniform1f(lightDistanceUniform[1], LIGHT_DIST[1]);
  gl.uniform3f(lightMaterialUniform[0], lightMaterial[0], lightMaterial[1], lightMaterial[2]); //player Light

  samplerUniform = gl.getUniformLocation(glProgram, "sampler")
  normalMapUniform = gl.getUniformLocation(glProgram, "normalMap")  


  lightingDisabledUniform = gl.getUniformLocation(glProgram, "lightingDisabled");
  texCoordAddUniform = gl.getUniformLocation(glProgram, "texCoordAdd");
  kernelUniform = gl.getUniformLocation(glProgram, "kernel[0]");
  bloomBufferSizeUniform = gl.getUniformLocation(glProgram, "bufferTextureSize");
}

/* Code From:
 * https://developer.mozilla.org/en-US/docs/Web/WebGL/Adding_2D_content_to_a_WebGL_context
 */
function getShader(gl, id) {
  var shaderScript, theSource, currentChild, shader;
   
  shaderScript = document.getElementById(id);
   
  if (!shaderScript) {
    return null;
  }
   
  theSource = "";
  currentChild = shaderScript.firstChild;
   
  while(currentChild) {
    if (currentChild.nodeType == currentChild.TEXT_NODE) {
      theSource += currentChild.textContent;
    }
     
    currentChild = currentChild.nextSibling;
  }

  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
     // Unknown shader type
     return null;
  }

  gl.shaderSource(shader, theSource);
     
  // Compile the shader program
  gl.compileShader(shader);  
     
  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {  
      alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));  
      return null;  
  }
     
  return shader;
}

function initBuffers() {
  vertices = [];
  normals = [];
  indices = [];
  texCoords = [];
  tangents =[];
  loadObj();
  loadTextures();
   
  for (var obj=0; obj<MAX_OBJ; obj++)
  { 
      vertexBuffer[obj] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer[obj]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices[obj]), gl.STATIC_DRAW);
      
      normalBuffer[obj] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[obj]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals[obj]), gl.STATIC_DRAW);
      
      textureBuffer[obj] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer[obj]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords[obj]), gl.STATIC_DRAW);
    
      tangentBuffer[obj] = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer[obj]);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tangents[obj]), gl.STATIC_DRAW);

      indexBuffer[obj] = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer[obj]);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices[obj]), gl.STATIC_DRAW);
  }
}

function initGame()
{
   //starting positions:
   posY = 70;
   posX = 101 * Math.random()-50;
   posZ = 101 * Math.random()-50;

   lastUpdateTime = (new Date).getTime(); //start the time
}

function drawScene() {

    if (canvas.width != canvas.clientWidth)
    {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientWidth*7.7/16;
    }
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

    
    var currentTime = (new Date).getTime();
    var renderTime = currentTime - RENDER_TIME_DELAY;

//
//fps++
//if (currentTime - lastFPSCheck>1000)
//{
//console.log("FPS:"+(fps * 1000/(currentTime-lastFPSCheck)));
//fps=0;
//lastFPSCheck=currentTime;
//}
//

    var delta = currentTime - lastUpdateTime;

  //remove this for now
    act(delta)


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

     perspectiveMatrix = makePerspective(45, canvas.width/canvas.height, 0.1, CAMERA_MAX);
     setPerspectiveMatrix();


  gl.uniform1f(lightingDisabledUniform, 0);
//player
    camX = posX;
    camY = posY;
    camZ = posZ;
    camRotX = xRotation;
    camRotY = yRotation;

     loadIdentity();
  
    mvRotate(camRotX, [1,0,0])  
    mvRotate(camRotY, [0,1,0])  
    mvTranslate([-camX, -camY, -camZ])

    var vectorLight = [];
    vectorLight[0]=$V([LIGHT_MOVE_RADIUS*Math.cos(lightTime*LIGHT_MOVE_SPEED), LIGHT_HEIGHT,
                       LIGHT_MOVE_RADIUS*Math.sin(lightTime*LIGHT_MOVE_SPEED), 1]);
    vectorLight[0] = mvMatrix.x(vectorLight[0]);

//    vectorLight[1] = $V([powerPosX[0], LIGHT_HEIGHT+mapY, powerPosZ[0],1]);
//    vectorLight[1] = mvMatrix.x(vectorLight[1]);

//    vectorLight[2] = $V([powerPosX[1], LIGHT_HEIGHT+mapY, powerPosZ[1],1]);
//    vectorLight[2] = mvMatrix.x(vectorLight[2]);

    gl.uniform3f(lightPositionUniform[0], vectorLight[0].e(1), vectorLight[0].e(2), vectorLight[0].e(3));
//    gl.uniform3f(lightPositionUniform[1], vectorLight[1].e(1), vectorLight[1].e(2), vectorLight[1].e(3));
//    gl.uniform3f(lightPositionUniform[2], vectorLight[2].e(1), vectorLight[2].e(2), vectorLight[2].e(3));

    mvTranslate([posX,posY,posZ]);
    mvRotate(-yRotation, [0, 1, 0]);
    mvRotate(-xRotation, [1, 0, 0]);


    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer[playerObj]);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[playerObj]);
    gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer[playerObj]);
    gl.vertexAttribPointer(vertexTextureAttribute, 2, gl.FLOAT, false, 0, 0);

  //  gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer[playerObj]);
  //  gl.vertexAttribPointer(vertexTangentAttribute, 4, gl.FLOAT, false, 0, 0);
  
  
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture[playerTexture]);
    gl.uniform1i(samplerUniform, 0);

  //  gl.activeTexture(gl.TEXTURE1);
  //  gl.bindTexture(gl.TEXTURE_2D, texture[2]);
  //  gl.uniform1i(normalMapUniform, 1);
  
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer[playerObj]);
    setNormalMatrix();
    setModelViewMatrix();
    gl.drawElements(gl.TRIANGLES, indices[playerObj].length, gl.UNSIGNED_SHORT, 0);




  //other players--------------------------------------------
  for (var p=0; p<numPlayers; p++)
  {
      if (p!=playerId && !otherPlayerDisconnected[p])
      {
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer[otherPlayerObj]);
          gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
          
          gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[otherPlayerObj]);
          gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            
          gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer[otherPlayerObj]);
          gl.vertexAttribPointer(vertexTextureAttribute, 2, gl.FLOAT, false, 0, 0);
             
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texture[otherPlayerTexture]);
          gl.uniform1i(samplerUniform, 0);
                
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer[otherPlayerObj]);
          loadIdentity();
          mvRotate(camRotX, [1,0,0])
          mvRotate(camRotY, [0,1,0])  
          mvTranslate([-camX, -camY, -camZ]);

          var snapshot=0;
          var priorSnapshot=0;
          var afterSnapshot=0;
          var tRatio=0;
          while (snapshot<NUM_SNAPSHOTS)
          {
              if (snapshotTimestamp[p][snapshot]<renderTime)
              {
                  priorSnapshot=snapshot;
                  afterSnapshot=snapshot-1;
                  if (afterSnapshot<0){ afterSnapshot=0; }
                  ratio = (renderTime - snapshotTimestamp[p][priorSnapshot]) / 
                          (snapshotTimestamp[p][afterSnapshot] - snapshotTimestamp[p][priorSnapshot]);
                          break;
                  
              }
              snapshot++;
          }

         var objPosX = otherPosX[p][priorSnapshot] + 
                      tRatio * (otherPosX[p][afterSnapshot] - otherPosX[p][priorSnapshot]);
         var objPosY = otherPosY[p][priorSnapshot] + 
                      tRatio * (otherPosY[p][afterSnapshot] - otherPosY[p][priorSnapshot]);
         var objPosZ = otherPosZ[p][priorSnapshot] + 
                      tRatio * (otherPosZ[p][afterSnapshot] - otherPosZ[p][priorSnapshot]);
         var objRotY = otherRotY[p][priorSnapshot] + 
                      tRatio * (otherRotY[p][afterSnapshot] - otherRotY[p][priorSnapshot]);

          mvTranslate([objPosX, objPosY, objPosZ]);
          mvRotate(-objRotY, [0, 1, 0]);
          setNormalMatrix();
          setModelViewMatrix();

          gl.drawElements(gl.TRIANGLES, indices[otherPlayerObj].length, gl.UNSIGNED_SHORT, 0);
      }
  }

for (var b=0; b<numBullets; b++)
  {
      if (true)//bulletAlive[b]
      {
          gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer[bulletObj]);
          gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
          
          gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[bulletObj]);
          gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            
          gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer[bulletObj]);
          gl.vertexAttribPointer(vertexTextureAttribute, 2, gl.FLOAT, false, 0, 0);
             
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texture[bulletTexture]);
          gl.uniform1i(samplerUniform, 0);
                
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer[bulletObj]);
          loadIdentity();
          mvRotate(camRotX, [1,0,0])
          mvRotate(camRotY, [0,1,0])  
          mvTranslate([-camX, -camY, -camZ]);

          var snapshot=0;
          var priorSnapshot=0;
          var afterSnapshot=0;
          var tRatio=0;
          while (snapshot<NUM_SNAPSHOTS)
          {
              if (bSnapshotTimestamp[b][snapshot]<renderTime)
              {
                  priorSnapshot=snapshot;
                  afterSnapshot=snapshot-1;
                  if (afterSnapshot<0){ afterSnapshot=0; }
                  ratio = (renderTime - bSnapshotTimestamp[b][priorSnapshot]) / 
                          (bSnapshotTimestamp[b][afterSnapshot] - bSnapshotTimestamp[b][priorSnapshot]);
                          break;
                  
              }
              snapshot++;
          }

         var objPosX = bPosX[b][priorSnapshot] + 
                      tRatio * (bPosX[b][afterSnapshot] - bPosX[b][priorSnapshot]);
         var objPosY = bPosY[b][priorSnapshot] + 
                      tRatio * (bPosY[b][afterSnapshot] - bPosY[b][priorSnapshot]);
         var objPosZ = bPosZ[b][priorSnapshot] + 
                      tRatio * (bPosZ[b][afterSnapshot] - bPosZ[b][priorSnapshot]);
  //       var objRotY = otherRotY[p][priorSnapshot] + 
   //                   tRatio * (otherRotY[p][afterSnapshot] - otherRotY[p][priorSnapshot]);

          mvTranslate([objPosX, objPosY, objPosZ]);
        //  mvRotate(-objRotY, [0, 1, 0]);
          setNormalMatrix();
          setModelViewMatrix();

          gl.drawElements(gl.TRIANGLES, indices[bulletObj].length, gl.UNSIGNED_SHORT, 0);
      }
  }

   //background--------------------------------------------------
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer[backgroundObj]);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[backgroundObj]);
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer[backgroundObj]);
  gl.vertexAttribPointer(vertexTextureAttribute, 2, gl.FLOAT, false, 0, 0);

//  gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer[backgroundObj]);
 // gl.vertexAttribPointer(vertexTangentAttribute, 4, gl.FLOAT, false, 0, 0);
     
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture[backgroundTexture]);
  gl.uniform1i(samplerUniform, 0);
  
 // gl.activeTexture(gl.TEXTURE1);
 // gl.bindTexture(gl.TEXTURE_2D, texture[3]);
  //gl.uniform1i(normalMapUniform, 1);
        
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer[backgroundObj]);
  loadIdentity();
  mvRotate(camRotX, [1,0,0])
  mvRotate(camRotY, [0,1,0])  
  mvTranslate([-camX, -camY, -camZ]);
  mvTranslate([0,-1 * MAP_SCALE,0]);
  setNormalMatrix();
  mvScale([MAP_SCALE,MAP_SCALE,MAP_SCALE]);
  setModelViewMatrix();

  gl.drawElements(gl.TRIANGLES, indices[backgroundObj].length, gl.UNSIGNED_SHORT, 0);

   lastUpdateTime = currentTime;
}

function act(dt)
{
    lightTime+=dt;
    var dX=0, dZ=0;
    if (upPressed)
    {
        dX += Math.sin(Math.PI*yRotation/180) * dt * CAMERA_MOVE_SPEED;
        dZ += -Math.cos(Math.PI*yRotation/180) * dt * CAMERA_MOVE_SPEED;
    }
    if (downPressed)
    {
        dX += -Math.sin(Math.PI*yRotation/180) * dt * CAMERA_MOVE_SPEED;
        dZ += Math.cos(Math.PI*yRotation/180) * dt * CAMERA_MOVE_SPEED;
    }
    if (leftPressed)
    {
        dX += -Math.cos(Math.PI*yRotation/180) * dt * CAMERA_MOVE_SPEED;
        dZ += -Math.sin(Math.PI*yRotation/180) * dt * CAMERA_MOVE_SPEED;
    }
    if (rightPressed)
    {
        dX += Math.cos(Math.PI*yRotation/180) * dt * CAMERA_MOVE_SPEED;
        dZ += Math.sin(Math.PI*yRotation/180) * dt * CAMERA_MOVE_SPEED;
    }
    if (spacePressed && posY<=MIN_POS_Y+1)
    {
       PlayerYAccel=JUMP_ACCEL;
       posY+=PlayerYAccel;
    }

    if (posY>MIN_POS_Y)
    {
       posY+=PlayerYAccel;
       PlayerYAccel-=0.02;
    }
    if (posY<MIN_POS_Y)
    {
      posY=MIN_POS_Y;
      PlayerYAccel=0;
    }

    posX+=dX;
    posZ+=dZ;

    socket.emit('fPos', [playerId, new Date().getTime(), posX, posY, posZ, yRotation]);

    if (reloadTime>0) { reloadTime-=dt; }

    if (leftMouseDown && reloadTime<=0)
    {
        socket.emit('nb', [playerId, new Date().getTime(), posX, posY, posZ, xRotation, yRotation]);
        reloadTime = 200;
    }
}

function loadObj() 
{
  var req = new XMLHttpRequest();
  req.open("GET", "/resources/models/rifle2.txt", false);
  req.onreadystatechange = function(){
     if (req.readyState===4) {
        if (req.status === 200){
           text = req.responseText;
           processObj(RIFLE_OBJ);
        }
     }
  }
  req.send(null);

  var req = new XMLHttpRequest();
  req.open("GET", "/resources/models/player.txt", false);
  req.onreadystatechange = function(){
     if (req.readyState===4) {
        if (req.status === 200){
           text = req.responseText;
           processObj(PLAYER_OBJ);
        }
     }
  }
  req.send(null);

  req = new XMLHttpRequest();
  req.open("GET", "/resources/models/arena.txt", false);
  req.onreadystatechange = function(){
     if (req.readyState===4) {
        if (req.status === 200){
           text = req.responseText;
           processObj(BG_OBJ);
        }
     }
  }
  req.send(null);
}

function loadTextures() {
  texture[0] = gl.createTexture();
  image[0] = new Image();
  image[0].onload = function() { handleTextureLoaded(image[0], texture[0]); }
  image[0].src = "/resources/images/rifle2AO.png";
  
  texture[1] = gl.createTexture();
  image[1] = new Image();
  image[1].onload = function() { handleTextureLoaded(image[1], texture[1]); }
  image[1].src = "/resources/images/playerAO.png";

  texture[2] = gl.createTexture();
  image[2] = new Image();
  image[2].onload = function() { handleTextureLoaded(image[2], texture[2]); }
  image[2].src = "/resources/images/arenaAO.png";
  
  texture[3] = gl.createTexture();
  image[3] = new Image();
  image[3].onload = function() { handleTextureLoaded(image[3], texture[3]); }
  image[3].src = "/resources/images/bgNormal.png";
}
 
function handleTextureLoaded(image, texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);
}

function processObj(obj) {
   vertices[obj]=[];
    indices[obj]=[];
    normals[obj]=[];
    texCoords[obj]=[];
    tangents[obj]=[];

    var highestIndex;
    var vertexIndex=[];
    var texIndex=[];
    var normalIndex=[];

    var vertexData = [ ];
    var normalData = [ ];
    var texCoordData = [ ];
    var tangentData = [];
    var biTangentData = [];
    var facemap = { };
    var index = 0;


        var linesForSwoop = text.split("\n");

//*can be improved (doing it less times), but it shouldn't be too bad and gets the job done simply
for (var v=0; v<linesForSwoop.length*3; v++)
{
    tangentData[v]=0;
    biTangentData[v]=0;
}
   

        
        for (var lineIndex = 0; lineIndex<linesForSwoop.length; ++lineIndex) {
            var line = linesForSwoop[lineIndex];
            var value = line.split(" ");
            if (value[0] == "v") 
            {
                vertexData.push(parseFloat(value[1]));
                vertexData.push(parseFloat(value[2]));
                vertexData.push(parseFloat(value[3]));
            }
            else if (value[0] == "vt") 
            {
                texCoordData.push(parseFloat(value[1]));
                texCoordData.push(1-parseFloat(value[2])); //-1 because image is reversed on the Y
            }
            else if (value[0] == "vn") 
            {
                normalData.push(parseFloat(value[1]));
                normalData.push(parseFloat(value[2]));
                normalData.push(parseFloat(value[3]));
            }
            else if (value[0] == "f") 
            {
 var vtx=[];
var nor=[];
var tex=[];
//value[3]=value[3].substr(0,value[3].length-1) //seems to be a line break character making it seem different

                for (var i = 1; i < 4; i++) {
                    
                    if (!(value[i] in facemap)) {
                        // add a new entry to the map and arrays
                    var f = value[i].split("/");
                   

                    vtx[i-1] = parseInt(f[0]) - 1; //.obj starts vertices at 1, openGL starts at 0
                    tex[i-1] = parseInt(f[1]) - 1;
                    nor[i-1] = parseInt(f[2]) - 1;

                    if (vtx[i-1] * 3 + 2 < vertexData.length) 
                    {
                        vertices[obj].push(vertexData[vtx[i-1]*3]);
                        vertices[obj].push(vertexData[vtx[i-1]*3+1]);
                        vertices[obj].push(vertexData[vtx[i-1]*3+2]);
                    }
                    
                    if (nor[i-1] * 3 + 2 < normalData.length) 
                    {
                        normals[obj].push(normalData[nor[i-1]*3]);
                        normals[obj].push(normalData[nor[i-1]*3+1]);
                        normals[obj].push(normalData[nor[i-1]*3+2]);
                    }
                    

                    if (tex[i-1] * 2 + 1 < texCoordData.length) 
                    {
                        texCoords[obj].push(texCoordData[tex[i-1]*2]);
                        texCoords[obj].push(texCoordData[tex[i-1]*2+1]);
                    }

                    facemap[value[i]] = index++;

                }
            else
            {
                    var f = value[i].split("/");
                   

                    vtx[i-1] = parseInt(f[0]) - 1; //.obj starts vertices at 1, openGL starts at 0
                    tex[i-1] = parseInt(f[1]) - 1;
                    nor[i-1] = parseInt(f[2]) - 1;
            }


                indices[obj].push(facemap[value[i]]);
               // currentGroup[1]++;
            }
            var xDist1 = vertexData[vtx[1]*3]   - vertexData[vtx[0]*3];
            var xDist2 = vertexData[vtx[2]*3]   - vertexData[vtx[0]*3];
            var yDist1 = vertexData[vtx[1]*3+1] - vertexData[vtx[0]*3+1];
            var yDist2 = vertexData[vtx[2]*3+1] - vertexData[vtx[0]*3+1];
            var zDist1 = vertexData[vtx[1]*3+2] - vertexData[vtx[0]*3+2];
            var zDist2 = vertexData[vtx[2]*3+2] - vertexData[vtx[0]*3+2];

            var sDist1 = texCoordData[tex[1]*2] - texCoordData[tex[0]*2];
            var sDist2 = texCoordData[tex[2]*2] - texCoordData[tex[0]*2];
            var tDist1 = texCoordData[tex[1]*2+1] - texCoordData[tex[0]*2+1];
            var tDist2 = texCoordData[tex[2]*2+1] - texCoordData[tex[0]*2+1];
            var det = 1.0 / (sDist1 * tDist2 - sDist2 * tDist1);

            var tanAdd = [];
            var bTanAdd = [];


             tanAdd[0] = (tDist2 * xDist1 - tDist1 * xDist2)*det;
             tanAdd[1] = (tDist2 * yDist1 - tDist1 * yDist2)*det;
             tanAdd[2] = (tDist2 * zDist1 - tDist1 * zDist2)*det;
             bTanAdd[0] = (sDist1 * xDist2 - sDist2 * xDist1)*det;
             bTanAdd[1] = (sDist1 * yDist2 - sDist2 * yDist1)*det;
             bTanAdd[2] = (sDist1 * zDist2 - sDist2 * zDist1)*det;
            
            tangentData[3*vtx[0]]+=tanAdd[0];
            tangentData[3*vtx[0]+1]+=tanAdd[1];
            tangentData[3*vtx[0]+2]+=tanAdd[2];
            tangentData[3*vtx[1]]+=tanAdd[0];
            tangentData[3*vtx[1]+1]+=tanAdd[1];
            tangentData[3*vtx[1]+2]+=tanAdd[2];
            tangentData[3*vtx[2]]+=tanAdd[0];
            tangentData[3*vtx[2]+1]+=tanAdd[1];
            tangentData[3*vtx[2]+2]+=tanAdd[2];

            biTangentData[3*vtx[0]]+=bTanAdd[0];
            biTangentData[3*vtx[0]+1]+=bTanAdd[1];
            biTangentData[3*vtx[0]+2]+=bTanAdd[2];
            biTangentData[3*vtx[1]]+=bTanAdd[0];
            biTangentData[3*vtx[1]+1]+=bTanAdd[1];
            biTangentData[3*vtx[1]+2]+=bTanAdd[2];
            biTangentData[3*vtx[2]]+=bTanAdd[0];
            biTangentData[3*vtx[2]+1]+=bTanAdd[1];
            biTangentData[3*vtx[2]+2]+=bTanAdd[2];

        }
        }

for (var v=0; v<vertices[obj].length; v+=3)
    {

//to convert to tangents, which have 4 numbers in each segment, add v/3

        tangents[obj][4*v/3]= tangentData[v] - normals[obj][v] * (normals[obj][v]*tangentData[v]+normals[obj][v+1]*tangentData[v+1]+normals[obj][v+2]*tangentData[v+2]);
        tangents[obj][4*v/3+1]= tangentData[v+1] - normals[obj][v+1] * (normals[obj][v]*tangentData[v]+normals[obj][v+1]*tangentData[v+1]+normals[obj][v+2]*tangentData[v+2]);
        tangents[obj][4*v/3+2]= tangentData[v+2] - normals[obj][v+2] * (normals[obj][v]*tangentData[v]+normals[obj][v+1]*tangentData[v+1]+normals[obj][v+2]*tangentData[v+2]);
        var length = Math.sqrt(tangents[obj][4*v/3]*tangents[obj][4*v/3]+tangents[obj][4*v/3+1]*tangents[obj][4*v/3+1]+tangents[obj][4*v/3+2]*tangents[obj][4*v/3+2]);
        tangents[obj][4*v/3]=tangents[obj][4*v/3]/length;
        tangents[obj][4*v/3+1]=tangents[obj][4*v/3+1]/length;
        tangents[obj][4*v/3+2]=tangents[obj][4*v/3+2]/length;

        //normalize
        if (((normals[obj][v+1]*tangents[obj][4*v/3+2] - normals[obj][v+2]*tangents[obj][4*v/3+1])*biTangentData[v] + (normals[obj][v+2]*tangents[obj][4*v/3] - normals[obj][v]*tangents[obj][4*v/3+2])*biTangentData[v+1] + (normals[obj][v]*tangents[obj][4*v/3+1] - normals[obj][v+1]*tangents[obj][4*v/3])*biTangentData[v+2])>0)
        {
            tangents[obj][4*v/3+3]=-1;
        }
        else
        {
            tangents[obj][4*v/3+3]=1;
        }
    }

}


//
// Matrix utility functions
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;
  
  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}

function mvScale(v)
{
    multMatrix(Matrix.Diagonal([v[0], v[1], v[2], 1]).ensure4x4());
}

function setNormalMatrix() {
  gl.uniformMatrix3fv(nUniform, false, new Float32Array(mvMatrix.minor(1,1,3,3).flatten()));
}

function setModelViewMatrix() {
  gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
}

function setPerspectiveMatrix() {
  gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
}
