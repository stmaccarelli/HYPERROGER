/*
This module is for live new THREE.AnimationAction(.
*/

var HLAnim = function(){

  //this calculate all the rows geometries, so the world won't start with zero heights
  function init(){
    for(var i=0;i<HLG.worldtiles;i++){
      HLG.stepsCount++;
    //  calculateGeometries();
    }
    HLG.stepsCount=0;
    window.addEventListener("mousedown", function(e){HLH.startParticle(HL.geometries.clouds, HLG.worldwidth)},false);

  }


  function move(){
//    HL.camera.position.x = HL.noise.noise(HL.clock.getElapsedTime()*30,100,100)*2;
    HL.sea.position.z += HLG.movespeed;


    if (HL.sea.position.z > HLG.worldwidth / HL.geometries.sea.parameters.heightSegments) {
      HLG.stepsCount++;
      HL.sea.position.z  -= HLG.worldwidth / HL.geometries.sea.parameters.heightSegments;
      // shift sea heights for rows
      for(var i=HL.geometries.sea.parameters.heightSegments; i > 0; i--){
        HL.geometries.seaHeights[i] = HL.geometries.seaHeights[i-1];
      }
     // calculate SEA first row heights
      HL.geometries.seaHeights[0] = 2;
    }
    // basic sea waves
    HLH.sinMotion(HL.geometries.sea, HLG.stepsCount, HL.geometries.seaHeights, HLG.seaSpeed);


    HL.land.position.z += HLG.movespeed;
    // if plane moved more than a row
    if (HL.land.position.z > HLG.worldwidth / HL.geometries.land.parameters.heightSegments) {
      // put plane back, so it will look move seamless
      HL.land.position.z -= HLG.worldwidth / HL.geometries.land.parameters.heightSegments;
      // then shift land heights on next rows
      HLH.shiftHeights(HL.geometries.land);
      // then calculate LAND first row new heights
      // if we enable FOG we'll not see the first row appearing from nothing
      for (var i = 0; i < (HL.geometries.land.parameters.widthSegments + 1); i++){
        HL.geometries.land.vertices[i].y =
        HL.noise.nNoise( i / HL.geometries.land.parameters.widthSegments * HLG.noiseFrequency /*TBD frequency gotta change according to audio*/,
          HLG.stepsCount / HL.geometries.land.parameters.heightSegments * HLG.noiseFrequency, HLG.noiseSeed /*TBD this gotta be HLG.noiseSeed*/)
        * HLG.devLandHeight + HLG.devLandBase
        + (HL.noise.nNoise(i / HL.geometries.land.parameters.widthSegments * HLG.noiseFrequency2,
           HLG.stepsCount / HL.geometries.land.parameters.heightSegments * HLG.noiseFrequency2, HLG.noiseSeed*2) + 1 ) / 2
        * HLG.devLandHeight * .5;
      }

    }


      HLH.moveParticles(HL.geometries.clouds, HLG.worldwidth, HLG.movespeed+2);
      HLH.moveParticles(HL.geometries.flora, HLG.worldwidth, HLG.movespeed+2);

  }



  return{
    move:function(){return move()},
    init:function(){return init()},
  }
}();
