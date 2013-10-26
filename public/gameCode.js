var SERVER_ADDRESS = 'http://ec2-54-219-137-123.us-west-1.compute.amazonaws.com/';
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

var gl; //webGL object
var canvas; //HTML5 canvas object that uses webGL
var brElement;

var vertexBuffer=[]; //buffer to hold vertices
var normalBuffer=[]; //buffer to hold vertex normals
var textureBuffer=[]; //buffer to hold texture coordinates
var indexBuffer=[]; //buffer to hold vertex indices

var glProgram; //program holding the shaders

var vertexPositionAttribute; //pointer to vertexPosition in the shader
var vertexNormalAttribute; //pointer to vertexNormal in the shader
var vertexTextureAttribute; //pointer to vertexTexture in the shader

var pUniform; //perspective matrix
var nUniform; //normal matrix
var mvUniform; //model-view matrix

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

var perspectiveMatrix; //perspective matrix

var lastUpdateTime = 0; //time of the last frame, used for game logic.
var text;
var texture=[]; //holds all textures
var image=[]; //holds all images for textures
var leftPressed=false, upPressed=false, rightPressed=false, downPressed=false; //holds key presses: false means key is not pressed, true means key is being pressed down

var fuzzyBear=0;

var CAMERA_MAX=200;

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

var codeConsole;
var inputConsole;

//score
var score=0;

//textures
var SWOOP_TEXTURE=0;
var METAL_SWOOP_TEXTURE=2;
var OBSTACLE_TEXTURE=3;
var BACKGROUND_TEXTURE=4;
var NEWS_TEXTURE=5;
var SCORE_TEXTURE=6;
var NEWS_MAIN_MENU_TEXTURE=7;
var NEWS_GAME_OVER_TEXTURE=8;
var B_SWOOPY=1;
var B_MATRIX=12;
var B_OWLIE=9;
var B_SNOW=10;
var B_WIRE=11;
var B_NEON=12;
var B_EVIL=13;
var B_FIRE=14;

//objects
var MAX_OBJ=6;

OWL_OBJ=0;
BOX_OBJ=1;
BG_OBJ=2;
ITEM_BOX_OBJ=3;
SCORE_OBJ=4;
MENU_OBJ=5;

//DO NOT include in MAX_OBJ (max obj should be same number as first)
UNIFIED_MAZE_OBJ=6;
CUSTOMIZE_OBJ=7;

//audio
var soundPlayer=[];
var AUDIO_MUSIC = 0;
var AUDIO_ITEM = 1;
var AUDIO_HIT_BY_ENEMY = 2;

//camera vars
var worldX=0,worldY=0, worldZ=0;
var camRotX = 50;
var camX=0; camY=0; camZ=0;



//player vars
var playerName="";
var customizeCode="";
var typingName=false;
var SWOOP_START_Z=-1;
var posX=0,posY=1.4, posZ=SWOOP_START_Z;

var yRotation=0.0;
var playerObj=OWL_OBJ;
var playerTexture=SWOOP_TEXTURE;
var SWOOP_SPEED = 0.027; //const: player speed

//enemy vars
var STARTING_ENEMIES=2;
var MAX_ENEMIES=4;
var enemyNum=2;
var ePosX=[], ePosY=[], ePosZ=[];
var pathX=[];
var pathY=[];
var eCurrentNode=[];
var eYRotation=[];
var enemyPower=32106311;
var enemyObj=OWL_OBJ;
var enemyTexture=METAL_SWOOP_TEXTURE;
var ENEMY_SPEED=0.005;
var ENEMY_SPEED_INC=0.002;
var ENEMY_SPEED_LEVEL_INC=0.002;

//item vars
var itemNum=5;
var ITEM_SCORE=100;
var itemPosX=[], itemPosY=[], itemPosZ=[];
var itemXRotation=20;
var itemYRotation=0;
var itemYRotSpeed=0.1;
var itemObj=ITEM_BOX_OBJ;
var itemTexture=NEWS_TEXTURE;

//power-up vars
var powerUpNum=2;
var powerPosX=[], powerPosY=[], powerPosZ=[];
var powerXRotation=20;
var powerYRotation=0;
var powerYRotSpeed=0.1;
var powerObj=OWL_OBJ
var powerTexture=NEWS_TEXTURE;

var powerUpType=[];
var POWER_UP_TYPE_NUM=5;
var POWER_UP_SPEED_UP=0;
var POWER_UP_HEAT_VISION=1;
var POWER_UP_INVINCIBILITY=2;
var POWER_UP_FLARE = 3;
var POWER_UP_BONUS_LEVEL=4;

