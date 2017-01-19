var HLS = {

    // just a local for requestAnimationFrame
    raf: null,
    sceneStart: 0,
    sceneProgress: 0,
    modelsParams: null,
    sceneId: null, //stores current scene id
    defaultScene:'mizu',

    //local debouncers
    shotFlora: true,

    // varie
    tempColor: 0,

    //hud
    hud: null,

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


function initHUD(){
  HLS.hud = new HUD(true);
}
var load = window.addEventListener('HLEload',initHUD);



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
      if (HLS.hud !== undefined && !noHUD) HLS.hud.display((isMobile||isVR)?'':(HLSP[sceneId].displayText || sceneId), 8, false);

      //load scene parameters

      HLS.loadParams(HLSP[sceneId]);

    }


    //reset fog
    if(HL.scene.fog!==null)
      HL.scene.fog.density = 0.00025;

    //destroy all running models
    HLH.destroyAllModels();

    HL.materials.land.uniforms.buildFreq.value =
      HLE.advance = HLE.reactiveMoveSpeed = HLE.moveSpeed = 0;





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

    // advance buildFreq
    // HL.materials.land.uniforms.buildFreq.value += Math.max(0, (HLR.fft1 - 0.97)) * 2.6;

    // // compute move speed
    HLE.reactiveMoveSpeed = 1 + ( HLR.fft2 + HLR.fft3+ HLR.fft1) * 0.3 * HLE.BASE_MOVE_SPEED + HLE.BASE_MOVE_SPEED*0.5;
    // HLE.moveSpeed += (HLE.reactiveMoveSpeed - HLE.moveSpeed) * 0.25;
    HLE.moveSpeed = HLE.reactiveMoveSpeed * ( (isMobile || isVR) ? 0.3 : 1 );
    HLE.moveSpeed *= 0.96;

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

    // if (HLR.fft3 > 0.97)
    //     HLH.shootGroup(HLS.modelsParams);

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


HLS.scenesAddons.intro = function(){
  // cameraCompanion move
  HL.cameraCompanion.rotation.y = ( Math.sin(frameCount*.0013)*0.252) ;
  HL.cameraCompanion.rotation.x = ( Math.cos(frameCount*.00125)*0.35) ;
}

HLS.initScenes.firefly = function() {
    HLS.logoChange('cube');
    HL.cameraCompanion.visible = true;
}

HLS.scenes.firefly = function() {
    // HLS.raf = window.requestAnimationFrame(HLS.scenes.static);
    if(isVR) HLS.raf = HL.VREffect.requestAnimationFrame(HLS.scenes.firefly);
    else HLS.raf = window.requestAnimationFrame(HLS.scenes.firefly);
    // compute move speed
    HLE.reactiveMoveSpeed = 1 + HLR.fft1 * HLE.BASE_MOVE_SPEED;
    HLE.moveSpeed += (HLE.reactiveMoveSpeed - HLE.moveSpeed) * 0.015;

    // cameraCompanion move
    HL.cameraCompanion.rotation.y = ( (frameCount*.0055)*0.252);
    HL.cameraCompanion.rotation.x = ( (frameCount*.005)*0.25);

}

// scene addons are executed after standard scene
HLS.scenesAddons.mizu = function() {
    // thunderbolts
    HLS.lumi = HLR.fft3 * 0.25;
    HLC.horizon.setRGB(
        HLC.tempHorizon.r + HLS.lumi,
        HLC.tempHorizon.g + HLS.lumi,
        HLC.tempHorizon.b + HLS.lumi
    );

}

HLS.scenesAddons.solar_valley = function() {
    // thunderbolts
    HLS.lumi = HLR.fft3 * HLR.fft3 * 4;
    HLC.land.setRGB(HLS.lumi, HLS.lumi, HLS.lumi);
}

HLS.scenesAddons.escher_surfers = function(){
  HL.materials.land.uniforms.buildFreq.value += Math.max(0, (HLR.fft1 - 0.9)) * 2.6;
}


HLS.scenesAddons.drift = function() {
    HL.cameraGroup.position.y += HLR.fft1 * 0.075;
    HL.cameraGroup.position.y = THREE.Math.clamp(
        HL.cameraGroup.position.y,
        HLSP.drift.cameraPositionY, -HLSP.drift.cameraPositionY
    );
}

// THIS SETS UP DYNAMIC TEXTURE FOR CUBE
// HL.dynamicTextures.stars.c.clearRect(0,0,HL.dynamicTextures.stars.width,HL.dynamicTextures.stars.height);
// HL.dynamicTextures.stars.c.font="200px Arial";
// HL.dynamicTextures.stars.c.fillStyle = 'white';
// HL.dynamicTextures.stars.c.fillText("XXXXX",256, 256);
// HL.dynamicTextures.stars.texture.needsUpdate=true;
//
// HL.cameraGroup.children[1].material.map = HL.dynamicTextures.stars.texture;
// HL.cameraGroup.children[1].material.needsUpdate = true;

