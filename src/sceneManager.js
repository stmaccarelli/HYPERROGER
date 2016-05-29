var HLS ={

    // just a local for requestAnimationFrame
    raf: null,
    sceneStart:0,
    sceneProgress:0,

    //local debouncers
    shotFlora:true,

    // varie
    tempColor:0,
}

  HLS.startScene = function(sceneId){
    if(HLS[sceneId]!==undefined){
      // stop previous animation
      //destroy all running models
      HLH.destroyAllModels();
      //reset camera
  //    HL.camera.lookAt(new THREE.Vector3(0,0,-HLE.WORLD_WIDTH/2));

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

      window.cancelAnimationFrame(HLS.raf);
      //init new scene
      if(HLS[sceneId+'init']!==undefined)
      HLS.raf =  window.requestAnimationFrame(HLS[sceneId+'init']);
      // supported: timer useful for timed scene switch from one to another like:
      //  if(frameCount-HLS.sceneStart>=600) HLR.startScene('scene2');
      HLS.sceneStart = frameCount;
      //start new animation
    }
  }

  HLS.scene1init = function(){
    // if(hud!==undefined) hud.display('CHAPTER ONE.\nDEEP LIKE THE VOID',3, true);
    HL.materials.skybox.map = HL.textures.skybox;
    HL.materials.skybox.needsUpdate = true;

    HL.materials.land.wireframe=false;
    HL.materials.land.uniforms.color.value = HLC.land.setHSL((frameCount/3600)%1+.25, .2, .1+HLR.fft3);
    HL.materials.land.needsUpdate = true;

    HL.materials.water.material.uniforms.alpha.value = 0.90;
    HL.materials.water.needsUpdate = true;

    HLS.raf = window.requestAnimationFrame(HLS.scene1);
  }

  HLS.scene1 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene1);
    HLS.cameraRotation();


    HLS.sceneProgress=(frameCount - HLS.sceneStart)*0.001;

    HLC.horizon.setHSL((frameCount/3600)%1,.2, (Math.sin(HLS.sceneProgress)+1)*0.25 + HLR.fft1*0.75-HLR.fft3*5.5);

    HL.materials.land.uniforms.color.value = HLC.land.setHSL(0,0, .1+HLR.fft3*.3);
  }


  HLS.scene2init = function(){
    // if(hud!==undefined) hud.display('CHAPTER TWO.\nFOLLOW YOUR FOLLOWERS',3,true);
    HL.materials.skybox.map = null;
    HL.materials.skybox.needsUpdate = true;
    HL.materials.land.wireframe=true;
    HL.materials.land.uniforms.color.value = HLC.land.setHSL(Math.random(),1,.5);//,.5+Math.random(),.5+Math.random());
    // HL.materials.water
    // HL.models.whale.material.map = HL.dynamicTextures.stars.texture;
    // HL.models.whale.material.needsUpdate = true;

    HL.materials.water.material.uniforms.color.value = HLC.land.set(0x222222);
    HL.materials.water.needsUpdate = true;
    HLS.raf = window.requestAnimationFrame(HLS.scene2);

  }

  HLS.scene2 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene2);
    HLS.cameraRotation();



    HLS.tempColor = HLR.fft2*HLR.fft2*HLR.fft2*.5 - HLR.fft3*3;

    HLC.horizon.setRGB(HLS.tempColor+(millis*.003%.5),HLS.tempColor+(millis*.0029%.5),HLS.tempColor+(millis*.0031%.5));
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

    // TODO: DEBOUNCE
    if(HLR.fft3>0.25)     HL.materials.land.wireframe=false;
    else     HL.materials.land.wireframe=true;
    HL.models.whale.material.needsUpdate = true;

    HL.materials.water.material.uniforms.alpha.value = .85 + HLR.fft1*.5;
//    HL.materials.water.needsUpdate = true;

    if(HLR.fft3>.3) HL.materials.land.uniforms.color.value = HLC.land.setHSL(Math.random(),1,.5);//,.5+Math.random(),.5+Math.random());


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

    HLS.raf = window.requestAnimationFrame(HLS.scene3);

  }

  HLS.story = 'HYPEROCEAN NIAGARA'.split(' ');

  HLS.scene3 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene3);
    HLS.cameraRotation();

    HLH.loopParticles(HL.geometries.clouds, HLE.WORLD_WIDTH, HLE.moveSpeed*4);

    HL.materials.land.uniforms.color.value = HLC.land.setRGB(HLR.fft4*.1,HLR.fft4*.1,HLR.fft4*.1);//,.5+Math.random(),.5+Math.random());
    HLC.horizon.setRGB(0+ HLR.fft3,.3+ HLR.fft3,.6 + HLR.fft3);


    HL.dynamicTextures.stars.c.clearRect(0,0,HL.dynamicTextures.stars.width,HL.dynamicTextures.stars.height);
    HL.dynamicTextures.stars.c.font=(64+HLR.fft4*10)+"px Arial";
    HL.dynamicTextures.stars.c.fillStyle = 'white';
    HL.dynamicTextures.stars.c.fillText(HLS.story[Math.floor(frameCount/20%HLS.story.length)],10, 256);
    HL.dynamicTextures.stars.texture.needsUpdate=true;




  }

  HLS.cameraRotation = function(){
    HL.camera.rotateY(HL.noise.nNoise(HLR.fft3*0.0002, HLR.fft1*0.0015,100));
    //HL.camera.rotateX(HL.noise.nNoise(HLR.fft5*0.00013, HLR.fft2*0.0005,100));
  }

  HLS.shootEverything = function(){
    HLH.startModel(HL.models[HL.modelsKeys[Math.floor(Math.random()*HL.modelsKeys.length)]],
     THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),
     THREE.Math.randInt(HLE.WORLD_HEIGHT*0.4,HLE.WORLD_HEIGHT*3),
     0, 'xyz');    // shoot all models from a group
  }

  HLS.shootGroup = function(g,s,r){
    HLH.startModel(HL.models[HL.mGroups[g][Math.floor(Math.random()*HL.mGroups[g].length)]],
     THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),
     THREE.Math.randInt(HLE.WORLD_HEIGHT*0.4,HLE.WORLD_HEIGHT*3),
     s, (r?'xyz':null) );    // shoot all models from a group
  }

  //
  // weird:['ducky','tiger','aurora'],
  // space:['mercury','aurora','airbus'],
  // sea:['whale','whale2'],
  //
  //
  HLS.modelshooting = function(k){
    if(k.keyCode==81)//q
      HLS.shootGroup('sea',5,false);
    if(k.keyCode==87)//w
      HLS.shootGroup('weird',5,true);
    if(k.keyCode==69)//e
      HLS.shootGroup('space',5,true);
    if(k.keyCode==65)//a
      HLS.shootEverything();

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
