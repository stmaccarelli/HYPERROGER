/*
This file defines HYPERLAND elements, global settings

The HLEnvironment module inits scene, renderer, camera, effects, shaders, geometries, materials, meshes
*/

// HL Environment constants and parameters
var HLE = {
  WORLD_WIDTH:1000,
  WORLD_HEIGHT:300,
  WORLD_TILES:29, // change it according to device capabilities in initEnvironment()

  FOG:true,

  MAX_MOVE_SPEED: 8,
  BASE_MOVE_SPEED: 1,
  reactiveMoveSpeed:0, // changes programmatically - audio
  moveSpeed:0, // stores final computer move speed

  landFriction:0,
  seaFriction:0,

  BASE_SEA_SPEED:2.5,
  CLOUDS_SPEED:2,

  reactiveSeaHeight:0, // changes live

  // DEV - TEMP vars
  // devLandBase:-10,
  // devLandHeight:10,

  landZeroPoint:0, // actually not a geometry, just a float to be multiplied to compute height
  landHeight:30, // actually not a geometry, just a float to be added to compute height

  seaStepsCount:0,
  landStepsCount:0,

  // init particle size for Particle Systems
  // we could computer device capabilities, then find a total amount of particles it can manage
  // then divide proportionally
  MAX_TOTAL_PARTICLES: 300, // change it according to device capabilities in initEnvironment()
  CLOUDS_AMOUNT : 0, // change it according to device capabilities in initEnvironment()
  FLORA_AMOUNT : 0, // change it according to device capabilities in initEnvironment()
  MAX_FAUNA: 0, // change it according to device capabilities in initEnvironment()
  faunaAmount : 1, // this will represent users, and will change live, so we set a MAX_FAUNA as top limit
  shotFlora : true, //debounce 7 trigger
  // noise is stored in HL module
  // these are needed for terrain generation
  noiseSeed:0,
  noiseFrequency:1,
  noiseFrequency2:1,

  cameraHeight:100, // will change live
}

HLE.resetTriggers = function(){
  HLE.shotFlora = false;

}

//HL parts Library
var HLC = {
  horizon: new THREE.Color(.0, .3, .5),
  land: new THREE.Color(.1, .1, .1),
  sea: new THREE.Color(.7, .7, .7),

  underHorizon: new THREE.Color(.0, .02, .05),
  underLand: new THREE.Color(.1, .9, .9),
  underSea: new THREE.Color(.1, .9, .9),

  flora: new THREE.Color(1,1,0),
  fauna: new THREE.Color(1,0,0),
  clouds: new THREE.Color(1,1,0),
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
    skybox:null,
    seabox:null,
    land:null,
    sea:null,
    seaHeights:null, // actually not a geometry, just an array of heights per row to be added to a sine motion
    clouds: new THREE.BufferGeometry(),
    flora: new THREE.BufferGeometry(),
    fauna: new THREE.BufferGeometry(),
  },
  materials: {
    skybox:null,
    seabox:null,
    land:null,
    sea:null,
    clouds:null,
    flora:null,
    fauna:null,
    mirror:null,
  },
  // meshes
  skybox:null,
  seabox:null,
  land:null,
  sea:null,
  clouds:null,
  flora:null,
  fauna:null,
}


var groundMirror;

