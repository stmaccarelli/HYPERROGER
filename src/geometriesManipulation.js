/*
here I'll store methods of geometry manipulation for land and sea
*/

// moves all the particles in that geometry living inside acrive area (>-worldSize/2 - wordSize/2)
function moveParticles(geometry, worldSize, moveSpeed) {

  for (i = 0; i < geometry.vertices.length; i++) {
    if (geometry.vertices[i].z > -worldSize/2)
      geometry.vertices[i].z += moveSpeed;
    if (geometry.vertices[i].z >= worldSize / 2)
      geometry.vertices[i].z = -worldSize/2;
  }
  geometry.verticesNeedUpdate = true;
}

function loopParticles(geometry, worldSize, moveSpeed) {

  for (i = 0; i < geometry.vertices.length; i++) {
    if (geometry.vertices[i].z > -worldSize / 2)
      geometry.vertices[i].z += moveSpeed;
    if (geometry.vertices[i].z >= worldSize / 2){
      geometry.vertices[i].x = (Math.random()*2-1) * worldSize;
      geometry.vertices[i].z = -worldSize / 2 + .1;
    }
  }
  geometry.verticesNeedUpdate = true;
}

function startParticle(geometry, worldSize) {
  for (i = 0; i < geometry.vertices.length; i++) {
    if (geometry.vertices[i].z <= -worldSize / 2) {
      geometry.vertices[i].z = -worldSize / 2 + .1;
      break;
    }
  }
  geometry.verticesNeedUpdate = true;
}


function shotFloraCluster(geometry, stepsCount, amountToBurst) {
  var skipped = 0;
  var sC = stepsCount / HLE.WORLD_TILES;
  for (i = 0; i < Math.min(geometry.vertices.length, amountToBurst+skipped); i++) {
    // if particle is inactive at "standby" distance
    if (geometry.vertices[i].z == -HLE.WORLD_WIDTH/2) {
      var nX = Math.random();
      geometry.vertices[i].x = (nX * 2 - 1) * (HLE.WORLD_WIDTH / 2);
      geometry.vertices[i].z = -HLE.WORLD_WIDTH/2+.1;//getRandomIntInclusive(-HLE.WORLD_WIDTH * 0.5+1, -HLE.WORLD_WIDTH / 2);

      var nY = (geometry.vertices[i].z / HLE.WORLD_WIDTH + 0.5) * -1; // in range 0 , 0.5
      geometry.vertices[i].y = landHeightNoise(nX, (sC ));
      //         HL.geometries.land.vertices[i].y = HLH.landHeightNoise(i / (HL.geometries.land.parameters.widthSegments), (HLE.landStepsCount / HLE.WORLD_TILES) * 0.75 );
    } else skipped++;
  }
  geometry.verticesNeedUpdate = true;
}
