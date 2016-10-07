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
    hud: new HUD(true),

}

// custom scene init (follows standard init)
HLS.initScenes =   {};
// holds standard, can be extended to custom scenes, called by rAF
HLS.scenes = {};
// custom scenes addons, follow scenes, called in scenes
HLS.scenesAddons = {};


HLS.loadParams = function(params) {

    HLE.BASE_MOVE_SPEED = (isVR||isCardboard)?params.speed*0.01:params.speed || 1;

    if (params.cameraPositionY !== undefined)
        HL.cameraGroup.position.y = params.cameraPositionY;
    else HL.cameraGroup.position.y = 50;

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
        HL.land.material.uniforms.buildFreq = Math.random() * 100;
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

    if (params.centerPath !== undefined){
        HL.materials.land.uniforms.withCenterPath.value =
        HLE.CENTER_PATH =
        params.centerPath;
    }
}

HLS.startScene = function(sceneId) {
    HLS.sceneId = sceneId;
    // cancel previous animation
    window.cancelAnimationFrame(HLS.raf);

    //reset fog
    HL.scene.fog.density = 0.00025;

    //destroy all running models
    HLH.destroyAllModels();

    //load scene parameters
    if (HLSP.scenesParams[sceneId] !== undefined) {
        HLS.loadParams(HLSP.scenesParams[sceneId]);
        //start hud display
        if (HLS.hud !== undefined) HLS.hud.display(HLSP.scenesParams[sceneId].displayText || sceneId, 3, false);
    }

    // reset camera rotations etc
    // HL.cameraGroup.rotation.x = 0;
    // HL.cameraGroup.rotation.y = 0;
    // HL.cameraGroup.rotation.z = 0;
    HL.cameraCompanion.visible = false;

    //init custom scene, in case any
    // TODO try to remove and parametrize everything in scenesParams
    if (HLS.initScenes[sceneId] !== undefined)
        HLS.initScenes[sceneId]();

    // scene timer, useful for timed scene events
    // eg:  if(frameCount-HLS.sceneStart>=600) HLR.startScene('scene2');
    HLS.sceneStart = frameCount;

    //start new sceneI
    if(isVR) HLS.raf = HL.stereoEffect.requestAnimationFrame(HLS.scenes[sceneId] || HLS.scenes.standard);
    else HLS.raf = window.requestAnimationFrame(HLS.scenes[sceneId] || HLS.scenes.standard);
}




HLS.scenes.standard = function() {

  if(isVR) HLS.raf = HL.stereoEffect.requestAnimationFrame(HLS.scenes.standard);
  else window.requestAnimationFrame(HLS.scenes.standard);


    // HLS.raf = window.requestAnimationFrame(HLS.scenes.standard);

    // advance buildFreq
    HL.materials.land.uniforms.buildFreq.value -= Math.max(0, (HLR.fft1 - 0.96)) * 2.5;

    // // compute move speed
    HLE.reactiveMoveSpeed = 1 + (HLR.fft1 + HLR.fft2 + HLR.fft3) * 0.3 * HLE.BASE_MOVE_SPEED;
    // HLE.moveSpeed += (HLE.reactiveMoveSpeed - HLE.moveSpeed) * 0.25;
    HLE.moveSpeed = HLE.reactiveMoveSpeed;
    HLE.moveSpeed *= 0.98;

    // compute noiseFrequency (used in land for rainbow etc)
    HLR.tempNoiseFreq = 7 - (HLR.fft3) * 3;
    // HLE.noiseFrequency += (HLR.tempNoiseFreq - HLE.noiseFrequency) * 0.3;
    HLE.noiseFrequency = HLR.tempNoiseFreq;

    HLE.noiseFrequency2 += (HLR.fft2 - HLR.fft3) * .003;

    // compute land heiught
    HLR.tempLandHeight = (HLR.smoothFFT1 + HLR.smoothFFT3) *
        HLE.WORLD_HEIGHT;
    // if(HLE.CENTER_PATH) HLR.tempLandHeight*=3;
    HLE.landHeight += (HLR.tempLandHeight - HLE.landHeight) * 0.45;
    // HLE.landZeroPoint = - HLR.fft3 * HLE.landHeight * .5;

    if (HLR.fft3 > 0.99)
        HLH.shootGroup(HLS.modelsParams);

    // thunderbolts
    var lumi = HLR.fft3;
    HLC.horizon.setRGB(
        HLC.tempHorizon.r + lumi,
        HLC.tempHorizon.g + lumi,
        HLC.tempHorizon.b + lumi
    );

    //camera motion
    if (!isMobile)
        HLS.cameraMotion();

    if (HLS.scenesAddons[HLS.sceneId] || undefined)
        HLS.scenesAddons[HLS.sceneId]();
}


