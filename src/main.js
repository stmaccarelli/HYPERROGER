

    var isMobile = !!('ontouchstart' in window); //true for android or ios, false for MS surface
    var isVR = window.location.href.indexOf('?vr')>-1;
    var isDebug = window.location.href.indexOf('?debug')>-1;
    var isFPC = window.location.href.indexOf('?fpc')>-1;
    var isWire = window.location.href.indexOf('?wire')>-1;
    var hasShadows = true;

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

    var noScroll = new NoScroll();
    noScroll.enable();


    function onResized() {
      HL.renderer.setSize(window.innerWidth, window.innerHeight);
      HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);
      groundMirror.renderer.setSize(window.innerWidth, window.innerHeight);

      HL.camera.aspect = window.innerWidth / window.innerHeight;
      HL.camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", onResized);
    window.addEventListener("resize", disableNavBar );

    HLAnim.init();

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


    // var effectController  = {
    //
    //   focus: 		1.0,
    //   aperture:	0.025,
    //   maxblur:	1.0
    //
    // };
    //
    // var matChanger = function( ) {
    //
    //   HL.postprocessing.bokeh.uniforms[ "focus" ].value = effectController.focus;
    //   HL.postprocessing.bokeh.uniforms[ "aperture" ].value = effectController.aperture;
    //   HL.postprocessing.bokeh.uniforms[ "maxblur" ].value = effectController.maxblur;
    //
    // };
    //
    // gui.add( effectController, "focus", 0.1, 2.1, 0.01 ).onChange( matChanger );
    // gui.add( effectController, "aperture", 0.001, 0.2, 0.001 ).onChange( matChanger );
    // gui.add( effectController, "maxblur", 0.0, 3.0, 0.025 ).onChange( matChanger );
    // //gui.close();




  }




   function run() {
      window.requestAnimationFrame(run);
      frameCount++;
      millis = frameCount/60;



      // Environment and animation
      HLE.moveSpeed = Math.max(HLE.MAX_MOVE_SPEED, HLE.BASE_MOVE_SPEED + HLE.reactiveMoveSpeed)*HL.clock.getDelta()*60;

      // remote control / audioreactive
      HLR.updateHLParams();
    //  HLAnim.colors();
      // HLAnim.elements();
    //  HLAnim.sea();
      HLAnim.land();

      // Controls
      if(isMobile)
        HL.controls.update(); //Accelerometers camera controls mode
      else if(isFPC)
        HL.controls.update(HL.clock.getDelta()); //FPC camera controls mode
      else
        HL.camera.lookAt(new THREE.Vector3(0,0,-HLE.WORLD_WIDTH/2)); // camera looks at center point on horizon

      HLE.cameraHeight += (HLE.landHeight*1.50+HLE.landZeroPoint-HLE.cameraHeight) * 0.05;
      HL.camera.position.y = HLE.cameraHeight + HLE.WORLD_HEIGHT*0.05;


      // Rendering

      // groundMirror.render();
      // HL.renderer.setRenderTarget( null ); // add this line

      if(isVR) HL.stereoEffect.render(HL.scene,HL.camera);
      else HL.renderer.render(HL.scene,HL.camera);


    }



    // TBD: fullscreen

    // Safari iOS: if you tap on top or bottom of screen when in fullscreen, safari shows navbars
    // trying to prevent, seems out of window scope. gotta explore "Navigator".
    // or simply use this function to detect if - while in landscape - window height changed
    // so we can show something, icon, message, etc.
    var debLand = false;
    function disableNavBar(){
      if(window.innerWidth>window.innerHeight){
        if(debLand){
          console.log('enter disableNavBar');
          //qui mostrare messaggio con icola per rimettere il tel a posto
          window.setTimeout( function(){window.scroll(0,-100)},1000);
        }
        else debLand = true;
      }
      else debLand = false;
    }


    window.addEventListener('load',function(){
      mainInit();
      guiInit();
      // init HL Environment
      HLEnvironment.init();
      HLAnim.init();

      run();

    });
