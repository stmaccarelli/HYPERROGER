/*
This file defines HYPERLAND elements, global settings

The HLEnvironment module inits scene, renderer, camera, effects, shaders, geometries, materials, meshes
*/

// HL Global parameters
var HLG = {
  worldwidth:800,
  worldheight:600,
  worldtiles:39, //gotta change according to device capabilities
  movespeed:0.9,
  seaSpeed:6.8,
  stepsCount:0,
  noiseFrequency:1,
  noiseFrequency2:1,
  noiseSeed:0,

  fog:true,

  devLandBase:-5,
  devLandHeight:10,

  cameraHeight:100,

}

//HL Colors
var HLC = {
  horizon: new THREE.Color(.1, .9, .9),
  land: new THREE.Color(.9, 0, 0),
  sea: new THREE.Color(0, .55, .9),

  white: new THREE.Color(1, 1, 1)
}

// HL elements library
var HL = {
  scene:null,
  renderer:null,
  camera:null,
  stereoEffect:null,
  controls:null,
  //three clock
  clock:null,
  noise:null,

  geometries: {
    sky:null,
    land:null,
    landBottomHeights:null, // actually not a geometry, just a float to be multiplied to compute height
    landHeights:null, // actually not a geometry, just a float to be added to compute height
    sea:null,
    seaHeights:null, // actually not a geometry, just an array of heights per row to be added to a sine motion
    clouds: new THREE.Geometry(),
    flora: new THREE.Geometry(),
    fauna: new THREE.Geometry(),
  },
  materials: {
    sky:null,
    land:null,
    sea:null,
    clouds:null,
    flora:null,
    fauna:null
  },
  // meshes
  sky:null,
  land:null,
  sea:null,
  clouds:null,
  flora:null,
  fauna:null,
  // init particle size for Particle Systems
  cloudsAmount : 50,
  floraAmount : 50,
  faunaAmount : 100 // this will represent users, and will change live, so here we set a MAX_USERS_CANSHOW
}

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
    if(HLG.fog)  HL.scene.fog = new THREE.Fog(HLC.horizon, HLG.worldwidth/6, HLG.worldwidth / 2);// - HLG.worldwidth / HLG.worldtiles *2 );

    HL.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000000);
    HL.camera.position.y = HLG.cameraHeight;
    if(!isMobile) HL.camera.lookAt(new THREE.Vector3(0,0,-HLG.worldwidth/2));

    HL.renderer = new THREE.WebGLRenderer({antialias: true});
    HL.renderer.setPixelRatio(window.devicePixelRatio);
    HL.renderer.setClearColor(HLC.horizon);
    document.body.appendChild(HL.renderer.domElement);

    HL.stereoEffect = new THREE.StereoEffect(HL.renderer);
    HL.stereoEffect.eyeSeparation = 4;
    HL.stereoEffect.focalLength = HLG.worldwidth / 4;
    HL.stereoEffect.setSize(window.innerWidth, window.innerHeight);

    // init controls
    if (isMobile){
      HL.controls = new THREE.DeviceOrientationControls(HL.camera);
    }
    else{
      // HL.controls = new THREE.FirstPersonControls(HL.camera);
		  // HL.controls.movementSpeed = 10;
		  // HL.controls.lookSpeed = 0.1;
    }

  }

  function initGeometries(){
    // init and set geometries
    HL.geometries.sky = new THREE.BoxGeometry(HLG.worldwidth, HLG.worldwidth, HLG.worldwidth);

    HL.geometries.land = new THREE.PlaneGeometry(HLG.worldwidth, HLG.worldwidth, HLG.worldtiles , HLG.worldtiles);
    HL.geometries.land.dynamic = true;
    HL.geometries.land.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
    HL.geometries.land.translate(0,-(HLG.worldwidth/HLG.worldtiles)*3,0);

    HL.geometries.sea = new THREE.PlaneGeometry(HLG.worldwidth, HLG.worldwidth, HLG.worldtiles*1,HLG.worldtiles*1);
    HL.geometries.sea.rotateX(-Math.PI / 2); // gotta rotate because Planes in THREE are created vertical
    HL.geometries.sea.dynamic = true;

    HL.geometries.seaHeights = [];
    for(var i=0; i<HLG.worldtiles;i++)
      HL.geometries.seaHeights[i]=1;

    HLH.initParticleSystem(HL.geometries.clouds, HLG.worldwidth, HL.cloudsAmount, true, true);
    HLH.initShotParticles(HL.geometries.clouds, HLG.worldwidth);

    HLH.initParticleSystem(HL.geometries.flora , HLG.worldwidth, HL.floraAmount, false, true);
    HLH.initParticleSystem(HL.geometries.fauna , HLG.worldwidth, HL.faunaAmount, false, true);

    console.log(HL.geometries.land);
  }


  function initMaterials(){

    HL.materials.sky = new THREE.MeshBasicMaterial({
      color: HLC.horizon,
      fog: false,
      side: THREE.DoubleSide,
      wireframe: false,
      wireframeLinewidth: 2
    });
    HL.materials.sky.side = THREE.BothSides;

    HL.materials.land = new THREE.MeshBasicMaterial({
      color: HLC.land,
      fog: true,
    //  side: THREE.DoubleSide,
      wireframe: false,
      wireframeLinewidth: 2,
      map: new THREE.TextureLoader().load( "img/blur-400x400.png" ),
    });
    HL.materials.land.map.wrapS = THREE.RepeatWrapping;
    HL.materials.land.map.wrapT = THREE.RepeatWrapping;

    HL.materials.land.map.repeat.set( HLG.worldtiles, 1 );

    HL.materials.sea = new THREE.MeshBasicMaterial({
      color: HLC.sea,
      fog: true,
      wireframe: false,
      wireframeLinewidth: 2,
      // opacity: 0.8,
      // transparent:true,
      // blending: THREE.AdditiveBlending,
      map: new THREE.TextureLoader().load( "img/blur-400x400.png" ),
    });
    HL.materials.sea.map.wrapS = THREE.RepeatWrapping;
    HL.materials.sea.map.wrapT = THREE.RepeatWrapping;
    HL.materials.sea.map.repeat.set( 1, HLG.worldtiles*2 );

    HL.materials.clouds = new THREE.PointsMaterial({
      color: HLC.white,
      opacity: 0.2,
      transparent: true,
      size: 50,
      fog: false,
      sizeAttenuation: true,
      //alphaTest: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: new THREE.TextureLoader().load( "img/blur-400x400.png" ),

    });

    HL.materials.flora = new THREE.PointsMaterial({
      color: HLC.white,
      opacity: 1,
      transparent: false,
      size: 10,
      fog: true,
      sizeAttenuation: true
    });

    HL.materials.fauna = new THREE.PointsMaterial({
      color: HLC.white,
      opacity: 1,
      transparent: false,
      size: 20,
      fog: true,
      sizeAttenuation: true
    });

  }

  function initMeshes(){
    HL.sky = new THREE.Mesh(HL.geometries.sky, HL.materials.sky);
  //  HL.scene.add(HL.sky);

    HL.land = new THREE.Mesh(HL.geometries.land, HL.materials.land);
    HL.scene.add(HL.land);

    HL.sea = new THREE.Mesh(HL.geometries.sea, HL.materials.sea);
    HL.scene.add(HL.sea);

    HL.clouds = new THREE.Points(HL.geometries.clouds, HL.materials.clouds);
    HL.scene.add(HL.clouds);

    HL.flora = new THREE.Points(HL.geometries.flora, HL.materials.flora);
  //  HL.scene.add(HL.flora);

    HL.fauna = new THREE.Points(HL.geometries.fauna, HL.materials.fauna);
//    HL.scene.add(HL.fauna);
  }





  return {
    init:init
  }
}();