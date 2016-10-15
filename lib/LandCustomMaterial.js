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
      "withCenterPath"  : {type:"b", value: false},
      "map" : {type:"t", value: null },
      "repeatUV" : {type:"v2", value: new THREE.Vector2(1,1) },
      "color" : { type: "c", value: new THREE.Color( 0x00FF00 ) },
      "worldColor" : {type:"c", value: new THREE.Color( 0xffffff ) },
      "natural" : {value: 1},
      "rainbow" : {value: 0},
      "bFactor" : { type: "f", value: 0.5 },
      "cFactor" : { type: "f", value: 0.15 },
      "squareness" : {value: 0.0001},
    }]),

	vertexShader:
  noise25d+
  //noise3d+
  [ "\n",
  THREE.ShaderChunk['common'],
    "varying highp vec2 vUv;",
    "varying float advanceUV;",
    "varying vec3 noiseColor;",
    "varying vec3 vNormal;",

    "uniform vec2 repeatUV;",

    "uniform float worldWidth;",
    "uniform float worldTiles;",
    "uniform float advance;",
    "uniform float noiseFreq;",
    "uniform float noiseFreq2;",
    "uniform float buildFreq;",
    "uniform float landHeight;",
    "uniform float landZeroPoint;",
    "uniform bool withCenterPath;",

    "uniform float bFactor;",
    "uniform float cFactor;",
    "uniform float squareness;",

    "varying float aaa;",
    "varying float bbb;",
    "varying float ccc;",
    "varying float altitude;",
    "varying float altitudeWithCenterPath;",
    "varying vec4 poss;",

    "void main() {",

    "float advanceMod = mod(advance,worldWidth/worldTiles);",
    "float posZ = position.z + advanceMod; ",

    // "aaa = floor( snoise(vec3( (position.x / worldWidth) * 2.0  , ((posZ - advance)/worldWidth) * 2.0   , buildFreq*.5 ) ) /squareness)*squareness;",
    // "bbb = floor( snoise(vec3( (position.x / worldWidth) * 8.0  , ((posZ - advance)/worldWidth) * 8.0   , buildFreq*.5 ) ) /squareness)*squareness;",//1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / worldWidth;",
    // "ccc = floor( snoise(vec3( (position.x / worldWidth) * 100.0, ((posZ - advance)/worldWidth) * 100.0 , 100.0        ) ) /squareness)*squareness;",//1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / worldWidth;",

    "aaa =  snoise(vec3( (position.x / worldWidth) * 1.8  , ((posZ - advance)/worldWidth) * 1.8   , buildFreq*.120 ) ) ;",
    "float nBbb =  snoise(vec3( (position.x / worldWidth) * 8.0  , ((posZ - advance)/worldWidth) * 8.0   , buildFreq*.125  ) ) ;",//1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / worldWidth;",
    "float nCcc =  snoise(vec3( (position.x / worldWidth) * 50.0, ((posZ - advance)/worldWidth) * 50.0 , buildFreq*0.5+100.0) ) ;",//1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / worldWidth;",


    "ccc = 1.0 - ccc;",
    "bbb = nBbb * clamp(bFactor,0.0,1.0) ; ",
    "ccc = nCcc * clamp(cFactor,0.0,1.0) ; ",


    "float centerPath = abs(position.x/worldWidth*0.5);",
    //ease
    " centerPath = centerPath * (2.5-centerPath) * 2.5;",

    "float posY = (aaa + bbb*0.3 + ccc*0.3) * (1.0/(1.0+bFactor+cFactor));",
    // base altitude
    "altitude = posY;",// / (poss.y<0.0?0.4:2.0) );",
    //centerPath calculations
    "posY *= withCenterPath?(posY>0.0?centerPath:1.0):1.0;",

    //add squareness calculations
    "posY = floor(posY/squareness)*squareness;",
    "posY += landZeroPoint/landHeight;",
    "altitudeWithCenterPath = posY;",// / (poss.y<0.0?0.4:2.0) );",

    //multiply normalized posY per landHeight
    "posY *= landHeight;",




    // "+ bbb * landHeight * 0.1 ",
    // "+ ccc * landHeight * 0.1; ",
    "poss = projectionMatrix * modelViewMatrix * ",
    "vec4( vec3(position.x, posY , posZ ) ,1.0);",

    "gl_Position = poss; ",


        "advanceUV = (advance-advanceMod)/worldWidth;",
        "vUv = ( uv + vec2(0,advanceUV)) * repeatUV;",

  //  "poss = vec4( vec3(position.x, posY+10.0, posZ ) ,1.0);",
  //  "bbb = (bbb+1.0)/2.0;",
  //  "aaa = (aaa+1.0)/2.0;",
    //"aaa = floor(advanceMod/(worldWidth/worldTiles)+0.1);",
    "noiseColor = vec3(", //vec3(nBbb*aaa-nCcc, nCcc, nCcc*nBbb) ;",

      ".4 + snoise( vec3( (uv.x) *worldTiles/50.0, (uv.y+advanceUV) * worldTiles/50.0, noiseFreq2*1.1 ))* .7 ,",
      ".4 + snoise( vec3( (uv.x) *worldTiles/50.0, (uv.y+advanceUV) * worldTiles/50.0, noiseFreq2*1.05 ))* .7 ,",
      ".4 + snoise( vec3( (uv.x) *worldTiles/50.0, (uv.y+advanceUV) * worldTiles/50.0, noiseFreq2     ))* .7 ) ;",
      // "vec3(aaa,bbb,ccc);",




    //altitude is -1,1 from minimum depression to maximum heitht
    // "vec4 tempNorm = gl_Position*viewMatrix;",

    "}"].join("\n"),

  fragmentShader:
  noise25d+
  ["\n",

  THREE.ShaderChunk['common'],
  THREE.ShaderChunk['fog_pars_fragment'],


    "varying highp vec2 vUv;",
    "varying float advanceUV;",
    "varying vec3 noiseColor;",
    "varying vec3 nNormal;",
    "varying vec3 vNormal;",

    "varying float bbb;",
    "varying float aaa;",
    "varying float ccc;",
    "varying float altitude;",
    "varying float altitudeWithCenterPath;",
    "varying vec4 poss;",

    "uniform vec3 color;",


    "uniform float worldWidth;",
    "uniform float worldTiles;",
    "uniform float advance;",
    "uniform float noiseFreq;",
    // "uniform float buildFreq;",
    "uniform float noiseFreq2;",
    "uniform float landHeight;",
    "uniform float landZeroPoint;",

    "uniform sampler2D map;",
    "uniform float natural;",
    "uniform float rainbow;",
    "uniform vec3 worldColor;",

    "void main() {",
  // " float ccc = snoise(vec3( (poss.x )  * .025, (poss.z - advance)  * .025,  10.0) )*.02;",//1.0-distance( vec2(0,0), vec2(position.x,position.z+advanceMod) ) / worldWidth;",
    "vec4 diffuseColor = vec4(color,1.0);",
    "#ifdef TEXTURED",
    "vec4 texelColor = texture2D( map, vUv );",
  //  " texelColor = mapTexelToLinear( texelColor );",
    " diffuseColor *= texelColor;",
    "#endif",

  //  "gl_FragColor = vec4(diffuseColor*bbb*0.5 - vec3(1.0 - aaa - ccc*0.5),1.0);",
    // "gl_FragColor = vec4(vUv.xxx,1.0);",
    //"gl_FragColor = vec4(vec3(aaa),1.0);",



    // "gl_FragColor = vec4(diffuseColor.rgb - vec3(1.0 - aaa - ccc*0.5),diffuseColor.a);",
    //
    // "gl_FragColor = vec4(diffuseColor.rgb - vec3(1.0 - aaa - ccc*0.5) - vec3(bbb*0.5) , diffuseColor.a);",
    // "gl_FragColor = vec4((diffuseColor.rgb - vec3(1.0 - aaa - ccc*0.25)) * zzz , diffuseColor.a);",
    // "gl_FragColor = vec4( diffuseColor.rgb * vec3(bbb,aaa,ccc) - vec3(1.0 - aaa - ccc*0.5) + vec3(0.25*(1.0-zzz)) - zzz , zzz);",
    // "gl_FragColor = vec4( vec3(zzz) , diffuseColor.a);",

    // TODO decide if using AAA or ALTITUDE for sea depth.
    "float seaDepth = pow( min(altitude+1.0, 1.0), 3.0)  ;",
     "float seashore = pow(1.0-abs(altitudeWithCenterPath),40.0);",
  //  "float seashore = max( (1.0-abs(altitude)-0.93)*12.0, 0.0);",

    // "gl_FragColor = vec4( (diffuseColor.rgb + (1.0-seaDepth)*1.2*color ) * min(seaDepth * 2.0 , 1.0), diffuseColor.a);",
    // "gl_FragColor.rgb += seashore * 0.2;",
    // "gl_FragColor.rgb *=  altitude>0.0?(bbb*0.5+0.75):1.0;",
    // "gl_FragColor.rgb *=  altitude>0.0?(ccc*0.5+0.75):1.0;",

    // "gl_FragColor = vec4( (color.rgb + (1.0-seaDepth)*1.2*color ) * min(seaDepth * 2.0 , 1.0), 1.0);",
    //

    // "gl_FragColor.rgb *= altitude+1.0;",
    // "gl_FragColor.rgb *=  (altitude>0.0?(bbb*1.0+0.6):1.0);",
    // "gl_FragColor.rgb *=  (altitude>0.0?(ccc*1.6+0.5):1.0);",

    "float peaks = clamp(",
    "  (altitude+1.0) * ",
    "  (altitude>0.0?(bbb*1.0+0.5):1.0) *",
    "  (altitude>0.0?(ccc*1.0+0.5):1.0) ",
    " ,0.0,1.0);",
    //"gl_FragColor.rgb = mix(gl_FragColor.rgb,noiseColor,rainbow);",

    "gl_FragColor.rgb = diffuseColor.rgb;",//" * (0.8+worldColor*0.2);",
    "gl_FragColor.rgb *= 1.0-natural+peaks*natural;",
    "gl_FragColor.rgb *= 1.0-rainbow+noiseColor*rainbow;",

    //
    // "float peaks = (altitude+2.0)*0.5 * altitude>0.0?(bbb*1.0+0.6):1.0 * altitude>0.0?(ccc*1.6+0.5):1.0;",
    //
    // "gl_FragColor.rgb *= peaks;",

    // "gl_FragColor.rgb +=  vec3(",
    // "snoise( vec3( vUv.x*0.01, (vUv.y+advanceUV)*0.01, 1.0  ) ) , ",
    // "snoise( vec3( vUv.x*0.02, (vUv.y+advanceUV)*0.03, 1.0  ) ) , ",
    // "snoise( vec3( vUv.x*0.01, (vUv.y+advanceUV)*0.01, 1.0  ) )   );",

    // "gl_FragColor.rgb =  vec3(bbb*1.0+0.6);",
    "gl_FragColor *= seaDepth*seaDepth;",

    "gl_FragColor.rgb = gl_FragColor.rgb - seashore*worldColor*peaks*natural;",

    THREE.ShaderChunk['fog_fragment'],
		"}"].join("\n")
};



