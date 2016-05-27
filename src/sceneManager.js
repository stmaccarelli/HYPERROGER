var HLS ={

    // just a local for requestAnimationFrame
    raf: null,
    sceneStart:0,

    //local debouncers
    shotFlora:true,

    // varie
    tempColor:0,
}

  HLS.startScene = function(sceneId){
    if(HLS[sceneId]!==undefined){
      // stop previous animation
      window.cancelAnimationFrame(HLS.raf);
      //destroy all running models
      HLH.destroyAllModels();
      //reset camera
      HL.camera.lookAt(new THREE.Vector3(0,0,-HLE.WORLD_WIDTH/2));

      // reset sea position and alpha
      HL.materials.water.material.uniforms.alpha.value = 0.9;
      HL.sea.position.y = 0;

      //reset materials maps
      HL.materials.skybox.map = HL.textures.skybox;
      HL.materials.skybox.needsUpdate = true;

      // reset models maps
      for(var i in HL.models){
        HL.models[i].material.map = (HL.textures[i]!==undefined?HL.textures[i]:null);
        HL.models[i].material.needsUpdate = true;
      }
      //init new scene
      if(HLS[sceneId+'init']!==undefined) HLS[sceneId+'init']();
      // supported: timer useful for timed scene switch from one to another like:
      //  if(frameCount-HLS.sceneStart>=600) HLR.startScene('scene2');
      HLS.sceneStart = frameCount;
      //start new animation
      HLS[sceneId]();
    }
  }

  HLS.scene2init = function(){
    // if(hud!==undefined) hud.display('CHAPTER TWO.\nFOLLOW YOUR FOLLOWERS',3,true);
    HL.materials.skybox.map = null;
    HL.materials.skybox.needsUpdate = true;
    HL.materials.land.wireframe=true;
    HL.materials.land.uniforms.color.value = HLC.land.setHSL(Math.random(),1,.75);//,.5+Math.random(),.5+Math.random());
    // HL.materials.water
    HL.models.whale.material.map = HL.dynamicTextures.stars.texture;
    HL.models.whale.material.needsUpdate = true;
  }

  HLS.scene2 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene2);

    HLS.tempColor = HLR.fft2*HLR.fft2*HLR.fft2;

    HLC.horizon.setRGB(HLS.tempColor,HLS.tempColor,HLS.tempColor);
    //HLC.horizon.setRGB(.2+(colorCycle)%.8,.1+(colorCycle)%.8,(colorCycle)%.8);
    HLH.loopParticles(HL.geometries.clouds, HLE.WORLD_WIDTH, 10, 1);
    //stars dynamicTextureAni
    HL.dynamicTextures.stars.c.clearRect(0,0,HL.dynamicTextures.stars.width,HL.dynamicTextures.stars.height);
    HL.dynamicTextures.stars.c.fillStyle = 'white';
    for(var x=0; x<HL.dynamicTextures.stars.width;x+=50){
      for(var y=0; y<HL.dynamicTextures.stars.height;y+=50){
        HL.dynamicTextures.stars.c.fillRect(x+HLR.fft3*y*.5, y+HLR.fft2*x*.5, HLR.fft2*10,HLR.fft4*20);
      }
    }
    HL.dynamicTextures.stars.texture.needsUpdate=true;

  }


  HLS.scene1init = function(){
    // if(hud!==undefined) hud.display('CHAPTER ONE.\nDEEP LIKE THE VOID',3, true);
    HL.materials.skybox.map = HL.textures.skybox;
    HL.materials.skybox.needsUpdate = true;

    HL.materials.land.wireframe=false;
    HL.materials.land.needsUpdate = true;

    HL.materials.water.material.uniforms.alpha.value = 0.90;

  }

  HLS.scene1 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene1);
    HL.camera.rotateY((HLR.fft3-0.5)*0.01);
    HL.camera.rotateX((HLR.fft5/HLR.maxFFT5 * 0.5)*0.001);

    //if(HLR.fft3>0.8) HLH.startModel(HL.models.whale,THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),Math.random()*HLE.WORLD_HEIGHT, 0);

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

