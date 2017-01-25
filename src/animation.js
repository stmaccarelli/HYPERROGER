/*
This module is for animations: moving objects, changing colors, etc
*/

var HLAnim = function(){

  function sea(){
    // // move
    // HL.sea.position.z += HLE.moveSpeed;
    //
    // // if moved farther than 1 row
    // if (HL.sea.position.z > HLE.SEA_TILE_SIZE) {
    //   HLE.seaStepsCount++;
    //   // put 1 row back
    //   HL.sea.position.z  -= HLE.SEA_TILE_SIZE;
    //   // shift sea heights for rows
    //   for(var i=HL.geometries.sea.parameters.heightSegments; i > 0; i--){
    //     HL.geometries.seaHeights[i] = HL.geometries.seaHeights[i-1];
    //   }
    //   // calculate new height ot first row
    //   HL.geometries.seaHeights[0] = HLE.reactiveSeaHeight;
    // }
    //  // compute row-shifting basic sea waves
    //  HLH.seaMotion(HL.geometries.sea, HLE.seaStepsCount, HL.geometries.seaHeights, HLE.BASE_SEA_SPEED);
    //
    //  // if we want to use shadows, we have to recalculate normals
    //  if(hasShadows){
    //    HL.geometries.sea.computeFaceNormals();
    //    HL.geometries.sea.computeVertexNormals();
    //  }
  }

  function mirrorWaves(){
      HL.materials.mirror.material.uniforms.time.value += 0.01 + HLE.moveSpeed * .01;
//      HL.materials.mirror.material.uniforms.step.value = HLE.landStepsCount;
  }

  function seaGLSL(){
     HL.materials.water.material.uniforms.advance.value += 0.01 + HLE.moveSpeed * .01;
  }

  function land(){
    if(HLE.LAND_IS_BUFFER)
      landBufferGeometry();
    else
      landGeometry();
  }

  function landBufferGeometry(){
    HL.land.position.z += HLE.moveSpeed;
    if (HL.land.position.z > HLE.TILE_SIZE) {
      HLE.landStepsCount++;
      HL.land.position.z -= HLE.TILE_SIZE;
      HLH.shiftHeightsBuf(HL.geometries.land);
      // then calculate LAND first row new heights with noise function
      for ( var i = 0; i < (HL.geometries.land.parameters.widthSegments)*3; i+=3){
        HL.geometries.land.attributes.position.array[i + 1] = HLH.landHeightNoise(
          i / 3 / (HLE.WORLD_TILES-1),
          (HLE.landStepsCount / HLE.WORLD_TILES) )
        * (HLE.CENTER_PATH? (Math.abs(HL.geometries.land.attributes.position.array[i]/HLE.WORLD_WIDTH)*2):1) ;
      }
      // if(hasShadows){///TODO check if works on BufferGeometry
      //     HL.geometries.land.computeFaceNormals();
      //     HL.geometries.land.computeVertexNormals();
      // }
      // this is for land shadermaterial, to compute depth colors
      // HL.materials.land.uniforms.landHeight.value = HLE.landHeight;
      // HL.materials.land.uniforms.landZeroPoint.value = HLE.landZeroPoint;
    }
  }

  function landGeometry(){
    HL.land.position.z += HLE.moveSpeed;
    if (HL.land.position.z > HLE.TILE_SIZE) {
      // for(var i=0;i<HLE.WORLD_TILES;i++){
      //   HLH.startModel(HL.models.ducky,(i*HLE.TILE_SIZE)-HLE.WORLD_WIDTH/2,true );
      // }
      HLE.landStepsCount++;
      HL.land.position.z -= HLE.TILE_SIZE;
      HLH.shiftHeights(HL.geometries.land);
      // then calculate LAND first row new heights with noise function
      for ( var i = 0; i < HLE.WORLD_TILES; i++){
        HL.geometries.land.vertices[i].y =
        HLH.landHeightNoise(
          i / (HLE.WORLD_TILES-1),
          (HLE.landStepsCount / HLE.WORLD_TILES) )
        * (HLE.CENTER_PATH? Math.abs(HL.geometries.land.vertices[i].x/HLE.WORLD_WIDTH)*2:1) ;
      }
      // if(hasShadows){
      //     HL.geometries.land.computeFaceNormals();
      //     HL.geometries.land.computeVertexNormals();
      // }
    //  HL.materials.land.uniforms.landHeight.value = HLE.landHeight;
    }
    HL.geometries.land.verticesNeedUpdate = true;
  }


  function landOrganicChange(f){

    HLC.land.r += (Math.random()-.5)*0.01;
    HLC.land.g += (Math.random()-.5)*0.01;
    HLC.land.b += (Math.random()-.5)*0.01;

    //HL.land.material.uniforms.worldTiles.value = params.tiles;

    //HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(params.repeatUV, params.repeatUV);

    HL.land.material.uniforms.bFactor.value = THREE.Math.clamp(
      HL.land.material.uniforms.bFactor.value + (Math.random()-.5)*0.00005, 0.0001,1);

    HL.land.material.uniforms.cFactor.value = THREE.Math.clamp(
      HL.land.material.uniforms.cFactor.value + (Math.random()-.5)*0.00005, 0.0001,1);

    HL.land.material.uniforms.buildFreq.value = THREE.Math.clamp(
      HL.land.material.uniforms.buildFreq.value + (Math.random()-.5)*0.00005, 0,100000);

    //HL.land.material.uniforms.map.value = HL.textures[params.map];

    HL.land.material.uniforms.natural.value = THREE.Math.clamp(
      HL.land.material.uniforms.natural.value + (Math.random()-.5)*0.00005, 0.0001,1);

    HL.land.material.uniforms.rainbow.value = THREE.Math.clamp(
      HL.land.material.uniforms.rainbow.value + (Math.random()-.5)*0.00005, 0.0001,1);

    HL.land.material.uniforms.squareness.value = THREE.Math.clamp(
      HL.land.material.uniforms.squareness.value + (Math.random()-.5)*0.00001, 0.0001,1);

  }

  // rotation vector rv
  var rv = new THREE.Euler( 0, 0, 0, 'YXZ' );
  // var seaMotion = new THREE.Vector2(0,0);

  function landGLSL(){

    if(isFPC)
      HL.controls.lookSpeed = 0.02 + HLE.moveSpeed * 0.001;


    rv.setFromQuaternion(HL.cameraGroup.quaternion,'YXZ');
    // HLE.moveSpeed *= Math.cos(rv.x);
    //HLE.acceleration += HLE.moveSpeed; // advance is a master advance rate for the entire environment
   HL.cameraGroup.position.y = THREE.Math.clamp(HL.cameraGroup.position.y + rv.x * HLE.moveSpeed, HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT*4);

    // overwrite rv variable (it was rotation vector) for memory optimization
    rv.x = Math.sin(rv.y);
    rv.z = Math.cos(rv.y);

    HLE.landMotion.x += rv.x*(0 + HLE.moveSpeed);
    HLE.landMotion.z += rv.z*(0 + HLE.moveSpeed);

    // seaMotion.x += rv.x*HLE.moveSpeed*0.01;
    // seaMotion.y += rv.x*HLE.moveSpeed*0.01;
    //
    // HL.materials.water.material.uniforms.seaMotion.value = seaMotion;


    // HL.materials.land.uniforms.advance.value = HLE.acceleration;
    HL.materials.land.uniforms.landMotion.value = HLE.landMotion;

    HL.materials.land.uniforms.noiseFreq.value = HLE.noiseFrequency;
    HL.materials.land.uniforms.noiseFreq2.value = HLE.noiseFrequency2;
    HL.materials.land.uniforms.landHeight.value = HLE.landHeight;
    HL.materials.land.uniforms.landZeroPoint.value = HLE.landZeroPoint;
    // HL.materials.land.uniforms.buildFreq.value += HLE.moveSpeed * 0.001;

    landOrganicChange(HLE.moveSpeed*0.005);
    // console.log( Math.sin(HL.cameraGroup.rotation.z) );
  }




  // FOR CLOUDS, FLORA AND FAUNA, I'd move this in HLS sceneManager
  function particles(){

   HLH.loopParticles(HL.geometries.clouds, HLE.WORLD_WIDTH, HLE.moveSpeed*2);

    // HLH.moveParticles(HL.geometries.flora, HLE.WORLD_WIDTH, HLE.moveSpeed);

    // HLH.bufSinMotion(HL.geometries.fauna,.1,.1);

  }

  function wind(){
    if(frameCount%10 == 0)
      HLH.startModel(
        HL.models.cube,
        (Math.random()-.5) * HLE.WORLD_WIDTH,
        HLE.WORLD_HEIGHT/2+Math.random()*HLE.WORLD_HEIGHT/2,
        HLE.moveSpeed*100, false, 1,1,100,true);
  }

  function models(){
    // for(var k in HL.models)
    //   if(HL.models[k].position){
    //     HLH.moveModel( HL.models[k], 'z' );
    //   }
    //
    for(var k in HL.dynamicModelsClones){
      if(HL.dynamicModelsClones[k] && HL.dynamicModelsClones[k].position){
       HLH.moveModel( HL.dynamicModelsClones[k] );
      }
    }

  }



  // COLORS ANIMATIONS for underwater
  var colorsDebounce = true;
  function colors(){
    if(HL.camera.position.y > 0 && colorsDebounce){
      HL.renderer.setClearColor(HLC.horizon);
      if(HLE.FOG && !isWire) HL.scene.fog.color = HLC.horizon;
      HL.materials.skybox.color = HLC.horizon;
    //  HL.materials.land.color = HLC.land;
      HL.materials.sea.color = HLC.sea;
      colorsDebounce=false;
      console.log('colors above');
    }
    else if(HL.camera.position.y < 0 && !colorsDebounce){
      HL.renderer.setClearColor(HLC.underHorizon);
      if(HLE.FOG && !isWire) HL.scene.fog.color = HLC.underHorizon;
      HL.materials.skybox.color = HLC.underHorizon;
    //  HL.materials.land.color = HLC.horizon;
      HL.materials.sea.color = HLC.underSea;
      colorsDebounce=true;
      console.log('colors below');

    }
  }

  return{
    sea:sea,
    mirrorWaves:mirrorWaves,
    seaGLSL:seaGLSL,
    land:land,
    particles:particles,
    wind:wind,
    models:models,
    colors:colors,
    landGLSL:landGLSL,
  }
}();
