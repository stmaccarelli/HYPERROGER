
  // global vars
  var isMobile = !!('ontouchstart' in window); //true for android or ios, false for MS surface
  var isVR = window.location.href.indexOf('?vr')>-1;
  var isDebug = window.location.href.indexOf('?debug')>-1;
  var isFPC = window.location.href.indexOf('?fpc')>-1;
  var isOrbit = window.location.href.indexOf('?orbit')>-1;
  var isNoiseCam = window.location.href.indexOf('?noisecam')>-1;
  var isWire = window.location.href.indexOf('?wire')>-1;
  var hasShadows = false;

  var frameCount = 0;
  var millis = 0;
  var delta = 0;

  function mainInit(){
    // init and enable NoSleep so screen won't dim
    var noSleep = new NoSleep();
    function noSleepEnable(){
      noSleep.enable();
      window.removeEventListener('click', noSleepEnable, false);
      console.log('noSleep enabled');
    }
    window.addEventListener('click', noSleepEnable, false);
    noSleepEnable();

    // init noScroll
    var noScroll = new NoScroll();
    noScroll.enable();

    function onResized() {
      HL.renderer.setSize(window.innerWidth, window.innerHeight);
      if(isVR) HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);
      HL.camera.aspect = window.innerWidth / window.innerHeight;
      HL.camera.updateProjectionMatrix();
      hud.resize();
    }

    window.addEventListener("resize", onResized);
  }

  function guiInit(){
    var gui = new dat.GUI();
    var guiTweak = gui.addFolder('manuali');
    guiTweak.add(HLE, 'BASE_MOVE_SPEED',0,30);
  }


  function run() {
    window.requestAnimationFrame(run);

    // Environment and animation
    frameCount++;
    millis = (frameCount/60);
    delta = HL.clock.getDelta();

    // TODO: improve detection. take account of browser cpu time, models shooting time, etc
    //CPU GPU POWER DETECTION BY CLOCK
    // if(delta>0.05){
    //   HLE.WORLD_TILES = Math.round(HLE.WORLD_TILES*0.75);
    //   HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, HLE.WORLD_TILES,HLE.WORLD_TILES);
    //   HL.land.geometry.rotateX(-Math.PI / 2);
    //   HL.land.material.uniforms.worldTiles.value = HLE.WORLD_TILES;
    //   HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(1,HLE.WORLD_TILES*1);
    //   console.log(delta+ " reducing tiles: " + HLE.WORLD_TILES);
    // };

    // remote control / audioreactive
    // if we are on SOCKET MODE this function will be called by a socket.on() event
    // so we should not call it here.
      HLRemote.updateHLParams(.5,.5,.5,.5,.5);
      // HLRemote.updateHLParams(AA.getFreq(2), AA.getFreq(0), AA.getFreq(400), AA.getFreq(64), AA.getFreq(200));

    // HLAnim.particles(); // moved in sceneManager
    if(!HLE.MIRROR && !HLE.WATER) HLAnim.sea();
    if(HLE.MIRROR) HLAnim.mirrorWaves();
    if(HLE.WATER) HLAnim.waterShaderBaseMotion();
    HLAnim.landGLSL();
    HLAnim.models();
    HLAnim.particles();
    // HLAnim.wind();

    // Controls and camera
    if(isMobile || isOrbit)
      HL.controls.update(); //DeviceOrientationControls  mode
    else if(isFPC || isNoiseCam){
      HL.controls.update(delta,millis); //FPC mode
    }
    else{
      // this function sucks spu, use just if really needed
      //  HL.camera.lookAt(new THREE.Vector3(0,0,-HLE.WORLD_WIDTH/6)); // camera looks at center point on horizon

    }

    if(!HLE.CENTER_PATH && !isMobile){
      // HLE.cameraHeight = HLE.landHeight;
      HLE.smoothCameraHeight += (HLE.landHeight - HLE.smoothCameraHeight) * (HLE.moveSpeed * 0.001);
      HL.camera.position.y = 10 + HLE.smoothCameraHeight * 1.1;
    }

    // Rendering
    if(HLE.WATER)
      HL.materials.water.render();
    if(HLE.MIRROR)
      HL.materials.mirror.render();
    if(isVR){
      if(HLE.MIRROR || HLE.WATER)
      HL.renderer.setRenderTarget( null );
      HL.stereoEffect.render(HL.scene,HL.camera);
    }
    else
      HL.renderer.render(HL.scene,HL.camera);

    delta = null;
  }

  function loadRoutine(){
    mainInit();
    // guiInit();
    // init HyperLand Environment
    HLEnvironment.init();
    hud = new HUD(true);
    // run is called by HLEnvironment.init() when it's all loaded
    window.addEventListener('HLEload', function(){console.log("event HLEload received"); run(); });
    window.removeEventListener('load',loadRoutine,false);
  }
  window.addEventListener('load',loadRoutine,false);


// TODO: REMOVE! JUST FOR DEV PURPOSES
  function randomizeLand(){

  var tilen = Math.round(Math.random()*HLE.WORLD_TILES);

   HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, tilen,tilen);
   HL.land.geometry.rotateX(-Math.PI / 2);
   HL.land.material.uniforms.worldTiles.value = tilen;
   HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(tilen * Math.random(), tilen * Math.random() );

   HL.land.material.uniforms.cFactor.value = Math.random();
   HL.land.material.uniforms.dFactor.value = Math.random()*0.3;
   HL.land.material.uniforms.buildFreq.value = Math.random()*100.0;
   HL.land.material.uniforms.map.value = HL.textures[(Math.random()>.5?'land':'pattern')+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];
   HL.land.material.uniforms.natural.value = Math.random();
   HL.land.material.uniforms.rainbow.value = Math.random();
    //  HL.materials.clouds.map = HL.textures['land'+(1+Math.round(Math.random()*4))];

   HLC.land.setRGB(0.5+Math.random()*0.5, 0.5+Math.random()*0.5, 0.5+Math.random()*0.5);
   HLC.horizon.setRGB(Math.random()/2,Math.random()/2,Math.random()/2);

   launchIntoFullscreen(document.documentElement); // the whole page

  };

  if(isMobile)  window.addEventListener('touchstart',randomizeLand);
  else  window.addEventListener('click',randomizeLand);