var POWER_UP_LENGTH=6400;
var POWER_UP_RESPAWN=7777;
var POWER_SPEED=false;
var SPEED_UP_AMOUNT=0.0125;
var POWER_HEAT_VISION=false;
var POWER_INVINCIBILITY=false;
var POWER_FLARE=false;
var FLARE_NEW_LIGHT=525;

var tempPowerNum;

//score vars
var scoreNum=6; //digits for score
var scoreObj=SCORE_OBJ;
var scoreTexture=SCORE_TEXTURE;

//obstacle vars
var obstacleNumX=19; //old = 19
var obstacleNumY=14; //old = 14
var obstacleHidden = [] //two dimensional array to be further initialized in initGame
var obstacleObj = UNIFIED_MAZE_OBJ;
var obstacleTexture = OBSTACLE_TEXTURE;
var OBSTACLE_SIZE=7;
var OBSTACLE_OFFSET_Z=-21;
var OBSTACLE_OFFSET_X=3.5;
var BLOCKS_TO_REMOVE=64;
var mazeDone=[];
var playerObstacleStartX=9, playerObstacleStartY=obstacleNumY-4; //block to remove for player
var TRAVEL_SPACE=1; //amount player can stray off of center

//background vars
var backgroundObj=BG_OBJ;
var backgroundTexture=BACKGROUND_TEXTURE;

//level change vars
var LEVEL_CHANGE_SCORE = 1000;
var currentLevel=1;
var changingLevel=false;
var entering=false;
var mapY=0;
var LEVEL_CHANGE_SPEED=0.024;
var MAP_Y_MAX=40;
var MAP_Y_MIN=-77;

//newspaper vars (i.e. menu and game over screen vars
var mainMenuActive;
var gameOverActive;
var pauseKeyActive=false;
var NEWSPAPER_START_Z=-200;
var NEWSPAPER_END_Z=-20;
var newsPaperZ=NEWSPAPER_START_Z;
var newsPaperRotationZ;
var NEWSPAPER_SPEED=0.14;
var NEWSPAPER_ROTATION_SPEED=4.2;
var newsPaperObj = MENU_OBJ;
var newsPaperTexture;

var GAME_OVER_TIME=7777;

var fps=0;
var lastFPSCheck;

function start()
{
    socket = io.connect(SERVER_ADDRESS);
    socket.on('chat', function (data) {
        writeTex(chatConsole, data);
    });

    inputConsole = document.getElementById("Input");    
    chatConsole = document.getElementById("chatBox");

    document.onkeydown = function(event) {
        keyDown(event);
    };   
    document.onkeyup = function(event) {
        keyUp(event);
    };

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
  
  lightingDisabledUniform = gl.getUniformLocation(glProgram, "lightingDisabled");
  texCoordAddUniform = gl.getUniformLocation(glProgram, "texCoordAdd");
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
    
      indexBuffer[obj] = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer[obj]);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices[obj]), gl.STATIC_DRAW);
  }
}

