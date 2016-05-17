
  // global vars
  var isMobile = !!('ontouchstart' in window); //true for android or ios, false for MS surface
  var isVR = window.location.href.indexOf('?vr')>-1;
  var isDebug = window.location.href.indexOf('?debug')>-1;
  var isFPC = window.location.href.indexOf('?fpc')>-1;
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
    }

    window.addEventListener("resize", onResized);
  }

  function guiInit(){
    var gui = new dat.GUI();
    var guiTweak = gui.addFolder('manuali');
    guiTweak.add(HLE, 'reactiveMoveSpeed',0,10.0);
    guiTweak.add(HLE, 'reactiveSeaHeight',0.001,2.0);
    guiTweak.add(HLE, 'noiseFrequency',0,20);
    guiTweak.add(HLE, 'noiseFrequency2',0,20);
    guiTweak.add(HLE, 'landZeroPoint',-150,150);
    guiTweak.add(HLE, 'landHeight',0,150);
  }


  function run() {
    window.requestAnimationFrame(run);

    // Environment and animation
    frameCount++;
    millis = (frameCount/60);
    delta = HL.clock.getDelta();

    // remote control / audioreactive
    HLR.updateHLParams();
    //if(HLDEV.animColors) HLAnim.colors();
    HLAnim.particles();
    if(!HLE.MIRROR && !HLE.WATER) HLAnim.sea();
    if(HLE.MIRROR) HLAnim.seaWMMove();
    HLAnim.land();
    HLAnim.models();

    // Controls and camera
    if(isMobile)
      HL.controls.update(); //DeviceOrientationControls  mode
    else if(isFPC || isNoiseCam){
      HL.controls.update(delta,millis); //FPC mode
    }
    else{
     HL.camera.lookAt(new THREE.Vector3(0,0,-HLE.WORLD_WIDTH/2)); // camera looks at center point on horizon
    }
    // set camera move easing according to move speed
    if(!HLE.CENTER_PATH){
      HLE.cameraHeight += ((HLE.landHeight+HLE.landZeroPoint)-HLE.cameraHeight) * (HLE.moveSpeed * 0.08);
      HL.camera.position.y = 10 + HLE.cameraHeight * 1.5;
    }

    // HL.camera.fov = 10 + HLE.cameraHeight * .6;
    // HL.camera.updateProjectionMatrix ();
    if(HLE.MIRROR) {
     HL.materials.water.render();
    }
    else if(HLE.WATER) {
     HL.materials.water.render();
    // HL.materials.water.material.uniforms.waterColor.value = HLC.horizon;
    }
    // Rendering
    if(isVR){
      if(HLE.MIRROR || HLE.WATER)
        HL.renderer.setRenderTarget( null );
      HL.stereoEffect.render(HL.scene,HL.camera);
    }
    else HL.renderer.render(HL.scene,HL.camera);


    // Rendering
    if(isVR){
    //  HL.renderer.setRenderTarget( null ); not needed anymore??
      HL.stereoEffect.render(HL.scene,HL.camera);
    }
    else HL.renderer.render(HL.scene,HL.camera);

  }



  window.addEventListener('load',function(){
    mainInit();
    guiInit();
    // init HyperLand Environment
    HLEnvironment.init();
    // run is called by HLEnvironment.init() when it's all loaded
    window.addEventListener('HLEload', function(){console.log("event HLEload received"); run(); });
  });
