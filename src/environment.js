/*
This file defines HYPERLAND elements, global settings

The HLEnvironment module inits scene, renderer, camera, effects, shaders, geometries, materials, meshes
*/

// HL Environment constants and parameters
var HLE = {
  WORLD_WIDTH:2500,
  WORLD_HEIGHT:500,
  WORLD_TILES:30, // change it according to device capabilities in initEnvironment()

  FOG:true,

  MAX_MOVE_SPEED: 13,
  BASE_MOVE_SPEED: 1,
  reactiveMoveSpeed:0, // changes programmatically - audio
  moveSpeed:0, // stores final computed move speed

  BASE_SEA_SPEED:2.5,
  CLOUDS_SPEED:2,

  reactiveSeaHeight:0, // changes programmatically - audio

  landZeroPoint:0, // actually not a geometry, just a float to be multiplied to compute height
  landHeight:30, // actually not a geometry, just a float to be added to compute height

  seaStepsCount:0,
  landStepsCount:0,

  MAX_TOTAL_PARTICLES: 500, // change it according to device capabilities in initEnvironment()
  CLOUDS_AMOUNT : 0,
  FLORA_AMOUNT : 0,
  MAX_FAUNA: 0,
  faunaAmount : 1, // this will represent users, and will change live, so we set a MAX_FAUNA as top limit
  shotFlora : true, //debounce 7 trigger

  noiseSeed:0,
  noiseFrequency:1,
  noiseFrequency2:1,

  cameraHeight:10, // will change live
}

HLE.resetTriggers = function(){
  HLE.shotFlora = false;
}

