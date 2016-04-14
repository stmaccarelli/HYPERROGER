

    var isMobile = !!('ontouchstart' in window); //true for android or ios, false for MS surface
    var isVR = window.location.href.indexOf('?vr')>-1;
    var isDebug = window.location.href.indexOf('?debug')>-1;
    var isFPC = window.location.href.indexOf('?fpc')>-1;
    var isWire = window.location.href.indexOf('?wire')>-1;
    var computeShadows = false;

    // init and enable NoSleep so screen won't dim
    var noSleep = new NoSleep();
    function noSleepEnable(){
      noSleep.enable();
      window.removeEventListener('click', noSleepEnable, false);
      console.log('noSleep enabled');
    }
    window.addEventListener('click', noSleepEnable, false);

    // prevent scroll
    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = {37: 1, 38: 1, 39: 1, 40: 1};

    function preventDefault(e) {
      e = e || window.event;
      if (e.preventDefault)
          e.preventDefault();
      e.returnValue = false;
    }

    function preventDefaultForScrollKeys(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    function disableTouchMove() {
      if (window.addEventListener) // older FF
          window.addEventListener('DOMMouseScroll', preventDefault, false);
      window.onwheel = preventDefault; // modern standard
      window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
      window.ontouchmove  = preventDefault; // mobile
      document.onkeydown  = preventDefaultForScrollKeys;
    }
    disableTouchMove();

    function enableScroll() {
        if (window.removeEventListener)
            window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.onmousewheel = document.onmousewheel = null;
        window.onwheel = null;
        window.ontouchmove = null;
        document.onkeydown = null;
    }


    var frameCount = 0;
    var millis = 0;


    var gui = new dat.GUI();
    gui.add(HLG, 'movespeed',0.1,10.0);
    gui.add(HLG, 'seaSpeed',0.1,14.0);
    gui.add(HLG, 'noiseFrequency',0,20);
    gui.add(HLG, 'noiseFrequency2',0,20);
    gui.add(HLG, 'devLandBase',-150,150);
    gui.add(HLG, 'devLandHeight',0,150);



    // init HL Environment
    HLEnvironment.init();
    HLAnim.init();

    var i = 0, x=0,y=0;


    function live() {
      window.requestAnimationFrame(live);
      frameCount++;
      millis = frameCount/60;

      if(isMobile)
        HL.controls.update(); //Accelerometers camera controls mode
      else if(isFPC)
        HL.controls.update(HL.clock.getDelta()); //FPC camera controls mode
      else
        HL.camera.lookAt(new THREE.Vector3(0,0,-HLG.worldwidth/2)); // camera looks at center point on horizon


      HLAnim.sea();
      HLAnim.land();
      HLAnim.elements();
      HLAnim.colors();

      HLG.cameraHeight = HLG.cameraHeight + (HLG.devLandHeight*1.25+HLG.devLandBase-HLG.cameraHeight)*0.01;
      HL.camera.position.y = HLG.cameraHeight;

      if(isVR) HL.stereoEffect.render(HL.scene,HL.camera);
      else HL.renderer.render(HL.scene,HL.camera);

    }

    var debLand = false;
    function disableNavBar(){
      if(window.innerWidth>window.innerHeight){
        if(debLand){
          console.log('enter disableNavBar');
          window.setTimeout( function(){window.scroll(0,-100)},1000);
        }
        else debLand = true;
      }
      else debLand = false;
    }

    function onResized() {
      HL.renderer.setSize(window.innerWidth, window.innerHeight);
      HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);

      HL.camera.aspect = window.innerWidth / window.innerHeight;
      HL.camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", onResized);
    window.addEventListener("resize", disableNavBar );
    // on resize, se lo schermo è in landscale (w>h) scrollo il body a 0,0. magari elimina le barre



    live();