THREE.LandShaderMaterial = function(_worldWidth,_worldTiles, options){
  options = options || {};
  var s = this;

this.material = new THREE.ShaderMaterial( {
//  wireframe:true,
  fragmentShader: LandMat.fragmentShader,
  vertexShader: LandMat.vertexShader,
  uniforms: THREE.UniformsUtils.clone( LandMat.uniforms ),
  wireframe: options.wireframe||false,
  fog: options.fog|| false,
  side: options.side||THREE.FrontSide,
} );

this.material.uniforms.worldWidth.value = _worldWidth;
this.material.uniforms.worldTiles.value = _worldTiles;
this.material.uniforms.withCenterPath.value = options.centerPath || false;

if(options.map!=null && options.map!==undefined){
  this.material.defines.TEXTURED = true;
  this.material.uniforms.map.value = options.map;
  if(options.repeatUV!==undefined){
    this.material.uniforms.repeatUV.value = options.repeatUV;
    this.material.uniforms.map.value.wrapS = THREE.RepeatWrapping;
    this.material.uniforms.map.value.wrapT = THREE.RepeatWrapping;
  }
}

this.material.uniforms.color.value = options.color || new THREE.Color(0,0,1);
this.material.uniforms.landHeight.value = options.landHeight || 1.0;


return this.material;
}
