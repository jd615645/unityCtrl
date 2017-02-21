$(document).ready(() => {
  var socket = io();
  var x=-13,
      y=0.5,
      z=0;
  var isReady = false;
  var playerNum;
  socket.emit("USER_CONNECT");

  var joystickView = new JoystickView(150, (callbackView) => {
    $("#joystickContent").append(callbackView.render().el);
    setTimeout(function(){
      callbackView.renderSprite();
    }, 0);
  });
  joystickView.bind("verticalMove", (y) => {
    // console.log(y);
    // $("#yVal").html(y);
    if (y > 0) {
      console.log('up');

      if (!isReady && z <= 6) {
        z+=1;
        var playerData =
        {
          name: name,
          position: x + ','+ y +',' + z
        };
        socket.emit('MOVE', playerData);
      }
    }
    else if (y < 0) {
      console.log('down');
      if (!isReady && z >= -6) {
        z-=1;
        var playerData =
        {
          name: name,
          position: x + ','+ y +',' + z
        };
        socket.emit('MOVE', playerData);
      }
    }
  });
  joystickView.bind("horizontalMove", (x) => {
    // 橫向
    // console.log(x);
    // $("#xVal").html(x);
  });

  $('#ready').click(() => {
    console.log('ready');
    isReady = !isReady;
    $('#ready span').text(isReady);
    socket.emit('READY', isReady);

    if(isReady) {
      y=0.5;
      z=0;
      if (playerNum == 0) {
        x = -13;
      }
      else {
        x = 13;
      }
      socket.emit('MOVE', { name: name, position: x + ',' + y + ',' + z });
    }
  });

  socket.on('PLAY', (data) => {
    playerNum = data['number'] ;
    if (playerNum != 0) {
      x = 13;
    }
    $('#playerNum').text(playerNum+1);
    var playerData =
    {
      name: name,
      position: x + ','+ y +',' + z
    };
    socket.emit('MOVE', playerData);
  });

  socket.on('USER_CONNECTED', (data) => {
    console.log(data);
  });
  socket.on('USER_DISCONNECTED', (data) => {
    console.log(data);
    if(playerNum == 1) {
      playerNum = 0;
      x = -13;
      $('#playerNum').text(1);
      var playerData =
      {
        name: name,
        position: x + ','+ y +',' + z
      };
      socket.emit('MOVE', playerData);
    }
  });

  socket.on('START', (data) => {
    console.log('START');
    $('#ready').fadeOut();
    setTimeout(()=>{
      isReady = false;
      $('#ready span').text(isReady);
    }, 3000);
  });

  socket.on('WINNER', (data) => {
    $('#ready').fadeIn();
  });

  $('input').keypress((e) => {
    if(e.which == 13) {
      name = $('input').val();
      if (name != '') {
        $('#name').text(name);
        $('#keyin').fadeOut();
        $('#playBtn').fadeIn();

        console.log('play');
        var playerData =
        {
          name: name,
          position: x + ','+ y +',' + z
        };
        socket.emit('PLAY', playerData);
      }
    }
  });
});
