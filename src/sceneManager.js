var HLS = {

    // just a local for requestAnimationFrame
    raf: null,
    sceneStart: 0,
    sceneProgress: 0,
    modelsParams: null,
    sceneId: null, //stores current scene id
    defaultScene:'interactiveRogerWater',

    //local debouncers
    shotFlora: true,

    // varie
    tempColor: 0,

    //hud
  //  hud: null,

    color : new THREE.Vector3(),
    lumi:0,

    landColorChange:false,

}

// custom scene init (follows standard init)
HLS.initScenes =   {};
// holds standard, can be extended to custom scenes, called by rAF
HLS.scenes = {};
// custom scenes addons, follow scenes, called in scenes
HLS.scenesAddons = {};


// function initHUD(){
//   HLS.hud = new HUD(true);
//   window.removeEventListerer(load);
// }
// var load = window.addEventListener('HLEload',initHUD);



HLS.loadParams = function(params) {

    if(params.speed !== undefined)
      HLE.BASE_MOVE_SPEED = ( (isVR||isCardboard)?(params.speed*0.01) : params.speed );

    if (params.cameraPositionY !== undefined)
        HL.cameraGroup.position.y = params.cameraPositionY;
    else HL.cameraGroup.position.y = 50;
    HL.cameraGroup.updateMatrix();
    HL.cameraGroup.updateMatrixWorld();

    if (params.seaLevel !== undefined)
        HL.sea.position.y = params.seaLevel;
    else
        HL.sea.position.y = 0;

    if(HL.scene.fog!==null){
      if (params.fogDeensity !== undefined)
          HL.scene.fog.density = params.fogDensity;
        else HL.scene.fog.density = 0.00015;
    }

    if (params.modelsParams !== undefined)
        HLS.modelsParams = params.modelsParams;
    else
      HLS.modelsParams = null;

    if (params.tiles !== undefined) {
        HL.land.geometry = new THREE.PlaneBufferGeometry(
            HLE.WORLD_WIDTH, HLE.WORLD_WIDTH,
            params.tiles, params.tiles);
        HL.land.geometry.rotateX(-Math.PI / 2);
        HL.land.material.uniforms.worldTiles.value = params.tiles;
    }
    if (params.repeatUV !== undefined)
        HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(params.repeatUV, params.repeatUV);
    if (params.bFactor !== undefined)
        HL.land.material.uniforms.bFactor.value = params.bFactor;
    if (params.cFactor !== undefined)
        HL.land.material.uniforms.cFactor.value = params.cFactor;
    if (params.buildFreq !== undefined)
        HL.land.material.uniforms.buildFreq.value = params.buildFreq;
    else
        HL.land.material.uniforms.buildFreq = 0;
    if (params.map !== undefined)
        HL.land.material.uniforms.map.value = HL.textures[params.map];
    if (params.map2 !== undefined)
        HL.land.material.uniforms.map2.value = HL.textures[params.map2];
    if (params.natural !== undefined)
        HL.land.material.uniforms.natural.value = params.natural;
    if (params.rainbow !== undefined)
        HL.land.material.uniforms.rainbow.value = params.rainbow;
    if (params.squareness !== undefined)
        HL.land.material.uniforms.squareness.value = params.squareness;
    if (params.landRGB !== undefined)
        HLC.land.set(params.landRGB);
    if (params.horizonRGB !== undefined) {
        HLC.horizon.set(params.horizonRGB);
        HLC.tempHorizon.set(params.horizonRGB);
    }
    if (params.skyMap !== undefined)
        HL.materials.sky.map = HL.textures[params.skyMap];

    if (params.landColorChange !== undefined)
      HLS.landColorChange = params.landColorChange;

    if (params.centerPath !== undefined){
        HL.materials.land.uniforms.withCenterPath.value =
        HLE.CENTER_PATH =
        params.centerPath;
    }
}

HLS.startScene = function(sceneId) {
    HLS.sceneId = sceneId;
    // cancel previous animation
    // window.cancelAnimationFrame(HLS.raf);
    if(isVR) HL.VREffect.cancelAnimationFrame(HLS.raf);
    else window.cancelAnimationFrame(HLS.raf);


    if (HLSP[sceneId] !== undefined) {

      //start hud display
      //if (HLS.hud !== undefined && !noHUD) HLS.hud.display((isMobile||isVR)?'':(HLSP[sceneId].displayText || sceneId), 8, false);

      //load scene parameters

      HLS.loadParams(HLSP[sceneId]);

    }


    //reset fog
    if(HL.scene.fog!==null)
      HL.scene.fog.density = 0.00025;

    //destroy all running models
    HLH.destroyAllModels();

    HL.materials.land.uniforms.buildFreq.value =
      HLE.acceleration = HLE.reactiveMoveSpeed = HLE.moveSpeed = 0;





    // reset camera rotations etc
    HL.cameraGroup.rotation.x = 0;
    HL.cameraGroup.rotation.y = 0;
    HL.cameraGroup.rotation.z = 0;
    HL.cameraCompanion.visible = false;


    //init custom scene, in case any
    // TODO try to remove and parametrize everything in scenesParams
    if (HLS.initScenes[sceneId] !== undefined)
        HLS.initScenes[sceneId]();

    // scene timer, useful for timed scene events
    // eg:  if(frameCount-HLS.sceneStart>=600) HLR.startScene('scene2');
    HLS.sceneStart = frameCount;


    //start new sceneI
    if(isVR) HLS.raf = HL.VREffect.requestAnimationFrame(HLS.scenes[sceneId] || HLS.scenes.standard);
    else HLS.raf = window.requestAnimationFrame(HLS.scenes[sceneId] || HLS.scenes.standard);
}




