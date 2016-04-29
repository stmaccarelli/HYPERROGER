/*
This module is for animations: moving objects, changing colors, etc
*/

var HLAnim = function(){

  function sea(){
    // move
    HL.sea.position.z += HLE.moveSpeed;

    // if moved farther than 1 row
    if (HL.sea.position.z > HLE.WORLD_WIDTH / HL.geometries.sea.parameters.heightSegments) {
      HLE.seaStepsCount++;
      // put 1 row back
      HL.sea.position.z  -= HLE.WORLD_WIDTH / HL.geometries.sea.parameters.heightSegments;
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
  //  HL.sea.position.z = (HL.sea.position.z+HLE.moveSpeed)%(HLE.WORLD_WIDTH);
  }


  function land(){
    // move
    HL.land.position.z += HLE.moveSpeed;
    // if plane moved more than a row
    if (HL.land.position.z > HLE.WORLD_WIDTH / HL.geometries.land.parameters.heightSegments) {
      HLE.landStepsCount++;
      // put plane back 1 row, so it will look moving seamless
      HL.land.position.z -= HLE.WORLD_WIDTH / HL.geometries.land.parameters.heightSegments;

      // HL.materials.land.uniforms.step.value = HLE.landStepsCount;
      //then shift land heights on next rows
      HLH.shiftHeights(HL.geometries.land);
      // then calculate LAND first row new heights with noise function
      for ( var i = 0; i < (HL.geometries.land.parameters.widthSegments + 1); i++){
        HL.geometries.land.vertices[i].y = HLH.landHeightNoise(
          i / (HL.geometries.land.parameters.widthSegments),
          (HLE.landStepsCount / HLE.WORLD_TILES) ) ;
      }
      // if we want to use shadows, we have to recalculate normals
      // if(hasShadows){
         HL.geometries.land.computeFaceNormals();
         HL.geometries.land.computeVertexNormals();
      // }

    }

  }

  // FOR CLOUDS, FLORA AND FAUNA
  function elements(){
    HLH.loopParticles(HL.geometries.clouds, HLE.WORLD_WIDTH, HLE.moveSpeed+HLE.CLOUDS_SPEED);
  //  HLH.bufSinMotion(HL.geometries.clouds, .4, .6);

    HLH.moveParticles(HL.geometries.flora, HLE.WORLD_WIDTH, HLE.moveSpeed);
    if(HLE.shotFlora) HLH.shotFloraCluster(HL.geometries.flora, HLE.landStepsCount, 10);

    // HLH.bufSinMotion(HL.geometries.fauna,.1,.1);

  }



  // COLORS ANIMATIONS
  var colorsDebounce = true;
  function colors(){
    if(HL.camera.position.y > 0 && colorsDebounce){
      HL.renderer.setClearColor(HLC.horizon);
      if(HLE.FOG && !isWire) HL.scene.fog.color = HLC.horizon;
      HL.materials.skybox.color = HLC.horizon;
      HL.materials.land.color = HLC.land;
      HL.materials.sea.color = HLC.sea;
      colorsDebounce=false;
      console.log('colors above');
    }
    else if(HL.camera.position.y < 0 && !colorsDebounce){
      HL.renderer.setClearColor(HLC.underHorizon);
      if(HLE.FOG && !isWire) HL.scene.fog.color = HLC.underHorizon;
      HL.materials.skybox.color = HLC.underHorizon;
      HL.materials.land.color = HLC.horizon;
      HL.materials.sea.color = HLC.underSea;
      colorsDebounce=true;
      console.log('colors below');

    }
  }

  return{
    sea:sea,
    seaWMMove:seaWMMove,
    land:land,
    elements:elements,
    colors:colors,
  }
}();
