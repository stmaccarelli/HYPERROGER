var HLS ={

    // just a local for requestAnimationFrame
    raf: null,
    sceneStart:0,
    sceneProgress:0,
    modelsParams:null,

    //local debouncers
    shotFlora:true,

    // varie
    tempColor:0,

    //hud
    hud: new HUD(true),

}
// "speed":1,
// "modelsGroup":'sea',
//
//
// "tiles": 32,
// "repeatUV": 512,
// "bFactor": 0.22087281339397613,
// "cFactor": 0.01543734109853323,
// "buildFreq": 50.332836415087655,
// "natural": 0.09748154523558328,
// "rainbow": 0.8787699998982024,
// "squareness": 0.22450016948639295,
// "map": "land1 qw1q",
// "landRGB": 1966335,
// "horizonRGB": 0

  HLS.loadParams = function(params){

    HLE.BASE_MOVE_SPEED = params.speed||1;

    if(params.modelsParams!==undefined)
      HLS.modelsParams=params.modelsParams;

    if(params.tiles!==undefined){
      HL.land.geometry = new THREE.PlaneBufferGeometry(
        HLE.WORLD_WIDTH, HLE.WORLD_WIDTH,
        params.tiles,params.tiles);
      HL.land.geometry.rotateX(-Math.PI / 2);
      HL.land.material.uniforms.worldTiles.value = params.tiles;
    }
    if(params.repeatUV!==undefined)
      HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(params.repeatUV,params.repeatUV);
    if(params.bFactor!==undefined)
      HL.land.material.uniforms.bFactor.value = params.bFactor;
    if(params.cFactor!==undefined)
      HL.land.material.uniforms.cFactor.value = params.cFactor;
    if(params.buildFreq!==undefined)
      HL.land.material.uniforms.buildFreq.value = params.buildFreq;
    if(params.map!==undefined)
      HL.land.material.uniforms.map.value = HL.textures[params.map];
    if(params.natural!==undefined)
      HL.land.material.uniforms.natural.value = params.natural;
    if(params.rainbow!==undefined)
      HL.land.material.uniforms.rainbow.value = params.rainbow;
    if(params.squareness!==undefined)
      HL.land.material.uniforms.squareness.value = params.squareness;
    if(params.landRGB!==undefined)
      HLC.land.set(params.landRGB);
    if(params.horizonRGB!==undefined){
      HLC.horizon.set(params.horizonRGB );
      HLC.tempHorizon.set(params.horizonRGB );
    }
  }

  HLS.startScene = function(sceneId){
    if(HLS.scenesParams[sceneId]!==undefined){
      // cancel previous animation
      window.cancelAnimationFrame(HLS.raf);

      // load new scene parameters
      HLS.loadParams(HLS.scenesParams[sceneId]);

      //stard display
      if(HLS.hud!==undefined) HLS.hud.display(HLS.scenesParams[sceneId].displayText||sceneId,3, false);


      // stop previous animation
      //destroy all running models
      HLH.destroyAllModels();

      // reset camera
      HL.camera.lookAt(new THREE.Vector3(0,0,-HLE.WORLD_WIDTH/2));

      // reset sea position and alpha
      // HL.materials.water.material.uniforms.alpha.value = 0.9;
      // HL.sea.position.y = 0;

      //reset materials maps
      // HL.materials.skybox.map = HL.textures.skybox;
      // HL.materials.skybox.needsUpdate = true;

      // reset models maps
      // for(var i in HL.models){
      //   HL.models[i].material.map = (HL.textures[i]!==undefined?HL.textures[i]:null);
      //   HL.models[i].material.needsUpdate = true;
      // }


      // supported: timer useful for timed scene switch from one to another like:
      //  if(frameCount-HLS.sceneStart>=600) HLR.startScene('scene2');
      HLS.sceneStart = frameCount;

      //init new custom scene, in case any
      if(HLS.initScenes[sceneId]!==undefined)
        HLS.initScenes[sceneId]();

      //start new scene
      HLS.raf =  window.requestAnimationFrame( HLS.scenes[sceneId]|| HLS.scenes.standard );

    }
  }

  HLS.scene1init = function(){
    // if(HLS.hud!==undefined) HLS.hud.display('MIZU',3, false);
    // HLS.loadParams(HLS.scenesParams.extra3);
    // HL.materials.skybox.map = HL.textures.skybox;
    // HL.materials.skybox.needsUpdate = true;
    //
    // HL.materials.land.wireframe=false;
    // HL.materials.land.uniforms.color.value = HLC.land.setHSL((frameCount/3600)%1+.25, .2, .1+HLR.fft3);
    // HL.materials.land.needsUpdate = true;
    //
    // HL.materials.water.material.uniforms.alpha.value = 0.90;
    // HL.materials.water.needsUpdate = true;

    // HLS.raf = window.requestAnimationFrame(HLS.scene1);
  }

  HLS.initScenes = {};
  HLS.initScenes.standard = function(){

  }

  HLS.scenes = {};
  HLS.scenes.standard = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scenes.standard);
    // advance buildfrew
    HL.materials.land.uniforms.buildFreq.value -= Math.max(0,(HLR.fft1-0.96)) * .25;

    // thunderbolts
    var lumi = HLR.fft3;
    HLC.horizon.setRGB(
      HLC.tempHorizon.r + lumi,
      HLC.tempHorizon.g + lumi,
      HLC.tempHorizon.b + lumi
    );
  }

  HLS.scene1 = function(){
    HLS.raf = window.requestAnimationFrame(HLS.scene1);
    // HLS.cameraRotation();
    //
    //
    // HLS.sceneProgress=(frameCount - HLS.sceneStart)*0.001;
    //
    //
    // // HL.land.material.uniforms.color.value = HLC.land.setHSL(0,0, .1+HLR.fft3*.3);
    //
    // HLE.noiseSeed = HLR.fft3*300;
    //
    HL.materials.land.uniforms.buildFreq.value -= Math.max(0,(HLR.fft1-0.96)) * .25;

    var lumi = HLR.fft3;
    HLC.horizon.setRGB(
      HLC.tempHorizon.r + lumi,
      HLC.tempHorizon.g + lumi,
      HLC.tempHorizon.b + lumi
    );

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

  HLS.shootGroup = function(g,s,r,floating){
    if(s==undefined && r==undefined && floating==undefined)
      var s=g[1],r=g[2],floating=g[3], g = g[0];
    HLH.startModel(HL.models[HL.mGroups[g][Math.floor(Math.random()*HL.mGroups[g].length)]],
     THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),
     floating?0:THREE.Math.randInt(HLE.WORLD_HEIGHT*0.001,HLE.WORLD_HEIGHT*2),
     s, (r?'xyz':null) );    // shoot all models from a group
  }

  //
  // weird:['ducky','tiger','aurora'],
  // space:['mercury','aurora','airbus'],
  // sea:['whale','whale2'],
  //
  //
  HLS.modelshooting = function(k){
    // create keys for scenes
    var keyCodeIndex = 65 // 'a' on keyboard
    for(var key in HLS.scenesParams){
      if(k.keyCode==keyCodeIndex++){
        HLS.startScene(key);
      }
    }
    //
    // if(k.keyCode==81)//q
    //   HLS.shootGroup('sea',0,false);
    // if(k.keyCode==87)//w
    //   HLS.shootGroup('weird',1,true,true);
    // if(k.keyCode==69)//e
    //   HLS.shootGroup('space',50,true);
    // if(k.keyCode==65)//a
    //   HLS.shootEverything();
    // if(k.keyCode==66)//b
    //   HLS.shootGroup(HLS.modelsParams);
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
  window.addEventListener('keydown',HLS.modelshooting);
