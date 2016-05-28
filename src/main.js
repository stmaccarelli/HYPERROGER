
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
      // hud.resize();
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

    // remote control / audioreactive
    // if we are on SOCKET MODE this function will be called by a socket.on() event
    // so we should not call it here.
   HLRemote.updateHLParams(AA.getFreq(2), AA.getFreq(0), AA.getFreq(400), AA.getFreq(64), AA.getFreq(200));
    //  HLRemote.updateHLParams(1,1,1,1,1);

    // HLAnim.particles(); // moved in sceneManager
    if(!HLE.MIRROR && !HLE.WATER) HLAnim.sea();
    if(HLE.MIRROR) HLAnim.mirrorWaves();
    if(HLE.WATER) HLAnim.waterShaderBaseMotion();
    HLAnim.land();
    HLAnim.models();

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
    // set camera move easing according to move speed
    if(!HLE.CENTER_PATH){
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
    // hud = new HUD(true);
    // run is called by HLEnvironment.init() when it's all loaded
    window.addEventListener('HLEload', function(){console.log("event HLEload received"); run(); });
    window.removeEventListener('load',loadRoutine,false);
  }
  window.addEventListener('load',loadRoutine,false);
