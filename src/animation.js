/*
This module is for animations: moving objects, changing colors, etc
*/

var HLAnim = function(){

  function sea(){
    // move
    HL.sea.position.z += HLE.moveSpeed;

    // if moved farther than 1 row
    if (HL.sea.position.z > HLE.TILE_SIZE) {
      HLE.seaStepsCount++;
      // put 1 row back
      HL.sea.position.z  -= HLE.TILE_SIZE;
      // shift sea heights for rows
      for(var i=HL.geometries.sea.parameters.heightSegments; i > 0; i--){
        HL.geometries.seaHeights[i] = HL.geometries.seaHeights[i-1];
      }
      // calculate new height ot first row
      HL.geometries.seaHeights[0] = HLE.reactiveSeaHeight;
    }
     // compute row-shifting basic sea waves
     HLH.seaMotion(HL.geometries.sea, HLE.seaStepsCount, HL.geometries.seaHeights, HLE.BASE_SEA_SPEED);

     // if we want to use shadows, we have to recalculate normals
     if(hasShadows){
       HL.geometries.sea.computeFaceNormals();
       HL.geometries.sea.computeVertexNormals();
     }
  }

  function seaWMMove(){
  // now in shader  HL.sea.position.z = (HL.sea.position.z+HLE.moveSpeed)%(HLE.TILE_SIZE);

  HL.materials.water.material.uniforms.time.value = millis;
  HL.materials.water.material.uniforms.step.value = HLE.landStepsCount;
  }


  function land(){
    // move
    HL.land.position.z += HLE.moveSpeed;
    // if plane moved more than a row
    if (HL.land.position.z > HLE.TILE_SIZE) {
      HLE.landStepsCount++;
      // put plane back 1 row, so it will look moving seamless
      HL.land.position.z -= HLE.TILE_SIZE;

      // HL.materials.land.uniforms.step.value = HLE.landStepsCount;
      //then shift land heights on next rows
      HLH.shiftHeights(HL.geometries.land);
      // then calculate LAND first row new heights with noise function
      for ( var i = 0; i < (HL.geometries.land.parameters.widthSegments + 1); i++){
        HL.geometries.land.vertices[i].y = HLH.landHeightNoise(
          i / (HL.geometries.land.parameters.widthSegments),
          (HLE.landStepsCount / HLE.WORLD_TILES) ) * (HLE.CENTER_PATH? Math.abs(HL.geometries.land.vertices[i].x/HLE.WORLD_WIDTH)*2:1) ;
      }
      // if we want to use shadows, we have to recalculate normals
      // if(hasShadows){
        //  HL.geometries.land.computeFaceNormals();
        //  HL.geometries.land.computeVertexNormals();
      // }

      // update landZeroPoint and landHeight in shader
      HL.materials.land.uniforms.landHeight.value = HLE.landHeight;
      HL.materials.land.uniforms.landZeroPoint.value = HLE.landZeroPoint;
    }

  }

  // FOR CLOUDS, FLORA AND FAUNA
  function particles(){
    HLH.loopParticles(HL.geometries.clouds, HLE.WORLD_WIDTH, HLE.moveSpeed+HLE.CLOUDS_SPEED);
  //  HLH.bufSinMotion(HL.geometries.clouds, .4, .6);

    HLH.moveParticles(HL.geometries.flora, HLE.WORLD_WIDTH, HLE.moveSpeed);
    if(HLE.shotFlora){
      HLH.shotFloraCluster(HL.geometries.flora, HLE.landStepsCount, 1);
      HLE.shotFlora=false;
    }
      // HLH.bufSinMotion(HL.geometries.fauna,.1,.1);

  }



  // COLORS ANIMATIONS
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
    seaWMMove:seaWMMove,
    land:land,
    particles:particles,
    colors:colors,
  }
}();
