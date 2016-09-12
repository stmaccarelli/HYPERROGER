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

  function waterShaderBaseMotion(){
    HL.materials.water.material.uniforms.time.value += 0.01 + HLE.moveSpeed * .01;
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


  function landGLSL(){
    HLE.advance += HLE.moveSpeed; // advance is a master advance rate for the entire environment

    HL.materials.land.uniforms.advance.value = HLE.advance;
    HL.materials.land.uniforms.noiseFreq.value = HLE.noiseFrequency;
    HL.materials.land.uniforms.noiseFreq2.value = HLE.noiseFrequency2;
    HL.materials.land.uniforms.landHeight.value = HLE.landHeight * 1.3 ;
    HL.materials.land.uniforms.landZeroPoint.value = HLE.landZeroPoint;


    if(HLR.fft1!==undefined){
      HL.materials.land.uniforms.buildFreq.value += Math.max(0,(HLR.fft2-0.96)) * 0.25 ;
    }

  }


  // FOR CLOUDS, FLORA AND FAUNA, I'd move this in HLS sceneManager
  function particles(){

  //  HLH.bufSinMotion(HL.geometries.clouds, .4, .6);

    HLH.moveParticles(HL.geometries.flora, HLE.WORLD_WIDTH, HLE.moveSpeed);

      // HLH.bufSinMotion(HL.geometries.fauna,.1,.1);

  }

  function models(){
    // for(var k in HL.models)
    //   if(HL.models[k].position){
    //     HLH.moveModel( HL.models[k], 'z' );
    //   }
    //
    for(var k in HL.dynamicModelsClones){
      if(HL.dynamicModelsClones[k] && HL.dynamicModelsClones[k].position){
       HLH.moveModel( HL.dynamicModelsClones[k], 'z' );
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
    waterShaderBaseMotion:waterShaderBaseMotion,
    land:land,
    particles:particles,
    models:models,
    colors:colors,
    landGLSL:landGLSL,
  }
}();