HLS.initScenes.static = function() {
    HL.cameraCompanion.visible = true;
}
HLS.scenes.static = function() {
    // HLS.raf = window.requestAnimationFrame(HLS.scenes.static);
    if(isVR) HLS.raf = HL.stereoEffect.requestAnimationFrame(HLS.scenes.static);
    else window.requestAnimationFrame(HLS.scenes.static);
    // compute move speed
    HLE.reactiveMoveSpeed = 1 + HLR.fft1 * HLE.BASE_MOVE_SPEED;
    HLE.moveSpeed += (HLE.reactiveMoveSpeed - HLE.moveSpeed) * 0.015;

}

// scene addons are executed after standard scene
HLS.scenesAddons.mizu = function() {
    // thunderbolts
    var lumi = HLR.fft3 * 0.25;
    HLC.horizon.setRGB(
        HLC.tempHorizon.r + lumi,
        HLC.tempHorizon.g + lumi,
        HLC.tempHorizon.b + lumi
    );

}

HLS.scenesAddons.solar_valley = function() {
    // thunderbolts
    var lumi = HLR.fft5 * HLR.fft5 * 4;
    HLC.land.setRGB(lumi, lumi, lumi);
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
    var lumi = HLR.fft1 * 0.125;
    HLC.horizon.setRGB(
        HLC.tempHorizon.r + lumi,
        HLC.tempHorizon.g + lumi,
        HLC.tempHorizon.b + lumi
    );
    // thunderbolts
    lumi = HLR.fft3 + HLR.fft2;
    HLC.land.setRGB(lumi, lumi, lumi);
}

HLS.scenesAddons.twin_horizon = function() {
    HL.cameraGroup.rotation.z += Math.PI;

    var lumi = HLR.fft3 * 0.825;
    HLC.horizon.setRGB(
        HLC.tempHorizon.r -lumi,
        HLC.tempHorizon.g - lumi,
        HLC.tempHorizon.b + lumi
    );
}


HLS.scenesAddons.hyperocean = function() {}



HLS.scenesAddons.roger_water = function(){
  // thunderbolts
  var lumi = Math.min(HLR.fft3*2+HLR.fft1*0.2,1);
  HLC.horizon.setRGB(
      HLC.tempHorizon.r + lumi,
      HLC.tempHorizon.g + lumi,
      HLC.tempHorizon.b + lumi
  );

  if(HLR.fft1>0.98)
    randomizeLand();
}

HLS.scenesAddons.popeye = function(){
  HL.materials.land.uniforms.buildFreq.value += (HLR.fft1-0.8) * .05;

  var lumi = HLR.fft1*0.25;
  HLC.horizon.setRGB(
      HLC.tempHorizon.r + lumi,
      HLC.tempHorizon.g + lumi,
      HLC.tempHorizon.b + lumi
  );
}


/*
* COMMON HELPERS
*
*/


HLS.cameraMotion = function() {

  var b = Math.PI + Math.sin(HLE.advance  * 0.0001 ) * Math.PI;
  var r = HLE.WORLD_WIDTH*0.25;


  HL.cameraGroup.lookAt(
     new THREE.Vector3(
      Math.sin(b) * r,
      HL.cameraGroup.position.y*2,
      Math.cos(b) * r
    )
    );

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

var tilen = Math.round(Math.random()*HLE.WORLD_TILES);

 // HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, tilen,tilen);
 // HL.land.geometry.rotateX(-Math.PI / 2);
 // HL.land.material.uniforms.worldTiles.value = tilen;
 HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(tilen * Math.random(), tilen * Math.random() );

 HL.land.material.uniforms.bFactor.value = Math.random();
 HL.land.material.uniforms.cFactor.value = Math.random();
 // HL.land.material.uniforms.buildFreq.value = Math.random()*100.0;
 HL.land.material.uniforms.map.value = HL.textures[(Math.random()>.5?'land':'pattern')+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];
 HL.land.material.uniforms.natural.value = Math.random();
 HL.land.material.uniforms.rainbow.value = Math.random();
 HL.land.material.uniforms.squareness.value = Math.random()*0.05;


 HLC.land.setRGB(0.5+Math.random()*0.5, 0.5+Math.random()*0.5, 0.5+Math.random()*0.5);
  HLC.horizon.setRGB(Math.random()/2,Math.random()/2,Math.random()/2);

};


HLS.logoChange = function(model) {
    HL.cameraGroup.remove(HL.cameraCompanion);

    HL.cameraCompanion = HL.models[model].clone();
    HL.cameraCompanion.geometry = HL.cameraCompanion.geometry.clone().scale(30, 30, 30);
    HL.cameraCompanion.position.z = -600;
    HL.cameraCompanion.position.y = -40;
    HL.cameraCompanion.position.x = -20;
    // HL.cameraCompanion.material = new THREE.MeshBasicMaterial({color:0xff0000,side:THREE.DoubleSide});
    HL.cameraCompanion.material.color.set(0xff0000);
    HL.cameraCompanion.material.emissive.set(0xaa0000);

    HL.cameraGroup.add(HL.cameraCompanion);

}

HLS.modelshooting = function(k) {
  console.log(k);
    // create keys for scenes
    var keyCodeIndex = 65 // 'a' on keyboard
    for (var key in HLSP.scenesParams) {
        if (k.keyCode == keyCodeIndex++) {
          console.log(key);
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
