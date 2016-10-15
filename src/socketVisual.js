var socketVisual = function(){
  var socket = io('http://pixelsmasher.io:1502');

  function init(){
    //chech if previously got a ID
    var local_mobi_id = window.localStorage.getItem('mobile_id');

    //send acknowledge
    if(isMobile) socket.emit('ack',{whoami:'mobi',mobi_id:local_mobi_id}); //TODO
    else socket.emit('ack',{whoami:'visual'});

    socket.on('youare', function(e){console.log(e); window.localStorage.setItem('mobile_id',e.mobi_id);});

    console.log('sent ack');


    var hidden, visibilityChange;
    if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
      hidden = "hidden";
      visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
      visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
      visibilityChange = "webkitvisibilitychange";
    }

    function handleVisibilityChange() {
        socket.emit('hidden',{hidden:document.hidden});
        console.log(document.hidden);
    }

    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
      console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
    } else {
      // Handle page visibility change
      document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }




    // // socket.on('mobi_keypush',function(e){console.log('mobi keypush '+e)});
    // // socket.on('mobi_count',function(e){console.log('mobi count'); console.log(e)});
    //
    // console.log('socket event listeners set');

    //reset HLRemote params
    // HLRemote.updateHLParams(0,0,0,0,0);
    if(!partSocket)
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

      // console.log("mxr_push_to_cli_key ",d.msg.a);
      //
      // if (Number(d.msg.a) == 49) //1
      //     HLH.shootGroup('sea', 8, false, false);
      // if (Number(d.msg.a) == 50) //2
      //     HLH.shootGroup('weird', 0, true, true);
      // if (Number(d.msg.a) == 51) //3
      //     HLH.shootGroup('space', 50, true, false);
      // if (Number(d.msg.a) == 52) //4
      //     HLH.startModel(HL.models['whale'],
      //     THREE.Math.randInt(-1000, 1000),
      //     THREE.Math.randInt(-HLE.WORLD_HEIGHT * 0.01, HLE.WORLD_HEIGHT * 1.1), 2.5, null, 10); //TODO
      if (Number(d.msg.a) == 53) //5
          HLH.shootGroup(HLS.modelsParams);

      if (Number(d.msg.a) == 54) //6
          HLS.logoChange('logo');
      if (Number(d.msg.a) == 56) //8
          HLS.logoChange('cube');
      if (Number(d.msg.a) == 48)//0
          HL.cameraCompanion.visible = !HL.cameraCompanion.visible;

      if (Number(d.msg.a) == 57){ //9
        HLE.CENTER_PATH=!HLE.CENTER_PATH;
        HL.materials.land.uniforms.withCenterPath.value = HLE.CENTER_PATH;
      }

    });



    socket.on('cur_scene', function(d){HLS.startScene(d.curscene); console.log('cur_scene '+d.curscene); } );



  }

  return{
    init:init
  }
}();

// TODO: init socket da main