//     HLC.horizon.setHSL((frameCount/36000)%1,1-HLR.fft1*HLR.fft4*0.4, .2 + HLR.fft1*.4);
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
    // if(HLR.fft4>0.5){
    //   if(HLS.shotFlora){
    //     HLH.shotFloraCluster(HL.geometries.flora, HLE.landStepsCount, 10);
    //     HLS.shotFlora=false;
    //   }
    // }
    // else HLS.shotFlora=true;
      // HL.materials.clouds.opacity = 1-HLR.fft3;
    //  HLC.horizon.setHSL(millis*.1%1,.8, .2 + HLR.smoothFFT3*.2 + HLR.fft3*.2);

  }

  HLS.scene3init = function(){
    // if(hud!==undefined) hud.display('CHAPTER THREE.FLYING LIKE AN EAGLE IN A RIVER',3, true);
    HL.materials.skybox.map = null;
    HL.materials.skybox.needsUpdate = true;

    HL.materials.land.uniforms.color.value = HLC.land.setRGB(.08,.05,.4);//,.5+Math.random(),.5+Math.random());
    HL.materials.land.wireframe=false;
    HL.materials.land.needsUpdate = true;

    HL.materials.water.material.uniforms.alpha.value = 1;

    HL.sea.position.y = HLE.WORLD_HEIGHT*2;

    HL.models.whale.material.map = HL.dynamicTextures.stars.texture;
    HL.models.whale.material.needsUpdate = true;

  }

  HLS.story = 'HYPEROCEAN NIAGARA'.split(' ');

  HLS.scene3 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene3);

    HLH.loopParticles(HL.geometries.clouds, HLE.WORLD_WIDTH, HLE.moveSpeed*4);

    HL.materials.land.uniforms.color.value = HLC.land.setRGB(HLR.fft4*.1,HLR.fft4*.1,HLR.fft4*.1);//,.5+Math.random(),.5+Math.random());
    HLC.horizon.setRGB(0,.3,.2 + HLR.fft3*.5);

    HL.camera.rotateY((HLR.fft3-0.5)*0.01);
    HL.camera.rotateX((HLR.fft5/HLR.maxFFT5 * 0.5)*0.001);


    HL.dynamicTextures.stars.c.clearRect(0,0,HL.dynamicTextures.stars.width,HL.dynamicTextures.stars.height);
    HL.dynamicTextures.stars.c.font=(64+HLR.fft4*10)+"px Arial";
    HL.dynamicTextures.stars.c.fillStyle = 'white';
    HL.dynamicTextures.stars.c.fillText(HLS.story[Math.floor(frameCount/20%HLS.story.length)],10, 256);
    HL.dynamicTextures.stars.texture.needsUpdate=true;

  }

  HLS.modelshooting = function(k){
    if(k.keyCode==87)//w
    { // shoot totally random between any
      // HLH.startModel(HL.models[HL.modelsKeys[Math.floor(Math.random()*HL.modelsKeys.length)]],THREE.Math.randInt(-HLE.WORLD_WIDTH/2,HLE.WORLD_WIDTH/2),HLE.WORLD_HEIGHT*1.2, 0);
      HLH.startModel(HL.models[HL.mGroups.animals[Math.floor(Math.random()*HL.mGroups.animals.length)]],THREE.Math.randInt(-HLE.WORLD_WIDTH/2,HLE.WORLD_WIDTH/2),HLE.WORLD_HEIGHT*1.2, 0);

      // console.log(HL.dynamicModels.length);
    }
    if(k.keyCode==88)//x
      HLH.startModel(HL.models.ducky,THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),true, 0);
    if(k.keyCode==89)//y
      HLH.startModel(HL.models.whale2,THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),HLE.WORLD_HEIGHT*1.5, 3);
    if(k.keyCode==49)//1
      {HLS.startScene('scene1');}
    if(k.keyCode==50)//2
      {HLS.startScene('scene2');}
    if(k.keyCode==51)//3
      {HLS.startScene('scene3');}

    if(k.keyCode==67){//c
      HLE.CENTER_PATH=!HLE.CENTER_PATH;
      HLE.cameraHeight = 0;
      // if(hud!==undefined) hud.display('HLE.CENTER_PATH= '+HLE.CENTER_PATH, 5);
    }

  }
  window.addEventListener('keydown',HLS.modelshooting);
