var HLH = function(){

  // common helpers

  // Returns a random integer between min (included) and max (included)
  // Using Math.round() will give you a non-uniform distribution!
  function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // simple sine motion for a plane geometry, for seawaves
  function sinMotion(geometry, stepsCount, heights, seaSpeed){
    for ( y = 0; y < geometry.parameters.heightSegments; y++)
      for ( x = 0; x < geometry.parameters.widthSegments + 1; x++) {
        geometry.vertices[y * (geometry.parameters.widthSegments + 1) + x].y =
          Math.sin( millis * seaSpeed + x*x * ((y*2 - stepsCount*2)) ) * (heights[y] + .2); //add 1 to height because we don't want a completely flat sea
      }
    geometry.verticesNeedUpdate = true;
  }

  // shift vertex heights on the previous vertex row.
  // it's the core of the landscape motion logic
  function shiftHeights(geometry){
    for ( y = geometry.parameters.heightSegments; y > 0; y--)
      for ( x = 0; x < geometry.parameters.widthSegments + 1; x++) {
        geometry.vertices[y * (geometry.parameters.widthSegments +1) + x].y = geometry.vertices[(y - 1) * (geometry.parameters.widthSegments +1) + x].y;
      }
    geometry.verticesNeedUpdate = true;
  }


  // used to populate a basic Geometry for a particle system
  function initParticleSystem(geometry, worldWidth, amount, randomize, dynamic){
  for ( i = 0; i < amount; i++) {
    if(randomize)
      geometry.vertices.push(
        new THREE.Vector3(
          Math.random() * worldWidth - worldWidth / 2 ,
          Math.random() * worldWidth / 4 + 10, // TBD find a standard solution
          Math.random() * worldWidth - worldWidth / 2 )
      );
    else
      geometry.vertices.push(
        new THREE.Vector3(0,0,-worldWidth)
      );
  }
  if(dynamic) geometry.dynamic = true;
}

  // positions shootable particles out of the active moving area
    function initShootableParticles(geometry, border){
      for(i=0;i<geometry.vertices.length;i++)
        geometry.vertices[i].z=-border;
      geometry.verticesNeedUpdate = true;
    }


    // motion system for one-shot particles - non destructive.
    // we init and allocate memory for the whole array, then shift position out of the camera FAR value (not visible)
    // when we gotta shot a particle, we init it by placing at the edges of our world.
    // the motion function moves every particle in the "worldwidth" scope,
    // and when particle reaches the end of the worldwidth, it resets the position far again.

    function startParticle(geometry, limit){
      for(i=0;i<geometry.vertices.length;i++){
        if(geometry.vertices[i].z==-limit){
          geometry.vertices[i].z=-limit/2;
          break;
        }
        // else if(i==geometry.vertices.length-1)
        //   console.log('cant init particle, all particles out');
      }
       geometry.verticesNeedUpdate = true;
    }

    function moveParticles(geometry, WORLDSIZE, moveSpeed){
      for(i=0;i<geometry.vertices.length;i++){
        if(geometry.vertices[i].z>-WORLDSIZE)
          geometry.vertices[i].z+=moveSpeed;
        if(geometry.vertices[i].z>=WORLDSIZE/2)
          geometry.vertices[i].z=-WORLDSIZE;
      }
       geometry.verticesNeedUpdate = true;
    }

    var skipped,x=0,y=0,sC,z;
    function shotPartCluster(partGeom, stepsCount, amountToBurst){
      skipped=0;
      sC = stepsCount / HLG.worldtiles;
      for(i=0;i<Math.min(partGeom.vertices.length,amountToBurst+skipped);i++){
        // if particle is inactive at "standby" distance
        if(partGeom.vertices[i].z==-HLG.worldwidth ){
          partGeom.vertices[i].x= Math.random() * HLG.worldwidth - HLG.worldwidth / 2;
          partGeom.vertices[i].z= getRandomIntInclusive(-HLG.worldwidth+1,-HLG.worldwidth/2);

          y = (partGeom.vertices[i].z/HLG.worldwidth + 0.5)*-1;
          x = ((partGeom.vertices[i].x / (HLG.worldwidth/2))+1) / 2;
          partGeom.vertices[i].y = landHeightNoise(x,sC+y);
          partGeom.vertices[i].y += 5;//solleva un po'
        }
        else skipped++;
      }
      partGeom.verticesNeedUpdate = true;
    }




    function landHeightNoise(x,y){
    return HL.noise.nNoise( x * HLG.noiseFrequency /*TBD frequency gotta change according to audio*/,
      y * HLG.noiseFrequency, HLG.noiseSeed /*TBD this gotta be HLG.noiseSeed*/)
    * HLG.devLandHeight + HLG.devLandBase
    + (HL.noise.nNoise(x * HLG.noiseFrequency2,
      y * HLG.noiseFrequency2, HLG.noiseSeed*2) + 1 ) / 2
    * HLG.devLandHeight * .5;
    }


    return{
      initParticleSystem:   function(a,b,c,d,e){  return initParticleSystem(a,b,c,d,e)           },
      initShootableParticles:function(a,b){       return initShootableParticles(a,b)             },
      startParticle:        function(a,b){        return startParticle(a,b)                      },
      moveParticles:        function(a,b,c){      return moveParticles(a,b,c)                    },
      // shuffleUVs:           function(a){          return shuffleUVs(a)                },
      // scaleUVs:             function(a,b){        return scaleUVs(a,b)                },
      // offsetUV:             function(a,b){        return offsetUV(a,b)                },
      shiftHeights:         function(a){          return shiftHeights(a)                         },
      sinMotion:            function(a,b,c,d){    return sinMotion(a,b,c,d)                      },
      shotPartCluster:      function(a, b, c){    return shotPartCluster(a, b, c)                },
      landHeightNoise:      function(a,b){        return landHeightNoise(a,b)                    },
    }
}();
