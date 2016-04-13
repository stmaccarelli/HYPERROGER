
    // init NoSleep so screen won't dim
    var noSleep = new NoSleep();

    var isMobile = !!('ontouchstart' in window); //true for android or ios, false for MS surface
    var isDebug = window.location.href.indexOf('?debug')>-1;


    var gui = new dat.GUI();
    gui.add(HLG, 'movespeed',0.1,10.0);
    gui.add(HLG, 'seaSpeed',0.1,14.0);
    gui.add(HLG, 'noiseFrequency',0,10);
    gui.add(HLG, 'noiseFrequency2',0,20);
    gui.add(HLG, 'devLandBase',-150,150);
    gui.add(HLG, 'devLandHeight',0,150);



    // init HL Environment
    HLEnvironment.init();
    HLAnim.init();


    function live() {
      window.requestAnimationFrame(live);
      if(isMobile)
        HL.controls.update();
      //  HL.controls.update(HL.clock.getDelta()); //FPS controls mode
    //  else HL.controls.update(); //device orientation controls mode
      // if (isVR)
      //   effect.render(scene, camera);
      // else
      HLAnim.move();
      HLG.cameraHeight = HLG.cameraHeight + (HLG.devLandHeight*1.25+HLG.devLandBase-HLG.cameraHeight)*0.01;
      HL.camera.position.y = HLG.cameraHeight;
      if(!isMobile) HL.camera.lookAt(new THREE.Vector3(0,0,-HLG.worldwidth/2));
      HL.renderer.render(HL.scene,HL.camera);
    }

    function onResized() {
      HL.renderer.setSize(window.innerWidth, window.innerHeight);
      HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);

      HL.camera.aspect = window.innerWidth / window.innerHeight;
      HL.camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", onResized);


    live();
