
  // global vars
  var isMobile = !!('ontouchstart' in window); //true for android or ios, false for MS surface
  var isCardboard = window.location.href.indexOf('?card')>-1;
  var isVR = window.location.href.indexOf('?vr')>-1;
  var isDebug = window.location.href.indexOf('?debug')>-1;
  var isFPC = window.location.href.indexOf('?fpc')>-1;
  var isOrbit = window.location.href.indexOf('?orbit')>-1;
  var isNoiseCam = window.location.href.indexOf('?noisecam')>-1;
  var isWire = window.location.href.indexOf('?wire')>-1;
  var hasShadows = false;
  var noSocket = window.location.href.indexOf('?nosocket')>-1;
  var hasGUI = window.location.href.indexOf('?gui')>-1;

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
      HL.renderer.setSize(window.innerWidth * HLE.SCREEN_WIDTH_SCALE, window.innerHeight * HLE.SCREEN_HEIGHT_SCALE);
      if(isCardboard) HL.stereoEffect.setSize(window.innerWidth * HLE.SCREEN_WIDTH_SCALE, window.innerHeight * HLE.SCREEN_HEIGHT_SCALE);
      HL.camera.aspect = (window.innerWidth * HLE.SCREEN_WIDTH_SCALE) / (window.innerHeight * HLE.SCREEN_HEIGHT_SCALE);
      HL.camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", onResized);

    if(noSocket){ AA = AudioAnalyzer(); AA.initGetUserMedia();}

  }



  function run() {
    if(isVR) HL.stereoEffect.requestAnimationFrame(run);
    else window.requestAnimationFrame(run);

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

    if(noSocket && !isMobile)
      HLRemote.updateHLParams(AA.getFreq(2), AA.getFreq(0), AA.getFreq(400), AA.getFreq(64), AA.getFreq(200));
    else if(noSocket)
      HLRemote.updateHLParams(.5,.5,.5,.5,.5);

    // HLAnim.particles(); // moved in sceneManager
    if(!HLE.MIRROR && !HLE.WATER) HLAnim.sea();
    if(HLE.MIRROR) HLAnim.mirrorWaves();
    if(HLE.WATER) HLAnim.seaGLSL(); //just updates uniforms
    HLAnim.landGLSL(); //just updates uniforms
    HLAnim.models();
    HLAnim.particles();
    // HLAnim.wind();



    // camera controls
    if(isMobile || isOrbit || isVR )
      HL.controls.update(); //DeviceOrientationControls  mode
    else if(isFPC || isNoiseCam){
      HL.controls.update(delta,millis); //FPC mode
    }
    else{
    }





    // Rendering
    if(HLE.WATER)
      HL.materials.water.render();
    if(HLE.MIRROR)
      HL.materials.mirror.render();
    if(isCardboard || isVR){
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
    // init HyperLand Environment
    HLEnvironment.init();
    // run is called when it's all loaded
    window.addEventListener('HLEload', function(){
        console.log("event HLEload received");
        run();
        // DEV
        if(hasGUI) { G = GUI(); G.guiInit();}
        if(!noSocket) socketVisual.init();
      }
    );

    if ( isVR && WEBVR.isAvailable() === true ) {
      document.body.appendChild( WEBVR.getButton( HL.stereoEffect ) );
    }
    
    window.removeEventListener('load',loadRoutine);

  }
  window.addEventListener('load',loadRoutine,false);










// TODO: REMOVE! JUST FOR DEV PURPOSES
  function randomizeLand(){

  var tilen = Math.round(Math.random()*HLE.WORLD_TILES);

   HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, tilen,tilen);
   HL.land.geometry.rotateX(-Math.PI / 2);
   HL.land.material.uniforms.worldTiles.value = tilen;
   HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(tilen * Math.random(), tilen * Math.random() );

   HL.land.material.uniforms.bFactor.value = Math.random();
   HL.land.material.uniforms.cFactor.value = Math.random()*0.3;
   HL.land.material.uniforms.buildFreq.value = Math.random()*100.0;
   HL.land.material.uniforms.map.value = HL.textures[(Math.random()>.5?'land':'pattern')+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];
   HL.land.material.uniforms.natural.value = Math.random();
   HL.land.material.uniforms.rainbow.value = Math.random();
   HL.land.material.uniforms.squareness.value = Math.random()*0.25;


   HLC.land.setRGB(0.5+Math.random()*0.5, 0.5+Math.random()*0.5, 0.5+Math.random()*0.5);
    HLC.horizon.setRGB(Math.random()/2,Math.random()/2,Math.random()/2);

  };





  //TODO remove, just DEV features
  if(isMobile)  window.addEventListener('touchstart',randomizeLand);
  // else  window.addEventListener('click',randomizeLand);


  var consoleDiv = document.createElement('div');
  consoleDiv.style.position = "absolute";
  consoleDiv.style.bottom=0;
  consoleDiv.style.left=0;
  document.body.appendChild(consoleDiv);

  if (typeof console  != "undefined")
      if (typeof console.log != 'undefined'){
        console.olog = console.log;
        console.oTimeEnd = console.timeEnd;
        }
      else{
          console.olog = function() {};
        }

  console.log = function(message) {
      console.olog(message);
      consoleDiv.innerHTML += ('<p>' + message + '</p>');
  };

  console.timeEnd = function(message) {
      console.oTimeEnd(message);
      consoleDiv.innerHTML += ('<p>' + message +'</p>');
  };
  console.error = console.debug = console.info = console.log


  //fullscreen API TODO
  // Find the right method, call on correct element
  function launchIntoFullscreen(element) {
    if(element.requestFullscreen) {
      element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if(element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if(element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  // Launch fullscreen for browsers that support it!
  //if(isMobile) launchIntoFullscreen(document.documentElement); // the whole page
