// this stores all data coming from websocket / any remote source we want to connect

var HLR = {
  fft1: 0.0,
  fft2: 0.0,
  fft3: 0.0,
  fft4: 0.0,
  fft5: 0.0,

  connectedUsers:0, // affects fauna

  key1: false,
  key2: false,
  key3: false,
  key4: false,
  key5: false,
}

  HLR.updateFFT = function(a,b,c,d,e){
    HLR.fft1 = a;
    HLR.fft2 = b;
    HLR.fft3 = c;
    HLR.fft4 = d;
    HLR.fft5 = e;
  }

  HLR.updateClientsNumber = function(a){
    HLR.connectedClient = a;
  }

  HLR.listenKeys = function(){}

  var tempFFT1 = 0,
  tempFFT2 = 0,
  tempFFT3=0,
  tempFFT4 = 0,
  tempDevLandHeight=0,
  tempLandZeroPoint=0;

  HLR.updateHLParams = function(){
    this.updateFFT(AA.getFreq(0), AA.getFreq(1), AA.getFreq(12), AA.getFreq(32), AA.getFreq(127));

      HLE.faunaAmount = Math.round(HLR.connectedUsers);

    if(!isNaN(HLR.fft1)){
      HLE.reactiveSeaHeight = HLR.fft2*10;

      // compute move speed
      // lerp move speed according to audio
      HLE.reactiveMoveSpeed += (HLR.fft1 * HLE.MAX_MOVE_SPEED - HLE.reactiveMoveSpeed) * 0.001;
    //  HLE.moveSpeed = Math.max(HLE.MAX_MOVE_SPEED, HLE.BASE_MOVE_SPEED + HLE.reactiveMoveSpeed*0.8);

      // compute noise frequency for terrain generation
      tempFFT1 += (HLR.fft1 - tempFFT1)*0.005;
      tempFFT2 += (HLR.fft2 - tempFFT2)*0.005;
      tempFFT3 += (HLR.fft3 - tempFFT3)*0.005;
      tempFFT4 += (HLR.fft4 - tempFFT4)*0.005;

      HLE.noiseFrequency = .5 + Math.max(0, tempFFT4 * 10 ) ;
      HLE.noiseFrequency2 = 1 + Math.max(0, tempFFT3*50 - tempFFT2*10 );//- tempFFT2*20 + tempFFT3*50;// 20; //tempFFT3*20;// += (HLR.fft3*2000 - HLE.noiseFrequency2)*0.0005;

      // compute terrain max height
     tempDevLandHeight =
      // Math.sin(millis*.5)*
     2 + (tempFFT1 * .35 + tempFFT3 * .15 + HLR.fft1 * .1) * HLE.WORLD_HEIGHT;
      HLE.landHeight += (tempDevLandHeight-HLE.landHeight)*0.05;
      // HLE.landHeight = Math.sin(millis*.5)*HLE.WORLD_HEIGHT*0.5;
      HLE.landZeroPoint = Math.sin(millis*(1-tempFFT3)) * HLE.landHeight * 0.5;// + HL.noise.noise(millis,millis*0.3,10000)*tempDevLandHeight;//tempFFT2 * HLE.landHeight*0.5;

      HL.materials.clouds.opacity = tempFFT1;
      // HL.materials.fauna.opacity = HLR.fft3*0.5;

      HLC.horizon.setHSL(1 - tempFFT1*.5,.8, .1 + tempFFT3*.1 + HLR.fft3*.4);

      if(HLR.fft2>0.85) HLE.shotFlora = true;

   //   HLE.landFriction = Math.pow(Math.sin(millis*0.1),3)/2 +.5;

//      HLC.horizon.setHSL(millis*.1%1,.8, .2 + tempFFT3*.2 + HLR.fft3*.2);
    }
  }
