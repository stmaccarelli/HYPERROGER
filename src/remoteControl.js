// this stores all data coming from websocket / any remote source we want to connect
// TODO socket here
var HLR = {
  //audio
  fft1: 0.0,
  fft2: 0.0,
  fft3: 0.0,
  fft4: 0.0,
  fft5: 0.0,
  maxFFT1:0.0001,
  maxFFT2:0.0001,
  maxFFT3:0.0001,
  maxFFT4:0.0001,
  maxFFT5:0.0001,
  smoothFFT1:0,
  smoothFFT2:0,
  smoothFFT3:0,
  smoothFFT4:0,
  smoothFFT5:0,

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


  function updateFFT(a,b,c,d,e){
    HLR.fft1 = a;
    HLR.fft2 = b;
    HLR.fft3 = c;
    HLR.fft4 = d;
    HLR.fft5 = e;
  }

  // TODO bind to SOCKET
  function updateClientsNumber(clientsConnected){
    HLE.mobileConnected = Math.round(clientsConnected);
  }

  function updateHLParams(a,b,c,d,e){
    // TODO: memory optimization

      updateFFT(
        Math.max(a,0.0001),
        Math.max(b,0.0001),
        Math.max(c,0.0001),
        Math.max(d,0.0001),
        Math.max(e,0.0001)
      );

    // begin audioreactive stuff
//    if(!isNaN(HLR.fft1)){
      // compute smooth
      HLR.smoothFFT1 += (HLR.fft1 - HLR.smoothFFT1)*0.005;
      HLR.smoothFFT2 += (HLR.fft2 - HLR.smoothFFT2)*0.005;
      HLR.smoothFFT3 += (HLR.fft3 - HLR.smoothFFT3)*0.005;
      HLR.smoothFFT4 += (HLR.fft4 - HLR.smoothFFT4)*0.005;
      HLR.smoothFFT5 += (HLR.fft5 - HLR.smoothFFT5)*0.005;

      //compute max
      // HLR.maxFFT1 = HLR.fft1>HLR.maxFFT1?HLR.fft1:HLR.maxFFT1; UNUSED
      // HLR.maxFFT2 = HLR.fft2>HLR.maxFFT2?HLR.fft2:HLR.maxFFT2; UNUSED
      // HLR.maxFFT3 = HLR.fft3>HLR.maxFFT3?HLR.fft3:HLR.maxFFT3; UNUSED
      // HLR.maxFFT4 = HLR.fft4>HLR.maxFFT4?HLR.fft4:HLR.maxFFT4; UNUSED
      HLR.maxFFT5 = HLR.fft5>HLR.maxFFT5?HLR.fft5:HLR.maxFFT5; // USED in sceneManaer


      // // compute move speed
      // HLE.reactiveMoveSpeed = max(1 + (HLR.fft1 + HLR.fft3 + HLR.fft4) * 0.333 * HLE.BASE_MOVE_SPEED, HLE.MAX_MOVE_SPEED);
      // // HLE.moveSpeed += ((Math.max( HLE.reactiveMoveSpeed*delta*100,0))-HLE.moveSpeed) * 0.25;
      // HLE.moveSpeed += ((max( HLE.reactiveMoveSpeed,0))-HLE.moveSpeed) * 0.25;

      // compute move speed
      HLE.reactiveMoveSpeed = 1 + (HLR.fft1 + HLR.fft4) * 0.75 * HLE.BASE_MOVE_SPEED;
      HLE.moveSpeed += (HLE.reactiveMoveSpeed-HLE.moveSpeed)*0.15;
  //    HLE.moveSpeed = HLE.reactiveMoveSpeed<0?0:HLE.reactiveMoveSpeed;

      // sea height of uniforms update
      if(HLE.MIRROR)
        HL.materials.mirror.material.uniforms.time.value += HLR.fft4*0.2;
      if(HLE.WATER){
        HL.materials.water.material.uniforms.time.value += HLR.fft4*0.2;
       HL.materials.land.uniforms.buildFreq.value += Math.min(HLR.fft2-0.85, 0.00001) * 0.005;
      }
      else
        HLE.reactiveSeaHeight = HLR.fft3*HLE.WORLD_HEIGHT*0.1;

      // compute land Heights
      // HLR.tempNoiseFreq = 7 - (HLR.smoothFFT2 * 7 - HLR.smoothFFT3 * 6.5);
      // HLR.tempNoiseFreq2 = .5 + HLR.smoothFFT4 * 15 * (HLR.smoothFFT3+1)*0.65 ;
      HLR.tempNoiseFreq = 7 - (HLR.smoothFFT2 - HLR.smoothFFT3)*3;
      HLR.tempNoiseFreq2 = .5 + HLR.smoothFFT4 * 15;

      //TODO CHECK l'easing deve avvenire in base alla larghezza tile
      HLE.noiseFrequency +=  (HLR.tempNoiseFreq  - HLE.noiseFrequency ) * (1/HLE.WORLD_TILES * HLE.moveSpeed/HLE.BASE_MOVE_SPEED);
      HLE.noiseFrequency2 += (HLR.tempNoiseFreq2 - HLE.noiseFrequency2) * (1/HLE.WORLD_TILES * HLE.moveSpeed/HLE.BASE_MOVE_SPEED);

    //  HL.land.position.x += HLR.fft3;
      // HLE.noiseFrequency2

      //
      HLR.tempLandHeight = (HLR.smoothFFT1 + HLR.smoothFFT3 )
        * HLE.WORLD_HEIGHT*1;
      if(HLE.CENTER_PATH) HLR.tempLandHeight*=3;
      HLE.landHeight += (HLR.tempLandHeight-HLE.landHeight)*0.45;
      //  HLE.landZeroPoint = - HLR.fft3 * HLE.landHeight * .5;
  //  }// end audioreactive stuff


  }

  return{
    updateHLParams:function(a,b,c,d,e){return updateHLParams(a,b,c,d,e)},
  }
}();