//HL Colors Library
var HLC = {
  horizon: new THREE.Color(.0, .3, .5),
  land: new THREE.Color(.0, .0, .0),
  sea: new THREE.Color(.7, .7, .7),

  underHorizon: new THREE.Color(.0, .02, .02),
  underLand: new THREE.Color(.1, .9, .9),
  underSea: new THREE.Color(.1, .9, .9),

  flora: new THREE.Color(1,1,0),
  fauna: new THREE.Color(1,0,0),
  clouds: new THREE.Color(1,1,1),
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
    land:null,
    sea:null,
    seaHeights:null, // actually not a geometry, just an array of heights per row to be added to a sine motion
    clouds: new THREE.BufferGeometry(),
    flora: new THREE.BufferGeometry(),
    fauna: new THREE.BufferGeometry(),
  },
  materials: {
    skybox:null,
    land:null,
    sea:null,
    clouds:null,
    flora:null,
    fauna:null,
    mirror:null,
  },
  // meshes
  skybox:null,
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
    HLE.CLOUDS_AMOUNT = Math.round(HLE.MAX_TOTAL_PARTICLES * 0.45);
    HLE.FLORA_AMOUNT = Math.round(HLE.MAX_TOTAL_PARTICLES * 0.45);
    HLE.MAX_FAUNA = Math.round(HLE.MAX_TOTAL_PARTICLES * 0.10);

    // set scene, camera, renderer, stereoEffect
    HL.scene = new THREE.Scene();
    if(HLE.FOG && !isWire){
      HL.scene.fog = new THREE.Fog(0x000000, HLE.WORLD_WIDTH*0.2, HLE.WORLD_WIDTH * 0.49);
      HL.scene.fog.color = HLC.horizon;
    }

    HL.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 2, HLE.WORLD_WIDTH);

    HL.renderer = new THREE.WebGLRenderer({antialias: true, shadowMapEnabled:false});
    HL.renderer.setSize(window.innerWidth, window.innerHeight);
    HL.renderer.setPixelRatio(window.devicePixelRatio);
    //HL.renderer.sortObjects = false;
    document.body.appendChild(HL.renderer.domElement);

    if(isVR){
      HL.stereoEffect = new THREE.StereoEffect(HL.renderer);
      HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);
    }

    // init controls
    if (isMobile){
      HL.controls = new THREE.DeviceOrientationControls(HL.camera);
    }
    else if(isFPC){
      HL.camera.rotateX(Math.PI/2);
      HL.controls = new THREE.FirstPersonControls(HL.camera);
		  HL.controls.movementSpeed = 10;
		  HL.controls.lookSpeed = 0.1;
    }

  }

  function initGeometries(){
    HL.geometries.skybox = new THREE.BoxGeometry(HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT*2, HLE.WORLD_WIDTH);

    HL.geometries.land = new THREE.PlaneGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, HLE.WORLD_TILES , HLE.WORLD_TILES);
    HL.geometries.land.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
    HL.geometries.land.dynamic = true;

    HL.geometries.sea = new THREE.PlaneGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, HLE.WORLD_TILES , HLE.WORLD_TILES);
    HL.geometries.sea.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
    HL.geometries.sea.dynamic = true;

    HL.geometries.seaHeights = [];
    for(var i=0; i<HLE.WORLD_TILES;i++)
      HL.geometries.seaHeights[i]=1;

    // init and set oarticle systems geometries
    HLH.initBufParticleSystem(HL.geometries.clouds, HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT, HLE.CLOUDS_AMOUNT, true, true);
    HLH.initBufParticleSystem(HL.geometries.flora , HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT, HLE.FLORA_AMOUNT, false, true);
    HLH.initBufParticleSystem(HL.geometries.fauna , HLE.WORLD_WIDTH, HLE.WORLD_HEIGHT*0.5, HLE.MAX_FAUNA,     true, true);

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

    HL.materials.land = new THREE.MeshBasicMaterial({
      color: HLC.land,
      side: THREE.FrontSide,
      fog: true,
      wireframe: isWire,
      wireframeLinewidth: 2,
      opacity: 1,
      transparent:false,
      // shading: THREE.FlatShading,
      // map: new THREE.TextureLoader().load( "img/tex_stripe2_512.gif" ),
    });
    HL.materials.land.color = HLC.land; // set by reference
    // HL.materials.land.map.wrapS = THREE.RepeatWrapping;
    // HL.materials.land.map.wrapT = THREE.RepeatWrapping;
    // HL.materials.land.map.repeat.set( 1, HLE.WORLD_TILES*8 );

    HL.materials.sea = new THREE.MeshBasicMaterial({
      color: HLC.sea,
      //side: THREE.DoubleSide,
      fog: true,
      wireframe: isWire,
      wireframeLinewidth: 2,
       opacity: 1,
       transparent:false,
       alphaTest: 0.5,
       map: new THREE.TextureLoader().load( "img/tex_stripe_512.gif" ),
    });
    HL.materials.sea.color = HLC.sea; // set by reference

    HL.materials.sea.map.wrapS = THREE.RepeatWrapping;
    HL.materials.sea.map.wrapT = THREE.RepeatWrapping;
    HL.materials.sea.map.repeat.set( HLE.WORLD_TILES*8, 1);


    HL.materials.clouds = new THREE.PointsMaterial({
      color: HLC.clouds,
      // side: THREE.DoubleSide,
      opacity: 1,
      transparent: true,
      size: 80,
      fog: true,
      sizeAttenuation: true,
      //alphaTest: 0.5,
      depthWrite: false,
      map: isWire?null:new THREE.TextureLoader().load( "img/tex_cloud_128x128.png" ),
    });
    HL.materials.clouds.color = HLC.clouds; // set by reference


    HL.materials.flora = new THREE.PointsMaterial({
      color: HLC.flora,
      // side: THREE.DoubleSide,
      // opacity: 0.55,
      // transparent: true,
      size: 10,
      fog: true,
      sizeAttenuation: true,
    //  alphaTest: 0.5,
    //  map: isWire?null:new THREE.TextureLoader().load( "img/tex_tree_82_128x128.png" ),
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

  }


  function initMeshes(){
    HL.skybox = new THREE.Mesh(HL.geometries.skybox, HL.materials.skybox);
    HL.skybox.name = "skybox";
    HL.scene.add(HL.skybox);

    HL.land = new THREE.Mesh(HL.geometries.land, HL.materials.land);
    HL.land.position.y = -5; //hardset land at lower height, so we easily see sea
    HL.land.name = "land";
    HL.scene.add(HL.land);

    HL.sea = new THREE.Mesh(HL.geometries.sea, HL.materials.sea);
    HL.sea.name = "sea";
    HL.scene.add(HL.sea);

    HL.clouds = new THREE.Points(HL.geometries.clouds, HL.materials.clouds);
    HL.clouds.name = "clouds";
    HL.scene.add(HL.clouds);

    HL.flora = new THREE.Points(HL.geometries.flora, HL.materials.flora);
    //HL.flora.frustumCulled = true;
    HL.flora.name = "flora";
    HL.flora.position.y = -5; //hardset like land at lower height, so we easily see se
    HL.scene.add(HL.flora);

    HL.fauna = new THREE.Points(HL.geometries.fauna, HL.materials.fauna);
    HL.fauna.name = "fauna";
    HL.scene.add(HL.fauna);
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
