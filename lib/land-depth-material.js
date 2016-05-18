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
    // "varying float vDensity;",

    "float rand(vec2 co){",
    "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);}",
    "void main() {",
    // Volumetric fog per vertex
// "vec3 worldPos = (modelMatrix * vec4(position,1.0)).xyz;",
//
// "vec3 diff = cameraPosition - worldPos;",
// "float factor = length(diff) / abs(diff.y);",
// "vec2 depths = (-vec2(worldPos.y, cameraPosition.y) + 0.0) * 0.5;",
// "vDensity = abs(exp(depths.x) - exp(depths.y)) * factor * .0005;",

    "gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);",
//    "depthFactor = ((position.y / (landHeight+1.0) * 2.0) * 0.5 + 1.0);",
    "depthFactor = 1.0-abs(position.y / landHeight) + rand(position.xy)*0.05;",
  // "if(depthFactor<0.99)depthFactor*=depthFactor;",
  // "depthFactor=clamp(depthFactor,0.0,1.0);",
    "}"].join("\n"),

  fragmentShader: ["\n",
    THREE.ShaderChunk[ "common" ],
    THREE.ShaderChunk[ "fog_pars_fragment" ],
    "uniform vec3 color;",
    "uniform vec3 waterColor;",
    "varying float depthFactor;",
    // "varying float vDensity;",
    "void main() {",
    "gl_FragColor = vec4(depthFactor*color,1.0);",
    THREE.ShaderChunk[ "fog_fragment" ],
		"}"].join("\n")
};

THREE.LandDepthMaterial = function(options){

  options = options || {};

  this.color = options.color !== undefined ? options.color : 0x7F7F7F;
  this.waterColor = options.waterColor !== undefined ? options.waterColor : 0x000000;
  this.wireframe = options.wireframe !== undefined ? options.wireframe : false;
  this.fog = options.fog !== undefined ? options.fog : false;


this.material = new THREE.ShaderMaterial( {
  fragmentShader: LandDepthMat.fragmentShader,
  vertexShader: LandDepthMat.vertexShader,
  uniforms: THREE.UniformsUtils.clone( LandDepthMat.uniforms ),
  fog:this.fog,
  wireframe:this.wireframe,
} );

this.material.uniforms.color.value = new THREE.Color(this.color);
this.material.uniforms.waterColor.value = new THREE.Color(this.waterColor);
this.material.uniforms.landHeight.value = options.landHeight !== undefined ? options.landHeight : 1.0;
// this.material.uniforms.worldTiles.value = _worldTiles;

return this.material;
}
