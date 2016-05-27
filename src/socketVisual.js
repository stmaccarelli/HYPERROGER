var socketVisual = function(){
  var socket = io('http://pixelsmasher.io:1502');

  function init(){
    socket.emit('ack',{whoami:'visual'});
    console.log('sent ack');

    socket.on('mobi_keypush',function(e){console.log(e)});
    socket.on('mobi_count',function(e){console.log('eeeh'); console.log(e)});
    console.log('socket event listeners set');

    socket.on('mxr_push_to_cli_fft', function(d){
      HLR.updateHLParams(
      d.msg.a,
      d.msg.b,
      d.msg.c,
      d.msg.d,
      d.msg.e
    );
    });
    socket.on('mxr_push_to_cli_key', function(d){console.log(d.msg);});
  }

  return{
    init:init
  }
}();

// TODO: init socket da main
