// this stores all data coming from websocket / any remote source we want to connect
// TODO socket here
var HLR = {
  //audio
  fft1: 0.0,
  fft2: 0.0,
  fft3: 0.0,
  // fft4: 0.0,
  // fft5: 0.0,
  maxFFT1:0.0001,
  maxFFT2:0.0001,
  maxFFT3:0.0001,
  // maxFFT4:0.0001,
  // maxFFT5:0.0001,
  smoothFFT1:0,
  smoothFFT2:0,
  smoothFFT3:0,
  // smoothFFT4:0,
  // smoothFFT5:0,

  // socket
  connectedUsers:0, // affects fauna
  key1: false,
  key2: false,
  key3: false,
  key4: false,
  key5: false,


  //temp vars to be used by scenes
  tempLandHeight:0,
  tempLandZeroPoint:0,
  tempNoiseFreq:0,
  tempNoiseFreq2:0,

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

    // begin audioreactive stuff
//    if(!isNaN(HLR.fft1)){
      // compute smooth
      HLR.smoothFFT1 += (HLR.fft1 - HLR.smoothFFT1)*0.005;
      HLR.smoothFFT2 += (HLR.fft2 - HLR.smoothFFT2)*0.005;
      HLR.smoothFFT3 += (HLR.fft3 - HLR.smoothFFT3)*0.005;
      // HLR.smoothFFT4 += (HLR.fft4 - HLR.smoothFFT4)*0.005;
      // HLR.smoothFFT5 += (HLR.fft5 - HLR.smoothFFT5)*0.005;

      //compute max
      // HLR.maxFFT1 = HLR.fft1>HLR.maxFFT1?HLR.fft1:HLR.maxFFT1; UNUSED
      // HLR.maxFFT2 = HLR.fft2>HLR.maxFFT2?HLR.fft2:HLR.maxFFT2; UNUSED
      // HLR.maxFFT3 = HLR.fft3>HLR.maxFFT3?HLR.fft3:HLR.maxFFT3; UNUSED
      // HLR.maxFFT4 = HLR.fft4>HLR.maxFFT4?HLR.fft4:HLR.maxFFT4; UNUSED
      // HLR.maxFFT5 = HLR.fft5>HLR.maxFFT5?HLR.fft5:HLR.maxFFT5; // USED in sceneManaer

  }


  function keyboardControls(k) {
    // console.log(k);
      // create keys for scenes
      var keyCodeIndex = 65 // 'a' on keyboard
      for (var key in HLSP) {
          if (k.keyCode == keyCodeIndex++) {
            // console.log(key);
              HLS.startScene(key);
          }
      }
      //
      if (k.keyCode == 49) //1
          HLH.shootGroup('sea', 8, false, false);
      if (k.keyCode == 50) //2
          HLH.shootGroup('weird', 0, true, true);
      if (k.keyCode == 51) //3
          HLH.shootGroup('space', 50, true, false);
      if (k.keyCode == 52) //4
          HLH.startModel(HL.models['whale'],
          THREE.Math.randInt(-1000, 1000),
          THREE.Math.randInt(-HLE.WORLD_HEIGHT * 0.01, HLE.WORLD_HEIGHT * 1.1), 2.5, null, 10); //TODO
      if (k.keyCode == 53) //5
          HLH.shootGroup(HLS.modelsParams);

      if (k.keyCode == 54) //6
          HLS.logoChange('intro');
      if (k.keyCode == 55) //7
          HLS.logoChange('logo');
      if (k.keyCode == 56) //8
          HLS.logoChange('cube');
      if (k.keyCode == 48)//0
          HL.cameraCompanion.visible = !HL.cameraCompanion.visible;


      if(k.keyCode == 57){ //9
        HLE.CENTER_PATH=!HLE.CENTER_PATH;
        HL.materials.land.uniforms.withCenterPath.value = HLE.CENTER_PATH;
      }

      if(k.keyCode == 88){ //x ?
        HLS.logoChange(HUD.textGeometries.mizu);
      }


        if(k.key == 'p'){
          AA.audioPlayPause();
        }

        if(k.key == 'm'){
          AA.connectMic();
        }

        if(k.key=='f'){
          AA.connectFile();
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
  if(noSocket){
     window.addEventListener('keydown', keyboardControls);
   }

  // listen audio events
  window.addEventListener('HLEload', function(){
    AA.audioFile.addEventListener('timeupdate', function(){
      if (AA.audioFile.currentTime > 0) {
        var value = (100 / AA.audioFile.duration) * AA.audioFile.currentTime;
      }
      document.getElementById('progress').style.width = value + "%";
    });
  });

  return{
    updateHLParams:function(a,b,c){return updateHLParams(a,b,c)},
  }
}();
