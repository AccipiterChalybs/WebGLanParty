var socket;
var chatMessage = "";

var shiftDown = false;

var inputConsole;
var chatConsole;

function start()
{
    socket = io.connect('http://ec2-54-219-137-123.us-west-1.compute.amazonaws.com/');
    socket.on('chat', function (data) {
        writeTex(chatConsole, data);
    });

  inputConsole = document.getElementById("message");    
  chatConsole = document.getElementById("chatBox");

    document.onkeydown = function(event) {
        keyDown(event);
    };   
    document.onkeyup = function(event) {
        keyUp(event);
    };  
}

function keyDown(event)
{
   var keyCode = event.keyCode;
        if (event.keyCode == 8)
        {
          event.preventDefault(); 
        }
        else if (event.keyCode == 16)
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

function keyUp(event)
{
  var keyCode = event.keyCode;
    if (keyCode == 13)
        {
       message(chatMessage);
            chatMessage="";
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

  function message(messageText)
  {
   socket.emit('inc',  messageText);
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