HLS.scenesAddons.else = function() {
    // thunderbolts
    HLS.lumi = HLR.fft1 * 0.125;
    HLC.horizon.setRGB(
        HLC.tempHorizon.r + HLS.lumi,
        HLC.tempHorizon.g + HLS.lumi,
        HLC.tempHorizon.b + HLS.lumi
    );
    // thunderbolts
    HLS.lumi = HLR.fft3 + HLR.fft2;
    HLC.land.setRGB(HLS.lumi, HLS.lumi, HLS.lumi);
}

HLS.scenesAddons.twin_horizon = function() {
    HL.cameraGroup.rotation.z += Math.PI;

    HLS.lumi = HLR.fft3 * 0.825;
    HLC.horizon.setRGB(
        HLC.tempHorizon.r -HLS.lumi,
        HLC.tempHorizon.g - HLS.lumi,
        HLC.tempHorizon.b + HLS.lumi
    );
}


HLS.scenesAddons.hyperocean = function() {
  if(HLR.fft1>0.97){

// if (k.keyCode == 53) //5
//     HLH.shootGroup(HLS.modelsParams);

    if(randomLandDebounce){
      HLS.randomizeLand();

      HLH.startModel(HL.models['whale'],
        THREE.Math.randInt(-1000, 1000),
        THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 2.5, null, 10
      ); //TODO
      HLH.shootGroup(HLS.modelsParams);

      randomLandDebounce=false;
    }
  } else randomLandDebounce = true;

}



HLS.scenesAddons.roger_water = function(){
  // thunderbolts
  HLS.lumi = Math.min(HLR.fft3*2+HLR.fft1*0.2,1);
  HLC.horizon.setRGB(
      HLC.tempHorizon.r + HLS.lumi,
      HLC.tempHorizon.g + HLS.lumi,
      HLC.tempHorizon.b + HLS.lumi
  );

  if(HLR.fft1>0.97){
    if(randomLandDebounce){
      HLS.randomizeLand();
      randomLandDebounce=false;
    }
  } else randomLandDebounce = true;
}

var randomLandDebounce = true;

HLS.scenesAddons.popeye = function(){
  HL.materials.land.uniforms.buildFreq.value += Math.max(0,HLR.fft1-0.8) * .05;

  HLS.lumi = HLR.fft1*0.25;
  HLC.horizon.setRGB(
      HLC.tempHorizon.r + HLS.lumi,
      HLC.tempHorizon.g + HLS.lumi,
      HLC.tempHorizon.b + HLS.lumi
  );
}


/*
* COMMON HELPERS
*
*/
//
// var b = 0, h=0, r=0;
// HLS.cameraMotion = function(straight) {
//
//
//   // b -= mouse.rX * 0.00001;
//   // b = -mouse.rX * 0.01;
//   //   h = mouse.rY;
//
//   b = b + ((b-mouse.rX*0.0005)-b)*0.13;
//   h = THREE.Math.clamp( h - ((h-mouse.rY*0.05)-h)*0.13, -360, 360);
//
//   r = HLE.WORLD_WIDTH* (0.15 - Math.sin(HLE.advance*0.0002)*0.10);
//
//   // if(straight)
//   //   h = HL.cameraGroup.position.y
//   // else
//      h = (HL.cameraGroup.position.y+(HL.cameraGroup.position.y-HL.sea.position.y)),
//   HL.cameraGroup.lookAt(
//      new THREE.Vector3(
//       Math.sin(b) * r,
//       h,
// //      HL.sea.position.y,//HL.cameraGroup.position.y*2,//(2 - Math.sin(HLE.advance*0.002)*2),
//       Math.cos(b) * r
//     )
//     );
//   // HL.cameraGroup.position.y += Math.sin(HLE.advance*0.002)*.1;
//
//     // HL.cameraGroup.rotation.x = -Math.sin(HLE.advance * 0.000062) * Math.PI / 32;
//     // HL.cameraGroup.rotation.y = Math.PI - Math.cos(HLE.advance * 0.00005) * Math.PI;
//     // HL.cameraGroup.rotation.z = -Math.sin(HLE.advance * 0.00004) * Math.PI / 32;
//
//     // HL.cameraGroup.rotation.x += Math.cos(HLR.fft1*0.001*HLE.advance)*0.0005*HLE.moveSpeed;
//     // HL.cameraGroup.rotation.y += Math.sin(HLR.fft2*0.001*HLE.advance)*0.0005*HLE.moveSpeed;
//     // HL.cameraGroup.rotation.z += Math.cos(HLR.fft3*0.001*HLE.advance)*0.0005*HLE.moveSpeed;
//
//     // HL.cameraCompanion.rotation.x = Math.sin(HLE.advance*0.00062)*Math.PI/64;
//     // HL.cameraCompanion.rotation.y = -Math.cos(HLE.advance*0.0005)*Math.PI/12;
//     // HL.cameraCompanion.rotation.z = Math.sin(HLE.advance*0.0004)*Math.PI/64;
// }

