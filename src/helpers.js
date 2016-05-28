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

	function easeInOutQuad(t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t };
	function easeOutQuad(t) { return t*(2-t) };
	function easeInQuad(t) { return t*t };


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
		for (i = 0; i < geometry.attributes.position.array.length; i += 3){
			geometry.attributes.position.array[i + 1] = 10000;
//			Math.sin(millis * speed + i+1.45435) * height;
		}
		geometry.attributes.position.needsUpdate = true;
	}


	// shift vertex heights of all the geometry rows from the previous vertex row.
	// it's the core of the landscape motion logic
	function shiftHeights(geometry) {
		for (y = HLE.WORLD_TILES; y > 0; y--)
			for (x = 0; x < HLE.WORLD_TILES + 1; x++) {
				geometry.vertices[y * (HLE.WORLD_TILES + 1) + x].y =
				geometry.vertices[(y - 1) * (HLE.WORLD_TILES + 1) + x].y;
			}
		geometry.verticesNeedUpdate = true;
	}


	// var ny=0,py=0;
	// function shiftHeightsBuf(geometry) {
	// 	for(y = geometry.parameters.heightSegments-1;y>=0;y--)
	// 		for(x = 0; x<geometry.parameters.widthSegments*3;x+=3){
	// 			ny = 		 y*(geometry.parameters.widthSegments+1)*3;
	// 			py = (y-1)*(geometry.parameters.widthSegments+1)*3;
	// 			geometry.attributes.position.array[ny+x+1] = geometry.attributes.position.array[py+x+1];
	// 		}
	// 		geometry.attributes.position.needsUpdate = true;
	// }


	var ny=0,py=0;
	function shiftHeightsBuf(geometry) {
		for(y = geometry.parameters.heightSegments-1;y>=0;y--)
			for(x = 0; x<geometry.parameters.widthSegments*3;x+=3){
				ny = 		 y*(geometry.parameters.widthSegments+1)*3;
				py = (y-1)*(geometry.parameters.widthSegments+1)*3;
				geometry.attributes.position.array[ny+x+1] = geometry.attributes.position.array[py+x+1];
			}
			geometry.attributes.position.needsUpdate = true;
	}



	// computes terrain heights
	var noiseA,noiseB,noiseC;
	function landHeightNoise(x, y, sparuto) {
		sparuto = sparuto || HLE.landCliffFrequency;
		noiseA = HL.noise.nNoise(x * HLE.noiseFrequency*sparuto, y  * HLE.noiseFrequency*sparuto , HLE.noiseSeed);
		noiseB = HL.noise.nNoise(x * HLE.noiseFrequency2,y  * HLE.noiseFrequency2, HLE.noiseSeed*2);
		noiseC = HL.noise.nNoise(x * HLE.noiseFrequency2*5,y  * HLE.noiseFrequency2*5, HLE.noiseSeed*3);
	//	return (noiseA + (noiseA*0.5+1) * noiseB * noiseC) * HLE.landHeight;
		// return ((noiseA*0.5+1) * (noiseB + noiseC)*0.5) * HLE.landHeight;
//		return ((noiseA) *  (noiseC*0.5+1)) * HLE.landHeight;
		return (noiseA + (noiseA*0.5+1) * noiseB * (noiseC*0.5+1)) * HLE.landHeight;

	}


	// PARTICLE SYSTEMS

	// used to populate a BufferGeometry for a particle system
	function initBufParticleSystem(geometry, worldWidth, worldHeight, amount, randomize, dynamic) {
		var vertexPositions = [];
		for (i = 0; i < amount; i++) {
			if (randomize) {
				vertexPositions.push(
					[Math.random() * worldWidth - worldWidth / 2,
						worldHeight*0.75 + Math.random() * worldHeight*0.5, // TBD find a standard solution
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
						Math.random() * worldWidth / 2,
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
			if (geometry.attributes.position.array[i + 2] > -worldSize)
				geometry.attributes.position.array[i + 2] += moveSpeed;
			if (geometry.attributes.position.array[i + 2] >= worldSize)
				geometry.attributes.position.array[i + 2] = -worldSize;
		}
		geometry.attributes.position.needsUpdate = true;
	}

  function loopParticles(geometry, worldSize, moveSpeed) {
		for (i = 0; i < geometry.attributes.position.array.length; i += 3) {
			if (geometry.attributes.position.array[i + 2] > -worldSize)
				geometry.attributes.position.array[i + 2] += moveSpeed;
			if (geometry.attributes.position.array[i + 2] >= worldSize){
				geometry.attributes.position.array[i] = (Math.random()*2-1) * worldSize/2;
				geometry.attributes.position.array[i+ 2] = (Math.random()*2-1) * worldSize/2;
				geometry.attributes.position.array[i + 2] = -worldSize + .1;
      }
		}
		geometry.attributes.position.needsUpdate = true;
	}

	function startParticle(geometry, worldSize) {
		for (i = 0; i < geometry.attributes.position.array.length; i+=3) {
			if (geometry.attributes.position.array[i + 2] <= -worldSize) {
				geometry.attributes.position.array[i + 2] = -worldSize + .1;
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
			if (geometry.attributes.position.array[i + 2] <= -HLE.WORLD_WIDTH) {
				var nX = Math.random();
				geometry.attributes.position.array[i] = (nX * 2 - 1) * (HLE.WORLD_WIDTH / 2);
				geometry.attributes.position.array[i + 2] = -HLE.WORLD_WIDTH * 0.5; //getRandomIntInclusive(-HLE.WORLD_WIDTH +.1, -HLE.WORLD_WIDTH * 0.5);
				var nY = (geometry.attributes.position.array[i + 2] / HLE.WORLD_WIDTH + 0.5) * -1; // in range 0 , 0.5
				geometry.attributes.position.array[i + 1] = landHeightNoise(nX, (sC)) ;
				//         HL.geometries.land.vertices[i].y = HLH.landHeightNoise(i / (HL.geometries.land.parameters.widthSegments), (HLE.landStepsCount / HLE.WORLD_TILES) * 0.75 );
				if (geometry.attributes.position.array[i + 1]>0) i-=6;
			} else skipped++;
		}
		geometry.attributes.position.needsUpdate = true;
		console.log("HLH.shotFlora");
	}
  // HLH.landHeightNoise(
  //  i / (HL.geometries.land.parameters.widthSegments),
  //  (HLE.landStepsCount / HLE.WORLD_TILES) );

	/*
	MODELS MANAGEMENT
	*/

	function resetModel(model){
			model.position.set(0,0,-HLE.WORLD_WIDTH*10);
			model['moving']=false;
	}

	function resetAllModels(){
		for(var key in HL.models)
			if(HL.models[key]!==null)
				HL.models[key].position.set(0,0,-HLE.WORLD_WIDTH*10);
	}


	function startModel(model,x,y,speed,rotations){
		if(HL.dynamicModels.length >= HLE.MAX_MODELS_OUT) return

		speed = speed || 0;
		x = x || 0;
		y = y || 0;
		rotations = rotations || 'n';

		HL.dynamicModels['m'+frameCount] = model.clone();

		var z = -HLE.WORLD_WIDTH;
		// y === true means we want models attached to landscape
		if(y === true){
			y=landHeightNoise((x/HLE.WORLD_WIDTH)+0.5,HLE.landStepsCount/HLE.WORLD_TILES)
				+HL.land.position.y;
			y=Math.max(y,0);//TODO if y is 0, gotta move according to seawaves, if any ---
			speed = 0;
			z=-HLE.WORLD_WIDTH*0.5-HL.land.position.y;

			if(y!=0){
				HL.dynamicModels['m'+frameCount].rotateX((Math.random()-0.5)*3);
				HL.dynamicModels['m'+frameCount].rotateY((Math.random()-0.5)*3);
				HL.dynamicModels['m'+frameCount].rotateZ((Math.random()-0.5)*3);
			}
		}

		if(rotations.indexOf('x')!=-1)
			HL.dynamicModels['m'+frameCount].rotateX((Math.random()-0.5)*3);
		if(rotations.indexOf('y')!=-1)
			HL.dynamicModels['m'+frameCount].rotateY((Math.random()-0.5)*3);
		if(rotations.indexOf('z')!=-1)
			HL.dynamicModels['m'+frameCount].rotateZ((Math.random()-0.5)*3);

		HL.dynamicModels['m'+frameCount].size = model.size;
		HL.dynamicModels['m'+frameCount].scale.set(.7+Math.random()*.3, .7+Math.random()*.3, .7+Math.random()*.3);
		HL.dynamicModels['m'+frameCount]['key']='m'+frameCount;
		HL.scene.add(HL.dynamicModels['m'+frameCount]);
		HL.dynamicModels.length++;

		HL.dynamicModels['m'+frameCount].position.set(x,y,z);
		HL.dynamicModels['m'+frameCount]["speed"] = speed;
		HL.dynamicModels['m'+frameCount]["targetY"] = y;
		HL.dynamicModels['m'+frameCount]['moving'] = true;
		HL.dynamicModels['m'+frameCount]['rotations'] = rotations;

	}


	function moveModel(model){
		if(model.position.z >= -HLE.WORLD_WIDTH){
			if(model.speed!==0) model.position.z += model.speed;
			else model.position.z+=HLE.moveSpeed;
			model.position.y = -model.size.y + (model.targetY+model.size.y)
				- easeInQuad(Math.abs(model.position.z)/HLE.WORLD_WIDTH)
					*(model.targetY+model.size.y);

			if(model.rotations.indexOf('x')!=-1) model.rotateX(millis*.0000025*HLE.moveSpeed);
			if(model.rotations.indexOf('y')!=-1) model.rotateY(millis*.0000030*HLE.moveSpeed);
			if(model.rotations.indexOf('z')!=-1) model.rotateZ(millis*.0000035*HLE.moveSpeed);
		}
		if(model.position.z>=HLE.WORLD_WIDTH*0.5+model.size.z*.5){
			//resetModel(model);
			HL.scene.remove(model);
			model.material.dispose();
			model.geometry.dispose();
			delete HL.dynamicModels[model.key];
			HL.dynamicModels.length--;
		}
	}

	function destroyAllModels(){
		for(var k in HL.dynamicModels){
			if(k.indexOf('length')===-1){
				HL.scene.remove(HL.dynamicModels[k]);
				HL.dynamicModels[k].material.dispose();
				HL.dynamicModels[k].geometry.dispose();
				delete HL.dynamicModels[k];
			}
		}
		HL.dynamicModels.length = 0;
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
		shiftHeightsBuf: function(a) {
			return shiftHeightsBuf(a)
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
		landHeightNoise: function(a, b,c) {
			return landHeightNoise(a, b, c)
		},
		resetModel: function(a) {resetModel(a)},
		resetAllModels: resetAllModels,
		startModel: function(a,b,c,d,e) {startModel(a,b,c,d,e)},
		moveModel: function(a,b) {moveModel(a,b)},
		destroyAllModels:destroyAllModels,
	}
}();
