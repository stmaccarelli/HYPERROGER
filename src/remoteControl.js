// this stores all data coming from websocket / any remote source we want to connect
// TODO socket here
var HLR = {
  //audio
  fft1: 0.0,
  fft2: 0.0,
  fft3: 0.0,
  // fft4: 0.0,
  // fft5: 0.0,
  // maxFFT1:0.0001,
  // maxFFT2:0.0001,
  // maxFFT3:0.0001,
  // maxFFT4:0.0001,
  // maxFFT5:0.0001,
  smoothFFT1:0,
  smoothFFT2:0,
  smoothFFT3:0,
  // smoothFFT4:0,
  // smoothFFT5:0,

  // socket
  // connectedUsers:0, // affects fauna
  // key1: false,
  // key2: false,
  // key3: false,
  // key4: false,
  // key5: false,


  //temp vars to be used by scenes
  tempLandHeight:0,
  tempLandZeroPoint:0,
  tempNoiseFreq:0,
  tempNoiseFreq2:0,

  // global game status
  status:0
}


var HLRemote = function(){


  function updateFFT(a,b,c){
    HLR.fft1 = a;
    HLR.fft2 = b;
    HLR.fft3 = c;

  }

  // TODO bind to SOCKET
  function updateClientsNumber(clientsConnected){
    HLE.mobileConnected = Math.round(clientsConnected);
    HLR.connectedUsers = clientsConnected;
  }

  function updateHLParams(a,b,c){
    // TODO: memory optimization

      updateFFT(
        Math.max(a,0.0001),
        Math.max(b,0.0001),
        Math.max(c,0.0001)
      );

      // compute smooths
      HLR.smoothFFT1 += (HLR.fft1 - HLR.smoothFFT1)*0.04;
      HLR.smoothFFT2 += (HLR.fft2 - HLR.smoothFFT2)*0.04;
      HLR.smoothFFT3 += (HLR.fft3 - HLR.smoothFFT3)*0.04;

  }


  function keyboardControls(k) {
      // create keys for scenes
      var keyCodeIndex = 65 // 'a' on keyboard is the first key for scenes
      for (var key in HLSP) {
          if (k.keyCode == keyCodeIndex++) {
              HLS.startScene(key);
          }
      }

      if (k.keyCode == 53) //5
      HLH.shootGroup(['space', 1, 1,true,false, HLE.WORLD_HEIGHT / 3 ] );

      // if (k.keyCode == 54) //6
      //     HLS.logoChange('intro');
      // if (k.keyCode == 55) //7
      //     HLS.logoChange('logo');
      // if (k.keyCode == 56) //8
      //     HLS.logoChange('cube');
      // if (k.keyCode == 48)//0
      //     HL.cameraCompanion.visible = !HL.cameraCompanion.visible;


      // if(k.keyCode == 57){ //9
      //   HLE.CENTER_PATH=!HLE.CENTER_PATH;
      //   HL.materials.land.uniforms.withCenterPath.value = HLE.CENTER_PATH;
      // }

      if(k.keyCode == 88){ //x ?
        HLS.logoChange(HUD.textGeometries.mizu);
      }


        // if(k.key == 'p'){
        //   AA.filePlayPause();
        // }

        if(k.key == 'm'){
          AA.connectMic();
        }

        if(k.key=='f'){
          AA.connectFile();
        }

        if(k.key==' '){
          playPause();
        }

        // lancio modelli
        if(k.key=='h' || k.key=='H'){
          HLH.startModel(HL.models['heartbomb'],
            THREE.Math.randInt(-1000, 1000),
            THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 20, 'xyz', 4
          ); //TODO
        }

        if(k.key=='y' || k.key=='Y'){
          HLH.shootGroup(['band', 10, 20,true,false, HLE.WORLD_HEIGHT / 3 ] );
        }

        if(k.key=='p' || k.key=='P'){
          HLH.startModel(HL.models['whale'],
            THREE.Math.randInt(-1000, 1000),
            THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 20, null, 10
          ); //TODO
        }

        if(k.key=='e' || k.key=='E'){
          HLH.startModel(HL.models['ducky'],
            THREE.Math.randInt(-1000, 1000),
            THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 20, 'xyz', 100
          ); //TODO
        }

        if(k.key=='r' || k.key=='R'){
          HLH.startModel(HL.models['airbus'],
            THREE.Math.randInt(-1000, 1000),
            THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 40, null, 5
          ); //TODO
        }

      //
      // if(k.keyCode==49)//1
      //   {HLS.startScene('scene1');}
      // if(k.keyCode==50)//2
      //   {HLS.startScene('scene2');}
      // // if(k.keyCode==51)//3
      // //   {HLS.startScene('scene3');}

      // if(k.keyCode==67){//c
      //   HLE.CENTER_PATH=!HLE.CENTER_PATH;
      //   HLE.cameraHeight = 0;
      //   HL.land.material.uniforms.withCenterPath.value = HLE.CENTER_PATH;
      // }

  }


  // listen keyboard TODO+ check final commands!
  window.addEventListener('keydown', keyboardControls);

  // SCREENS MANAGEMENT

  // show/hide html element by selector
  var visible = (function(selector, visible){
    var elements = document.querySelectorAll(selector);
    for( var i =0; i<elements.length; i++ ){
      elements[i].style.opacity = visible?1:0;
      elements[i].style.display = visible?'block':'none';
      console.log('visible: selector: '+selector+' visibile: '+visible);
    }
  });

  //pause game
  var playPause = function(){
    //pause file if playing
    AA.filePlayPause();
    //show pause div if paused
    visible('#paused', AA.fileGetPaused());
  };
  // document.addEventListener('mousedown', playPause);

  // MASTER SCENES ROUTINE

  var screensInit = function(){
    var totalLoading = 0;
    HL.modelsLoadingManager.onProgress = function( url, itemsLoaded, itemsTotal ){
      document.getElementById('modelsLoading').style.width =
        (100 / itemsTotal) * itemsLoaded + '%';

    };
    HL.texturesLoadingManager.onProgress = function( url, itemsLoaded, itemsTotal ){
      document.getElementById('texturesLoading').style.width =
        (100 / itemsTotal) * itemsLoaded + '%';
    };


  }

  window.addEventListener('HLEload', function(){
    // connect FILE and play file
    AA.connectFile();
    // AA.filePlayPause();
    // hide intro screen
    visible('#intro',false);

    // show ending screen when audio ends
    AA.fileEventListener('ended', function(){
      // update game status
      HLR.status = 0;
      // rewind file trach
      AA.fileRewind();
      //show ending screens
      visible('#ended',true);

    });

    // change progress bar
    AA.fileEventListener('timeupdate', function(){
      if (AA.fileGetTime() > 0) {
        var value = (100 / AA.fileGetDuration()) * AA.fileGetTime();
      }
      document.getElementById('progress').style.width = value + "%";
    });

  });

  return{
    updateHLParams:function(a,b,c){return updateHLParams(a,b,c)},
    screensInit:screensInit
  }
}();
