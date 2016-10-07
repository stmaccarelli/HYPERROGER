/*
This file defines HYPERLAND elements, global settings

The HLEnvironment module inits scene, renderer, camera, effects, shaders, geometries, materials, meshes
*/

// HL Environment constants and parameters
var HLE = {
  WORLD_WIDTH:5000,
  WORLD_HEIGHT:1000,
  WORLD_TILES: isMobile?128:512,
  TILE_SIZE:null,
  SEA_TILES:16,
  SEA_TILE_SIZE:null,

  PIXEL_RATIO_SCALE:.5,
  
  SCREEN_WIDTH_SCALE:1,
  SCREEN_HEIGHT_SCALE:!isMobile?1:.7,


  FOG:true,
  MIRROR: false,
  WATER: true,

  MAX_MOVE_SPEED: null,
  BASE_MOVE_SPEED: 0,
  CENTER_PATH:true, // true if you don't want terrain in the middle of the scene

  reactiveMoveSpeed:0, // changes programmatically - audio
  moveSpeed:0, // stores final computed move speed
  advance:0, // for GLSL land moving, build up with time
  buildFreq:50.0, //for GLSL land material

  BASE_SEA_SPEED:2.5,
  CLOUDS_SPEED:1,

  MAX_MODELS_OUT:100,
  PARTICLE_MODELS_OUT:1,

  reactiveSeaHeight:0, // changes programmatically - audio

  landZeroPoint:-20, //shift up or down the landscape
  landHeight:300,
  landCliffFrequency:0.5,
  LAND_IS_BUFFER:true,
  // LAND_Y_SHIFT:6,

  seaStepsCount:0,
  landStepsCount:0,

  CLOUDS_AMOUNT : 200,
  FLORA_AMOUNT : 1,
  MAX_FAUNA: 50,

  mobileConnected : 1, // this will represent mobile users, and will change live, so we set a MAX_FAUNA as top limit


  noiseSeed:0,
  noiseFrequency:1,
  noiseFrequency2:1,

  cameraHeight:0, // will change live
  smoothCameraHeight:10, // will change live
}


//HL Colors Library
var HLC = {
  horizon: new THREE.Color(0x888888),
  tempHorizon: new THREE.Color(0xff0000),

  land: new THREE.Color(0x116611),
  sea: new THREE.Color(0x001112),

  underHorizon: new THREE.Color(.0, .02, .02),
  underLand: new THREE.Color(.1, .9, .9),
  underSea: new THREE.Color(.1, .9, .9),

  flora: new THREE.Color(1,1,0),
  fauna: new THREE.Color(1,0,0),
  clouds: new THREE.Color(1,1,1),

  gWhite: new THREE.Color(0xffffff),
}


