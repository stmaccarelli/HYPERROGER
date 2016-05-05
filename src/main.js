
  // global vars
  var isMobile = !!('ontouchstart' in window); //true for android or ios, false for MS surface
  var isVR = window.location.href.indexOf('?vr')>-1;
  var isDebug = window.location.href.indexOf('?debug')>-1;
  var isFPC = window.location.href.indexOf('?fpc')>-1;
  var isOrbit = window.location.href.indexOf('?orbit')>-1;
  var isWire = window.location.href.indexOf('?wire')>-1;
  var hasShadows = false;

  var frameCount = 0;
  var millis = 0;


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

  var HLDEV = {
    audioReactive:true,
    animElements:true,
    animColors:true,
    animLand:true,
    animSea:true,
    stats:true,
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
    guiTweak.add(HLE, 'faunaAmount',0,150).step(1);
    var guiBase = gui.addFolder('guiBase');
    guiBase.add(HLR, 'connectedUsers', 0,500);
    guiBase.add(HLR, 'fft1', 0.1, 1.1);
    guiBase.add(HLR, 'fft2', 0.1, 1.1);
    guiBase.add(HLR, 'fft3', 0.1, 1.1);
    guiBase.add(HLR, 'fft4', 0.1, 1.1);
    guiBase.add(HLR, 'fft5', 0.1, 1.1);
    var guiDEV = gui.addFolder("dev");
    guiDEV.add(HLDEV, 'audioReactive');
    guiDEV.add(HLDEV, 'animColors');
    guiDEV.add(HLDEV, 'animElements');
    guiDEV.add(HLDEV, 'animSea');
    guiDEV.add(HLDEV, 'animLand');
  }


  function run() {
    window.requestAnimationFrame(run);

    // Environment and animation
    frameCount++;
    millis = (frameCount/60);
    HLE.moveSpeed += ((Math.max(Math.min(HLE.MAX_MOVE_SPEED, HLE.BASE_MOVE_SPEED + HLE.reactiveMoveSpeed),0))-HLE.moveSpeed) * 0.05;

    // remote control / audioreactive
    if(HLDEV.audioReactive) HLR.updateHLParams();
    //if(HLDEV.animColors) HLAnim.colors();
    if(HLDEV.animElements) HLAnim.particles();
    if(HLDEV.animSea && !HLE.MIRROR && !HLE.WATER) HLAnim.sea();
    if(HLE.MIRROR) HLAnim.seaWMMove();
    if(HLDEV.animLand) HLAnim.land();

  //  HLE.resetTriggers();

    // Controls and camera
    if(isMobile)
      HL.controls.update(); //DeviceOrientationControls  mode
    else if(isFPC || isOrbit){
      HL.controls.update(HL.clock.getDelta()); //FPC mode
    }
   else{
     HL.camera.lookAt(new THREE.Vector3(0,0,-HLE.WORLD_WIDTH/2)); // camera looks at center point on horizon
     HL.camera.rotateY(millis*0.001);
     HL.camera.rotateX(Math.sin(millis*0.1)*0.001);
   }
    // set camera move easing according to move speed
   HLE.cameraHeight += ((HLE.landHeight+HLE.landZeroPoint)-HLE.cameraHeight) * (HLE.moveSpeed * 0.02);
   HL.camera.position.y = 5 + HLE.cameraHeight * 1.5;

    // HL.camera.fov = 10 + HLE.cameraHeight * .6;
    // HL.camera.updateProjectionMatrix ();



    if(HLE.MIRROR) {
     HL.materials.water.render();
    }
    else if(HLE.WATER) {
     HL.materials.water.render();
     HL.materials.water.material.uniforms.time.value += HLE.moveSpeed * .01;
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

          // groundMirror.render();
          // HL.renderer.setRenderTarget( null ); // add this line

          if(isVR) HL.stereoEffect.render(HL.scene,HL.camera);
          else HL.renderer.render(HL.scene,HL.camera);

  }



  window.addEventListener('load',function(){
    mainInit();
    guiInit();
    // init HyperLand Environment
    HLEnvironment.init();

    // log
    console.log("THREE scene, renderer, camera, controls:");
    console.log(HL.scene);
    console.log(HL.renderer);
    console.log(HL.camera);
    console.log(HL.controls);

    // run
    run();
  });