HLS.randomizeLand = function(){

var tilen = Math.round(Math.random()*24);

 // HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, tilen,tilen);
 // HL.land.geometry.rotateX(-Math.PI / 2);
 // HL.land.material.uniforms.worldTiles.value = tilen;
 HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(tilen , tilen  );

 HL.land.material.uniforms.bFactor.value = Math.random()*1.25;
 HL.land.material.uniforms.cFactor.value = Math.random()*1.0;
 // HL.land.material.uniforms.buildFreq.value = Math.random()*100.0;

 // HL.land.material.uniforms.map.value = HL.textures[(Math.random()>.5?'land':'pattern')+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];
 // HL.land.material.uniforms.map2.value = HL.textures[(Math.random()>.5?'land':'pattern')+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];

 HL.land.material.uniforms.map2.value = HL.textures['land'+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];
 HL.land.material.uniforms.map2.value = HL.textures['land'+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];

 HL.land.material.uniforms.natural.value = Math.random();
 HL.land.material.uniforms.rainbow.value = Math.random();
 HL.land.material.uniforms.squareness.value = Math.random()*0.05;

 HL.sky.material.map = HL.textures['sky'+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];


 HLC.land.setRGB(0.5+Math.random()*0.5, 0.5+Math.random()*0.5, 0.5+Math.random()*0.5);
  HLC.horizon.setRGB( 0.2+Math.random()*0.8, 0.2+Math.random()*0.8, 0.2+Math.random()*0.8 );
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


HLS.MIDIcontrols = function(){
console.log('HLS.MIDIcontrols init');
  navigator.requestMIDIAccess().then(
    onMIDIInit,
    onMIDISystemError );

  function onMIDISystemError(e){
    console.log(e);
  }

  function onMIDIInit( midi ) {
    // sys_midi = midi;
    for (var input of midi.inputs.values())
      input.onmidimessage = midiMessageReceived;
  }

  function midiMessageReceived( ev ) {

    var midiInputIndex = 144 // channel in DJ mode without hex calculations

    for (var key in HLSP) {
        if (ev.data[2]>0 && ev.data[1]==103 && ev.data[0]== midiInputIndex++) {
          HLS.startScene(key);
        }
    }


    if (ev.data[2]>0 && ev.data[1]==0) //5
      if(HLS.modelsParams !== null)
        HLH.shootGroup(HLS.modelsParams);

    if (ev.data[0]==156 && ev.data[2]>0 && ev.data[1]==1) { //9
      HLE.CENTER_PATH=!HLE.CENTER_PATH;
      HL.materials.land.uniforms.withCenterPath.value = HLE.CENTER_PATH;
    }

  }
}


HLS.KeyboardControls = function(k) {
  // console.log(k);
    // create keys for scenes
    var keyCodeIndex = 65 // 'a' on keyboard
    for (var key in HLSP) {
        if (k.keyCode == keyCodeIndex++) {
          // console.log(key);
            HLS.startScene(key);
        }
    }
    //
    if (k.keyCode == 49) //1
        HLH.shootGroup('sea', 8, false, false);
    if (k.keyCode == 50) //2
        HLH.shootGroup('weird', 0, true, true);
    if (k.keyCode == 51) //3
        HLH.shootGroup('space', 50, true, false);
    if (k.keyCode == 52) //4
        HLH.startModel(HL.models['whale'],
        THREE.Math.randInt(-1000, 1000),
        THREE.Math.randInt(-HLE.WORLD_HEIGHT * 0.01, HLE.WORLD_HEIGHT * 1.1), 2.5, null, 10); //TODO
    if (k.keyCode == 53) //5
        HLH.shootGroup(HLS.modelsParams);

    if (k.keyCode == 54) //6
        HLS.logoChange('intro');
    if (k.keyCode == 55) //7
        HLS.logoChange('logo');
    if (k.keyCode == 56) //8
        HLS.logoChange('cube');
    if (k.keyCode == 48)//0
        HL.cameraCompanion.visible = !HL.cameraCompanion.visible;


    if(k.keyCode == 57){ //9
      HLE.CENTER_PATH=!HLE.CENTER_PATH;
      HL.materials.land.uniforms.withCenterPath.value = HLE.CENTER_PATH;
    }

    if(k.keyCode == 88){ //x ?
      HLS.logoChange(HUD.textGeometries.mizu);
    }

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
if(noSocket){
  if(midiIn) window.addEventListener('HLEload', HLS.MIDIcontrols);
  else window.addEventListener('keydown', HLS.KeyboardControls);
}
window.addEventListener('HLEload', function(){ HLS.startScene(HLS.defaultScene)} );