var HLEnvironment = function(){

  function init(){
    initEnvironment();
    initGeometries();
    initMaterials();
    initMeshes();
    //initLights();

    // start clock;
    HL.clock.start();
  }

  function initEnvironment(){
    // init clock
    HL.clock = new THREE.Clock();

    //init noise
    HLE.noiseSeed = Math.random() * 1000;
    HL.noise = new ImprovedNoise();

    // set constants  MAX_TOTAL_PARTICLES: 1000, // change it according to device capabilities in initEnvironment()
    HLE.CLOUDS_AMOUNT = Math.round(HLE.MAX_TOTAL_PARTICLES * 0.45), // change it according to device capabilities in initEnvironment()
    HLE.FLORA_AMOUNT = Math.round(HLE.MAX_TOTAL_PARTICLES * 0.45), // change it according to device capabilities in initEnvironment()
    HLE.MAX_FAUNA = Math.round(HLE.MAX_TOTAL_PARTICLES * 0.10), // change it according to device capabilities in initEnvironment()



    // set scene, camera, renderer, stereoEffect
    HL.scene = new THREE.Scene();
    if(HLE.FOG && !isWire){
      HL.scene.fog = new THREE.Fog(0x000000, HLE.WORLD_WIDTH/6, HLE.WORLD_WIDTH / 2);// - HLE.WORLD_WIDTH / HLE.WORLD_TILES *2 );
      HL.scene.fog.color = HLC.horizon;
    }

    HL.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    HL.camera.lookAt(new THREE.Vector3(0,0,-HLE.WORLD_WIDTH/2));

    HL.renderer = new THREE.WebGLRenderer({antialias: true, shadowMapEnabled:true});
    HL.renderer.setPixelRatio(window.devicePixelRatio);
    HL.renderer._clearColor = HLC.horizon;

    console.log(HL.renderer);
    //HL.renderer.sortObjects = false;

    document.body.appendChild(HL.renderer.domElement);

    HL.stereoEffect = new THREE.StereoEffect(HL.renderer);
    // HL.stereoEffect.eyeSeparation = 4000;
    // HL.stereoEffect.focalLength = HLE.WORLD_WIDTH / 4;
    HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);

    // init controls
    if (isMobile){
      HL.controls = new THREE.DeviceOrientationControls(HL.camera);
    }
    else if(isFPC){
      HL.controls = new THREE.FirstPersonControls(HL.camera);
		  HL.controls.movementSpeed = 10;
		  HL.controls.lookSpeed = 0.1;
      HL.camera.lookAt(new THREE.Vector3(0,0,-HLE.WORLD_WIDTH/2));
    }
  }

  function initGeometries(){
    // init and set solid geometries
    HL.geometries.skybox = new THREE.BoxGeometry(HLE.WORLD_WIDTH*2, HLE.WORLD_HEIGHT*2, HLE.WORLD_WIDTH*2);

    HL.geometries.seabox = new THREE.BoxGeometry(HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT, HLE.WORLD_WIDTH);

    HL.geometries.land = new THREE.PlaneGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, HLE.WORLD_TILES , HLE.WORLD_TILES);
    HL.geometries.land.dynamic = true;
    HL.geometries.land.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
  //  HL.geometries.land.translate(0,-(HLE.WORLD_WIDTH/HLE.WORLD_TILES)*3,0);

    HL.geometries.sea = new THREE.PlaneGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, HLE.WORLD_TILES , HLE.WORLD_TILES);
    HL.geometries.sea.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
    HL.geometries.sea.dynamic = true;
    // HL.geometries.sea = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, HLE.WORLD_TILES,HLE.WORLD_TILES);
    // HL.geometries.sea.attributes.position.dynamic = true;

    HL.geometries.seaHeights = [];
    for(var i=0; i<HLE.WORLD_TILES;i++)
      HL.geometries.seaHeights[i]=1;

    // init and set oarticle systems geometries
    HLH.initBufParticleSystem(HL.geometries.clouds, HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT/4, HLE.CLOUDS_AMOUNT, true, true);
    HLH.initBufParticleSystem(HL.geometries.flora , HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT/4, HLE.FLORA_AMOUNT, false, true);
    HLH.initBufParticleSystem(HL.geometries.fauna , HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT/4, HLE.MAX_FAUNA,     true, true);
  }


  function initMaterials(){
    HL.materials.skybox = new THREE.MeshBasicMaterial({
      color: HLC.horizon,
      fog: false,
      side: THREE.BackSide,
      wireframe: isWire,
      wireframeLinewidth: 2,
    });
    HL.materials.skybox.color = HLC.horizon; // set by reference

    HL.materials.seabox = new THREE.MeshBasicMaterial({
      color: HLC.sea,
      fog: false,
      side: THREE.BackSide,
      wireframe: isWire,
      wireframeLinewidth: 2
    });

//   HL.materials.land = new THREE.LandMaterial(HL.landStepsCount);
    HL.materials.land = new THREE.MeshBasicMaterial({
      color: HLC.land,
      side: THREE.DoubleSide,
      fog: true,
      wireframe: isWire,
      wireframeLinewidth: 2,
      shading: THREE.FlatShading,
      // map: new THREE.TextureLoader().load( "img/blur-400x400.png" ),
    });
    HL.materials.land.color = HLC.land; // set by reference

    // HL.materials.land.map.wrapS = THREE.RepeatWrapping;
    // HL.materials.land.map.wrapT = THREE.RepeatWrapping;
    // HL.materials.land.map.repeat.set( .5, HLE.WORLD_TILES );

    HL.materials.sea = new THREE.MeshBasicMaterial({
      color: HLC.sea,
      //side: THREE.DoubleSide,
      fog: true,
      wireframe: isWire,
      wireframeLinewidth: 2,
       opacity: 0.5,
       //transparent:true,
      // blending: THREE.AdditiveBlending,
      //  map: new THREE.TextureLoader().load( "img/blur-400x400.png" ),
    });
    HL.materials.sea.color = HLC.sea; // set by reference

    // HL.materials.sea.map.wrapS = THREE.RepeatWrapping;
    // HL.materials.sea.map.wrapT = THREE.RepeatWrapping;
    // HL.materials.sea.map.repeat.set( HLE.WORLD_TILES*2, 0.5 );

    HL.materials.clouds = new THREE.PointsMaterial({
      color: HLC.clouds,
      // side: THREE.DoubleSide,
      opacity: 0.1,
      transparent: true,
      size: 8,
      fog: true,
      sizeAttenuation: false,
      //alphaTest: 0.5,
      //depthWrite: false,
    //  map: isWire?null:new THREE.TextureLoader().load( "img/tex_cloud_128x128.png" ),
    });
    HL.materials.clouds.color = HLC.clouds; // set by reference


    HL.materials.flora = new THREE.PointsMaterial({
      color: HLC.flora,
      // side: THREE.DoubleSide,
      // opacity: 0.55,
      // transparent: true,
      size: 50,
      fog: true,
      sizeAttenuation: true,
      alphaTest: 0.5,
      //depthWrite: false,
      map: isWire?null:new THREE.TextureLoader().load( "img/tex_tree_82_128x128.png" ),
    });
    HL.materials.flora.color = HLC.flora; // set by reference


    HL.materials.fauna = new THREE.PointsMaterial({
      color: HLC.fauna,
      // side: THREE.DoubleSide,
      opacity: .6,
      transparent: true,
      size: 20,
      fog: true,
      sizeAttenuation: true,
    //  map: new THREE.TextureLoader().load( "img/tex_tree_8_128x128.png" ),
      //alphaTest: 0.5,
    //  blending: THREE.AdditiveBlending,
    });
    HL.materials.fauna.color = HLC.fauna; // set by reference


    // HL.materials.mirror = new THREE.Mirror(
    //   HL.renderer,
    //   HL.camera,
    //   { clipBias: 0.0003, textureWidth: HLE.WORLD_WIDTH*10, textureHeight: HLE.WORLD_WIDTH*10, color: 0x777777 }
    // );

  }

  function initMeshes(){
    HL.skybox = new THREE.Mesh(HL.geometries.skybox, HL.materials.skybox);
    //HL.skybox.position.y = HLE.WORLD_WIDTH/4;
    HL.scene.add(HL.skybox);

    HL.seabox = new THREE.Mesh(HL.geometries.seabox, HL.materials.seabox);
  //  HL.scene.add(HL.seabox);

    HL.land = new THREE.Mesh(HL.geometries.land, HL.materials.land);
    HL.land.position.y = -1;
    HL.scene.add(HL.land);

    HL.sea = new THREE.Mesh(HL.geometries.sea, HL.materials.sea);
    HL.scene.add(HL.sea);

    // // MIRROR
    // groundMirror = new THREE.Mirror( HL.renderer, HL.camera, { clipBias: 0.00, textureWidth: HLE.WORLD_WIDTH, textureHeight: HLE.WORLD_WIDTH, color: 0x444444 } );
    // groundMirror.rotateX( - Math.PI / 2 );
    // HL.sea = new THREE.Mesh( HL.geometries.sea, groundMirror.material );
    // HL.sea.add( groundMirror );
    // HL.scene.add( HL.sea );

    HL.clouds = new THREE.Points(HL.geometries.clouds, HL.materials.clouds);
    //HL.clouds.frustumCulled = true;
    HL.scene.add(HL.clouds);

    HL.flora = new THREE.Points(HL.geometries.flora, HL.materials.flora);
    //HL.flora.frustumCulled = true;
    HL.scene.add(HL.flora);

    // HL.fauna = new THREE.Points(HL.geometries.fauna, HL.materials.fauna);
    // //HL.fauna.frustumCulled = true;
    // HL.scene.add(HL.fauna);

  }

  function initLights(){
    HL.scene.add( new THREE.AmbientLight( 0x444444 ) );
    var light = new THREE.DirectionalLight( 0xffffbb, 1 );
    light.position.set( - 1, 1, - 1 );
    light.castShadows = true;
    HL.scene.add( light );
  }



  return {
    init:init
  }
}();