// HL scene library
var HL = {
  scene:null,
  renderer:null,
  camera:null,
  stereoEffect:null,
  controls:null,
  clock:null,
  noise:null,

  geometries: {
    sky:null,
    land:null,
    sea:null,
    seaHeights:null, // actually not a geometry, just an array of heights per row to be added to a sine motion
    clouds: null,
    fauna: null,
  },
  materials: {
    sky:null,
    land:null,
    sea:null,
    water:null,
    mirror:null,
    clouds:null,
    flora:null,
    fauna:null,
    models:null,
  },
  textures: {
    sky1:"img/skybox2/skymap_photo9.jpg",
    sky2:"img/skybox2/skydome3.jpg",
    sky3:"img/skybox2/sky_pattern_4.png",

    land:"img/landHeights.jpg",
    sea:null,
    flora:"img/tex_tree_82_128x128.png",
    fauna:null,
    water:"img/waternormals5.png",//wn5

    cloud1:'img/cloud1.png',
    cloud2:"img/tex_tree_82_128x128.png",


    //for models
    whale:"3dm/BL_WHALE/BL_WHALE.jpg",
    ducky:"3dm/ducky/ducky.png",
    airbus:"3dm/airbus/airbus_a.png",
    aurora:"3dm/aurora/aurora.png",
    heartbomb:"3dm/heartbomb/heartbomb_full.png",
    mercury:"3dm/mercury/mercury.png",
    tiger:"3dm/uncletiger/uncletiger_al.png",

    pattern1:"img/patterns/pattern-1.png",
    pattern2:"img/patterns/pattern-2.png",
    pattern3:"img/patterns/pattern-3.png",
    pattern4:"img/patterns/pattern-4.png",
    pattern5:"img/patterns/pattern-5.png",

    land1:"img/land/land_tex_1.jpg",
    land2:"img/land/land_tex_2.jpg",
    land3:"img/land/land_tex_3.jpg",
    land4:"img/land/land_tex_4.jpg",
    land5:"img/land/land_tex_5.jpg",
    land6:"img/land/land_tex_6.jpg",

    white:"img/white2x2.gif",
  },
  dynamicTextures:{
    stars:null,
    textbox:null,
  },
  models: {
    whale:["3dm/BL_WHALE/BL_WHALE2.OBJ",10],
    whale2:["3dm/BL_WHALE/BL_WHALE2.OBJ",5],
    ducky:["3dm/ducky/ducky.obj",5],
    airbus:["3dm/airbus/airbus_c.obj",5],
    aurora:["3dm/aurora/aurora_c.obj",5],
    heartbomb:["3dm/heartbomb/heartbomb_c.obj",5],
    mercury:["3dm/mercury/mercury_c.obj",5],
    tiger:["3dm/uncletiger/uncletiger_c.obj",5],
    cube:["3dm/cube.obj",2.5],
    logo:["3dm/hyperland_logo.obj",5],
    maker:["3dm/makerfaire.obj",5],
    data:["3dm/roma_data.obj",5],

    stone1:["3dm/stones/stone1.obj",10],
    stone2:["3dm/stones/stone2.obj",10],
    stone3:["3dm/stones/stone3.obj",10],
  },
  modelsKeys:null,
  mGroups:{
    weird:['ducky','tiger','mercury','ducky'],
    space:['mercury','aurora','airbus','heartbomb'],
    sea:['whale','whale2'],
    stones:['stone1','stone2','stone3']
  },
  // object containing models dynamically cloned from originals, for animation.
  dynamicModelsClones:{length:0},
  // meshes
  sky:null,
  land:null,
  sea:null,
  clouds:true,
  flora:null,
  fauna:null,

  lights:{
    ambient:null,
    directional:null,
    sun:null,
  },
}


