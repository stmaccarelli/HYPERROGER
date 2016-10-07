var socketVisual = function(){
  var socket = io('http://pixelsmasher.io:1502');

  function init(){
    if(isMobile) socket.emit('ack',{whoami:'mobile'});
    else socket.emit('ack',{whoami:'visual'});

    console.log('sent ack');

    socket.on('mobi_keypush',function(e){console.log(e)});
    socket.on('mobi_count',function(e){console.log('eeeh'); console.log(e)});
    console.log('socket event listeners set');

    //reset HLRemote params
    HLRemote.updateHLParams(0,0,0,0,0);

    socket.on('mxr_push_to_cli_fft', function(d){
      HLRemote.updateHLParams(
      d.msg.a,
      d.msg.b,
      d.msg.c,
      d.msg.d,
      d.msg.e
    );
    });


    socket.on('mxr_push_to_cli_key', function(d){

      console.log("mxr_push_to_cli_key ",d.msg.a);

      if (Number(d.msg.a) == 49) //1
          HLH.shootGroup('sea', 8, false, false);
      if (Number(d.msg.a) == 50) //2
          HLH.shootGroup('weird', 0, true, true);
      if (Number(d.msg.a) == 51) //3
          HLH.shootGroup('space', 50, true, false);
      if (Number(d.msg.a) == 52) //4
          HLH.startModel(HL.models['whale'],
          THREE.Math.randInt(-1000, 1000),
          THREE.Math.randInt(-HLE.WORLD_HEIGHT * 0.01, HLE.WORLD_HEIGHT * 1.1), 2.5, null, 10); //TODO
      if (Number(d.msg.a) == 53) //5
          HLH.shootGroup(HLS.modelsParams);

      if (Number(d.msg.a) == 54) //6
          HLS.logoChange('logo');
      if (Number(d.msg.a) == 55) //7
          HLS.logoChange('maker');
      if (Number(d.msg.a) == 56) //8
          HLS.logoChange('cube');
      if (Number(d.msg.a) == 48)
          HL.cameraCompanion.visible = !HL.cameraCompanion.visible;

    });



    socket.on('cur_scene', function(d){HLS.startScene(d.curscene); console.log('cur_scene '+d.curscene); } );



  }

  return{
    init:init
  }
}();

// TODO: init socket da main
