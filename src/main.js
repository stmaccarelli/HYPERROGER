
  // global vars
  var isMobile = !!('ontouchstart' in window); //true for android or ios, false for MS surface
  var isCardboard = window.location.href.indexOf('?cardboard')>-1;
  var isVR = window.location.href.indexOf('?webvr')>-1;
  var isDebug = window.location.href.indexOf('?debug')>-1;
  var isFPC = window.location.href.indexOf('?fpc')>-1;
  var isOrbit = window.location.href.indexOf('?orbit')>-1;
  var isNoiseCam = window.location.href.indexOf('?noisecam')>-1;
  var isWire = window.location.href.indexOf('?wire')>-1;
  var hasShadows = false;
  var noHUD = window.location.href.indexOf('?noHUD')>-1;
  var isMapped = window.location.href.indexOf('?mapped')>-1;
  var mappingCorrectAspect = window.location.href.indexOf('?mappedB')>-1;
  var staticAudio = window.location.href.indexOf('?staticaudio')>-1;




  var noSocket = window.location.href.indexOf('?nosocket')>-1;
  var partSocket = window.location.href.indexOf('?partsocket')>-1;
  var hasGUI = window.location.href.indexOf('?gui')>-1;
  var midiIn = window.location.href.indexOf('?midiin')>-1;

  var frameCount = 0;
  var millis = 0;
  var delta = 0;
  var mouse = {
    x:null, y:null,
    // coords relative to center
    rX:null,rY:null,
    // coords in the prev frame
    prevX:null,prevY:null
  };

  function mainInit(){
    // init and enable NoSleep so screen won't dim
    var noSleep = new NoSleep();
    function noSleepEnable(){
      noSleep.enable();
      window.removeEventListener('touchstart', noSleepEnable);
      window.removeEventListener('resize', noSleepEnable);
      window.removeEventListener('click', noSleepEnable);
      window.removeEventListener('orientationchange', noSleepEnable);

      console.log('noSleep enabled');
    }
    window.addEventListener('touchstart', noSleepEnable);
    window.addEventListener('click', noSleepEnable);
    window.addEventListener('resize', noSleepEnable);
    window.addEventListener('orientationchange', noSleepEnable);
    noSleepEnable();

    // init noScroll TODO do it according to broswer / os
    var noScroll = new NoScroll();
    noScroll.enable();

    // function setMouse(e){
    //   mouse.pX = mouse.x;
    //   mouse.pY = mouse.y;
    //
    //   mouse.x = e.pageX;
    //   mouse.y = e.pageY;
    //
    //   mouse.rX = e.pageX - window.innerWidth*0.5;
    //   mouse.rY = e.pageY - window.innerHeight*0.5;
    // }
    // window.addEventListener('mousemove',setMouse);
    // console.log('mouse var enabled');

    function onResized() {

      HL.camera.aspect = window.innerWidth / window.innerHeight;
      HL.camera.updateProjectionMatrix();
      HL.renderer.setSize( window.innerWidth, window.innerHeight );
      if(isCardboard)
        HL.stereoEffect.setSize(window.innerWidth * HLE.SCREEN_WIDTH_SCALE, window.innerHeight * HLE.SCREEN_HEIGHT_SCALE);

      //
      // HL.renderer.setSize(window.innerWidth * HLE.SCREEN_WIDTH_SCALE, window.innerHeight * HLE.SCREEN_HEIGHT_SCALE);
      // if(HLE.WATER)
      //   HL.materials.water.renderer.setSize(window.innerWidth * HLE.SCREEN_WIDTH_SCALE, window.innerHeight * HLE.SCREEN_HEIGHT_SCALE);
      //
      // if(HLE.MIRROR)
      //   HL.materials.mirror.renderer.setSize(window.innerWidth * HLE.SCREEN_WIDTH_SCALE, window.innerHeight * HLE.SCREEN_HEIGHT_SCALE);
      //
      // if(isCardboard) HL.stereoEffect.setSize(window.innerWidth * HLE.SCREEN_WIDTH_SCALE, window.innerHeight * HLE.SCREEN_HEIGHT_SCALE);
      //
      // HL.camera.aspect = (window.innerWidth * HLE.SCREEN_WIDTH_SCALE) / (window.innerHeight * HLE.SCREEN_HEIGHT_SCALE);
      // HL.camera.updateProjectionMatrix();


    }

    window.addEventListener("resize", onResized);


    // AUDIO ANALYSIS
    // if((noSocket || partSocket) && !isMobile && !staticAudio) { AA = AudioAnalyzer(); AA.initGetUserMedia();}
    AA = new AAMS();
    
  }



  function run() {
    if(isVR) HL.VREffect.requestAnimationFrame(run);
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

    // if(staticAudio){
      HLRemote.updateHLParams(AA.getFreq(2), AA.getFreq(0), AA.getFreq(200));//), AA.getFreq(64), AA.getFreq(200));
    // }
    // else if( (noSocket || partSocket) && !isMobile)
    //   HLRemote.updateHLParams(AA.getFreq(2/*2*/)*0.975, AA.getFreq(0), AA.getFreq(200/*400*/));//), AA.getFreq(64), AA.getFreq(200));
    // else {
    //   HLRemote.updateHLParams(.5,.5,.5);
    // }

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
      HL.controls.update(delta); //FPC mode
    }
    else{
    }





    // Rendering
    // HL.renderer.autoClear = false;
     HL.renderer.clear();

    if(HLE.WATER)
      HL.materials.water.render();

    if(HLE.MIRROR)
      HL.materials.mirror.render();

    if(isCardboard || isVR){

      if(HLE.MIRROR || HLE.WATER){

        HL.renderer.setRenderTarget( null );

      }

      if(isCardboard){

        HL.stereoEffect.render(HL.scene,HL.camera);

      }

      if(isVR){

       HL.VREffect.render(HL.scene,HL.camera);

      }

    }
    else{ // no stereo

      if(isMapped){

        HL.renderer.render(HL.scene,HL.camera, HL.mappingRenderTarget);
        HL.renderer.render(HL.mappingScene,HL.mappingCamera);

      } else {

        HL.renderer.render(HL.scene,HL.camera);

      }

    }

    delta = null;
  }

  function loadRoutine(){
    mainInit();

    // init HyperLand Environment
    HLEnvironment.init();

    // run is called when it's all loaded
    window.addEventListener('HLEload', function(){
        console.log("event HLEload received");
        // DEV
        if(hasGUI) { G = GUI(); G.guiInit();}
        // if(!noSocket) socketVisual.init();

        //remove loadingDiv
        document.body.removeChild(loadingDiv);


        //let's rock
        run();
      }
    );

    if ( isVR && WEBVR.isAvailable() === true ) {
      document.body.appendChild( WEBVR.getButton( HL.VREffect ) );
    }

    window.removeEventListener('load',loadRoutine);

  }
  window.addEventListener('load',loadRoutine,false);






