/*
This module is for animations: moving objects, changing colors, etc
*/

var HLAnim = function(){

  //this calculate all the rows geometries, so the world won't start with zero heights
  function init(){
    // for(i=0;i<HL.geometries.clouds.vertices.length;i++)
    //   HL.geometries.clouds.vertices[0].z+=HLG.worldwidth/2;

    // for(i=0;i<HL.geometries.clouds.attributes.position.array.length;i+=3)
    //   HL.geometries.clouds.attributes.position.array[i+2]+=HLG.worldwidth/2;
  }

  function sea(){

    HL.sea.position.z += HLG.movespeed;


    if (HL.sea.position.z > HLG.worldwidth / HL.geometries.sea.parameters.heightSegments) {
      HLG.seaStepsCount++;
      HL.sea.position.z  -= HLG.worldwidth / HL.geometries.sea.parameters.heightSegments;
      // shift sea heights for rows
      for(var i=HL.geometries.sea.parameters.heightSegments; i > 0; i--){
        HL.geometries.seaHeights[i] = HL.geometries.seaHeights[i-1];
      }
     // calculate SEA first row heights
      HL.geometries.seaHeights[0] = 5;
    }
    //basic sea waves
     HLH.sinMotion(HL.geometries.sea, HLG.seaStepsCount, HL.geometries.seaHeights, HLG.seaSpeed);
  }

  function land(){
    HL.land.position.z += HLG.movespeed;
    // if plane moved more than a row
    if (HL.land.position.z > HLG.worldwidth / HL.geometries.land.parameters.heightSegments) {
      HLG.landStepsCount++;
      // put plane back 1 row, so it will look moving seamless
      HL.land.position.z -= HLG.worldwidth / HL.geometries.land.parameters.heightSegments;
      // then shift land heights on next rows
      HLH.shiftHeights(HL.geometries.land);
      // then calculate LAND first row new heights
      for ( i = 0; i < (HL.geometries.land.parameters.widthSegments + 1); i++){
        HL.geometries.land.vertices[i].y = HLH.landHeightNoise(i / (HL.geometries.land.parameters.widthSegments), HLG.landStepsCount / HLG.worldtiles );
      }
      if(computeShadows){
        HL.geometries.land.computeFaceNormals();
        HL.geometries.land.computeVertexNormals();
      }
    }
  }

  // FOR CLOUDS, FLORA AND FAUNA
  function elements(){
    // moveParticles moves all
    HLH.loopParticles(HL.geometries.clouds, HLG.worldwidth, HLG.movespeed+1);

    HLH.moveParticles(HL.geometries.flora, HLG.worldwidth, HLG.movespeed);

    HLH.shotFloraCluster(HL.geometries.flora, HLG.landStepsCount, 1);
  }

  var colorsDebounce = true;
  function colors(){
    if(HL.camera.position.y > 0 && colorsDebounce){
      HL.renderer.setClearColor(HLC.horizon);
      if(HLG.fog && !isWire) HL.scene.fog.color = HLC.horizon;
      HL.materials.skybox.color = HLC.horizon;
      HL.materials.seabox.color = HLC.underHorizon;
      HL.materials.land.color = HLC.land;
      HL.materials.sea.color = HLC.sea;
      colorsDebounce=false;
      console.log('colors above');
    }
    else if(HL.camera.position.y < 0 && !colorsDebounce){
      HL.renderer.setClearColor(HLC.underHorizon);
      if(HLG.fog && !isWire) HL.scene.fog.color = HLC.underHorizon;
      HL.materials.skybox.color = HLC.underHorizon;
      HL.materials.seabox.color = HLC.horizon;
      HL.materials.land.color = HLC.underLand;
      HL.materials.sea.color = HLC.underSea;
      colorsDebounce=true;
      console.log('colors below');

    }
  }

  return{
    sea:function(){return sea()},
    land:function(){return land()},
    elements:function(){return elements()},
    colors: function(){return colors()},
    init:function(){return init()},

  }
}();
