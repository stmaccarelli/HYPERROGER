var HLS = {

    // just a local for requestAnimationFrame
    raf: null,
    sceneStart: 0,
    sceneProgress: 0,
    modelsParams: null,
    sceneId: null, //stores current scene id

    //local debouncers
    shotFlora: true,

    // varie
    tempColor: 0,

    //hud
    hud: new HUD(false),

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

    if (params.fogDeensity !== undefined)
        HL.scene.fog.density = params.fogDensity;
    else HL.scene.fog.density = 0.00025;

    if (params.modelsParams !== undefined)
        HLS.modelsParams = params.modelsParams;

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


    //reset fog
    HL.scene.fog.density = 0.00025;

    //destroy all running models
    HLH.destroyAllModels();

    HL.materials.land.uniforms.buildFreq.value =
      HLE.advance = HLE.reactiveMoveSpeed = HLE.moveSpeed = 0;



    //load scene parameters
    if (HLSP.scenesParams[sceneId] !== undefined) {
        HLS.loadParams(HLSP.scenesParams[sceneId]);
        //start hud display
        if (HLS.hud !== undefined) HLS.hud.display((isMobile||isVR)?'':(HLSP.scenesParams[sceneId].displayText || sceneId), 6, false);
    }

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
    HL.materials.land.uniforms.buildFreq.value += Math.max(0, (HLR.fft1 - 0.97)) * 2.6;

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

    if (HLR.fft3 > 0.97)
        HLH.shootGroup(HLS.modelsParams);

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
    if (!isMobile && !isVR && HLS.sceneId!='firefly' && HLS.sceneID!='intro')
        HLS.cameraMotion(HLS.sceneId.indexOf('solar_valley')>-1);

    if (HLS.scenesAddons[HLS.sceneId] || undefined)
        HLS.scenesAddons[HLS.sceneId]();
}


HLS.initScenes.firefly = function() {
    HL.cameraCompanion.visible = true;
}
HLS.scenes.firefly = function() {
    // HLS.raf = window.requestAnimationFrame(HLS.scenes.static);
    if(isVR) HLS.raf = HL.VREffect.requestAnimationFrame(HLS.scenes.firefly);
    else HLS.raf = window.requestAnimationFrame(HLS.scenes.firefly);
    // compute move speed
    HLE.reactiveMoveSpeed = 1 + HLR.fft1 * HLE.BASE_MOVE_SPEED;
    HLE.moveSpeed += (HLE.reactiveMoveSpeed - HLE.moveSpeed) * 0.015;

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
    HLS.lumi = HLR.fft5 * HLR.fft5 * 4;
    HLC.land.setRGB(HLS.lumi, HLS.lumi, HLS.lumi);
}


