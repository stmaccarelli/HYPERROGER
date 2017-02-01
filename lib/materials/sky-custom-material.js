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
      vec4 diffuseColor = vec4(color,1.0);
			vec4 stripes = cos( diffuseColor * viewMatrix * vUv.xyxy * PI)*0.1;
    //  #ifdef TEXTURED
      vec4 texelColor1 = texture2D( map1, vUv );
      vec4 texelColor2 = texture2D( map2, vUv );
      vec4 texelColor3 = texture2D( map3, vUv );
      vec4 texelColor =
				texelColor1 * (1.0 - mixFactor) +
				texelColor2 * mixFactor ;

			texelColor = mix(texelColor, texelColor3, mixFactor*mixFactor*mixFactor*mixFactor*mixFactor);

       texelColor = mapTexelToLinear( texelColor );
      //    #endif
      gl_FragColor = vec4(diffuseColor.rgb * texelColor.rgb , 1.0);
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
