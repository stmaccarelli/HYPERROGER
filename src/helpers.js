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


  function initBufParticleSystem(geometry, worldWidth, amount, randomize, dynamic){
    var vertexPositions = [];
    for ( i = 0; i < amount; i++){
      if(randomize){
        vertexPositions.push(
          [ Math.random() * worldWidth - worldWidth / 2 ,
            Math.random() * worldWidth / HLG.worldtiles + HLG.worldheight/4, // TBD find a standard solution
            Math.random() * worldWidth - worldWidth / 2]
        );
      }
      else {
        vertexPositions.push([Math.random() * worldWidth, worldWidth*10, Math.random() * worldWidth]);
      }
    }
    var vertices = new Float32Array( vertexPositions.length * 3 ); // three components per vertex

    // components of the position vector for each vertex are stored
    // contiguously in the buffer.
    for ( var i = 0; i < vertexPositions.length; i++ ){
    	vertices[ i*3 + 0 ] = vertexPositions[i][0];
    	vertices[ i*3 + 1 ] = vertexPositions[i][1];
    	vertices[ i*3 + 2 ] = vertexPositions[i][2];
    }

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    if(dynamic) geometry.attributes.position.dynamic = true;
  }


  // used to populate a basic Geometry for a particle system
  function initParticleSystem(geometry, worldWidth, amount, randomize, dynamic){
  for ( i = 0; i < amount; i++) {
    if(randomize)
      geometry.vertices.push(
        new THREE.Vector3(
          Math.random() * worldWidth - worldWidth / 2 ,
          Math.random() * worldWidth / HLG.worldtiles + HLG.worldheight/4, // TBD find a standard solution
          Math.random() * worldWidth - worldWidth / 2 )
      );
    else
      geometry.vertices.push(
        new THREE.Vector3(1,1,-worldWidth)
      );
  }
  if(dynamic) geometry.dynamic = true;

}

  // positions shootable particles out of the active moving area
    function initShootableParticles(geometry, border){
      for(i=0;i<geometry.attributes.position.array.length;i++)
        geometry.attributes.position.array[i+2]=-border;
      geometry.attributes.position.needsUpdate = true;
    }


    // motion system for one-shot particles - non destructive.
    // we init and allocate memory for the whole array, then shift position out of the camera FAR value (not visible)
    // when we gotta shot a particle, we init it by placing at the edges of our world.
    // the motion function moves every particle in the "worldwidth" scope,
    // and when particle reaches the end of the worldwidth, it resets the position far again.

    function startParticles(geometry, limit){
      for(i=0;i<geometry.attributes.position.array.length;i++){
        if(geometry.attributes.position.array[i+2]==-limit){
          geometry.attributes.position.array[i+2]=-limit/2;
          break;
        }
        // else if(i==geometry.vertices.length-1)
        //   console.log('cant init particle, all particles out');
      }
       geometry.attributes.position.needsUpdate = true;
    }

    // function moveParticles(geometry, WORLDSIZE, moveSpeed){
    //   for(i=0;i<geometry.vertices.length;i++){
    //     if(geometry.vertices[i].z>-WORLDSIZE)
    //       geometry.vertices[i].z+=moveSpeed;
    //     if(geometry.vertices[i].z>=WORLDSIZE/2)
    //       geometry.vertices[i].z=-WORLDSIZE;
    //   }
    //    geometry.verticesNeedUpdate = true;
    // }

    function moveParticles(geometry, WORLDSIZE, moveSpeed){

      for(i=0;i<geometry.attributes.position.array.length;i+=3){
        if(geometry.attributes.position.array[i+2]>-WORLDSIZE)
          geometry.attributes.position.array[i+2]+=moveSpeed;
        if(geometry.attributes.position.array[i+2]>=WORLDSIZE/2)
          geometry.attributes.position.array[i+2]=-WORLDSIZE;
      }
       geometry.attributes.position.needsUpdate = true;

    }

    function loopParticles(geometry, WORLDSIZE, moveSpeed){

      for(i=0;i<geometry.attributes.position.array.length;i+=3){
        if(geometry.attributes.position.array[i+2]>-WORLDSIZE)
          geometry.attributes.position.array[i+2]+=moveSpeed;
        if(geometry.attributes.position.array[i+2]>=WORLDSIZE/2)
          geometry.attributes.position.array[i+2]=-WORLDSIZE/2;
      }
       geometry.attributes.position.needsUpdate = true;

    }


    var skipped,nX=0,nY=0,sC,z;
    function shotFloraCluster(geometry, stepsCount, amountToBurst){
      skipped=0;
      sC = stepsCount / HLG.worldtiles;
      for(i=0;i<Math.min(geometry.attributes.position.array.length,amountToBurst+skipped);i++){
        // if particle is inactive at "standby" distance
        if(geometry.attributes.position.array[i+2]==-HLG.worldwidth ){
          geometry.attributes.position.array[i]= Math.random() * HLG.worldwidth - HLG.worldwidth / 2;
          geometry.attributes.position.array[i+2]= getRandomIntInclusive(-HLG.worldwidth+.1,-HLG.worldwidth/2);

          nX = (geometry.attributes.position.array[i]/(HLG.worldwidth/2)+1) / 2;// in range 0 , 1.0
          nY = (geometry.attributes.position.array[i+2]/HLG.worldwidth + 0.5)*-1; // in range 0 , 0.5
          geometry.attributes.position.array[i+1] = landHeightNoise(nX,sC+nY) + 5;
        }
        else skipped++;
      }
      geometry.attributes.position.needsUpdate = true;
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
      initBufParticleSystem:   function(a,b,c,d,e){  return initBufParticleSystem(a,b,c,d,e)           },
    //  initShootableParticles:function(a,b){       return initShootableParticles(a,b)             },
      startParticles:        function(a,b){        return startParticles(a,b)                      },
      moveParticles:        function(a,b,c){      return moveParticles(a,b,c)                    },
      loopParticles:        function(a,b,c){      return loopParticles(a,b,c)                    },
      // shuffleUVs:           function(a){          return shuffleUVs(a)                },
      // scaleUVs:             function(a,b){        return scaleUVs(a,b)                },
      // offsetUV:             function(a,b){        return offsetUV(a,b)                },
      shiftHeights:         function(a){          return shiftHeights(a)                         },
      sinMotion:            function(a,b,c,d){    return sinMotion(a,b,c,d)                      },
      shotFloraCluster:     function(a, b, c){    return shotFloraCluster(a, b, c)                },
      landHeightNoise:      function(a,b){        return landHeightNoise(a,b)                    },
    }
}();
