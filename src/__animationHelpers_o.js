// HELPERS
// GEOMETRY, ANIMATION

var HLH = function() {
	var i,x,y,dynModelsCounter=0;
	// GENERIC

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
	// we init and allocate memory for the whole array, then shift position out of the cameraGroup FAR value (not visible)
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
				geometry.attributes.position.array[i + 2] = -HLE.WORLD_WIDTH * 0.5;
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


	function startModel(model,x,y,speed,rotations, scale, isParticle){
		scale = scale || 1;
		isParticle = isParticle!==undefined?isParticle:false;
		model = HL.models[model] || model;

		if(isParticle) HLE.PARTICLE_MODELS_OUT++;
		if(HL.dynamicModelsClones.length >= HLE.MAX_MODELS_OUT + HLE.PARTICLE_MODELS_OUT) return
		dynModelsCounter++;

		speed = speed || 0;
		x = x || 0;
		y = y || 0;
		rotations = rotations || 'n';

		HL.dynamicModelsClones['m'+dynModelsCounter] = model.clone();


		var z = -HLE.WORLD_WIDTH;
		// y === true means we want models attached to landscape
		if(y === true){

			// This works if terrain is generated by CPU
			// y=landHeightNoise((x/HLE.WORLD_WIDTH)+0.5,HLE.landStepsCount/HLE.WORLD_TILES)
			// 	+HL.land.position.y;
			// y=Math.max(y,0);//TODO if y is 0, gotta move according to seawaves, if any ---
			// z=-HLE.WORLD_WIDTH*0.5-HL.land.position.y;

			y=0;
			speed = 0;

			if(y!=0){
				HL.dynamicModelsClones['m'+dynModelsCounter].rotateX((Math.random()-0.5)*3);
				HL.dynamicModelsClones['m'+dynModelsCounter].rotateY((Math.random()-0.5)*3);
				HL.dynamicModelsClones['m'+dynModelsCounter].rotateZ((Math.random()-0.5)*3);
			}
		}

		if(rotations.indexOf('x')!=-1)
			HL.dynamicModelsClones['m'+dynModelsCounter].rotateX((Math.random()-0.5)*3);
		if(rotations.indexOf('y')!=-1)
			HL.dynamicModelsClones['m'+dynModelsCounter].rotateY((Math.random()-0.5)*3);
		if(rotations.indexOf('z')!=-1)
			HL.dynamicModelsClones['m'+dynModelsCounter].rotateZ((Math.random()-0.5)*3);

		HL.dynamicModelsClones['m'+dynModelsCounter].size = model.size;
		HL.dynamicModelsClones['m'+dynModelsCounter].size.multiplyScalar(scale);
		HL.dynamicModelsClones['m'+dynModelsCounter].scale.set(.7+Math.random()*.3+scale, .7+Math.random()*.3+scale, .7+Math.random()*.3+scale);
		HL.dynamicModelsClones['m'+dynModelsCounter]['key']='m'+dynModelsCounter;
		HL.scene.add(HL.dynamicModelsClones['m'+dynModelsCounter]);

		if(isParticle)
			HL.dynamicModelsClones['m'+dynModelsCounter]['isparticle']=true;

		HL.dynamicModelsClones.length++;

		HL.dynamicModelsClones['m'+dynModelsCounter].position.set(x,y,z);
		HL.dynamicModelsClones['m'+dynModelsCounter]["speed"] = speed;
		HL.dynamicModelsClones['m'+dynModelsCounter]["targetY"] = y;
		HL.dynamicModelsClones['m'+dynModelsCounter]['moving'] = true;
		HL.dynamicModelsClones['m'+dynModelsCounter]['rotations'] = rotations;

	}

	function moveModel(model){
		if(model.position.z >= -HLE.WORLD_WIDTH){
			model.position.z += model.speed + HLE.moveSpeed;

			// if(! model.isParticle && model.position.y!=0)
			// 	model.position.y = -model.size.y + (model.targetY+model.size.y)
			// 		- easeInQuad(Math.abs(model.position.z)/HLE.WORLD_WIDTH)
			// 			*(model.targetY+model.size.y);

			if(model.rotations.indexOf('x')!=-1) model.rotateX(model.speed*0.0005);
			if(model.rotations.indexOf('y')!=-1) model.rotateY(model.speed*0.0005);
			if(model.rotations.indexOf('z')!=-1) model.rotateZ(model.speed*0.0005);

			if(model.position.y==HL.sea.position.y){
				model.rotation.x = Math.cos(HLE.advance*0.003)*0.3 * Math.sin(HLE.advance*0.003);
				model.rotation.y = Math.sin(HLE.advance*0.003)*0.3 * Math.cos(HLE.advance*0.003);;
				model.rotation.z = Math.cos(HLE.advance*0.003)*0.3;

			}

			// shake cameraGroup when objects approach
			model['dist'] = model.position.distanceTo(HL.camera.position);
			//normalized
			model.dist = Math.min(model.dist/(HLE.WORLD_WIDTH),1);
			model.dist =  Math.pow(1-model.dist,10);
			model.dist = model.speed * model.dist * 0.0010 * Math.min(model.size.length()*0.003,1);
			HL.camera.rotation.x +=(THREE.Math.randFloat(-1,1) * model.dist );
			HL.camera.rotation.y +=(THREE.Math.randFloat(-1,1) * model.dist );
			HL.camera.rotation.z +=(THREE.Math.randFloat(-1,1) * model.dist );
		}

		HL.camera.rotation.x*=0.98;
		HL.camera.rotation.y*=0.98;
		HL.camera.rotation.z*=0.98;

		if(model.position.z>=HLE.WORLD_WIDTH){
			//resetModel(model);
			HL.scene.remove(model);
			model.material.dispose();
			model.geometry.dispose();
			delete HL.dynamicModelsClones[model.key];

			// if( !HL.dynamicModelsClones['m'+dynModelsCounter].isparticle)
 				HL.dynamicModelsClones.length--;
			// HL.dynamicModelsClones['m'+dynModelsCounter]['key']='m'+dynModelsCounter;
			HL.camera.rotation.x=0;
			HL.camera.rotation.y=0;
			HL.camera.rotation.z=0;
		}
	}

	function destroyAllModels(){
		for(var k in HL.dynamicModelsClones){
			if(k.indexOf('length')===-1){
				HL.scene.remove(HL.dynamicModelsClones[k]);
				HL.dynamicModelsClones[k].material.dispose();
				HL.dynamicModelsClones[k].geometry.dispose();
				delete HL.dynamicModelsClones[k];
			}
		}
		HL.dynamicModelsClones.length = 0;
	}

	shootEverything = function(){
		HLH.startModel(HL.models[HL.modelsKeys[Math.floor(Math.random()*HL.modelsKeys.length)]],
		 THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),
		 THREE.Math.randInt(HLE.WORLD_HEIGHT*0.4,HLE.WORLD_HEIGHT*3),
		 0, 'xyz');    // shoot all models from a group
	}

	shootGroup = function(group, scale, speed,rotation,floating, midpoint){
		if(group.length)
			var scale=(typeof group[1] === "function")?group[1]():group[1],
			 speed=group[2],rotation=group[3],floating=group[4], midpoint = group[5] || 0,
			 group = group[0];

		// if(midpoint===undefined) midpoint=0;
		group = (typeof group==="object")?group:HL.mGroups[group];

		HLH.startModel(HL.models[ group[Math.floor(Math.random()*group.length)]],
		 THREE.Math.randInt(-HLE.WORLD_WIDTH/4,HLE.WORLD_WIDTH/4),
		 floating?midpoint:THREE.Math.randInt(-HLE.WORLD_HEIGHT*0.01,HLE.WORLD_HEIGHT*1.1)+midpoint,
		 speed, (rotation?'xyz':null), scale );    // shoot all models from a group
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
		startModel: function(a,b,c,d,e,f,i) {startModel(a,b,c,d,e,f,i)},
		moveModel: function(a,b) {moveModel(a,b)},
		destroyAllModels:destroyAllModels,
		shootEverything:shootEverything,
		shootGroup:function(a,b,c,d){shootGroup(a,b,c,d)},

	}
}();