HLS.scenes.standard = function() {

  if(isVR) HLS.raf = HL.VREffect.requestAnimationFrame(HLS.scenes.standard);
  else HLS.raf = window.requestAnimationFrame(HLS.scenes.standard);

  // HLS.raf = window.requestAnimationFrame(HLS.scenes.standard);

  // shake buildFreq
  // if(HLR.fft1>0.97)
  //   HL.materials.land.uniforms.buildFreq.value += Math.max(0, (HLR.fft1 - 0.97)) * 1.6 * (Math.random()*2-1);

  // compute auto movement  moveSpeed
  HLE.reactiveMoveSpeed = HLE.BASE_MOVE_SPEED*0.15 + ( HLR.smoothFFT1 + HLR.smoothFFT2 + HLR.smoothFFT3 * 20) * 0.3 * HLE.BASE_MOVE_SPEED ;
  // HLE.moveSpeed += (HLE.reactiveMoveSpeed - HLE.moveSpeed) * 0.25;
  HLE.moveSpeed = HLE.reactiveMoveSpeed * ( (isMobile || isVR) ? 0.3 : 1 );
  HLE.moveSpeed += HLE.MAX_MOVE_SPEED * HLE.acceleration;




  // compute noiseFrequency (used in land for rainbow etc)
  HLR.tempNoiseFreq = 7 - (HLR.fft3) * 3;
  // HLE.noiseFrequency += (HLR.tempNoiseFreq - HLE.noiseFrequency) * 0.3;
  HLE.noiseFrequency = HLR.tempNoiseFreq;

  HLE.noiseFrequency2 += Math.min(0,(HLR.fft2 - HLR.fft3)) * .003;

  // compute land heiught
  HLR.tempLandHeight = (HLR.smoothFFT2 + HLR.smoothFFT3) *
      HLE.WORLD_HEIGHT;

  // if(HLE.CENTER_PATH) HLR.tempLandHeight*=3;
  HLE.landHeight += (HLR.tempLandHeight - HLE.landHeight) * 0.45;
  // HLE.landZeroPoint = - HLR.fft3 * HLE.landHeight * .5;



  // thunderbolts
  HLS.lumi = HLR.fft3;
  HLC.horizon.setRGB(
      HLC.tempHorizon.r + HLS.lumi,
      HLC.tempHorizon.g + HLS.lumi,
      HLC.tempHorizon.b + HLS.lumi
  );

  if( HLS.landColorChange && HLR.fft1>0.98) {
    HLS.color.set(Math.random()*2-1,Math.random()*2-1,Math.random()*2-1).multiplyScalar(0.075);
    HLC.land.r = THREE.Math.clamp(HLC.land.r + HLS.color.x,0,1);
    HLC.land.g = THREE.Math.clamp(HLC.land.g + HLS.color.y,0,1);
    HLC.land.b = THREE.Math.clamp(HLC.land.b + HLS.color.z,0,1);
  }


  //camera motion
  // if (!isMobile && !isVR && HLS.sceneId!='firefly' )
  //   HLS.cameraMotion(HLS.sceneId.indexOf('solar_valley')>-1 && HLS.sceneId.indexOf('intro')>-1);
  // HLS.cameraMotion();

  if (HLS.scenesAddons[HLS.sceneId] || undefined)
      HLS.scenesAddons[HLS.sceneId]();

}


// HLS.scenesAddons.intro = function(){
//   // cameraCompanion move
//   HL.cameraCompanion.rotation.y = ( Math.sin(frameCount*.0013)*0.252) ;
//   HL.cameraCompanion.rotation.x = ( Math.cos(frameCount*.00125)*0.35) ;
// }

// HLS.initScenes.firefly = function() {
//     HLS.logoChange('cube');
//     HL.cameraCompanion.visible = true;
// }

// HLS.scenes.firefly = function() {
//     // HLS.raf = window.requestAnimationFrame(HLS.scenes.static);
//     if(isVR) HLS.raf = HL.VREffect.requestAnimationFrame(HLS.scenes.firefly);
//     else HLS.raf = window.requestAnimationFrame(HLS.scenes.firefly);
//     // compute move speed
//     HLE.reactiveMoveSpeed = 1 + HLR.fft1 * HLE.BASE_MOVE_SPEED;
//     HLE.moveSpeed += (HLE.reactiveMoveSpeed - HLE.moveSpeed) * 0.015;
//
//     // cameraCompanion move
//     HL.cameraCompanion.rotation.y = ( (frameCount*.0055)*0.252);
//     HL.cameraCompanion.rotation.x = ( (frameCount*.005)*0.25);
//
// }

