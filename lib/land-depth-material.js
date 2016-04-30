// TODO: map / texture support
// TODO check landHeight / landZeroPoint correct behaviour

var LandDepthMat = {
  //uniforms:{ "baseColor" : { type: "c", value: new THREE.Color(0xff0000)} }
	// uniforms: { "mirrorColor": { type: "c", value: new THREE.Color( 0x7F7F7F ) },
	// 			"mirrorSampler": { type: "t", value: null },
	// 			"textureMatrix" : { type: "m4", value: new THREE.Matrix4() }
	// },
  uniforms: THREE.UniformsUtils.merge( [
    THREE.UniformsLib[ "fog" ], {
    "map"  : {type:"t", value: null},
    "color": { type: "c", value: null},
    "waterColor": { type: "c", value: null},
    "landHeight"  : {type:"f", value: 1.0},
    "landZeroPoint"  : {type:"f", value: 1.0},

  }]),
	vertexShader:
    [ "\n",
//    "uniform sampler2d map;",
    "uniform float landHeight;",
    "uniform float landZeroPoint;",
    "varying float depthFactor;",
    "void main() {",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);",
    "depthFactor = (position.y / landHeight * 2.0) * 0.5 + 1.0;",
  //  "if(depthFactor>=0.2) depthFactor = 1.0;",
    "}"].join("\n"),

  fragmentShader: ["\n",
    THREE.ShaderChunk[ "common" ],
    THREE.ShaderChunk[ "fog_pars_fragment" ],
    "uniform vec3 color;",
    "uniform vec3 waterColor;",
    "varying float depthFactor;",
    "void main() {",
    "vec3 depthColor =  vec3(depthFactor)*color;",
    // "gl_FragColor = vec4(color*depthFactor,1.0);",
    "gl_FragColor = vec4(depthColor,1.0);",
    THREE.ShaderChunk[ "fog_fragment" ],
		"}"].join("\n")
};

THREE.LandDepthMaterial = function(options){

  options = options || {};

  this.color = options.color !== undefined ? options.color : 0x7F7F7F;
  this.waterColor = options.waterColor !== undefined ? options.waterColor : 0x000000;


  console.log(THREE.UniformsLib);
  console.log(THREE.ShaderChunk);


this.material = new THREE.ShaderMaterial( {
  fragmentShader: LandDepthMat.fragmentShader,
  vertexShader: LandDepthMat.vertexShader,
  uniforms: THREE.UniformsUtils.clone( LandDepthMat.uniforms ),
  fog:true,
  //map:
} );

this.material.uniforms.color.value = new THREE.Color(this.color);
this.material.uniforms.waterColor.value = new THREE.Color(this.waterColor);
// this.material.uniforms.worldTiles.value = _worldTiles;

return this.material;
}
