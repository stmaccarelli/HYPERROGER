// this stores all data coming from websocket / any remote source we want to connect

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

  // just a local for requestAnimationFrame
  raf: null,
  sceneStart:0,
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
    HLE.faunaAmount = Math.round(clientsConnected);
  }


  HLR.updateHLParams = function(){
      this.updateFFT(AA.getFreq(0), AA.getFreq(1), AA.getFreq(12), AA.getFreq(32), AA.getFreq(64));

    // begin audioreactive stuff
    if(!isNaN(HLR.fft1)){
      // compute smooth
      HLR.smoothFFT1 += (HLR.fft1 - HLR.smoothFFT1)*0.005;
      HLR.smoothFFT2 += (HLR.fft2 - HLR.smoothFFT2)*0.005;
      HLR.smoothFFT3 += (HLR.fft3 - HLR.smoothFFT3)*0.005;
      HLR.smoothFFT4 += (HLR.fft4 - HLR.smoothFFT4)*0.005;
      HLR.smoothFFT5 += (HLR.fft5 - HLR.smoothFFT5)*0.005;

      // compute move speed
      HLE.reactiveMoveSpeed = (HLR.smoothFFT1 + HLR.fft1 + HLR.fft4) * .3 *HLE.MAX_MOVE_SPEED;
      HLE.moveSpeed += ((Math.max( HLE.reactiveMoveSpeed,0))-HLE.moveSpeed) * 0.5;

      // compute seawaves height
      if(HLE.MIRROR)
        HL.materials.mirror.material.uniforms.time.value += 0.001 + HLE.moveSpeed * .004 + HLR.fft4*0.2;
      else if(HLE.WATER)
        HL.materials.water.material.uniforms.time.value += 0.001 + HLE.moveSpeed * .004 + HLR.fft4*0.2;
      else
        HLE.reactiveSeaHeight = HLR.fft3*HLE.WORLD_HEIGHT*0.1;

      // compute land Heights
      HLR.tempNoiseFreq = 7 - (HLR.smoothFFT2 * 7 - HLR.smoothFFT3 * 6.5);
      HLR.tempNoiseFreq2 = .5 + HLR.smoothFFT4 * 15 * (HLR.smoothFFT3+1)*0.65 ;
      //TODO CHECK l'easing deve avvenire in base alla larghezza tile
      HLE.noiseFrequency +=  (HLR.tempNoiseFreq  - HLE.noiseFrequency ) * (1/HLE.WORLD_TILES * HLE.moveSpeed/HLE.MAX_MOVE_SPEED);
      HLE.noiseFrequency2 += (HLR.tempNoiseFreq2 - HLE.noiseFrequency2) * (1/HLE.WORLD_TILES * HLE.moveSpeed/HLE.MAX_MOVE_SPEED);
      //
      HLR.tempLandHeight = (HLR.smoothFFT1 * 0.55 + HLR.smoothFFT3 * .45 )
        * HLE.WORLD_HEIGHT * 0.5 + 0.1;
      if(HLE.CENTER_PATH) HLR.tempLandHeight*=3;
      HLE.landHeight += (HLR.tempLandHeight-HLE.landHeight)*0.5;
      HLE.landZeroPoint = -HLE.landHeight * 0.1;
    }// end audioreactive stuff
  }

  HLR.startScene = function(sceneId){
    if(HLR[sceneId]!==undefined){
      // stop previous animation
      window.cancelAnimationFrame(HLR.raf);
      //init new scene
      if(HLR[sceneId+'init']!==undefined) HLR[sceneId+'init']();
      //start new animation
      HLR.sceneStart = frameCount;
      HLR[sceneId]();
    }
  }

  HLR.scene2init = function(){
    if(hud!==undefined) hud.display('SCENE TWO. FOLLOW YOUR FOLLOWER',3);
    HL.materials.land.wireframe=false;
    HL.materials.land.uniforms.color.value = HLC.land.setRGB(Math.random(),Math.random(),Math.random());
  }

  var colorCycle=0;
  HLR.scene2 = function(){
    HLR.raf = window.requestAnimationFrame(HLR.scene2);

    colorCycle+= HLR.fft5*0.01;
    // HLC.horizon.setRGB(.2+(frameCount/300)%.8,.1+(frameCount/300)%.8,(frameCount/300)%.8);
    HLC.horizon.setRGB(.2+(colorCycle)%.8,.1+(colorCycle)%.8,(colorCycle)%.8);
  }


  HLR.scene1init = function(){
    if(hud!==undefined) hud.display('SCENE ONE. ONLY GOD KNOWS',3);
  }
  HLR.scene1 = function(){
    HLR.raf = window.requestAnimationFrame(HLR.scene1);

    // supported: timer for scene switch from one to another
  //  if(frameCount-HLR.sceneStart>=600) HLR.startScene('scene2');

    //  HLE.CLOUDS_SPEED = 1 + HLR.smoothFFT4*20;
      // HLE.BASE_SEA_SPEED = 2.5 + HLR.fft3*1.1;

      //  HL.materials.clouds.opacity = HLR.smoothFFT1;
        // HL.materials.fauna.opacity = HLR.fft3*0.5;

      // HLC.horizon.setHSL(millis*0.1%1,.4, HLR.fft3*.3);
    // HLC.horizon.setHSL(millis*0.1%1,.6, .1 + HLR.fft3*HLR.fft3*0.7);

    HLC.horizon.setHSL((frameCount/3600)%1,.2, .1 + HLR.fft3);
  //  HL.materials.water.material.uniforms.sunColor.value = HLC.horizon;//HLC.horizon;
    // HL.materials.water.material.uniforms.color.value = new THREE.Color(0x000000);//HLC.horizon;

     HLC.horizon.setHSL((frameCount/36000)%1,1-HLR.fft1*HLR.fft4*0.4, .2 + HLR.fft1*.4);
    //HLC.horizon.setRGB((frameCount/36000)%1,1-HLR.fft1*HLR.fft4*0.4, .2 + HLR.fft1*.4);

   HL.materials.land.uniforms.color.value = HLC.land.setHSL((frameCount/3600)%1+.25,.9, .1+HLR.fft3*.5);
  //  if(!HLE.WATER) HLC.sea.setHSL(0,0,.05-HLR.fft5*.5);
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

    // if(HLR.fft2>0.95) HL.materials.land.uniforms.color.value = HLC.gWhite;
    if(HLR.fft4>0.6){
      if(shotFlora){
        HLH.shotFloraCluster(HL.geometries.flora, HLE.landStepsCount, 1);
        shotFlora=false;
      }
    }
    else shotFlora=true;
      // HL.materials.clouds.opacity = 1-HLR.fft3;
    //  HLC.horizon.setHSL(millis*.1%1,.8, .2 + HLR.smoothFFT3*.2 + HLR.fft3*.2);

  }

  HLR.modelshooting = function(k){
    console.log(k);
    if(k.keyCode==87)//w
      HLH.startModel(HL.models.whale,THREE.Math.randInt(-HLE.WORLD_WIDTH/2,HLE.WORLD_WIDTH/2),HLE.WORLD_HEIGHT*3, 10);
    if(k.keyCode==88)//x
      HLH.startModel(HL.models.ducky,THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),0.1, 0);
    if(k.keyCode==89)//y
      HLH.startModel(HL.models.whale2,THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),true, 0);
    if(k.keyCode==90)//z
      {HLR.startScene('scene1');}
    if(k.keyCode==86)//v
      {HLR.startScene('scene2');}
    if(k.keyCode==67){
      HLE.CENTER_PATH=!HLE.CENTER_PATH;
      HLE.cameraHeight = 0;
      hud.display('HLE.CENTER_PATH= '+HLE.CENTER_PATH, 5);
    }

  }
  window.addEventListener('keyup',HLR.modelshooting);