//
//
//
//
// // TODO: REMOVE! JUST FOR DEV PURPOSES
//   function randomizeLand(){
//
//   var tilen = Math.round(Math.random()*HLE.WORLD_TILES);
//
//    HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, tilen,tilen);
//    HL.land.geometry.rotateX(-Math.PI / 2);
//    HL.land.material.uniforms.worldTiles.value = tilen;
//    HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(tilen * Math.random(), tilen * Math.random() );
//
//    HL.land.material.uniforms.bFactor.value = Math.random();
//    HL.land.material.uniforms.cFactor.value = Math.random()*0.3;
//    HL.land.material.uniforms.buildFreq.value = Math.random()*100.0;
//    HL.land.material.uniforms.map.value = HL.textures[(Math.random()>.5?'land':'pattern')+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];
//    HL.land.material.uniforms.natural.value = Math.random();
//    HL.land.material.uniforms.rainbow.value = Math.random();
//    HL.land.material.uniforms.squareness.value = Math.random()*0.25;
//
//
//    HLC.land.setRGB(0.5+Math.random()*0.5, 0.5+Math.random()*0.5, 0.5+Math.random()*0.5);
//     HLC.horizon.setRGB(Math.random()/2,Math.random()/2,Math.random()/2);
//
//   };





  //TODO remove, just DEV features
  //if(isMobile)  window.addEventListener('touchstart',randomizeLand);
  // else  window.addEventListener('click',randomizeLand);


  var loadingDiv = document.getElementById('loadingDiv');
  //
  // if (typeof console.log != 'undefined'){
  //   console.olog = console.log;
  //   console.oTimeEnd = console.timeEnd;
  //   }
  // else{
  //     console.olog = function() {};
  //   }
  //
  // console.log = function(message) {
  //     console.olog(message);
  //     loadingDiv.innerHTML += ('<p>' + message + '</p>');
  // };
  //
  // console.timeEnd = function(message) {
  //     console.oTimeEnd(message);
  //     loadingDiv.innerHTML += ('<p>' + message +'</p>');
  // };
  // console.error = console.debug = console.info = console.log














  //fullscreen API TODO
  // Find the right method, call on correct element
  // function launchIntoFullscreen(element) {
  //   screen.orientation.lock ('landscape');
  //
  //   if(element.requestFullscreen) {
  //     element.requestFullscreen();
  //   } else if(element.mozRequestFullScreen) {
  //     element.mozRequestFullScreen();
  //   } else if(element.webkitRequestFullscreen) {
  //     element.webkitRequestFullscreen();
  //   } else if(element.msRequestFullscreen) {
  //     element.msRequestFullscreen();
  //   }
  //
  // }
  //
  //
  // function androFullscreenLandscape(){
  //   launchIntoFullscreen(document.documentElement);
  //   window.removeEventListener("orientationchange", androFullscreenLandscape);
  // }

  // Launch fullscreen for browsers that support it!
  //if(isMobile) launchIntoFullscreen(document.documentElement); // the whole page
//  window.addEventListener("orientationchange", androFullscreenLandscape); //test resize too

// alert('eh');
// screen.orientation.lock ('landscape');
// window.scrollTo(0, 0);

  // android stock
  // window.addEventListener('load', function() {
  //   screen.lockOrientation('landscape-primary');
  //   window.scrollTo(0, -10);
  //   alert("chrome is fullscreen");
  // });
//  document.addEventListener("touchmove", function(e) { e.preventDefault() });

  // //chrome (android)
  // var body = document.documentElement;
  // screen.orientation.lock ('landscape');
  // if (body.requestFullscreen) {
  //   body.requestFullscreen();
  // } else if (body.webkitrequestFullscreen) {
  //   body.webkitrequestFullscreen();
  // } else if (body.mozrequestFullscreen) {
  //   body.mozrequestFullscreen();
  // } else if (body.msrequestFullscreen) {
  //   body.msrequestFullscreen();
  // }
