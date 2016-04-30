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

      HLE.reactiveSeaHeight = HLR.fft3*HLE.WORLD_HEIGHT*0.05;

      // compute move speed
      // lerp move speed according to audio
      HLE.reactiveMoveSpeed = (tempFFT1 + HLR.fft1 ) * .5 *HLE.MAX_MOVE_SPEED;

      // compute noise frequency for terrain generation
      tempFFT1 += (HLR.fft1 - tempFFT1)*0.005;
      tempFFT2 += (HLR.fft2 - tempFFT2)*0.005;
      tempFFT3 += (HLR.fft3 - tempFFT3)*0.005;
      tempFFT4 += (HLR.fft4 - tempFFT4)*0.005;

      HLE.noiseFrequency = .5 + Math.max(0, tempFFT4 * 5 ) ;
      HLE.noiseFrequency2 = 2.0 + Math.max(0, tempFFT3 * 40 - tempFFT2*20 );//- tempFFT2*20 + tempFFT3*50;// 20; //tempFFT3*20;// += (HLR.fft3*2000 - HLE.noiseFrequency2)*0.0005;
      // TODO noiseFreq deve essere proporzionale al WORLD_WIDTH

      // compute terrain max height
     tempDevLandHeight =
      // Math.sin(millis*.5)*
     1 + (tempFFT1 * .35 + tempFFT3 * .55 ) * HLE.WORLD_HEIGHT ;
      HLE.landHeight += (tempDevLandHeight-HLE.landHeight)*0.08;
      // HLE.landHeight = Math.sin(millis*.5)*HLE.WORLD_HEIGHT*0.5;
      HLE.landZeroPoint = -HLE.landHeight * 0.5;// Math.sin(millis*(1-tempFFT2) * 0.5) * HLE.landHeight;// + HL.noise.noise(millis,millis*0.3,10000)*tempDevLandHeight;//tempFFT2 * HLE.landHeight*0.5;
    //  HL.materials.clouds.opacity = tempFFT1;
      // HL.materials.fauna.opacity = HLR.fft3*0.5;

      // HLC.horizon.setHSL(millis*0.1%1,.4, HLR.fft3*.3);
      HLC.horizon.setHSL(.65,.4, HLR.fft3*.3);
    //  HLC.sea.setHSL(0,0, -.4 + tempFFT3*.3 + HLR.fft3*.7);

    //HL.materials.clouds.size = 1000 - HLE.landHeight * 10;

      if(HLR.fft2>0.85) HLE.shotFlora = true;
      // HL.materials.clouds.opacity = 1-HLR.fft3;
//      HLC.horizon.setHSL(millis*.1%1,.8, .2 + tempFFT3*.2 + HLR.fft3*.2);
    }
  }