function initGame()
{
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
  //  act(delta)


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

     perspectiveMatrix = makePerspective(45, canvas.width/canvas.height, 0.1, CAMERA_MAX);
     setPerspectiveMatrix();


//player 
     camX=posX;
     camZ=posZ+9+41.14-9.2;
    camY=49.02+7.7;

     gl.uniform1f(lightingDisabledUniform, 0);
     gl.uniform2f(texCoordAddUniform,0,0);

     loadIdentity();
  
    mvTranslate([-worldX, -worldY, -worldZ])
    mvRotate(camRotX, [1,0,0])  
    mvTranslate([-camX, -camY, -camZ])

    var vectorLight = [];
    vectorLight[0]=$V([posX, LIGHT_HEIGHT+mapY, posZ,1]);
    vectorLight[0] = mvMatrix.x(vectorLight[0]);

    vectorLight[1] = $V([powerPosX[0], LIGHT_HEIGHT+mapY, powerPosZ[0],1]);
    vectorLight[1] = mvMatrix.x(vectorLight[1]);

    vectorLight[2] = $V([powerPosX[1], LIGHT_HEIGHT+mapY, powerPosZ[1],1]);
    vectorLight[2] = mvMatrix.x(vectorLight[2]);

    gl.uniform3f(lightPositionUniform[0], vectorLight[0].e(1), vectorLight[0].e(2), vectorLight[0].e(3));
    gl.uniform3f(lightPositionUniform[1], vectorLight[1].e(1), vectorLight[1].e(2), vectorLight[1].e(3));
    gl.uniform3f(lightPositionUniform[2], vectorLight[2].e(1), vectorLight[2].e(2), vectorLight[2].e(3));

    mvTranslate([posX,posY,posZ]);
    mvRotate(yRotation, [0, 1, 0]);


    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer[playerObj]);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[playerObj]);
    gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer[playerObj]);
    gl.vertexAttribPointer(vertexTextureAttribute, 2, gl.FLOAT, false, 0, 0);
  
  
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture[playerTexture]);
    gl.uniform1i(gl.getUniformLocation(glProgram, "sampler"), 0);
  
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer[playerObj]);
    setNormalMatrix();
    setModelViewMatrix();
    gl.drawElements(gl.TRIANGLES, indices[playerObj].length, gl.UNSIGNED_SHORT, 0);

  //background
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer[backgroundObj]);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer[backgroundObj]);
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
    
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer[backgroundObj]);
  gl.vertexAttribPointer(vertexTextureAttribute, 2, gl.FLOAT, false, 0, 0);
     
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture[backgroundTexture]);
  gl.uniform1i(gl.getUniformLocation(glProgram, "sampler"), 0); 
        
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer[backgroundObj]);
  loadIdentity();
  mvTranslate([-worldX, -worldY, -worldZ])
  mvRotate(camRotX, [1,0,0])
  mvTranslate([-camX, -camY, -camZ]);
  mvTranslate([0,mapY,-20]);
  setNormalMatrix();
  setModelViewMatrix();

  gl.drawElements(gl.TRIANGLES, indices[backgroundObj].length, gl.UNSIGNED_SHORT, 0);

   lastUpdateTime = currentTime;
}

function loadObj() 
{
  var req = new XMLHttpRequest();
  req.open("GET", "http://www.thefourthestate.net/OwlieGL/Swoop1.txt", false);
  req.onreadystatechange = function(){
     if (req.readyState===4) {
        if (req.status === 200){
           text = req.responseText;
           processObj(OWL_OBJ);
        }
     }
  }
  req.send(null);

  req = new XMLHttpRequest();
  req.open("GET", "http://www.thefourthestate.net/OwlieGL/BG.txt", false);
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
  image[0].src = "http://www.thefourthestate.net/OwlieGL/owlTexture1.png";
  
  texture[1] = gl.createTexture();
  image[1] = new Image();
  image[1].onload = function() { handleTextureLoaded(image[1], texture[1]); }
  image[1].src = "http://www.thefourthestate.net/OwlieGL/owlTexture2.png";
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

    var highestIndex;
    var vertexIndex=[];
    var texIndex=[];
    var normalIndex=[];

    var vertexData = [ ];
    var normalData = [ ];
    var texCoordData = [ ];
    var facemap = { };
    var index = 0;
    
        var linesForSwoop = text.split("\n");
        
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
                texCoordData.push(-1*parseFloat(value[2])); //-1 because image is reversed on the Y
            }
            else if (value[0] == "vn") 
            {
                normalData.push(parseFloat(value[1]));
                normalData.push(parseFloat(value[2]));
                normalData.push(parseFloat(value[3]));
            }
            else if (value[0] == "f") 
            {
                for (var i = 1; i < 4; ++i) {
                    
                    if (!(value[i] in facemap)) {
                        // add a new entry to the map and arrays
                    var f = value[i].split("/");
                    var vtx, nor, tex;

                    vtx = parseInt(f[0]) - 1; //.obj starts vertices at 1, openGL starts at 0
                    tex = parseInt(f[1]) - 1;
                    nor = parseInt(f[2]) - 1;

                    if (vtx * 3 + 2 < vertexData.length) 
                    {
                        vertices[obj].push(vertexData[vtx*3]);
                        vertices[obj].push(vertexData[vtx*3+1]);
                        vertices[obj].push(vertexData[vtx*3+2]);
                    }
                    
                    if (nor * 3 + 2 < normalData.length) 
                    {
                        normals[obj].push(normalData[nor*3]);
                        normals[obj].push(normalData[nor*3+1]);
                        normals[obj].push(normalData[nor*3+2]);
                    }
                    

                    if (tex * 2 + 1 < texCoordData.length) {
                        texCoords[obj].push(texCoordData[tex*2]);
                        texCoords[obj].push(texCoordData[tex*2+1]);
                    }
                    

                    facemap[value[i]] = index++;
                }

                indices[obj].push(facemap[value[i]]);
               // currentGroup[1]++;
            }
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
