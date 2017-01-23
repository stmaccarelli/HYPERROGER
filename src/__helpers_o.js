// HELPERS
// GEOMETRY, ANIMATION AND GENERIC HELPER FUNCTIONS

var HLH = {
	i:0,
	x:0,
	y:0,
	ny:0,
	py:0,
}

	// Returns a random integer between min (included) and max (included)
	// Using Math.round() will give you a non-uniform distribution!
	HLH.getRandomIntInclusive = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	HLH.easeInOutQuad = function(t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t };
	HLH.easeOutQuad = function(t) { return t*(2-t) };
	HLH.easeInQuad = function(t) { return t*t };


	// GEOMETRIES

	// Simple sine motion on Y axis for a plane geometry, for seawaves
	HLH.seaMotion = function(geometry, stepsCount, heights, speed) {
		for (y = 0; y < geometry.parameters.heightSegments; y++)
			for (x = 0; x < geometry.parameters.widthSegments + 1; x++) {
				geometry.vertices[y * (geometry.parameters.widthSegments + 1) + x].y =
					Math.sin(millis * speed + x * x * ((y * 2 - stepsCount * 2))) * (heights[y] + .2); //add 1 to height because we don't want a completely flat sea
			}
		geometry.verticesNeedUpdate = true;
	}

	//  Sine motion on Y axis for a BufferGeometry
	HLH.bufSinMotion = function(geometry, height, speed) {
		height = height || 1;
		speed = speed || 1;
		for (HLH.i = 0; HLH.i < geometry.attributes.position.array.length; HLH.i += 3){
			geometry.attributes.position.array[HLH.i + 1] = 10000;
//			Math.sin(millis * speed + HLH.i+1.45435) * height;
		}
		geometry.attributes.position.needsUpdate = true;
	}


	// shift vertex heights of all the geometry rows from the previous vertex row.
	// it's the core of the landscape motion logic
	HLH.shiftHeights = function(geometry) {
		for (HLH.y = HLE.WORLD_TILES; HLH.y > 0; HLH.y--)
			for (HLH.x = 0; HLH.x < HLE.WORLD_TILES + 1; HLH.x++) {
				geometry.vertices[HLH.y * (HLE.WORLD_TILES + 1) + HLH.x].y =
				geometry.vertices[(HLH.y - 1) * (HLE.WORLD_TILES + 1) + HLH.x].y;
			}
		geometry.verticesNeedUpdate = true;
	}


	// var ny=0,py=0;
	// HLH.shiftHeightsBuf(geometry) {
	// 	for(y = geometry.parameters.heightSegments-1;y>=0;y--)
	// 		for(x = 0; x<geometry.parameters.widthSegments*3;x+=3){
	// 			ny = 		 y*(geometry.parameters.widthSegments+1)*3;
	// 			py = (y-1)*(geometry.parameters.widthSegments+1)*3;
	// 			geometry.attributes.position.array[ny+x+1] = geometry.attributes.position.array[py+x+1];
	// 		}
	// 		geometry.attributes.position.needsUpdate = true;
	// }


	HLH.shiftHeightsBuf = function(geometry) {
		for(HLH.y = geometry.parameters.heightSegments-1;HLH.y>=0;y--)
			for(HLH.x = 0; HLH.x<geometry.parameters.widthSegments*3;HLH.x+=3){
				HLH.ny = 		 HLH.y*(geometry.parameters.widthSegments+1)*3;
				HLH.py = (HLH.y-1)*(geometry.parameters.widthSegments+1)*3;
				geometry.attributes.position.array[HLH.ny+HLH.x+1] = geometry.attributes.position.array[HLH.py+HLH.x+1];
			}
			geometry.attributes.position.needsUpdate = true;
	}



	// computes terrain heights
	var noiseA,noiseB,noiseC;
	HLH.landHeightNoise = function(x, y, sparuto) {
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
	HLH.initBufParticleSystem = function(geometry, worldWidth, worldHeight, amount, randomize, dynamic) {
		var vertexPositions = [];
		for (HLH.i = 0; HLH.i < amount; HLH.i++) {
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
		for ( HLH.i = 0; HLH.i < vertexPositions.length; HLH.i++) {
			vertices[HLH.i * 3 + 0] = vertexPositions[HLH.i][0];
			vertices[HLH.i * 3 + 1] = vertexPositions[HLH.i][1];
			vertices[HLH.i * 3 + 2] = vertexPositions[HLH.i][2];
		}

		// itemSize = 3 because there are 3 values (components) per vertex
		geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
		if (dynamic) geometry.attributes.position.dynamic = true;
	}


	// used to populate a Geometry for a particle system
	HLH.initParticleSystem = function(geometry, worldWidth, worldHeight, amount, randomize, dynamic) {
		for (HLH.i = 0; HLH.i < amount; HLH.i++) {
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
	// the motion HLH.moves every particle in the "WORLD_WIDTH" scope,
	// and when particle reaches the end of the WORLD_WIDTH, it resets the position far again.
  // ACTIVE AREA FOR MOVER FUNCIONTS is >-worldSize/2 to worldSize/2
	//  __ __
	// |__|__|
	// |__|__|
	//

  // moves all the particles in that geometry living inside acrive area (>-worldSize/2 - wordSize/2)
	HLH.moveParticles = function(geometry, worldSize, moveSpeed) {

		for (HLH.i = 0; HLH.i < geometry.attributes.position.array.length; HLH.i += 3) {
			if (geometry.attributes.position.array[HLH.i + 2] > -worldSize)
				geometry.attributes.position.array[HLH.i + 2] += moveSpeed;
			if (geometry.attributes.position.array[HLH.i + 2] >= worldSize)
				geometry.attributes.position.array[HLH.i + 2] = -worldSize;
		}
		geometry.attributes.position.needsUpdate = true;
	}

  HLH.loopParticles = function(geometry, worldSize, moveSpeed) {
		for (HLH.i = 0; HLH.i < geometry.attributes.position.array.length; HLH.i += 3) {
			if (geometry.attributes.position.array[HLH.i + 2] > -worldSize)
				geometry.attributes.position.array[HLH.i + 2] += moveSpeed;
			if (geometry.attributes.position.array[HLH.i + 2] >= worldSize){
				geometry.attributes.position.array[HLH.i] = (Math.random()*2-1) * worldSize/2;
				geometry.attributes.position.array[HLH.i+ 2] = (Math.random()*2-1) * worldSize/2;
				geometry.attributes.position.array[HLH.i + 2] = -worldSize + .1;
      }
		}
		geometry.attributes.position.needsUpdate = true;
	}

	HLH.startParticle = function(geometry, worldSize) {
		for (HLH.i = 0; HLH.i < geometry.attributes.position.array.length; HLH.i+=3) {
			if (geometry.attributes.position.array[HLH.i + 2] <= -worldSize) {
				geometry.attributes.position.array[HLH.i + 2] = -worldSize + .1;
				break;
			}
		}
		geometry.attributes.position.needsUpdate = true;
	}


	HLH.shotFloraCluster = function(geometry, stepsCount, amountToBurst) {
	  var skipped = 0;
		var sC = stepsCount / HLE.WORLD_TILES;
		for (HLH.i = 0; HLH.i < Math.min(geometry.attributes.position.array.length, amountToBurst*3+skipped*3); HLH.i+=3) {
			// if particle is inactive at "standby" distance
			if (geometry.attributes.position.array[HLH.i + 2] <= -HLE.WORLD_WIDTH) {
				var nX = Math.random();
				geometry.attributes.position.array[HLH.i] = (nX * 2 - 1) * (HLE.WORLD_WIDTH / 2);
				geometry.attributes.position.array[HLH.i + 2] = -HLE.WORLD_WIDTH * 0.5; //getRandomIntInclusive(-HLE.WORLD_WIDTH +.1, -HLE.WORLD_WIDTH * 0.5);
				var nY = (geometry.attributes.position.array[HLH.i + 2] / HLE.WORLD_WIDTH + 0.5) * -1; // in range 0 , 0.5
				geometry.attributes.position.array[HLH.i + 1] = landHeightNoise(nX, (sC)) ;
				//         HL.geometries.land.vertices[HLH.i].y = HLH.landHeightNoise(HLH.i / (HL.geometries.land.parameters.widthSegments), (HLE.landStepsCount / HLE.WORLD_TILES) * 0.75 );
				if (geometry.attributes.position.array[HLH.i + 1]>0) HLH.i-=6;
			} else skipped++;
		}
		geometry.attributes.position.needsUpdate = true;
		console.log("HLH.shotFlora");
	}
  // HLH.landHeightNoise(
  //  HLH.i / (HL.geometries.land.parameters.widthSegments),
  //  (HLE.landStepsCount / HLE.WORLD_TILES) );

	/*
	MODELS MANAGEMENT
	*/

	HLH.resetModel = function(model){
			model.position.set(0,0,-HLE.WORLD_WIDTH*10);
			model['moving']=false;
	}

	HLH.resetAllModels = function(){
		for(var key in HL.models)
			if(HL.models[key]!==null)
				HL.models[key].position.set(0,0,-HLE.WORLD_WIDTH*10);
	}


	HLH.startModel = function(model,x,y,speed){
		if(HL.dynamicModelsClones.length >= HLE.MAX_MODELS_OUT) return

		speed = speed || 0;
		x = x || 0;
		y = y || 0;
		var z = -HLE.WORLD_WIDTH;
		// y === true means we wand models attached to landscape
		if(y === true){
			y=landHeightNoise((x/HLE.WORLD_WIDTH)+0.5,HLE.landStepsCount/HLE.WORLD_TILES)
				+HL.land.position.y;
			y=Math.max(y,0);//TODO if y is 0, gotta move according to seawaves, if any ---
			speed = 0;
			z=-HLE.WORLD_WIDTH*0.5-HL.land.position.y;

			HL.dynamicModelsClones['m'+frameCount] = model.clone();
			if(y!=0){
				HL.dynamicModelsClones['m'+frameCount].rotateX((Math.random()-0.5)*3);
				HL.dynamicModelsClones['m'+frameCount].rotateY((Math.random()-0.5)*3);
				HL.dynamicModelsClones['m'+frameCount].rotateZ((Math.random()-0.5)*3);
			}

		}
		else
			HL.dynamicModelsClones['m'+frameCount] = model.clone();
		HL.dynamicModelsClones['m'+frameCount].size = model.size;
		HL.dynamicModelsClones['m'+frameCount].scale.set(.7+Math.random()*.3, .7+Math.random()*.3, .7+Math.random()*.3);
		HL.dynamicModelsClones['m'+frameCount]['key']='m'+frameCount;
		HL.scene.add(HL.dynamicModelsClones['m'+frameCount]);
		HL.dynamicModelsClones.length++;



		HL.dynamicModelsClones['m'+frameCount].position.set(x,y,z);
		HL.dynamicModelsClones['m'+frameCount]["speed"] = speed;
		HL.dynamicModelsClones['m'+frameCount]["targetY"] = y;
		HL.dynamicModelsClones['m'+frameCount]['moving'] = true;

		z=null;
	}


	HLH.moveModel = function(model){
		if(model.position.z >= -HLE.WORLD_WIDTH){
			if(model.speed!==0) model.position.z += model.speed;
			else model.position.z+=HLE.moveSpeed;
			model.position.y = -model.size.y + (model.targetY+model.size.y)
				- easeInQuad(Math.abs(model.position.z)/HLE.WORLD_WIDTH)
					*(model.targetY+model.size.y);
		}
		if(model.position.z>=HLE.WORLD_WIDTH*0.5+model.size.z*.5){
			//resetModel(model);
			HL.scene.remove(model);
			model.material.dispose();
			model.geometry.dispose();
			delete HL.dynamicModelsClones[model.key];
			HL.dynamicModelsClones.length--;
		}
	}

	HLH.destroyAllModels = function(){
		for(var k in HL.dynamicModelsClones){
			if(k.indexOf('length')===-1){
				HL.scene.remove(HL.dynamicModelsClones[k]);
				HL.dynamicModelsClones[k].material.dispose();
				HL.dynamicModelsClones[k].geometry.dispose();
				delete HL.dynamicModelsClones[k];
			}
		}
		HL.dynamicModelsClones.length = 0;
		k=null;
	}

	//
	//
	// return {
	// 	initParticleSystem: function(a, b, c, d, e) {
	// 		return initParticleSystem(a, b, c, d, e)
	// 	},
	// 	initBufParticleSystem: function(a, b, c, d, e) {
	// 		return initBufParticleSystem(a, b, c, d, e)
	// 	},
	// 	//  initShootableParticles:function(a,b){       return initShootableParticles(a,b)             },
	// 	startParticle: function(a, b) {
	// 		return startParticle(a, b)
	// 	},
	// 	moveParticles: function(a, b, c) {
	// 		return moveParticles(a, b, c)
	// 	},
	// 	loopParticles: function(a, b, c) {
	// 		return loopParticles(a, b, c)
	// 	},
	// 	// shuffleUVs:           function(a){          return shuffleUVs(a)                },
	// 	// scaleUVs:             function(a,b){        return scaleUVs(a,b)                },
	// 	// offsetUV:             function(a,b){        return offsetUV(a,b)                },
	// 	shiftHeights: function(a) {
	// 		return shiftHeights(a)
	// 	},
	// 	shiftHeightsBuf: function(a) {
	// 		return shiftHeightsBuf(a)
	// 	},
	// 	seaMotion: function(a, b, c, d) {
	// 		return seaMotion(a, b, c, d)
	// 	},
	// 	bufSinMotion: function(a, b, c) {
	// 		return bufSinMotion(a, b, c)
	// 	},
	// 	shotFloraCluster: function(a, b, c) {
	// 		return shotFloraCluster(a, b, c)
	// 	},
	// 	landHeightNoise: function(a, b,c) {
	// 		return landHeightNoise(a, b, c)
	// 	},
	// 	resetModel: function(a) {resetModel(a)},
	// 	resetAllModels: resetAllModels,
	// 	startModel: function(a,b,c,d) {startModel(a,b,c,d)},
	// 	moveModel: function(a,b) {moveModel(a,b)},
	// 	destroyAllModels:destroyAllModels,
	// }
