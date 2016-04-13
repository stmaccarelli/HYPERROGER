/*
This module is for live new THREE.AnimationAction(.
*/

var HLAnim = function(){

  //this calculate all the rows geometries, so the world won't start with zero heights
  function init(){
    for(i=0;i<HLG.worldtiles;i++){
      HLG.stepsCount++;
    //  calculateGeometries();
    }
    HLG.stepsCount=0;
    window.addEventListener("mousedown", function(e){HLH.startParticle(HL.geometries.clouds, HLG.worldwidth)},false);

  }


  function move(){
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
    //HLH.sinMotion(HL.geometries.sea, HLG.stepsCount, HL.geometries.seaHeights, HLG.seaSpeed);


    HL.land.position.z += HLG.movespeed;
    // if plane moved more than a row
    if (HL.land.position.z > HLG.worldwidth / HL.geometries.land.parameters.heightSegments) {
      HLG.landStepsCount++;
      // put plane back, so it will look move seamless
      HL.land.position.z -= HLG.worldwidth / HL.geometries.land.parameters.heightSegments;
      // then shift land heights on next rows
      HLH.shiftHeights(HL.geometries.land);
      // then calculate LAND first row new heights
      // if we enable FOG we'll not see the first row appearing from nothing
      for ( i = 0; i < (HL.geometries.land.parameters.widthSegments + 1); i++){
        HL.geometries.land.vertices[i].y =
        HL.noise.nNoise( i / (HL.geometries.land.parameters.widthSegments+1) * HLG.noiseFrequency /*TBD frequency gotta change according to audio*/,
          (HLG.landStepsCount / HLG.worldtiles) * HLG.noiseFrequency, HLG.noiseSeed /*TBD this gotta be HLG.noiseSeed*/)
        * HLG.devLandHeight + HLG.devLandBase
        + (HL.noise.nNoise(i / (HL.geometries.land.parameters.widthSegments+1) * HLG.noiseFrequency2,
           (HLG.landStepsCount / HLG.worldtiles) * HLG.noiseFrequency2, HLG.noiseSeed*2) + 1 ) / 2
        * HLG.devLandHeight * .5;
      }

    }


      HLH.moveParticles(HL.geometries.clouds, HLG.worldwidth, HLG.movespeed+2);
      HLH.moveParticles(HL.geometries.flora, HLG.worldwidth, HLG.movespeed);

  }

  window.addEventListener('click',function(){
    HLH.shotFloraCluster(HL.geometries.flora, HL.geometries.land, -HLG.worldwidth+1, -HLG.worldwidth/2, HLG.landStepsCount, 10)}, false
  );


  return{
    move:function(){return move()},
    init:function(){return init()},
  }
}();
