// this stores all data coming from websocket / any remote source we want to connect

var HLR = {
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

    // HLR.maxFFT1 = Math.max(HLR.maxFFT1,a);
    // HLR.maxFFT2 = Math.max(HLR.maxFFT2,b);
    // HLR.maxFFT3 = Math.max(HLR.maxFFT3,c);
    // HLR.maxFFT4 = Math.max(HLR.maxFFT4,d);
    // HLR.maxFFT5 = Math.max(HLR.maxFFT5,e);
    //
    // HLR.fft1 = THREE.Math.mapLinear(HLR.fft1,0,HLR.maxFFT1,0,1);
    // HLR.fft2 = THREE.Math.mapLinear(HLR.fft2,0,HLR.maxFFT2,0,1);
    // HLR.fft3 = THREE.Math.mapLinear(HLR.fft3,0,HLR.maxFFT3,0,1);
    // HLR.fft4 = THREE.Math.mapLinear(HLR.fft4,0,HLR.maxFFT4,0,1);
    // HLR.fft5 = THREE.Math.mapLinear(HLR.fft5,0,HLR.maxFFT5,0,1);
  }

  HLR.updateClientsNumber = function(a){
    HLR.connectedClient = a;
  }

  HLR.listenKeys = function(){}

  var tempFFT1 = 0,
  tempFFT2 = 0,
  tempFFT3=0,
  tempFFT4 = 0,
  tempFFT5 = 0,
  tempDevLandHeight=0,
  tempLandZeroPoint=0,
  tempnoiseFreq=0,
  tempNoiseFreq2=0;

  HLR.updateHLParams = function(){
    this.updateFFT(AA.getFreq(0), AA.getFreq(1), AA.getFreq(12), AA.getFreq(32), AA.getFreq(64));


      HLE.faunaAmount = Math.round(HLR.connectedUsers);

    if(!isNaN(HLR.fft1)){

      HLE.reactiveSeaHeight = HLR.fft3*HLE.WORLD_HEIGHT*0.1;

      // compute move speed
      // lerp move speed according to audio
      HLE.reactiveMoveSpeed = (tempFFT1 + HLR.fft1 + HLR.fft4) * .5 *HLE.MAX_MOVE_SPEED * 0.5;
      HLE.moveSpeed += ((Math.max(Math.min(HLE.MAX_MOVE_SPEED, HLE.BASE_MOVE_SPEED + HLE.reactiveMoveSpeed),0))-HLE.moveSpeed) * 0.05;

    //  HLE.CLOUDS_SPEED = 1 + tempFFT4*20;
      // HLE.BASE_SEA_SPEED = 2.5 + HLR.fft3*1.1;

      // compute noise frequency for terrain generation
      tempFFT1 += (HLR.fft1 - tempFFT1)*0.005;
      tempFFT2 += (HLR.fft2 - tempFFT2)*0.005;
      tempFFT3 += (HLR.fft3 - tempFFT3)*0.005;
      tempFFT4 += (HLR.fft4 - tempFFT4)*0.005;
      tempFFT5 += (HLR.fft5 - tempFFT5)*0.005;

      tempNoiseFreq = 10 - (tempFFT2 * 10 - tempFFT3 * 9);
      tempNoiseFreq2 = 1 + tempFFT4 * 30 * (tempFFT3+1)*1.3 ;//- tempFFT2*20 + tempFFT3*50;// 20; //tempFFT3*20;// += (HLR.fft3*2000 - HLE.noiseFrequency2)*0.0005;
      // TODO noiseFreq deve essere proporzionale al WORLD_WIDTH

      HLE.noiseFrequency +=  (tempNoiseFreq *.7 - HLE.noiseFrequency) * 0.1;
      HLE.noiseFrequency2 += (tempNoiseFreq2*.4 - HLE.noiseFrequency2) * 0.3;



      // if(HLR.fft3>0.7) HL.camera.rotateY((Math.random()-.5)*.5);

      // compute terrain max height
     tempDevLandHeight =
      // Math.sin(millis*.5)*
     (tempFFT1 * 0.55 + tempFFT3 * .45 ) * HLE.WORLD_HEIGHT * 0.5;
      HLE.landHeight += (tempDevLandHeight-HLE.landHeight)*0.05;
      // HLE.landHeight = Math.sin(millis*.5)*HLE.WORLD_HEIGHT*0.5;
      HLE.landZeroPoint = -HLE.landHeight * 0.1;// Math.sin(millis*(1-tempFFT2) * 0.5) * HLE.landHeight;// + HL.noise.noise(millis,millis*0.3,10000)*tempDevLandHeight;//tempFFT2 * HLE.landHeight*0.5;
    //  HL.materials.clouds.opacity = tempFFT1;
      // HL.materials.fauna.opacity = HLR.fft3*0.5;

      // HLC.horizon.setHSL(millis*0.1%1,.4, HLR.fft3*.3);
    // HLC.horizon.setHSL(millis*0.1%1,.6, .1 + HLR.fft3*HLR.fft3*0.7);

    HLC.horizon.setHSL((frameCount/3600)%1,.2, .1 + HLR.fft3);
  //  HL.materials.water.material.uniforms.sunColor.value = HLC.horizon;//HLC.horizon;
    // HL.materials.water.material.uniforms.color.value = new THREE.Color(0x000000);//HLC.horizon;

  // HLC.horizon.setHSL((frameCount/36000)%1,1-HLR.fft1*HLR.fft4*0.4, .2 + HLR.fft1*.4);

    HL.materials.land.uniforms.color.value = HLC.land.setHSL((frameCount/3600)%1+.25,.9, tempFFT2*.4+HLR.fft3*0.4);
    if(!HLE.WATER) HLC.sea.setHSL(0,0,.05-HLR.fft5*.5);
    //HL.materials.clouds.size = 1000 - HLE.landHeight * 10;


    // TODO: debounce
    // if(!HLE.WATER && !HLE.MIRROR){
    //   if(HLR.fft4>0.55) HL.materials.sea.wireframe = true;
    //   else HL.materials.sea.wireframe = false;
    // }
    // else if(HLE.WATER){
    // //  if(HLR.fft4>0.65) HL.materials.water.material.uniforms.color.value = HLC.sea.set(0xffffff);
    // //  else HL.materials.water.material.uniforms.color.value = HLC.sea.set(0x000000);
    // }

    if(HLR.fft3>0.8 )
      HLH.startModel(HL.models.whale,THREE.Math.randInt(-HLE.WORLD_WIDTH,HLE.WORLD_WIDTH)*.5,HLE.WORLD_HEIGHT*2, 10);

    // if(HLR.fft2<0.85) HL.materials.land.wireframe = true;
    // else HL.materials.land.wireframe = false;

      if(HLR.fft4>0.4) HLE.shotFlora = true;
      // HL.materials.clouds.opacity = 1-HLR.fft3;
    //  HLC.horizon.setHSL(millis*.1%1,.8, .2 + tempFFT3*.2 + HLR.fft3*.2);

    }
  }
