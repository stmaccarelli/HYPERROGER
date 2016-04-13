var HLH = function(){

  // simple sine motion for a plane geometry, for seawaves
  function sinMotion(geometry, stepsCount, heights, seaSpeed){
    for (var y = 0; y < geometry.parameters.heightSegments; y++)
      for (var x = 0; x < geometry.parameters.widthSegments + 1; x++) {
        geometry.vertices[y * (geometry.parameters.widthSegments + 1) + x].y =
          Math.sin( frameCount * 0.01 * seaSpeed + Math.pow(x,2) * ((y*2 - stepsCount*2)) ) * (heights[y] + .2); //add 1 to height because we don't want a completely flat sea
      }
    geometry.verticesNeedUpdate = true;
  }

  // shift vertex heights on the previous vertex row.
  // it's the core of the landscape motion logic
  function shiftHeights(geometry){
    for (var y = geometry.parameters.heightSegments; y > 0; y--)
      for (var x = 0; x < geometry.parameters.widthSegments + 1; x++) {
        geometry.vertices[y * (geometry.parameters.widthSegments +1) + x].y = geometry.vertices[(y - 1) * (geometry.parameters.widthSegments +1) + x].y;
      }
    geometry.verticesNeedUpdate = true;
  }


  // used to populate a basic Geometry for a particle system
  function initParticleSystem(geometry, worldWidth, amount, randomize, dynamic){
  for (var p = 0; p < amount; p++) {
    if(randomize)
      geometry.vertices.push(
        new THREE.Vector3(
          Math.random() * worldWidth - worldWidth / 2 ,
          Math.random() * worldWidth / 4 + 10, // TBD find a standard solution
          Math.random() * worldWidth - worldWidth / 2 )
      );
    else
      geometry.vertices.push(
        new THREE.Vector3(0,0,0)
      );
  }
  if(dynamic) geometry.dynamic = true;
}


    function initShotParticles(geometry, WORLDSIZE){
      for(var i=0;i<geometry.vertices.length;i++)
        geometry.vertices[i].z=-WORLDSIZE;
      geometry.verticesNeedUpdate = true;
    }


    // motion system for one-shot particles - non destructive.
    // we init and allocate memory for the whole array, then shift position out of the camera FAR value (not visible)
    // when we gotta shot a particle, we init it by placing at the edges of our world.
    // the motion function moves every particle in the "worldwidth" scope,
    // and when particle reaches the end of the worldwidth, it resets the position far again.

    function startParticle(geometry, WORLDSIZE){
      for(var i=0;i<geometry.vertices.length;i++){
        if(geometry.vertices[i].z==-WORLDSIZE){
          geometry.vertices[i].z=-WORLDSIZE/2;
          break;
        }
        // else if(i==geometry.vertices.length-1)
        //   console.log('cant init particle, all particles out');
      }
       geometry.verticesNeedUpdate = true;
    }

    function moveParticles(geometry, WORLDSIZE, RUNSPEED){
      for(var i=0;i<geometry.vertices.length;i++){
        if(geometry.vertices[i].z>-WORLDSIZE)
          geometry.vertices[i].z+=RUNSPEED;
        if(geometry.vertices[i].z>=WORLDSIZE/2)
          geometry.vertices[i].z=-WORLDSIZE;
      }
       geometry.verticesNeedUpdate = true;
    }

    // inutilizzabile per via della logica dello scorimento paesaggio
    // scalare successivamente le UV sarebbe operazione troppo costosa per la CPU
    function shuffleUVs(geometry){
      for(i =0;i<geometry.faceVertexUvs[0].length;i++){
        geometry.faceVertexUvs[0][i][0].set( (Math.random()+1)/2,(Math.random()+1)/2 );
        geometry.faceVertexUvs[0][i][1].set( (Math.random()+1)/2,(Math.random()+1)/2 );
        geometry.faceVertexUvs[0][i][2].set( (Math.random()+1)/2,(Math.random()+1)/2 );
      }
      geometry.uvsNeedUpdate = true;
    }

    // insensata
    scaleUVs = function(geometry, step){
      for(i = 0;i<geometry.faceVertexUvs[0].length;i++){
        geometry.faceVertexUvs[0][i][0].setY(  (geometry.faceVertexUvs[0][i][0].y + .5)%1 );
        geometry.faceVertexUvs[0][i][1].setY(  (geometry.faceVertexUvs[0][i][1].y + .5)%1 );
        geometry.faceVertexUvs[0][i][2].setY(  (geometry.faceVertexUvs[0][i][2].y + .5)%1 );
      }
      geometry.uvsNeedUpdate = true;
    };


    return{
      initParticleSystem:   function(a,b,c,d,e){  return initParticleSystem(a,b,c,d,e)},
      initShotParticles:    function(a,b){        return initShotParticles(a,b)       },
      startParticle:        function(a,b){        return startParticle(a,b)           },
      moveParticles:        function(a,b,c){      return moveParticles(a,b,c)         },
      // shuffleUVs:           function(a){          return shuffleUVs(a)                },
      // scaleUVs:             function(a,b){        return scaleUVs(a,b)                },
      // offsetUV:             function(a,b){        return offsetUV(a,b)                },
      shiftHeights:         function(a){          return shiftHeights(a)              },
      sinMotion:            function(a,b,c,d){    return sinMotion(a,b,c,d)           },
    }

}();
