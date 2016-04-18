/*
This file defines HYPERLAND elements, global settings

The HLEnvironment module inits scene, renderer, camera, effects, shaders, geometries, materials, meshes
*/

// HL Global parameters
// WILL BE HLE / Environment parameters, I'm gonna move the globals in MAIN, containing settings like isMobile, framecount, millis.
var HLG = {
  worldwidth:1000,
  worldheight:1000,
  worldtiles:39, //gotta change according to device capabilities
  movespeed:0.9,
  seaSpeed:2.5,
  seaStepsCount:0,
  landStepsCount:0,

  // init particle size for Particle Systems
  cloudsAmount : 20,
  floraAmount : 20,
  faunaAmount : 30, // this will represent users, and will change live, so here we set a MAX_USERS_CANSHOW

  noiseFrequency:1,
  noiseFrequency2:1,
  noiseSeed:0,

  fog:true,

  devLandBase:-5,
  devLandHeight:10,

  cameraHeight:100,

}

//HL Colors Library
var HLC = {
  horizon: new THREE.Color(.1, .1, .1),
  land: new THREE.Color(.51, .51, .51),
  sea: new THREE.Color(.7, .1, .15),

  underHorizon: new THREE.Color(.0, .02, .05),
  underLand: new THREE.Color(.1, .9, .9),
  underSea: new THREE.Color(.1, .9, .9),

  flora: new THREE.Color(1,1,0),
  fauna: new THREE.Color(1,0,0),
  clouds: new THREE.Color(1,0,1),
}

