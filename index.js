var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);

var clients = [];
var hoster = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on("connection", function(socket){

   var currentUser;

   socket.on("USER_CONNECT", function(){
       console.log("User connected");
       socket.emit("USER_CONNECT");
     for(var i = 0; i < clients.length; i++){
       socket.emit("USER_CONNECTED",{name:clients[i].name, position:clients[i].position, number:clients[i].number, ready:clients[i].ready});

       console.log("User name" + clients[i].name + "is connected");
     }
   });

   socket.on("WINNER", function (data) {
       var a = {
           winner: data
       }
       socket.emit("WINNER", a);
       socket.broadcast.emit("WINNER", a);
   });

   socket.on("HOST", function () {
       console.log("hosting")

       currentUser = {
           name: "hoster"
       }
       hoster.push(currentUser);
       socket.emit("HOST");
   });

   socket.on("PLAY", function( data ){
     console.log(data);

     currentUser = {
       name:data.name,
       position: data.position,
       number: clients.length,
       ready: 0
     }
     clients.push(currentUser);
     socket.emit("PLAY",currentUser);
     socket.broadcast.emit("USER_CONNECTED",currentUser);
   });

   socket.on("MOVE", function (data) {
     currentUser.position = data.position;
     socket.emit("MOVE", currentUser);
     socket.broadcast.emit("MOVE", currentUser);
     console.log(currentUser.name+" move to "+ currentUser.position);
   });

   socket.on("READY", function (data) {
       console.log(data);
       for (var i = 0; i < clients.length; i++) {
           if (clients[i].name == currentUser.name) {
               clients[i].ready = data;
           }
       }
       socket.emit("READY", currentUser);
       socket.broadcast.emit("READY", currentUser);
       if (clients.length > 1) {
           if (clients[0].ready && clients[1].ready) {
               socket.emit("START");
               socket.broadcast.emit("START");
               clients[0].ready = false;
               clients[1].ready = false;
           }
       }


   });

   socket.on("disconnect", function(){
     socket.broadcast.emit("USER_DISCONNECTED", currentUser);
     for(var i = 0; i < clients.length; i++){
       if(clients[i].name == currentUser.name){
         console.log("User "+ clients[i].name + "disconnected");
         clients.splice(i,1);
       }
     };
   });
});

server.listen(app.get('port'), function(){
  console.log("---------SERVER IS RUNNING---------");
});
