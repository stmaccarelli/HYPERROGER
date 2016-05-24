var HLS ={

    // just a local for requestAnimationFrame
    raf: null,
    sceneStart:0,

    //local debouncers
    shotFlora:true,
}

  HLS.startScene = function(sceneId){
    if(HLS[sceneId]!==undefined){
      // stop previous animation
      window.cancelAnimationFrame(HLS.raf);
      //init new scene
      if(HLS[sceneId+'init']!==undefined) HLS[sceneId+'init']();
      //start new animation
      HLS.sceneStart = frameCount;
      HLS[sceneId]();
    }
  }

  HLS.scene2init = function(){
    hud.display('CHAPTER TWO.|nFOLLOW YOUR FOLLOWERS',3,true);
    HL.materials.skybox.map = null;
    HL.materials.skybox.needsUpdate = true;
    HL.materials.land.wireframe=true;
    HL.materials.land.uniforms.color.value = HLC.land.setHSL(Math.random(),1,.5);//,.5+Math.random(),.5+Math.random());
    // HL.materials.water
    HL.models.whale.material.map = HL.dynamicTextures.stars.texture;
    HL.models.whale.material.needsUpdate = true;
  }

  var tempColor=0;
  HLS.scene2 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene2);

    tempColor = HLR.fft2*HLR.fft2*HLR.fft2;

    HLC.horizon.setRGB(tempColor,tempColor,tempColor);
    //HLC.horizon.setRGB(.2+(colorCycle)%.8,.1+(colorCycle)%.8,(colorCycle)%.8);

    //stars dynamicTextureAni
    HL.dynamicTextures.stars.c.clearRect(0,0,HL.dynamicTextures.stars.width,HL.dynamicTextures.stars.height);
    HL.dynamicTextures.stars.c.fillStyle = 'white';
    // for(var x=0; x<HL.dynamicTextures.stars.width;x+=20){
    //   for(var y=0; y<HL.dynamicTextures.stars.height;y+=20){
    //     HL.dynamicTextures.stars.c.fillRect(x+HLR.fft3*y*.5, y+HLR.fft2*x*.5, HLR.fft3*4,HLR.fft4*20);
    //   }
    // }
    HL.dynamicTextures.stars.c.fillRect(0,0, HLR.fft2*512,HLR.fft4*512);
    HL.dynamicTextures.stars.texture.needsUpdate=true;

  }


  HLS.scene1init = function(){
    hud.display('CHAPTER ONE.\nONLY GOD KNOWS',3, true);
    HL.materials.skybox.map = HL.textures.ducky;
    HL.materials.skybox.needsUpdate = true;

    HL.materials.land.wireframe=false;
    HL.materials.water.material.uniforms.alpha.value = 0.90;
    HLH.destroyAllModels();
  }
  HLS.scene1 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene1);

    // supported: timer for scene switch from one to another
  //  if(frameCount-HLS.sceneStart>=600) HLR.startScene('scene2');

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
    if(HLR.fft4>0.5){
      if(HLS.shotFlora){
        HLH.shotFloraCluster(HL.geometries.flora, HLE.landStepsCount, 10);
        HLS.shotFlora=false;
      }
    }
    else HLS.shotFlora=true;
      // HL.materials.clouds.opacity = 1-HLR.fft3;
    //  HLC.horizon.setHSL(millis*.1%1,.8, .2 + HLR.smoothFFT3*.2 + HLR.fft3*.2);

  }

  HLS.modelshooting = function(k){
    if(k.keyCode==87)//w
    {
      HLH.startModel(HL.models.whale,THREE.Math.randInt(-HLE.WORLD_WIDTH/2,HLE.WORLD_WIDTH/2),HLE.WORLD_HEIGHT*1.2, 0);
      console.log(HL.movingModels.length);
    }
    if(k.keyCode==88)//x
      HLH.startModel(HL.models.ducky,THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),true, 0);
    if(k.keyCode==89)//y
      HLH.startModel(HL.models.whale2,THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),HLE.WORLD_HEIGHT*1.5, 3);
    if(k.keyCode==90)//z
      {HLS.startScene('scene1');}
    if(k.keyCode==86)//v
      {HLS.startScene('scene2');}
    if(k.keyCode==67){
      HLE.CENTER_PATH=!HLE.CENTER_PATH;
      HLE.cameraHeight = 0;
      hud.display('HLE.CENTER_PATH= '+HLE.CENTER_PATH, 5);
    }

  }
  window.addEventListener('keyup',HLS.modelshooting);