HLS.scenesAddons.drift = function() {
    HL.cameraGroup.position.y += HLR.fft1 * 0.075;
    HL.cameraGroup.position.y = THREE.Math.clamp(
        HL.cameraGroup.position.y,
        HLSP.scenesParams.drift.cameraPositionY, -HLSP.scenesParams.drift.cameraPositionY
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

HLS.scenesAddons.escher_surfers = function() {
    // HL.cameraGroup.rotation.x = Math.sin(HLE.advance * 0.00004) * Math.PI / 32;
}

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


HLS.scenesAddons.hyperocean = function() {}



HLS.scenesAddons.roger_water = function(){
  // thunderbolts
  HLS.lumi = Math.min(HLR.fft3*2+HLR.fft1*0.2,1);
  HLC.horizon.setRGB(
      HLC.tempHorizon.r + HLS.lumi,
      HLC.tempHorizon.g + HLS.lumi,
      HLC.tempHorizon.b + HLS.lumi
  );

  if(HLR.fft1>0.97){
    if(rogerDebounce){
      HLS.randomizeLand();
      rogerDebounce=false;
    }
  } else rogerDebounce = true;
}

var rogerDebounce = true;

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


HLS.cameraMotion = function(straight) {

  var b = Math.PI + Math.sin(HLE.advance  * 0.0001 ) * Math.PI;
  var r = HLE.WORLD_WIDTH* (0.15 - Math.sin(HLE.advance*0.0002)*0.10);
var h = 0;
if(straight)
  h = HL.cameraGroup.position.y
else
  h = (HL.cameraGroup.position.y+(HL.cameraGroup.position.y-HL.sea.position.y)),

  HL.cameraGroup.lookAt(
     new THREE.Vector3(
      Math.sin(b) * r,
      h,
//      HL.sea.position.y,//HL.cameraGroup.position.y*2,//(2 - Math.sin(HLE.advance*0.002)*2),
      Math.cos(b) * r
    )
    );
  // HL.cameraGroup.position.y += Math.sin(HLE.advance*0.002)*.1;

    // HL.cameraGroup.rotation.x = -Math.sin(HLE.advance * 0.000062) * Math.PI / 32;
    // HL.cameraGroup.rotation.y = Math.PI - Math.cos(HLE.advance * 0.00005) * Math.PI;
    // HL.cameraGroup.rotation.z = -Math.sin(HLE.advance * 0.00004) * Math.PI / 32;

    // HL.cameraGroup.rotation.x += Math.cos(HLR.fft1*0.001*HLE.advance)*0.0005*HLE.moveSpeed;
    // HL.cameraGroup.rotation.y += Math.sin(HLR.fft2*0.001*HLE.advance)*0.0005*HLE.moveSpeed;
    // HL.cameraGroup.rotation.z += Math.cos(HLR.fft3*0.001*HLE.advance)*0.0005*HLE.moveSpeed;

    // HL.cameraCompanion.rotation.x = Math.sin(HLE.advance*0.00062)*Math.PI/64;
    // HL.cameraCompanion.rotation.y = -Math.cos(HLE.advance*0.0005)*Math.PI/12;
    // HL.cameraCompanion.rotation.z = Math.sin(HLE.advance*0.0004)*Math.PI/64;


}

HLS.randomizeLand = function(){

var tilen = Math.round(Math.random()*HLE.WORLD_TILES/2);

 // HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, tilen,tilen);
 // HL.land.geometry.rotateX(-Math.PI / 2);
 // HL.land.material.uniforms.worldTiles.value = tilen;
 HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(tilen * Math.random(), tilen * Math.random() );

 HL.land.material.uniforms.bFactor.value = Math.random();
 HL.land.material.uniforms.cFactor.value = Math.random();
 HL.land.material.uniforms.buildFreq.value = Math.random()*100.0;
 HL.land.material.uniforms.map.value = HL.textures[(Math.random()>.5?'land':'pattern')+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];
 HL.land.material.uniforms.natural.value = Math.random();
 HL.land.material.uniforms.rainbow.value = Math.random();
 HL.land.material.uniforms.squareness.value = Math.random()*0.005;

 HL.sky.material.map = HL.textures['sky'+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];


 HLC.land.setRGB(0.5+Math.random()*0.5, 0.5+Math.random()*0.5, 0.5+Math.random()*0.5);
  HLC.horizon.setRGB(Math.random()/2,Math.random()/2,Math.random()/2);

};


HLS.logoChange = function(model) {
    HL.cameraGroup.remove(HL.cameraCompanion);

    HL.cameraCompanion = HL.models[model].clone();
    HL.cameraCompanion.geometry = HL.cameraCompanion.geometry.clone().scale(30, 30, 30);
    // HL.cameraCompanion.rotation.y = Math.PI;
    HL.cameraCompanion.position.z = -600;
    HL.cameraCompanion.position.y = -40;
    HL.cameraCompanion.position.x = -20;
    // HL.cameraCompanion.material = new THREE.MeshBasicMaterial({color:0xff0000,side:THREE.DoubleSide});
    HL.cameraCompanion.material.color.set(0xff0000);
    HL.cameraCompanion.material.emissive.set(0xaa0000);

    HL.cameraGroup.add(HL.cameraCompanion);

}

HLS.modelshooting = function(k) {
  // console.log(k);
    // create keys for scenes
    var keyCodeIndex = 65 // 'a' on keyboard
    for (var key in HLSP.scenesParams) {
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
        HLS.logoChange('logo');
    if (k.keyCode == 55) //7
        HLS.logoChange('maker');
    if (k.keyCode == 56) //8
        HLS.logoChange('cube');
    if (k.keyCode == 48)//0
        HL.cameraCompanion.visible = !HL.cameraCompanion.visible;


    if(k.keyCode == 57){ //9
      HLE.CENTER_PATH=!HLE.CENTER_PATH;
      HL.materials.land.uniforms.withCenterPath.value = HLE.CENTER_PATH;
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
if(noSocket) window.addEventListener('keydown', HLS.modelshooting);
window.addEventListener('HLEload', HLS.scenes.intro);
