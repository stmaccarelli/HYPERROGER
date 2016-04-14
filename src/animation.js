/*
This module is for live new THREE.AnimationAction(.
*/

var HLAnim = function(){

  //this calculate all the rows geometries, so the world won't start with zero heights
  function init(){

//    window.addEventListener("mousedown", function(e){HLH.shotPartCluster(HL.geometries.flora, HLG.landStepsCount, HL.floraAmount)},false);
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
      HL.geometries.seaHeights[0] = 2;
    }
    // basic sea waves
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
    HLH.moveParticles(HL.geometries.clouds, HLG.worldwidth, HLG.movespeed+2);
    HLH.moveParticles(HL.geometries.flora, HLG.worldwidth, HLG.movespeed);
    HLH.shotPartCluster(HL.geometries.flora, HLG.landStepsCount, HL.floraAmount);
  }

  var colorsDebounce = true;
  function colors(){
    if(HL.camera.position.y > 0 && colorsDebounce){
      HL.renderer.setClearColor(HLC.horizon);
      HL.materials.sky.color = HLC.horizon;
      HL.scene.fog.color = HLC.horizon;
      HL.materials.land.color = HLC.land;
      HL.materials.sea.color = HLC.sea;
      colorsDebounce=false;
    }
    else if(HL.camera.position.y < 0 && !colorsDebounce){
      HL.renderer.setClearColor(HLC.underHorizon);
      HL.materials.sky.color = HLC.underHorizon;
      HL.scene.fog.color = HLC.underHorizon;
      HL.materials.land.color = HLC.underLand;
      HL.materials.sea.color = HLC.underSea;
      colorsDebounce=true;
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
