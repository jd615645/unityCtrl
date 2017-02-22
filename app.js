var express = require('express');
var socket_io = require( "socket.io" );
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();
var io = socket_io();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var clients = [];
var hoster = [];
io.on("connection", function(socket){

   var currentUser;

   socket.on("USER_CONNECT", function(){
       console.log("User connected");
       socket.emit("USER_CONNECT");
     for(var i = 0; i < clients.length; i++){
       socket.emit("USER_CONNECTED",{name:clients[i].name, position:clients[i].position, number:clients[i].number, ready:clients[i].ready});

       console.log("User name" + clients[i].name + " is connected");
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
     var leftOrRight;
     if (clients.length == 0) {
         leftOrRight = -1;
     } else {
         leftOrRight = 1;
     }
     currentUser = {
       name:data.name,
       position: (leftOrRight * 13) + "," + 0.5 + "," + 0,
       number: clients.length,
       ready: 0
     }
     console.log(currentUser);
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
       /*if (clients.length > 1) {
           if (clients[0].ready && clients[1].ready) {
               socket.emit("START");
               socket.broadcast.emit("START");
               clients[0].ready = false;
               clients[1].ready = false;
           }
       }*/


   });

   socket.on("START", function () {
       console.log("start");
       socket.emit("START");
       socket.broadcast.emit("START");
       clients[0].ready = false;
       clients[1].ready = false;
   });

   socket.on("disconnect", function(){
     socket.broadcast.emit("USER_DISCONNECTED", currentUser);
     if(currentUser !== undefined) {
       for(var i = 0; i < clients.length; i++){
         if(clients[i].name == currentUser.name){
           console.log("User "+ clients[i].name + " disconnected");
           clients.splice(i,1);
         }
       };
       for (var i = 0; i < clients.length; i++) {
           clients[i].number = i;
       }
     }
   });
});

module.exports = app;
