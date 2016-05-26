// this stores all data coming from websocket / any remote source we want to connect
// TODO socket here


var HLR = {
  //audio
  fft1: 0.0,
  fft2: 0.0,
  fft3: 0.0,
  fft4: 0.0,
  fft5: 0.0,
  maxFFT1:0,
  maxFFT2:0,
  maxFFT3:0,
  maxFFT4:0,
  maxFFT5:0,
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

  HLR.updateFFT = function(a,b,c,d,e){
    HLR.fft1 = a;
    HLR.fft2 = b;
    HLR.fft3 = c;
    HLR.fft4 = d;
    HLR.fft5 = e;
  }

  // TODO bind to SOCKET
  HLR.updateClientsNumber = function(clientsConnected){
    HLE.mobileConnected = Math.round(clientsConnected);
  }


  HLR.updateHLParams = function(socket){
    if(socket!==undefined) this.updateFFT(AA.getFreq(0), AA.getFreq(1), AA.getFreq(12), AA.getFreq(32), AA.getFreq(64));
    else this.updateFFT(AA.getFreq(0), AA.getFreq(1), AA.getFreq(12), AA.getFreq(32), AA.getFreq(64));

    // begin audioreactive stuff
    if(!isNaN(HLR.fft1)){
      // compute smooth
      HLR.smoothFFT1 += (HLR.fft1 - HLR.smoothFFT1)*0.001;
      HLR.smoothFFT2 += (HLR.fft2 - HLR.smoothFFT2)*0.001;
      HLR.smoothFFT3 += (HLR.fft3 - HLR.smoothFFT3)*0.001;
      HLR.smoothFFT4 += (HLR.fft4 - HLR.smoothFFT4)*0.001;
      HLR.smoothFFT5 += (HLR.fft5 - HLR.smoothFFT5)*0.001;

      //compute max
      HLR.maxFFT1 = Math.max(HLR.maxFFT1, HLR.fft1);
      HLR.maxFFT2 = Math.max(HLR.maxFFT2, HLR.fft2);
      HLR.maxFFT3 = Math.max(HLR.maxFFT3, HLR.fft3);
      HLR.maxFFT4 = Math.max(HLR.maxFFT4, HLR.fft4);
      HLR.maxFFT5 = Math.max(HLR.maxFFT5, HLR.fft5);


      // compute move speed
      HLE.reactiveMoveSpeed = Math.max(1 + (HLR.fft1 + HLR.fft3 + HLR.fft4) * 0.333 * HLE.BASE_MOVE_SPEED, HLE.MAX_MOVE_SPEED);
      HLE.moveSpeed += ((Math.max( HLE.reactiveMoveSpeed,0))-HLE.moveSpeed) * 0.25;

      // compute seawaves height
      if(HLE.MIRROR)
        HL.materials.mirror.material.uniforms.time.value += HLR.fft4*0.2;
      if(HLE.WATER)
        HL.materials.water.material.uniforms.time.value += HLR.fft4*0.2;
      else
        HLE.reactiveSeaHeight = HLR.fft3*HLE.WORLD_HEIGHT*0.1;

      // compute land Heights
      HLR.tempNoiseFreq = 7 - (HLR.smoothFFT2 * 7 - HLR.smoothFFT3 * 6.5);
      HLR.tempNoiseFreq2 = .5 + HLR.smoothFFT4 * 15 * (HLR.smoothFFT3+1)*0.65 ;
      //TODO CHECK l'easing deve avvenire in base alla larghezza tile
      HLE.noiseFrequency +=  (HLR.tempNoiseFreq  - HLE.noiseFrequency ) * (1/HLE.WORLD_TILES * HLE.moveSpeed/HLE.BASE_MOVE_SPEED);
      HLE.noiseFrequency2 += (HLR.tempNoiseFreq2 - HLE.noiseFrequency2) * (1/HLE.WORLD_TILES * HLE.moveSpeed/HLE.BASE_MOVE_SPEED);
      //
      HLR.tempLandHeight = (HLR.smoothFFT1 * 0.55 + HLR.smoothFFT3 * .45 )
        * HLE.WORLD_HEIGHT * 0.75;
      if(HLE.CENTER_PATH) HLR.tempLandHeight*=3;
      HLE.landHeight += (HLR.tempLandHeight-HLE.landHeight)*0.25;
      // HLE.landZeroPoint = +HLE.landHeight * 20.1;
    }// end audioreactive stuff
  }
