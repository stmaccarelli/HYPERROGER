var LandMat = {
  //uniforms:{ baseColor : { type: c, value: new THREE.Color(0xff0000)} }
	// uniforms: { mirrorColor: { type: c, value: new THREE.Color( 0x7F7F7F ) },
	// 			mirrorSampler: { type: t, value: null },
	// 			textureMatrix : { type: m4, value: new THREE.Matrix4() }
	// },
  uniforms: THREE.UniformsUtils.merge( [

		// THREE.UniformsLib[ 'common' ],
		THREE.UniformsLib[ 'fog' ],
    {
      advance : {type:"f", value: 0},
      landMotion : {type:"v3", value: new THREE.Vector3(0,0,0) },
      worldWidth : {type:"f", value: 0},
      worldTiles : {type:"f", value: 0},
      noiseFreq  : {type:"f", value: 2.0},
      noiseFreq2  : {type:"f", value: 2.0},
      buildFreq  : {type:"f", value: 50.0},
      landHeight  : {type:"f", value: 1.0},
      landZeroPoint  : {type:"f", value: 1.0},
      withCenterPath  : {type:"b", value: false},
      map : {type:"t", value: null },
      map2 : {type:"t", value: null },
      repeatUV : {type:"v2", value: new THREE.Vector2(1,1) },
      color : { type: "c", value: new THREE.Color( 0x00FF00 ) },
      worldColor : {type: "c", value: new THREE.Color( 0x00ff00 ) },
      skyColor : {type: "c", value: new THREE.Color( 0x0000ff ) },
      natural : {value: 1},
      rainbow : {value: 0},
      bFactor : { type: "f", value: 0.5 },
      cFactor : { type: "f", value: 0.15 },
      squareness : {value: 0.0001},
    }]),

	vertexShader:
  fastGLSLNoise+
  // THREE.ShaderChunk['common']+
  THREE.ShaderChunk['fog_pars_vertex']+

  `
    varying highp vec2 vUv;
    varying vec3 noiseColor;

    uniform vec2 repeatUV;

    uniform float worldWidth;
    uniform float worldTiles;
    uniform float advance;
    uniform vec3 landMotion;
    uniform float noiseFreq;
    uniform float noiseFreq2;
    uniform float buildFreq;
    uniform float landHeight;
    uniform float landZeroPoint;
    uniform bool withCenterPath;

    uniform float bFactor;
    uniform float cFactor;
    uniform float squareness;

    varying float bbb;
    varying float ccc;
    varying float altitude;
    varying float altitudeWithCenterPath;
    varying float noises[5];

    vec2 advanceUV;

    void main() {

      vec2 advanceMod = vec2(
        mod(landMotion.x,worldWidth/worldTiles),
        mod(landMotion.z,worldWidth/worldTiles)
      );

      vec3 nPos = position;// + vec3(advanceMod,0,advanceMod);

      nPos.x+=advanceMod.x;
      nPos.z+=advanceMod.y;

      // parametric terrain fBM - like

      vec3 mPos = vec3((nPos.x - landMotion.x ) / worldWidth, (nPos.z  - landMotion.z )/worldWidth, buildFreq);

      noises[0] = fnoise( mPos * 1.8  ) ;
      noises[1] = fnoise( mPos * 8.0  ) ;
      noises[2] = fnoise( mPos * 50.0 ) ;

      noises[3] = fnoise( mPos * 0.8  ) ;
      noises[4] = fnoise( mPos * 0.28 ) ;

    //  noises[5] = fnoise( mPos * 400.28 ) ;

      vec2 factors = clamp( vec2(
        bFactor * .7 + (noises[3]-0.5) *.3,
        cFactor * .7 + (noises[4]-0.5) *.3), 0.0,1.0
      );


    //  ccc = 1.0 - ccc;
     bbb = noises[1] * factors.x;
     ccc = noises[2] * factors.y;


    //float centerPath = abs(position.x/worldWidth*0.5);
    //ease
  //   centerPath = centerPath * (2.5-centerPath) * 2.5;

    // if ABS bb e ccc got peaks
    nPos.y = (noises[0] + (bbb)*0.5 + (ccc)*0.5) * (1.0/(1.0+factors.x+factors.y));
    // nPos.y = noises[0] * noises[1] * noises[2];// * noises[3] * noises[4];// * noises[5];
    // base altitude
    altitude = nPos.y;
    //centerPath calculations
    //nPos.y *= withCenterPath?(nPos.y>0.0?centerPath:1.0):1.0;

    //add squareness calculations
    nPos.y = floor(nPos.y/squareness)*squareness;
    nPos.y += landZeroPoint/landHeight;
    altitudeWithCenterPath = nPos.y;

    //multiply normalized nPos.y per landHeight
    nPos.y *= landHeight;


    gl_Position = projectionMatrix * modelViewMatrix * vec4( nPos ,1.0);

    advanceUV = (landMotion.xz - advanceMod)/worldWidth;
    vUv = vec2( uv.x - advanceUV.x, uv.y + advanceUV.y ) * repeatUV;


    // noiseColor = vec3 ( noises[3]*0.9, noises[3]*1.3, noises[3]*0.8);
//
    noiseColor = vec3( //vec3(noises[1]*noises[0]-noises[2], noises[2], noises[2]*noises[1]) ;
//    .4 + fnoise( vec3( (vUv.x) *worldTiles/50.0, (vUv.y) * worldTiles/50.0, noiseFreq2*1.05 ))* .7 ,

      .3 + fnoise( vec3( (vUv.x) *0.15 , (vUv.y) *0.05, noiseFreq2 * 2.1  ))* .7 ,
      .3 + fnoise( vec3( (vUv.x) *0.05 , (vUv.y) *0.055, noiseFreq2 * 1.05 ))* .7 ,
      .3 + fnoise( vec3( (vUv.x) *0.06 , (vUv.y) *0.069, noiseFreq2        ))* .7 ) * 1.0  ;

      // vec3(noises[0],bbb,ccc);




    //altitude is -1,1 from minimum depression to maximum heitht
    // vec4 tempNorm = gl_Position*viewMatrix;

    // custom fog_vertex chunk because of a lack of mvPosition;
    // fogDepth = -mvPosition.z;

    #ifdef USE_FOG
    vec4 mvPosition = modelViewMatrix * vec4( nPos, 1.0);
    fogDepth = -mvPosition.z;
    #endif

    }
    `,

  fragmentShader:
  // fastGLSLNoise+
  // THREE.ShaderChunk['common']+
  THREE.ShaderChunk['fog_pars_fragment']+
  `

    varying highp vec2 vUv;
    varying vec3 noiseColor;
    varying vec3 nNormal;

    varying float bbb;
    varying float noises[5];
    varying float ccc;
    varying float altitude;
    varying float altitudeWithCenterPath;

    uniform vec3 color;


    uniform float worldWidth;
    uniform float worldTiles;
    uniform float advance;
    uniform float noiseFreq;
    // uniform float buildFreq;
    uniform float noiseFreq2;
    uniform float landHeight;
    uniform float landZeroPoint;
    uniform vec3 landMotion;


    uniform sampler2D map;
    uniform sampler2D map2;
    uniform float natural;
    uniform float rainbow;
    uniform vec3 worldColor;
    uniform vec3 skyColor;

    void main() {
    vec4 diffuseColor = vec4(color,1.0);
    #ifdef TEXTURED
    vec4 texelColor1 = texture2D( map, vUv );
    //  texelColor1 = mapTexelToLinear( texelColor1 );
    vec4 texelColor2 = texture2D( map2, vUv );
    //  texelColor2 = mapTexelToLinear( texelColor2 );
    float mixA = noises[3]*0.5+0.5;
    vec4 texelColor = mix(texelColor1, texelColor2, mixA);//  * texelColor2;
     texelColor = mapTexelToLinear( texelColor );

    diffuseColor *= texelColor;
    #endif

  //  gl_FragColor = vec4(diffuseColor*bbb*0.5 - vec3(1.0 - noises[0] - ccc*0.5),1.0);
    // gl_FragColor = vec4(vUv.xxx,1.0);
    //gl_FragColor = vec4(vec3(noises[0]),1.0);



    // gl_FragColor = vec4(diffuseColor.rgb - vec3(1.0 - noises[0] - ccc*0.5),diffuseColor.a);
    //
    // gl_FragColor = vec4(diffuseColor.rgb - vec3(1.0 - noises[0] - ccc*0.5) - vec3(bbb*0.5) , diffuseColor.a);
    // gl_FragColor = vec4((diffuseColor.rgb - vec3(1.0 - noises[0] - ccc*0.25)) * zzz , diffuseColor.a);
    // gl_FragColor = vec4( diffuseColor.rgb * vec3(bbb,noises[0],ccc) - vec3(1.0 - noises[0] - ccc*0.5) + vec3(0.25*(1.0-zzz)) - zzz , zzz);
    // gl_FragColor = vec4( vec3(zzz) , diffuseColor.a);

    // TODO decide if using noises[0] or ALTITUDE for sea depth.
    float seaDepth = pow( min(altitude+1.0, 1.0), 3.0)  ;
     float seaShore = pow(1.0-abs(altitudeWithCenterPath),10.0);
  //  float seashore = max( (1.0-abs(altitude)-0.93)*12.0, 0.0);

    // gl_FragColor = vec4( (diffuseColor.rgb + (1.0-seaDepth)*1.2*color ) * min(seaDepth * 2.0 , 1.0), diffuseColor.a);
    // gl_FragColor.rgb += seashore * 0.2;
    // gl_FragColor.rgb *=  altitude>0.0?(bbb*0.5+0.75):1.0;
    // gl_FragColor.rgb *=  altitude>0.0?(ccc*0.5+0.75):1.0;

    // gl_FragColor = vec4( (color.rgb + (1.0-seaDepth)*1.2*color ) * min(seaDepth * 2.0 , 1.0), 1.0);
    //

    // gl_FragColor.rgb *= altitude+1.0;
    // gl_FragColor.rgb *=  (altitude>0.0?(bbb*1.0+0.6):1.0);
    // gl_FragColor.rgb *=  (altitude>0.0?(ccc*1.6+0.5):1.0);

    float zeroPoint = -landZeroPoint/landHeight;

//     float peaks = clamp(
//       (altitude+1.0) *
//         // *
//       abs(pow(ccc*bbb,2.0))+0.5
//       //  *
//       // (altitude>zeroPoint?(ccc*1.0+0.5)*2.0:1.0)
//      ,0.0,1.0);
//     //gl_FragColor.rgb = mix(gl_FragColor.rgb,noiseColor,rainbow);
// // peaks = altitude;
    gl_FragColor.rgb = diffuseColor.rgb * clamp(0.3 + skyColor.rgb*2.5,0.0,2.0);

    //seaBottom

     gl_FragColor.rgb *= vec3(1.0) - vec3( 0.85 - ( ccc + 0.46)  ) ;
    //  gl_FragColor.rgb *= 1.0 - rainbow + noiseColor*rainbow;
     gl_FragColor.rgb *= 1.0 - rainbow + noiseColor * clamp(rainbow,0.5,1.0) ;

    gl_FragColor.rgb += seaShore*0.25 ;

  //  gl_FragColor.rgb *= (1. + seaShore * vec3(0.8, 1.0, 1.2) ) ;

    // gl_FragColor.rgb *= (1.0-natural);
    // gl_FragColor.rgb -= vec3( ( 0.5 - ( bbb + .125)*2.0 )  );
  //  gl_FragColor.rgb -= vec3( 0.25 - ( ccc + .125)  ) ;


   gl_FragColor.rgb *= seaDepth * seaDepth;

    gl_FragColor.rgb = clamp(gl_FragColor.rgb,0.0,1.0);

    //
    //  gl_FragColor.rgb = gl_FragColor.rgb - seashore*worldColor*peaks*natural;

    // gl_FragColor.rgb = vec3(noises[3]*0.5+0.5);

    `+THREE.ShaderChunk['fog_fragment']+"}"
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
