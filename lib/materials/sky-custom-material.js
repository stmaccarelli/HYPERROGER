THREE.SkyShaderMaterial = function(options) {
	options = options || {};

	this.skyMat = {

		uniforms: THREE.UniformsUtils.merge([

			THREE.UniformsLib['common'], {
				map1: {
					type: "t",
					value: null
				},
				map2: {
					type: "t",
					value: null
				},
				map3: {
					type: "t",
					value: null
				},
				mixFactor: {
					type: "f",
					value: null
				},
				color : { type: "c", value: new THREE.Color( 0x00FF00 ) }

			}
		]),

		vertexShader: THREE.ShaderChunk['common'] +
			`
			varying highp vec2 vUv;
			uniform float mixFactor;

      void main() {
				vUv = uv ;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
      }
      `,

		fragmentShader: THREE.ShaderChunk['common'] +
			`
      uniform sampler2D map1;
      uniform sampler2D map2;
      uniform sampler2D map3;
      uniform float mixFactor;
			uniform vec3 color;
			varying highp vec2 vUv;


      void main() {
    //  #ifdef TEXTURED
      vec4 texelColor1 = texture2D( map1, vUv + vec2( mixFactor * 2.0 , .0 ) );
      vec4 texelColor2 = texture2D( map2, vUv + vec2( mixFactor * 3.0 , .0 ) );
      vec4 texelColor3 = texture2D( map3, vUv + vec2( mixFactor * 1.0 , .0 ) );
			float luma = length(color.rgb);
      vec3 texelColor = (texelColor1.rgb + texelColor2.rgb + texelColor3.rgb) * 0.34;


      gl_FragColor = vec4(texelColor.rgb * color.rgb, 1.0);
		}
      `
	};


	this.material = new THREE.ShaderMaterial({
		//  wireframe:true,
		fragmentShader: this.skyMat.fragmentShader,
		vertexShader: this.skyMat.vertexShader,
		uniforms: THREE.UniformsUtils.clone(this.skyMat.uniforms),
		wireframe: options.wireframe || false,
		fog: false,
		side: options.side || THREE.BackSide,
	});


	this.material.uniforms.color.value = options.color || new THREE.Color(0, 0, 1);
	this.material.uniforms.mixFactor.value = options.mixFactor || 0.5;
	this.material.uniforms.map1.value = options.map1 || null;
	this.material.uniforms.map2.value = options.map2 || null;
	this.material.uniforms.map3.value = options.map3 || null;


	return this.material;
}