// HL elements library
var HL = {
  scene:null,
  renderer:null,
  renderMirr:null,
  camera:null,
  dofCamera:null,
  stereoEffect:null,
  controls:null,
  //three clock
  clock:null,
  noise:null,
  postprocessing: {},

  geometries: {
    skybox:null,
    seabox:null,
    land:null,
    landBottomHeights:null, // actually not a geometry, just a float to be multiplied to compute height
    landHeights:null, // actually not a geometry, just a float to be added to compute height
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
    // start clock;
    HL.clock.start();
  }

  function initEnvironment(){
    // init clock
    HL.clock = new THREE.Clock();

    //init noise
    HL.noise = new ImprovedNoise();
    HLG.noiseSeed = Math.random() * 100;

    // TBD set WORLDTILES according to device capabilities
    // HLG.WORLDTILES = ????

    // set scene, camera, renderer, stereoEffect
    HL.scene = new THREE.Scene();
    if(HLG.fog && !isWire)  HL.scene.fog = new THREE.Fog(HLC.horizon, HLG.worldwidth/6, HLG.worldwidth / 2);// - HLG.worldwidth / HLG.worldtiles *2 );

    HL.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 1, 10000);
    HL.camera.lookAt(new THREE.Vector3(0,0,-HLG.worldwidth/2));

    HL.renderer = new THREE.WebGLRenderer({antialias: true});
    HL.renderer.setPixelRatio(window.devicePixelRatio);
    HL.renderer.setClearColor(HLC.horizon);
    //HL.renderer.sortObjects = false;

    document.body.appendChild(HL.renderer.domElement);

    HL.stereoEffect = new THREE.StereoEffect(HL.renderer);
    // HL.stereoEffect.eyeSeparation = 4000;
    // HL.stereoEffect.focalLength = HLG.worldwidth / 4;
    HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);

    // init controls
    if (isMobile){
      HL.controls = new THREE.DeviceOrientationControls(HL.camera);
    }
    else if(isFPC){
      HL.controls = new THREE.FirstPersonControls(HL.camera);
		  HL.controls.movementSpeed = 10;
		  HL.controls.lookSpeed = 0.1;
      HL.camera.lookAt(new THREE.Vector3(0,0,-HLG.worldwidth/2));
    }



    // HL.scene.add( new THREE.AmbientLight( 0x444444 ) );
    //
    // var light = new THREE.DirectionalLight( 0xffffbb, 1 );
    // light.position.set( - 1, 1, - 1 );
    // HL.scene.add( light );

  }


  function initGeometries(){
    // init and set solid geometries
    HL.geometries.skybox = new THREE.BoxGeometry(HLG.worldwidth, HLG.worldwidth/2, HLG.worldwidth);
    HL.geometries.skybox.translate(0,HLG.worldwidth/4-10,0);

    HL.geometries.seabox = new THREE.BoxGeometry(HLG.worldwidth, HLG.worldwidth/2, HLG.worldwidth);
    HL.geometries.seabox.translate(0,-HLG.worldwidth/4-10,0);

    HL.geometries.land = new THREE.PlaneGeometry(HLG.worldwidth, HLG.worldwidth, HLG.worldtiles , HLG.worldtiles);
    HL.geometries.land.dynamic = true;
    HL.geometries.land.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
    HL.geometries.land.translate(0,-(HLG.worldwidth/HLG.worldtiles)*3,0);

    HL.geometries.sea = new THREE.PlaneGeometry(HLG.worldwidth, HLG.worldwidth, HLG.worldtiles , HLG.worldtiles);
    HL.geometries.sea.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
    HL.geometries.sea.dynamic = true;
    // HL.geometries.sea = new THREE.PlaneBufferGeometry(HLG.worldwidth, HLG.worldwidth, HLG.worldtiles,HLG.worldtiles);
    // HL.geometries.sea.attributes.position.dynamic = true;

    HL.geometries.seaHeights = [];
    for(var i=0; i<HLG.worldtiles;i++)
      HL.geometries.seaHeights[i]=1;

    // init and set oarticle systems geometries
    HLH.initBufParticleSystem(HL.geometries.clouds, HLG.worldwidth, HLG.cloudsAmount, true, true);
    HLH.initBufParticleSystem(HL.geometries.flora , HLG.worldwidth, HLG.floraAmount, false, true);
    HLH.initBufParticleSystem(HL.geometries.fauna , HLG.worldwidth, HLG.faunaAmount, true, true);
  }


  function initMaterials(){
    HL.materials.skybox = new THREE.MeshBasicMaterial({
      color: HLC.horizon,
      fog: false,
      side: THREE.BackSide,
      wireframe: isWire,
      wireframeLinewidth: 2
    });

    HL.materials.seabox = new THREE.MeshBasicMaterial({
      color: HLC.sea,
      fog: false,
      side: THREE.BackSide,
      wireframe: isWire,
      wireframeLinewidth: 2
    });

    HL.materials.land = new THREE.MeshBasicMaterial({
      color: HLC.land,
      side: THREE.DoubleSide,
      fog: true,
      wireframe: isWire,
      wireframeLinewidth: 2,
      map: new THREE.TextureLoader().load( "img/tex_grass_1024.png" ),
    });
    HL.materials.land.map.wrapS = THREE.RepeatWrapping;
    HL.materials.land.map.wrapT = THREE.RepeatWrapping;
    HL.materials.land.map.repeat.set( 1, HLG.worldtiles );

    HL.materials.sea = new THREE.MeshBasicMaterial({
      color: HLC.sea,
      //side: THREE.DoubleSide,
      fog: true,
      wireframe: isWire,
      wireframeLinewidth: 2,
       opacity: 0.5,
       //transparent:true,
      // blending: THREE.AdditiveBlending,
       map: new THREE.TextureLoader().load( "img/blur-400x400.png" ),
    });
    HL.materials.sea.map.wrapS = THREE.RepeatWrapping;
    HL.materials.sea.map.wrapT = THREE.RepeatWrapping;
    HL.materials.sea.map.repeat.set( HLG.worldtiles*2, 0.5 );

    HL.materials.clouds = new THREE.PointsMaterial({
      color: HLC.clouds,
      // side: THREE.DoubleSide,
      // opacity: 0.55,
      // transparent: true,
      size: 8,
      fog: true,
      sizeAttenuation: false,
      alphaTest: 0.5,
      //depthWrite: false,
    //  map: isWire?null:new THREE.TextureLoader().load( "img/tex_cloud_128x128.png" ),
    });

    HL.materials.flora = new THREE.PointsMaterial({
      color: HLC.flora,
      // side: THREE.DoubleSide,
      // opacity: 0.55,
      // transparent: true,
      size: 10,
      fog: true,
      sizeAttenuation: true,
      alphaTest: 0.5,
      //depthWrite: false,
      map: isWire?null:new THREE.TextureLoader().load( "img/tex_tree_82_128x128.png" ),
    });

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

    HL.materials.mirror = new THREE.Mirror(
      HL.renderer,
      HL.camera,
      { clipBias: 0.0003, textureWidth: HLG.worldwidth*10, textureHeight: HLG.worldwidth*10, color: 0x777777 }
    );

  }

  function initMeshes(){
    HL.skybox = new THREE.Mesh(HL.geometries.skybox, HL.materials.skybox);
  //  HL.scene.add(HL.skybox);

    HL.seabox = new THREE.Mesh(HL.geometries.seabox, HL.materials.seabox);
  //  HL.scene.add(HL.seabox);

    HL.land = new THREE.Mesh(HL.geometries.land, HL.materials.land);
    HL.scene.add(HL.land);

    HL.sea = new THREE.Mesh(HL.geometries.sea, HL.materials.sea);
    HL.scene.add(HL.sea);

    // MIRROR
    // groundMirror = new THREE.Mirror( HL.renderer, HL.camera, { clipBias: 0.00, textureWidth: HLG.worldwidth/2, textureHeight: HLG.worldwidth/2, color: 0x444444 } );
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

    HL.fauna = new THREE.Points(HL.geometries.fauna, HL.materials.fauna);
    //HL.fauna.frustumCulled = true;
    HL.scene.add(HL.fauna);

  }





  return {
    init:init
  }
}();
