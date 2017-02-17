
  // global vars
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

  function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Windows Phone must come first because its UA also contains "Android"
      if (/windows phone/i.test(userAgent)) {
          return "Windows Phone";
      }

      if (/android/i.test(userAgent)) {
          return "Android";
      }

      // iOS detection from: http://stackoverflow.com/a/9039885/177710
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
          return "iOS";
      }

      return "unknown";
  }

  var mobileOS = getMobileOperatingSystem();
  var isMobile = false;
  if( mobileOS.indexOf("unknown") == -1 ){
    isMobile = true;
  }

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

      HL.renderer.setSize(window.innerWidth, window.innerHeight);

      if(isCardboard)
        HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);

      if(HLE.WATER)
        HL.materials.water.renderer.setSize(window.innerWidth, window.innerHeight);

      if(HLE.MIRROR)
        HL.materials.mirror.renderer.setSize(window.innerWidth, window.innerHeight);

      if(isFPC)
        HL.controls.handleResize();

    }

    window.addEventListener("resize", onResized);


    // AUDIO ANALYSIS
    // if((noSocket || partSocket) && !isMobile && !staticAudio) { AA = AudioAnalyzer(); AA.initGetUserMedia();}

    AA = new AAMS( HL.audio );
    // AAK = new AAMS( HL.audioKick, {mute:true} );

  }


  var performanceLow = 0, performanceHigh = 0;

  function mainLoop() {
    if(isVR) HLMain.rafID = HL.VREffect.requestAnimationFrame(mainLoop);
    else HLMain.rafID = window.requestAnimationFrame(mainLoop);

    // Environment and animation
    frameCount++;
    millis = (frameCount/60);
    delta = HL.clock.getDelta();

    // if (frameCount>10) return;


    // remote control / audioreactive
    // if we are on SOCKET MODE this function will be called by a socket.on() event
    // so we should not call it here.

    // if(staticAudio){

    if(isMobile && mobileOS.indexOf('Android')==-1 )
      HLRemote.updateHLParams(0.5,0.04,0.03,0.001);// .2+Math.random()*.4, .2+Math.random()*.4, .2+Math.random()*.4 );//), AA.getFreq(64), AA.getFreq(200));
    else
      HLRemote.updateHLParams( AA.getFreq(2), AA.getFreq(0), AA.getFreq(200), AA.getFreq(255) );//), AA.getFreq(64), AA.getFreq(200));
    // HLRemote.updateHLParams( AA.getFreq(2), AA.getFreq(0), AA.getFreq(200) );//), AA.getFreq(64), AA.getFreq(200));

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
    //  HL.renderer.clear();

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


    // TODO: improve detection. take account of browser cpu time, models shooting time, etc
    //CPU GPU POWER DETECTION BY CLOCK
    if(frameCount>2){
      if(delta>0.03333 && delta<1){
        if(++performanceLow == 30){
          HLE.PIXEL_RATIO_SCALE*=0.85;
          HL.renderer.setPixelRatio( window.devicePixelRatio * HLE.PIXEL_RATIO_SCALE);

          var tiles = Math.round(HL.land.geometry.parameters.widthSegments * 0.85 );
          HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, tiles, tiles);
          HL.land.geometry.rotateX(-Math.PI / 2);
          HL.land.material.uniforms.worldTiles.value = tiles;
          //HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(1,HLE.WORLD_TILES*1);
          console.log(delta+ " reducing tiles: " + tiles);
          performanceLow=0;
        }
      }
      else if(delta<0.01666){
        if(++performanceHigh == 60){
          HLE.PIXEL_RATIO_SCALE*=1.15;
          HL.renderer.setPixelRatio( window.devicePixelRatio * HLE.PIXEL_RATIO_SCALE);

          var tiles = Math.round(HL.land.geometry.parameters.widthSegments * 1.15 );
          HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, tiles, tiles);
          HL.land.geometry.rotateX(-Math.PI / 2);
          HL.land.material.uniforms.worldTiles.value = tiles;
          //HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(1,HLE.WORLD_TILES*1);
          console.log(delta+ " growing tiles: " + tiles);
          performanceHigh = 0;
        }
      }
      else{
        performanceHigh--;
        performanceLow--;
      }
    }


    delta = null;
  }

  function loadRoutine(){
    mainInit();
    // init HyperLand Environment
    HLEnvironment.init();
    // init remoteControl screens manager
    HLRemote.screensInit();

    // mainLoop is called when it's all loaded
    window.addEventListener('HLEload', function(){
        console.log("event HLEload received");
        // DEV
        if(hasGUI) { G = GUI(); G.guiInit();}
        // if(!noSocket) socketVisual.init();

        //remove loadingDiv
        // document.body.removeChild(loadingDiv);


        //let's rock
        HLMain.play();
      }
    );

    if ( isVR && WEBVR.isAvailable() === true ) {
      document.body.appendChild( WEBVR.getButton( HL.VREffect ) );
    }

    window.removeEventListener('load',loadRoutine);

  }
  window.addEventListener('load',loadRoutine,false);


  HLMain = {};
  HLMain.rafID = null;

  // PAUSE ANALYSIS
  HLMain.pause = function(){
    HL.clock.stop();
    window.cancelAnimationFrame(HLMain.rafID);
    HLMain.rafID = null;
  }

  // start
  HLMain.play = function(){
    if(HLMain.rafID===null) {
      HL.clock.start();
     mainLoop();
    }
  }



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
