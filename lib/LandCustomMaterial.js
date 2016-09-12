var LandMat = {
  //uniforms:{ "baseColor" : { type: "c", value: new THREE.Color(0xff0000)} }
	// uniforms: { "mirrorColor": { type: "c", value: new THREE.Color( 0x7F7F7F ) },
	// 			"mirrorSampler": { type: "t", value: null },
	// 			"textureMatrix" : { type: "m4", value: new THREE.Matrix4() }
	// },
  uniforms: THREE.UniformsUtils.merge( [

		THREE.UniformsLib[ 'common' ],
		THREE.UniformsLib[ 'fog' ],
    {
      "advance" : {type:"f", value: 0},
      "worldWidth" : {type:"f", value: 0},
      "worldTiles" : {type:"f", value: 0},
      "noiseFreq"  : {type:"f", value: 2.0},
      "noiseFreq2"  : {type:"f", value: 2.0},
      "buildFreq"  : {type:"f", value: 50.0},
      "landHeight"  : {type:"f", value: 1.0},
      "landZeroPoint"  : {type:"f", value: 1.0},
      "map" : {type:"t", value: null },
      "repeatUV" : {type:"v2", value: new THREE.Vector2(1.0,1.0) },
      "diffuse" : { type: "c", value: new THREE.Color( 0x00FF00 ) },
      "cFactor" : { type: "f", value: 0.5 },
      "dFactor" : { type: "f", value: 0.15 },
      "squareness" : {value: 1.000001},
    }]),

	vertexShader:
  noise3d+[ "\n",
  THREE.ShaderChunk['common'],
    "varying highp vec2 vUv;",
    "uniform vec2 repeatUV;",

    "uniform float worldWidth;",
    "uniform float worldTiles;",
    "uniform float advance;",
    "uniform float noiseFreq;",
    "uniform float noiseFreq2;",
    "uniform float buildFreq;",
    "uniform float landHeight;",
    "uniform float landZeroPoint;",

    "uniform float cFactor;",
    "uniform float dFactor;",
    "uniform float squareness;",

    "varying float ccc;",
    "varying float aaa;",
    "varying float ddd;",
    "varying float altitude;",
    "varying vec4 poss;",

    "void main() {",

    "float advanceMod = mod(advance,worldWidth/worldTiles);",
    "float posZ = position.z + advanceMod; ",
    // "squareness+=0.0007;",
    // "aaa = (floor(snoise(vec3( (position.x / worldWidth) * 2.0  , ((posZ - advance)/worldWidth) * 2.0, buildFreq*.5 ) )/0.0007)*0.0007);",
    // "ccc = (floor( snoise(vec3( (position.x / worldWidth) * 10.0, (posZ - advance)/worldWidth * 10.0,  buildFreq*.5) ) / 0.0007)*0.0007);",//1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / worldWidth;",
    // "ddd = (floor( snoise(vec3( (position.x / worldWidth) * 100.0, (posZ - advance)/worldWidth * 100.0,  100.0) ) / 0.0007)*0.0007);",//1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / worldWidth;",
    "aaa = snoise(vec3( (position.x / worldWidth) * 2.0  , ((posZ - advance)/worldWidth) * 2.0   , buildFreq*.5 ) ) ;",
    "ccc = snoise(vec3( (position.x / worldWidth) * 8.0  , ((posZ - advance)/worldWidth) * 8.0   , buildFreq*.5 ) ) ;",//1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / worldWidth;",
    "ddd = snoise(vec3( (position.x / worldWidth) * 100.0, ((posZ - advance)/worldWidth) * 100.0 , 100.0        ) ) ;",//1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / worldWidth;",

    "ccc *= max( min(cFactor,1.0),0.0) ; ",
    "ddd *= max( min(dFactor,1.0),0.0) ; ",
    "float posY = (aaa + ccc + ddd) * (1.0/(1.0+cFactor+dFactor))",
    "* landHeight;",
    // "+ ccc * landHeight * 0.1 ",
    // "+ ddd * landHeight * 0.1; ",
    "float centerPath = abs(position.x/worldWidth*0.5) * 5.0 ;",
    "poss = projectionMatrix * modelViewMatrix * ",
    "vec4( vec3(position.x, posY, posZ ) ,1.0);",

    "gl_Position = poss; ",

  //  "poss = vec4( vec3(position.x, posY+10.0, posZ ) ,1.0);",
  //  "ccc = (ccc+1.0)/2.0;",
  //  "aaa = (aaa+1.0)/2.0;",
    //"aaa = floor(advanceMod/(worldWidth/worldTiles)+0.1);",

    "vUv = uv * repeatUV;",
    //altitude is -1,1 from minimum depression to maximum heitht
    "altitude = (posY / landHeight) ;",// / (poss.y<0.0?0.4:2.0) );",
    "}"].join("\n"),

  fragmentShader:
  noise3d+["\n",

    "varying highp vec2 vUv;",
    THREE.ShaderChunk['fog_pars_fragment'],

    "varying float ccc;",
    "varying float aaa;",
    "varying float ddd;",
    "varying float altitude;",
    "varying vec4 poss;",

    "uniform vec3 diffuse;",


    "uniform float worldWidth;",
    "uniform float worldTiles;",
    "uniform float advance;",
    "uniform float noiseFreq;",
    // "uniform float buildFreq;",
    "uniform float noiseFreq2;",
    "uniform float landHeight;",
    "uniform float landZeroPoint;",

    "uniform sampler2D map;",

    "void main() {",
  // " float ddd = snoise(vec3( (poss.x )  * .025, (poss.z - advance)  * .025,  10.0) )*.02;",//1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / worldWidth;",
    "vec4 diffuseColor = vec4(diffuse,1.0);",
    "#ifdef TEXTURED",
    "vec4 texelColor = texture2D( map, vUv );",
  //  " texelColor = mapTexelToLinear( texelColor );",
    " diffuseColor *= texelColor;",
    "#endif",

  //  "gl_FragColor = vec4(diffuseColor*ccc*0.5 - vec3(1.0 - aaa - ddd*0.5),1.0);",
    // "gl_FragColor = vec4(vUv.xxx,1.0);",
    //"gl_FragColor = vec4(vec3(aaa),1.0);",



    // "gl_FragColor = vec4(diffuseColor.rgb - vec3(1.0 - aaa - ddd*0.5),diffuseColor.a);",
    //
    // "gl_FragColor = vec4(diffuseColor.rgb - vec3(1.0 - aaa - ddd*0.5) - vec3(ccc*0.5) , diffuseColor.a);",
    // "gl_FragColor = vec4((diffuseColor.rgb - vec3(1.0 - aaa - ddd*0.25)) * zzz , diffuseColor.a);",
    // "gl_FragColor = vec4( diffuseColor.rgb * vec3(ccc,aaa,ddd) - vec3(1.0 - aaa - ddd*0.5) + vec3(0.25*(1.0-zzz)) - zzz , zzz);",
    // "gl_FragColor = vec4( vec3(zzz) , diffuseColor.a);",

    // TODO decide if using AAA or ALTITUDE for sea depth.
    "float seaDepth = pow( min(altitude+1.0, 1.0), 8.0)  ;",
     "float seashore = pow(1.0-abs(altitude),14.0);",
  //  "float seashore = max( (1.0-abs(altitude)-0.93)*12.0, 0.0);",

    "gl_FragColor = vec4( (diffuseColor.rgb + (1.0-seaDepth)*1.2*diffuse ) * min(seaDepth * 2.0 , 1.0), diffuseColor.a);",
    "gl_FragColor.rgb += seashore * 0.2;",
    "gl_FragColor.rgb *=  altitude>0.0?(ccc*0.5+0.75):1.0;",
    "gl_FragColor.rgb *=  altitude>0.0?(ddd*0.5+0.75):1.0;",

    THREE.ShaderChunk['fog_fragment'],
		"}"].join("\n")
};



THREE.LandShaderMaterial = function(_worldWidth,_worldTiles, options){
  options = options || {};

this.material = new THREE.ShaderMaterial( {
//  wireframe:true,
  fragmentShader: LandMat.fragmentShader,
  vertexShader: LandMat.vertexShader,
  uniforms: THREE.UniformsUtils.clone( LandMat.uniforms ),
  wireframe: options.wireframe||false,
  fog: options.fog|| false,
} );

this.material.uniforms.worldWidth.value = _worldWidth;
this.material.uniforms.worldTiles.value = _worldTiles;
if(options.map!=null && options.map!==undefined){
  this.material.defines.TEXTURED = true;
  this.material.uniforms.map.value = options.map;
  if(options.repeatUV!==undefined){
    this.material.uniforms.repeatUV.value = options.repeatUV;
    this.material.uniforms.map.value.wrapS = THREE.RepeatWrapping;
    this.material.uniforms.map.value.wrapT = THREE.RepeatWrapping;
  }
}

this.material.uniforms.diffuse.value = options.color || new THREE.Color(0,0,1);
this.material.uniforms.landHeight.value = options.landHeight || 1.0;


return this.material;
}