// scene addons are executed after standard scene

// THIS SETS UP DYNAMIC TEXTURE FOR CUBE
// HL.dynamicTextures.stars.c.clearRect(0,0,HL.dynamicTextures.stars.width,HL.dynamicTextures.stars.height);
// HL.dynamicTextures.stars.c.font="200px Arial";
// HL.dynamicTextures.stars.c.fillStyle = 'white';
// HL.dynamicTextures.stars.c.fillText("XXXXX",256, 256);
// HL.dynamicTextures.stars.texture.needsUpdate=true;
//
// HL.cameraGroup.children[1].material.map = HL.dynamicTextures.stars.texture;
// HL.cameraGroup.children[1].material.needsUpdate = true;

var randomDebounce1 = true, randomDebounce2 = true;

HLS.scenesAddons.interactiveRogerWater = function() {

  if(HLR.fft1>0.975){
    if(randomDebounce1){
      HLS.randomizeLand();
      HLH.startModel(HL.models['whale'],
        THREE.Math.randInt(-1000, 1000),
        THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 20, null, 20, false, false
      ); //TODO
      randomDebounce1=false;
    }
  } else {
    randomDebounce1 = true;
  }

  if(HLR.fft3>0.3){
    // HLH.startGroup(['space', 1, 40, true, false, HLE.WORLD_HEIGHT / 3, false ] );
    // if(randomDebounce2){
    //   HLH.startGroup(['space', 1, 30,true,false, HLE.WORLD_HEIGHT / 3, false ] );
    //   // startGroup = function(group, scale, speed,rotation,floating, midpoint)
    //   randomDebounce2 = false;
    // }
  } else {
    randomDebounce2 = true;
  }

  HLS.lumi = Math.min(HLR.fft3*2+HLR.fft1*0.2,1);
  HLC.horizon.setRGB(
      HLC.tempHorizon.r + HLS.lumi,
      HLC.tempHorizon.g + HLS.lumi,
      HLC.tempHorizon.b + HLS.lumi
  );

}



HLS.randomizeLand = function(){

var tilen = Math.round(Math.random()*24);

 // HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, tilen,tilen);
 // HL.land.geometry.rotateX(-Math.PI / 2);
 // HL.land.material.uniforms.worldTiles.value = tilen;
 HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(tilen , tilen  );

 HL.land.material.uniforms.bFactor.value = Math.random()*1.25;
 HL.land.material.uniforms.cFactor.value = Math.random()*.70;
 // HL.land.material.uniforms.buildFreq.value = Math.random()*100.0;

var landPat = Math.random();
// HL.land.material.uniforms.map.value = HL.textures[( landPat>.5?'land':'pattern' )+
HL.land.material.uniforms.map.value = HL.textures['land'+
  ( 1+Math.round( Math.random()*4 ) )];// null;//HL.textures[Math.round(Math.random()*10)];
HL.land.material.uniforms.map2.value = HL.textures[( landPat>.5?'land'+( 1+Math.round( Math.random()*4 ) ):null )];// null;//HL.textures[Math.round(Math.random()*10)];

 // HL.land.material.uniforms.map.value = HL.textures['land'+(1+Math.round(Math.random()*4))];
 // HL.land.material.uniforms.map2.value = HL.textures['land'+(1+Math.round(Math.random()*4))];

 HL.land.material.uniforms.natural.value = 0.5 + Math.random()*0.5;
 HL.land.material.uniforms.rainbow.value = Math.random();
 HL.land.material.uniforms.squareness.value = Math.random()*0.05;

 // HL.sky.material.map = HL.textures['sky'+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];
 HL.sky.material.uniforms.mixFactor.value = Math.random();
 HL.sky.geometry.rotateY( Math.random() * Math.PI);


 // HLC.land.setRGB(0.5+Math.random()*0.5, 0.5+Math.random()*0.5, 0.5+Math.random()*0.5);
 HLC.land.setRGB( Math.random()*0.6, Math.random()*0.6, Math.random()*0.6 );
 HLC.horizon.setRGB( Math.random()*0.6, Math.random()*0.6, Math.random()*0.6 );
 HLC.tempHorizon.set(HLC.horizon);

};


HLS.logoChange = function(model) {

    if( typeof model ===  'string' ){

      model = HL.models[model];

    }

    if( model instanceof THREE.Mesh ){

      model = model.geometry;

    }

    HL.cameraCompanion.geometry = model.clone().scale(30, 30, 30);
    HL.cameraCompanion.visible = true;
}

window.addEventListener('HLEload', function(){ HLS.startScene(HLS.defaultScene)} );
