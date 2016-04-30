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
    "landHeight"  : {type:"f", value: 1.0},
    "landZeroPoint"  : {type:"f", value: 1.0},

  }]),
	vertexShader:
    [ "\n",
//    "uniform sampler2d map;",
    "uniform float landHeight;",
    "uniform float landZeroPoint;",

    "void main() {",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);",
    "}"].join("\n"),

  fragmentShader: ["\n",
    THREE.ShaderChunk[ "common" ],
    THREE.ShaderChunk[ "fog_pars_fragment" ],
    "uniform vec3 color;",
    "void main() {",
    "gl_FragColor = vec4(color,1.0);",
    THREE.ShaderChunk[ "fog_fragment" ],
		"}"].join("\n")
};

THREE.LandDepthMaterial = function(options){

  options = options || {};

  this.color = options.color !== undefined ? options.color : 0x7F7F7F;


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
// this.material.uniforms.worldTiles.value = _worldTiles;

return this.material;
}
