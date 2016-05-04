// HELPERS
// GEOMETRY, ANIMATION AND GENERIC HELPER FUNCTIONS

var HLH = function() {
	var i,x,y;
	// GENERIC

	// Returns a random integer between min (included) and max (included)
	// Using Math.round() will give you a non-uniform distribution!
	function getRandomIntInclusive(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// GEOMETRIES

	// Simple sine motion on Y axis for a plane geometry, for seawaves
	function seaMotion(geometry, stepsCount, heights, speed) {
		for (y = 0; y < geometry.parameters.heightSegments; y++)
			for (x = 0; x < geometry.parameters.widthSegments + 1; x++) {
				geometry.vertices[y * (geometry.parameters.widthSegments + 1) + x].y =
					Math.sin(millis * speed + x * x * ((y * 2 - stepsCount * 2))) * (heights[y] + .2); //add 1 to height because we don't want a completely flat sea
			}
		geometry.verticesNeedUpdate = true;
	}

	//  Sine motion on Y axis for a BufferGeometry
	function bufSinMotion(geometry, height, speed) {
		height = height || 1;
		speed = speed || 1;
		for (i = 0; i < geometry.attributes.position.array.length - 2; i += 3)
			geometry.attributes.position.array[i + 1] +=
			Math.sin(millis * speed + i) * height; //add 1 to height because we don't want a completely flat sea
		geometry.attributes.position.needsUpdate = true;
	}


	// shift vertex heights of all the geometry rows from the previous vertex row.
	// it's the core of the landscape motion logic
	function shiftHeights(geometry) {
		for (y = geometry.parameters.heightSegments; y > 0; y--)
			for (x = 0; x < geometry.parameters.widthSegments + 1; x++) {
				geometry.vertices[y * (geometry.parameters.widthSegments + 1) + x].y = geometry.vertices[(y - 1) * (geometry.parameters.widthSegments + 1) + x].y;
			}
		geometry.verticesNeedUpdate = true;
	}

	// // computes terrain heights
  // function landHeightNoise(x, y) {
  //   return ( HL.noise.nNoise(x * HLE.noiseFrequency , // fix audioreactivity issue: Y landscape freq is affected more by sound variations
  //     y*0.5 * HLE.noiseFrequency * 1 , HLE.noiseSeed)
	// 		+ ((HL.noise.nNoise(x * HLE.noiseFrequency2,
  //     y*0.5 * HLE.noiseFrequency2 * 1, HLE.noiseSeed * 2) + 1) / 2) * 0.2
	// 		)
	// 		* HLE.landHeight + HLE.landZeroPoint
	// 		;
  // }

	// computes terrain heights
	var noiseA,noiseB;
	function landHeightNoise(x, y) {
		noiseA = HL.noise.nNoise(x * HLE.noiseFrequency, y * 0.5 * HLE.noiseFrequency , HLE.noiseSeed);
		noiseB = HL.noise.nNoise(x * HLE.noiseFrequency2,y * 0.5 * HLE.noiseFrequency2, HLE.noiseSeed*2);
		return (noiseA + (noiseA*0.5+1) * noiseB) * HLE.landHeight;
	}


	// PARTICLE SYSTEMS

	// used to populate a BufferGeometry for a particle system
	function initBufParticleSystem(geometry, worldWidth, worldHeight, amount, randomize, dynamic) {
		var vertexPositions = [];
		for (i = 0; i < amount; i++) {
			if (randomize) {
				vertexPositions.push(
					[Math.random() * worldWidth - worldWidth / 2,
						worldHeight*0.75 + Math.random() * worldHeight*0.25, // TBD find a standard solution
						Math.random() * worldWidth - worldWidth / 2
					]
				);
			} else {
				vertexPositions.push([Math.random() * worldWidth, worldWidth * 10, Math.random() * worldWidth]);
			}
		}
		var vertices = new Float32Array(vertexPositions.length * 3); // three components per vertex

		// components of the position vector for each vertex are stored
		// contiguously in the buffer.
		for (var i = 0; i < vertexPositions.length; i++) {
			vertices[i * 3 + 0] = vertexPositions[i][0];
			vertices[i * 3 + 1] = vertexPositions[i][1];
			vertices[i * 3 + 2] = vertexPositions[i][2];
		}

		// itemSize = 3 because there are 3 values (components) per vertex
		geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
		if (dynamic) geometry.attributes.position.dynamic = true;
	}


	// used to populate a Geometry for a particle system
	function initParticleSystem(geometry, worldWidth, worldHeight, amount, randomize, dynamic) {
		for (i = 0; i < amount; i++) {
			if (randomize)
				geometry.vertices.push(
					new THREE.Vector3(
						Math.random() * worldWidth - worldWidth / 2,
						Math.random() * worldHeight, // TBD find a standard solution
						Math.random() * worldWidth - worldWidth / 2)
				);
			else
				geometry.vertices.push(
					new THREE.Vector3(1, 1, -WORLD_WIDTH)
				);
		}
		if (dynamic) geometry.dynamic = true;
	}



	// MOTION SYSTEM
	// motion system for one-shot particles - non destructive.
	// we init and allocate memory for the whole array, then shift position out of the camera FAR value (not visible)
	// when we gotta shot a particle, we init it by placing at the edges of our world.
	// the motion function moves every particle in the "WORLD_WIDTH" scope,
	// and when particle reaches the end of the WORLD_WIDTH, it resets the position far again.
  // ACTIVE AREA FOR MOVER FUNCIONTS is >-worldSize/2 to worldSize/2
	//  __ __
	// |__|__|
	// |__|__|
	//

  // moves all the particles in that geometry living inside acrive area (>-worldSize/2 - wordSize/2)
	function moveParticles(geometry, worldSize, moveSpeed) {

		for (i = 0; i < geometry.attributes.position.array.length; i += 3) {
			if (geometry.attributes.position.array[i + 2] > -worldSize/2)
				geometry.attributes.position.array[i + 2] += moveSpeed;
			if (geometry.attributes.position.array[i + 2] >= worldSize / 2)
				geometry.attributes.position.array[i + 2] = -worldSize/2;
		}
		geometry.attributes.position.needsUpdate = true;
	}

  function loopParticles(geometry, worldSize, moveSpeed) {

		for (i = 0; i < geometry.attributes.position.array.length; i += 3) {
			if (geometry.attributes.position.array[i + 2] > -worldSize / 2)
				geometry.attributes.position.array[i + 2] += moveSpeed;
			if (geometry.attributes.position.array[i + 2] >= worldSize / 2){
        geometry.attributes.position.array[i] = (Math.random()*2-1) * worldSize;
				geometry.attributes.position.array[i + 2] = -worldSize / 2 + .1;
      }
		}
		geometry.attributes.position.needsUpdate = true;
	}

	function startParticle(geometry, worldSize) {
		for (i = 0; i < geometry.attributes.position.array.length; i+=3) {
			if (geometry.attributes.position.array[i + 2] <= -worldSize / 2) {
				geometry.attributes.position.array[i + 2] = -worldSize / 2 + .1;
				break;
			}
		}
		geometry.attributes.position.needsUpdate = true;
	}


	function shotFloraCluster(geometry, stepsCount, amountToBurst) {
	  var skipped = 0;
		var sC = stepsCount / HLE.WORLD_TILES;
		for (i = 0; i < Math.min(geometry.attributes.position.array.length, amountToBurst*3+skipped*3); i+=3) {
			// if particle is inactive at "standby" distance
			if (geometry.attributes.position.array[i + 2] == -HLE.WORLD_WIDTH/2) {
				var nX = Math.random();
				geometry.attributes.position.array[i] = (nX * 2 - 1) * (HLE.WORLD_WIDTH / 2);
				geometry.attributes.position.array[i + 2] = -HLE.WORLD_WIDTH/2+.1;//getRandomIntInclusive(-HLE.WORLD_WIDTH * 0.5+1, -HLE.WORLD_WIDTH / 2);

				var nY = (geometry.attributes.position.array[i + 2] / HLE.WORLD_WIDTH + 0.5) * -1; // in range 0 , 0.5
				geometry.attributes.position.array[i + 1] = landHeightNoise(nX, (sC ))+5;
				//         HL.geometries.land.vertices[i].y = HLH.landHeightNoise(i / (HL.geometries.land.parameters.widthSegments), (HLE.landStepsCount / HLE.WORLD_TILES) * 0.75 );
			} else skipped++;
		}
		geometry.attributes.position.needsUpdate = true;
	}
  // HLH.landHeightNoise(
  //  i / (HL.geometries.land.parameters.widthSegments),
  //  (HLE.landStepsCount / HLE.WORLD_TILES) );


	function shotFloraParticle(geometry, stepsCount) {
    // var skipped = 0;
		// var sC = stepsCount / HLE.WORLD_TILES;
		// for (i = 0; i < Math.min(geometry.attributes.position.array.length, amountToBurst + skipped); i++) {
		// 	// if particle is inactive at "standby" distance
		// 	if (geometry.attributes.position.array[i + 2] == -HLE.WORLD_WIDTH/2) {
		// 		var nX = Math.random();
		// 		geometry.attributes.position.array[i] = (nX * 2 - 1) * (HLE.WORLD_WIDTH / 2);
		// 		geometry.attributes.position.array[i + 2] = -HLE.WORLD_WIDTH/2+.1;//getRandomIntInclusive(-HLE.WORLD_WIDTH * 0.5+1, -HLE.WORLD_WIDTH / 2);
    //
		// 		var nY = (geometry.attributes.position.array[i + 2] / HLE.WORLD_WIDTH + 0.5) * -1; // in range 0 , 0.5
		// 		geometry.attributes.position.array[i + 1] = landHeightNoise(nX, (sC + nY));
		// 		//         HL.geometries.land.vertices[i].y = HLH.landHeightNoise(i / (HL.geometries.land.parameters.widthSegments), (HLE.landStepsCount / HLE.WORLD_TILES) * 0.75 );
		// 	} else skipped++;
		// }
		// geometry.attributes.position.needsUpdate = true;
	}


	return {
		initParticleSystem: function(a, b, c, d, e) {
			return initParticleSystem(a, b, c, d, e)
		},
		initBufParticleSystem: function(a, b, c, d, e) {
			return initBufParticleSystem(a, b, c, d, e)
		},
		//  initShootableParticles:function(a,b){       return initShootableParticles(a,b)             },
		startParticle: function(a, b) {
			return startParticle(a, b)
		},
		moveParticles: function(a, b, c) {
			return moveParticles(a, b, c)
		},
		loopParticles: function(a, b, c) {
			return loopParticles(a, b, c)
		},
		// shuffleUVs:           function(a){          return shuffleUVs(a)                },
		// scaleUVs:             function(a,b){        return scaleUVs(a,b)                },
		// offsetUV:             function(a,b){        return offsetUV(a,b)                },
		shiftHeights: function(a) {
			return shiftHeights(a)
		},
		seaMotion: function(a, b, c, d) {
			return seaMotion(a, b, c, d)
		},
		bufSinMotion: function(a, b, c) {
			return bufSinMotion(a, b, c)
		},
		shotFloraCluster: function(a, b, c) {
			return shotFloraCluster(a, b, c)
		},
		shotFloraParticle: function(a, b) {
			return shotFloraParticle(a, b)
		},
		landHeightNoise: function(a, b) {
			return landHeightNoise(a, b)
		},
	}
}();