var HLEnvironment = function(){

  var imagesCounter=0,imagesLoaded=0;
  function imageLoaded(key){
    HL.textures[key].wrapS = THREE.RepeatWrapping;
    HL.textures[key].wrapT = THREE.RepeatWrapping;
    imagesLoaded++;
    console.log("image "+key+" loaded, "+imagesLoaded+"/"+imagesCounter);
    if(imagesLoaded==imagesCounter) {
      console.timeEnd('images');
      HL.textures['length'] = imagesLoaded;
      initMaterials();
    }
  }
  function loadTextures(){
    console.time('images');
    var loader = new THREE.TextureLoader();
    for (var key in HL.textures)
      if(HL.textures[key]!=null){
        imagesCounter++;
        HL.textures[key] = loader.load(
          HL.textures[key],
          (function(k) { return function() { imageLoaded( k ) } })(key),
          null,
          function(i){imagesCounter--; console.error(i)}
        );
      }
      else delete(HL.textures[key]);
  }

  function initDynamicTextures(){
    console.time('dyn textures');

    for(var k in HL.dynamicTextures){
      HL.dynamicTextures[k] = document.createElement('canvas');
      HL.dynamicTextures[k].width = 512;
      HL.dynamicTextures[k].height = 512;
      HL.dynamicTextures[k]['c'] = HL.dynamicTextures[k].getContext('2d');
      HL.dynamicTextures[k]['texture'] = new THREE.Texture(HL.dynamicTextures[k]);
      HL.dynamicTextures[k]['texture'].wrapS = THREE.RepeatWrapping;
      HL.dynamicTextures[k]['texture'].wrapT = THREE.RepeatWrapping;
      HL.dynamicTextures[k]['texture'].name = k;
    }
    console.timeEnd('dyn textures');
  }

  function init(){
    console.time('HL environment');

    initEnvironment();
    initGeometries();
    initDynamicTextures();
    loadTextures();
    // loadTextures() calls initMaterials() once all images are loaded
    // initMaterials() calls initMeshes()
    // initMeshes() calls initLights()
    // initLights() is the last call, so it dispatches HLEload event

    // start clock;
    HL.clock.start();
  }

  function initEnvironment(){
    console.time('environment');

    // SET CONSTANTS
    HLE.TILE_SIZE = HLE.WORLD_WIDTH / HLE.WORLD_TILES;
    HLE.SEA_TILE_SIZE = HLE.WORLD_WIDTH / HLE.SEA_TILES;
    // HLE.LAND_Y_SHIFT = -HLE.WORLD_HEIGHT*0.1;
    HLE.MAX_MOVE_SPEED = Math.min(20,HLE.TILE_SIZE);
    HLE.BASE_MOVE_SPEED = HLE.WORLD_WIDTH/HLE.WORLD_TILES/2 ;

    // init clock
    HL.clock = new THREE.Clock(false);

    //init noise
    HLE.noiseSeed = Math.random() * 1000;
    HL.noise = new ImprovedNoise();

    // SCENE
    HL.scene = new THREE.Scene();

    if(HLE.FOG && !isWire){
      // HL.scene.fog = new THREE.Fog(
      //   HLC.horizon,
      //   HLE.WORLD_WIDTH * 0.3,
      //   HLE.WORLD_WIDTH * 0.45
      // );
      HL.scene.fog = new THREE.FogExp2();
      HL.scene.fog.density = 0.001;//0.00025;
      HL.scene.fog.color = HLC.horizon;
    }


    // CAMERA
    if(isCardboard){
    HL.camera = new THREE.PerspectiveCamera(17.5, window.innerWidth / window.innerHeight, 3, HLE.WORLD_WIDTH*3);
    HL.camera.focus = HLE.WORLD_WIDTH * .5;
    }
    else
      HL.camera = new THREE.PerspectiveCamera(
        50,
        (window.innerWidth * HLE.SCREEN_WIDTH_SCALE) / (window.innerHeight * HLE.SCREEN_HEIGHT_SCALE),
        0.5,
        3000000
      );

    // TODO check filmGauge and filmOffset effects
    // HL.camera.filmGauge = 1;
    // HL.camera.filmOffset = 100;
    // HL.camera.lookAt(new THREE.Vector3(0,0,-HLE.WORLD_WIDTH/6)); // camera looks at center point on horizon

    HL.cameraGroup = new THREE.Object3D();
    HL.cameraGroup.rotation.y = (Math.PI);

    HL.cameraCompanion = new THREE.Mesh(new THREE.PlaneBufferGeometry(128,128,1,1),new THREE.MeshBasicMaterial({color:0xff0000,transparent:true,side:THREE.DoubleSide}));
    HL.cameraCompanion.position.z = -500;
    HL.cameraCompanion.visible = false;
    // c.geometry.rotateX(Math.PI/2);
    HL.cameraGroup.add(HL.camera);
    HL.cameraGroup.add(HL.cameraCompanion);
    HL.cameraGroup.position.y = 50;
    HL.scene.add(HL.cameraGroup);


    // RENDERER
    // TODO: The easyest method to spedup FPS on slow mobile, is to reduce resolution
    // we can do this by settind pixel ratio to fraction of devicePixelRatio

    if(HLE.PIXEL_RATIO_SCALE && HLE.PIXEL_RATIO_SCALE<1 && HLE.PIXEL_RATIO_SCALE>0){
      HL.renderer = new THREE.WebGLRenderer({antialias: true});
      HL.renderer.setSize(window.innerWidth * HLE.SCREEN_WIDTH_SCALE, window.innerHeight * HLE.SCREEN_HEIGHT_SCALE, true);
      HL.renderer.setPixelRatio(window.devicePixelRatio * HLE.PIXEL_RATIO_SCALE);
      // HL.renderer.domElement.style.imageRendering = 'pixelated';
      // HL.renderer.domElement.style.imageRendering += '-webkit-crisp-edges';
      // HL.renderer.domElement.style.imageRendering += '-moz-crisp-edges';
    }
    else {
      HL.renderer = new THREE.WebGLRenderer({antialias: true});
      HL.renderer.setSize(window.innerWidth * HLE.SCREEN_WIDTH_SCALE, window.innerHeight * HLE.SCREEN_HEIGHT_SCALE);
      HL.renderer.setPixelRatio(window.devicePixelRatio);
    }
    // HL.renderer.shadowMap.enabled = true;
    //HL.renderer.sortObjects = false;

    document.body.appendChild(HL.renderer.domElement);


    // EFFECT AND CONTROLS
    if(isCardboard){

      HL.stereoEffect = new THREE.StereoEffect(HL.renderer);
      HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);

      HL.camera.fov = 75;
      HL.camera.focus = HLE.WORLD_WIDTH;
      HL.camera.updateProjectionMatrix ();
    }
    else if(isVR){
      HL.stereoEffect = new THREE.VREffect( HL.renderer );
      HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);
    }

    if(isVR){
      HL.controls = new THREE.VRControls( HL.cameraGroup );
    }
    else if (isMobile){
      HL.controls = new THREE.DeviceOrientationControls(HL.cameraGroup);
    }
    else if(isFPC){
      HL.controls = new THREE.FirstPersonControls(HL.cameraGroup);
		  HL.controls.movementSpeed = 10;
		  HL.controls.lookSpeed = 0.1;
    }
    else if(isNoiseCam){
      HL.controls = new THREE.NoiseCameraMove(HL.cameraGroup);
    }
    else if(isOrbit){
      HL.controls = new THREE.OrbitControls(HL.cameraGroup);
    }

    console.timeEnd('environment');
  }


  function initGeometries(){
    console.time('geometries');

  //  HL.geometries.sky = new THREE.BoxGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, HLE.WORLD_WIDTH-HLE.TILE_SIZE);
  //  HL.geometries.sky.translate(0,0, HLE.TILE_SIZE*0.5);
    HL.geometries.sky = new THREE.SphereBufferGeometry(HLE.WORLD_WIDTH*3-10,64,64);
    // SphereBufferGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength)

    if(HLE.LAND_IS_BUFFER)
    HL.geometries.land = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH,
      HLE.WORLD_TILES , HLE.WORLD_TILES);
    else
      HL.geometries.land = new THREE.PlaneGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH,
        HLE.WORLD_TILES , HLE.WORLD_TILES);
    HL.geometries.land.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
    HL.geometries.land.dynamic = true;
    HL.geometries.land.name = 'land-geometry';

    if(HLE.WATER){
      HL.geometries.sea = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH,
      1,1);
      HL.geometries.sea.name = 'sea-water-geometry';
    }
    else{
      HL.geometries.sea = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH,
        HLE.SEA_TILES ,  HLE.SEA_TILES);
      HL.geometries.sea.name = 'sea-geometry';
    }

    HL.geometries.sea.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
    //HL.geometries.sea.dynamic = true;

    HL.geometries.seaHeights = [];
    for(var i=0; i<HLE.WORLD_TILES;i++)
      HL.geometries.seaHeights[i]=1;

    // init and set oarticle systems geometries
    HL.geometries.clouds = new THREE.BufferGeometry();
    HL.geometries.clouds.name = 'clouds-geometry';
    HLH.initBufParticleSystem(HL.geometries.clouds, HLE.WORLD_WIDTH*2, HLE.WORLD_HEIGHT, HLE.CLOUDS_AMOUNT, true, true);

    HL.geometries.flora = new THREE.BufferGeometry();
    HL.geometries.flora.name = 'flora-geometry';
    HLH.initBufParticleSystem(HL.geometries.flora , HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT, HLE.FLORA_AMOUNT, false, true);

    HL.geometries.fauna = new THREE.BufferGeometry();
    HL.geometries.fauna.name = 'fauna-geometry';
    HLH.initBufParticleSystem(HL.geometries.fauna , HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT*0.5, HLE.MAX_FAUNA, true, true);

    console.timeEnd('geometries');
  }


  function initMaterials(){
    console.time('materials');

    HL.materials.sky = new THREE.MeshBasicMaterial({
      color: HLC.horizon,
      fog: false,
      side: THREE.BackSide,
      wireframe: false,//isWire,
      wireframeLinewidth: 2,
      map:isWire?null:HL.textures.sky2,
    });
    HL.materials.sky.color = HLC.horizon; // set by reference
    // HL.textures.sky1.wrapS = HL.textures.sky1.wrapT = THREE.RepeatWrapping;
    // HL.textures.sky1.repeat.set( 3, 1);


    // HL.materials.land = new THREE.MeshBasicMaterial({
    //   color: HLC.land,
    //   side: THREE.FrontSide,
    //   fog: true,
    //   wireframe: isWire,
    //   wireframeLinewidth: 2,
    //   opacity: 1,
    //   transparent:false,
    //   //shading: THREE.FlatShading,
    //     map: new THREE.TextureLoader().load( "img/blur-400x400.png" ),
    // //  normalMap: rockNormalMap,
    // });
    // HL.materials.land.color = HLC.land; // set by reference
    //   HL.materials.land.map.wrapS = THREE.RepeatWrapping;
    //   HL.materials.land.map.wrapT = THREE.RepeatWrapping;
    //   HL.materials.land.map.repeat.set( 1, HLE.WORLD_TILES);


    //  HL.materials.land = new THREE.LandDepthMaterial({
    //    color:HLC.land,
    //    waterColor: 0x444444,
    //    wireframe:isWire,
    //    wireframeLinewidth:2,
    //    map:isWire?null:HL.textures.land,
    //    fog:true,
    //    landHeight:HLE.WORLD_HEIGHT * 0.5,
    // });

    HL.materials.land = new THREE.LandShaderMaterial(
      HLE.WORLD_WIDTH,HLE.WORLD_TILES,
      {
      color:HLC.land,
      wireframe:isWire,
      // wireframeLinewidth:2,
      map:isWire?null:HL.textures.land,
      fog:true,
      repeatUV: new THREE.Vector2(1,1),
      centerPath : HLE.CENTER_PATH,
      side:THREE.DoubleSide,
      heightMap: HL.textures.land,

   });
   HL.materials.land.uniforms.worldColor.value = HLC.horizon;
   HL.materials.land.uniforms.withCenterPath.value = HLE.CENTER_PATH;

   HL.materials.land.uniforms.advance.value = HLE.advance;
   HL.materials.land.uniforms.noiseFreq.value = HLE.noiseFrequency;
   HL.materials.land.uniforms.noiseFreq2.value = HLE.noiseFrequency2;
   HL.materials.land.uniforms.landHeight.value = HLE.landHeight * 1.3 ;
   HL.materials.land.uniforms.landZeroPoint.value = HLE.landZeroPoint;

  //  HL.materials.land = new THREE.LandMaterial(HLE.WORLD_WIDTH,HLE.WORLD_TILES,{
  //    wireframe:false,
  //    map : new THREE.TextureLoader().load( "img/DEV_princessB.png" ),
  //    repeatUV:new THREE.Vector2(1,HLE.WORLD_TILES),
  //    fog : true,
  //  });


    if(!HLE.WATER && !HLE.MIRROR){
      HL.materials.sea = new THREE.MeshBasicMaterial({
        color: HLC.sea,
        //side: THREE.DoubleSide,
        fog: true,
        wireframe: isWire,
        wireframeLinewidth: 2,
         transparent:false,
         opacity:0.80,
         alphaTest: 0.5,
         map:isWire?null:HL.textures.sea
      });
      HL.materials.sea.color = HLC.sea; // set by reference

      if(!isWire && HL.textures.sea!=null){
          HL.textures.sea.wrapS = THREE.RepeatWrapping;
          HL.textures.sea.wrapT = THREE.RepeatWrapping;
          HL.textures.sea.repeat.set( HLE.WORLD_TILES*4, 1);
      }
    }

    if(HLE.MIRROR) {
      HL.materials.mirror = new THREE.Mirror( HL.renderer, HL.camera,
        { clipBias: 0,//0.0003,
          textureWidth: 512,
          textureHeight: 512,
          color: 0x000000,//666666,
          fog: true,
          side: THREE.DoubleSide,
          worldWidth: HLE.WORLD_WIDTH,
          transparent:false,
          opacity:1,//0.657,
          wireframe:isWire,
          wireframeLinewidth:2,
         }
      );
      HL.materials.mirror.rotateX( - Math.PI / 2 );
    }

   if(HLE.WATER) {

      // Load textures
  		HL.textures.water.wrapS = HL.textures.water.wrapT = THREE.RepeatWrapping;
      HL.textures.water.repeat.set( 1, 1);

  		// Create the water effect
  		HL.materials.water = new THREE.Water(HL.renderer, HL.camera, HL.scene, {
  			textureWidth: isCardboard?200:512 ,
  			textureHeight: isCardboard?200:512,
  			waterNormals: HL.textures.water,
        noiseScale: .65,
        distortionScale:90,
  			// sunDirection: HL.lights.sun.position.normalize(),
        sunDirection: new THREE.Vector3(0,HLE.WORLD_HEIGHT, -HLE.WORLD_WIDTH*0.25).normalize(),
  			sunColor: HLC.horizon,
  		  color: HLC.sea,
  			// betaVersion: 1,
        fog: true,
        side: THREE.DoubleSide,
        wireframe:isWire,
        wireframeLinewidth:2,
  		});
    }



    HL.materials.clouds = new THREE.PointsMaterial({
      color: HLC.clouds,
      side: THREE.DoubleSide,
      opacity:1,
      transparent: false,
      size: isCardboard||isVR?10:25,
      fog: true,
      sizeAttenuation: true,
      // alphaTest: -0.5,
      depthWrite: false,
      // map:isWire?null:HL.textures.cloud1,
    });
    HL.materials.clouds.color = HLC.clouds; // set by reference


    HL.materials.flora = new THREE.PointsMaterial({
      color: HLC.flora,
      side: THREE.DoubleSide,
      opacity: 0.5,
      transparent: true,
      size: 100,
      fog: true,
      //blending:THREE.AdditiveBlending,
      sizeAttenuation: true,
      alphaTest: 0.1,
      map:isWire?null:HL.textures.flora,
      //depthTest:false,
    });
    HL.materials.flora.color = HLC.flora; // set by reference


    HL.materials.fauna = new THREE.PointsMaterial({
      color: HLC.fauna,
      // side: THREE.DoubleSide,
      opacity: .6,
      transparent: false,
      size: 10,
      fog: true,
      sizeAttenuation: true,
      map:isWire?null:HL.textures.fauna,
      alphaTest: 0.5,
      //blending: THREE.AdditiveBlending,
    });
    HL.materials.fauna.color = HLC.fauna; // set by reference


    //create materials for 3d models
    for(var k in HL.models){
      HL.materials[k] = new THREE.MeshLambertMaterial({
        color: 0x000000,
        map:isWire?null:(HL.textures[k]!==undefined?HL.textures[k]:null),
        fog:true,
        wireframe:isWire,
        wireframeLinewidth:2,
        side:THREE.DoubleSide,
      //  transparent:true,
      });
      HL.materials[k].color = new THREE.Color(0xffffff);

    }


    console.timeEnd('materials');

    initModels();

  }


  function initModels(){
    console.time('models');
    var loader = new THREE.OBJLoader(), modelPath, modelScale, goodModelsCounter=0, loadedModelsCounter=0;
    var keys = {};
    // load a resource
    for (var key in HL.models){
      if(HL.models[key]!==null){
        console.log("goodModelsCounter:"+ (++goodModelsCounter) );
        modelPath = HL.models[key][0];
        modelScale = HL.models[key][1];
        loader.load(
          // resource URL
          modelPath,
          // Function when resource is loaded
          // use the closure trick to dereference and pass key to the delayed out onLoad funtion
        //  (function(i) { return function() { alert( i ) } })(i);
          (function ( nK , modelScale) {
            return function( object ){
              HL.models[nK]= new THREE.Mesh(object.children[0].geometry);
              HL.models[nK].name = nK;
              HL.models[nK].geometry.scale(modelScale,modelScale,modelScale);
  //            HL.models[key].geometry.rotateX(Math.PI*0.5);
              HL.models[nK].geometry.computeBoundingBox();
              HL.models[nK]['size']=HL.models[nK].geometry.boundingBox.size();
              HL.models[nK].material = HL.materials[nK];
            //  HL.models[nK].material.color = HLC.horizon; // set by reference

              HL.scene.add( HL.models[nK] );
              HLH.resetModel(HL.models[nK] );
              loadedModelsCounter++;
              if(loadedModelsCounter==goodModelsCounter){
                console.timeEnd('models');
                initMeshes();
              }
            }
          })(key, modelScale)
        );
      }
    }
    HL.modelsKeys = Object.keys(HL.models);
  };


  function initLights(){
    console.time('lights');

    //  HL.lights.ambient = new THREE.AmbientLight( 0xbbbbbb );
    //  HL.scene.add( HL.lights.ambient );
  //
  //   HL.lights.directional = new THREE.DirectionalLight( 0xffffff, 10);
  //   HL.lights.directional.color = HLC.horizon;
  //   HL.lights.directional.position.set(0,HLE.WORLD_HEIGHT, -HLE.WORLD_WIDTH*0.5);
  // //  HL.lights.directional.castShadows = false;
  //   HL.scene.add( HL.lights.directional );

     HL.lights.sun = new THREE.DirectionalLight( 0xffffff, .5);
     HL.lights.sun.color = HLC.horizon;
     HL.lights.sun.position.set(0,1,0);
     //  HL.lights.sun.castShadows = false;
     HL.scene.add( HL.lights.sun );


    //  HL.lights['moon'] = new THREE.DirectionalLight( 0xffffff, 1);
    //  HL.lights.moon.position.set(0,1,0);
    //  HL.lights.moon.color = HLC.horizon;
    // HL.scene.add( HL.lights.moon );


     HL.lights['hemisphere'] = new THREE.HemisphereLight( 0xffffff, HLC.land, .6 );
     HL.lights.hemisphere.color = HLC.horizon;
     HL.lights.hemisphere.groundColor = HLC.land;

     HL.scene.add(HL.lights.hemisphere);



     console.timeEnd('lights');

     var HLEload = new Event("HLEload");
     console.timeEnd('HL environment');
     window.dispatchEvent(HLEload);
     document.body.removeChild(consoleDiv);

  }


  function initMeshes(){
    console.time('meshes');

    HL.sky = new THREE.Mesh(HL.geometries.sky, HL.materials.sky);
    HL.sky.name = "sky";
    HL.scene.add(HL.sky);

    HL.land = new THREE.Mesh(HL.geometries.land, HL.materials.land);
    // HL.land.position.y = -HLE.LAND_Y_SHIFT; //hardset land at lower height, so we easily see sea
    HL.land.name = "land";
    // HL.land.castShadows = true;
    // HL.land.receiveShadows = true;
    HL.scene.add(HL.land);




    if(HLE.MIRROR) {
      HL.sea = new THREE.Mesh( HL.geometries.sea, HL.materials.mirror.material );
      HL.sea.add( HL.materials.mirror );
    }
    else if(HLE.WATER){
      HL.sea = new THREE.Mesh( new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH,HLE.WORLD_WIDTH,1,1), HL.materials.water.material );
      HL.sea.add(HL.materials.water);
      HL.sea.rotateX(-Math.PI * .5);
    } else {
      HL.sea = new THREE.Mesh(HL.geometries.sea, HL.materials.sea);
    }
    HL.sea.name = "sea";
    HL.scene.add(HL.sea);
    // HL.sea.receiveShadows = true;




    HL.clouds = new THREE.Points(HL.geometries.clouds, HL.materials.clouds);
    HL.clouds.name = "clouds";
    HL.clouds.frustumCulled = false;
    HL.scene.add(HL.clouds);

    // HL.flora = new THREE.Points(HL.geometries.flora, HL.materials.flora);
    // HL.flora.name = "flora";
    // HL.flora.frustumCulled = false;
    // HL.scene.add(HL.flora);

    // HL.fauna = new THREE.Points(HL.geometries.fauna, HL.materials.fauna);
    // HL.fauna.name = "fauna";
    // HL.scene.add(HL.fauna);
    console.timeEnd('meshes');


    initLights();
  }
  return{init:init}
}();
