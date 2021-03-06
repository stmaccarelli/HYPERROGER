/**
 * @author jbouny / https://github.com/jbouny
 *
 * Work based on :
 * @author Slayvin / http://slayvin.net : Flat mirror for three.js
 * @author Stemkoski / http://www.adelphi.edu/~stemkoski : An implementation of water shader based on the flat mirror
 * @author Jonas Wagner / http://29a.ch/ && http://29a.ch/slides/2012/webglwater/ : Water shader explanations in WebGL
 */

 // TODO: BLUR MIRROR SAMPLE on depth or Yaxis depth from mirrora camera.
THREE.ShaderLib['water_hy'] = {
  uniforms: THREE.UniformsUtils.merge( [
    // THREE.UniformsLib[ "common" ],
    THREE.UniformsLib[ "fog" ], {
      "normalSampler":    { type: "t", value: null },
      "mirrorSampler":    { type: "t", value: null },
      "alpha":            { type: "f", value: 0.9 },
      "advance":          { type: "f", value: 0.0 },
      "distortionScale":  { type: "f", value: 20.0 },
      "noiseScale":       { type: "f", value: 1.0 },
      "textureMatrix" :   { type: "m4", value: new THREE.Matrix4() },
      "sunColor":         { type: "c", value: new THREE.Color(0x7F7F7F) },
      "sunDirection":     { type: "v3", value: new THREE.Vector3(0.70707, 0.70707, 0) },
      "eye":              { type: "v3", value: new THREE.Vector3(0, 0, 0) },
      "color":       { type: "c", value: new THREE.Color(0xff2255) },
      "waterReflectivity":{ type: "f", value: 0.75 },
      "blur":{type:"b", value:true},

    }
  ] ),

  vertexShader:[
    // THREE.ShaderChunk['common'],
    THREE.ShaderChunk[ "fog_pars_vertex" ],

    'uniform mat4 textureMatrix;',
    'uniform float advance;',

    'varying vec4 mirrorCoord;',
    'varying vec3 worldPosition;',
    'varying vec3 modelPosition;',
    'varying vec3 surfaceX;',
    'varying vec3 surfaceY;',
    'varying vec3 surfaceZ;',

    'vec2 random2(vec2 st){',
        'st = vec2( dot(st,vec2(127.1,311.7)),',
                  'dot(st,vec2(269.5,183.3)) );',
        'return -1.0 + 2.0*fract(sin(st)*43758.5453123);',
    '}',

    'float noise(vec2 st) {',
        'vec2 i = floor(st);',
        'vec2 f = fract(st);',

        'vec2 u = f*f*(3.0-2.0*f);',

        'return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ),',
                         'dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),',
                    'mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ),',
                         'dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);',
    '}',

    'void main()',
    '{',
    ' vec3 nPos = position + vec3(0.0, 0.0, 1.0); // + vec3(0, 0, noise( (position.xz + advance)*0.21 )*10.0 );',

    '  mirrorCoord = modelMatrix * vec4(nPos, 1.0);',
    '  worldPosition = mirrorCoord.xyz;',
    '  modelPosition = nPos;',
    '  surfaceX = vec3( modelMatrix[0][0], modelMatrix[0][1], modelMatrix[0][2]);',
    '  surfaceY = vec3( modelMatrix[1][0], modelMatrix[1][1], modelMatrix[1][2]);',
    '  surfaceZ = vec3( modelMatrix[2][0], modelMatrix[2][1], modelMatrix[2][2]);',

    '  mirrorCoord = textureMatrix * mirrorCoord;',
    '  gl_Position = projectionMatrix * modelViewMatrix * vec4( nPos, 1.0);',

    '#ifdef USE_FOG',
    'vec4 mvPosition = modelViewMatrix * vec4( nPos, 1.0); ',
    'fogDepth = -mvPosition.z;',
    '#endif',
    '}'
  ].join('\n'),

  fragmentShader: [
    // THREE.ShaderChunk['common'],
    THREE.ShaderChunk[ "fog_pars_fragment" ],

    'uniform sampler2D mirrorSampler;',
    'uniform float alpha;',
    'uniform float advance;',
    'uniform float distortionScale;',
    'uniform float noiseScale;',
    'uniform sampler2D normalSampler;',
    'uniform vec3 sunColor;',
    'uniform vec3 sunDirection;',
    'uniform vec3 eye;',
    'uniform vec3 color;',
    'uniform float waterReflectivity;',
    'uniform bool blur;',

    'varying vec4 mirrorCoord;',
    'varying vec3 worldPosition;',
    'varying vec3 modelPosition;',
    'varying vec3 surfaceX;',
    'varying vec3 surfaceY;',
    'varying vec3 surfaceZ;',

    'void sunLight(const vec3 surfaceNormal, const vec3 eyeDirection, in float shiny, in float spec, in float diffuse, inout vec3 diffuseColor, inout vec3 specularColor)',
    '{',
    '  vec3 reflection = normalize(reflect(-sunDirection, surfaceNormal));',
    '  float direction = max(0.0, dot(eyeDirection, reflection));',
    '  specularColor += pow(direction, shiny) * sunColor * spec;',
    '  diffuseColor += max(dot(sunDirection, surfaceNormal), 0.0) * sunColor * diffuse;',
    '}',

    'vec3 getNoise(in vec2 uv)',
    '{',

    '  vec2 uv0 = uv / (2103.0 * noiseScale) - advance / vec2( 17.0,  29.0);// + vec2(0.0,advance*0.01);',
    '  vec2 uv1 = uv / (2107.0 * noiseScale) - advance / vec2(-19.0,  31.0);// + vec2(0.0,advance*0.01);',
    '  vec2 uv2 = uv / (2111.0 * noiseScale) - advance / vec2( 11.0,  57.0);// + vec2(0.0,advance*0.01);',
    '  vec2 uv3 = uv / (2115.0 * noiseScale) - advance / vec2( 19.0, -23.0);// + vec2(0.0,advance*0.01);',
    '  vec4 noise = ',
    '    texture2D(normalSampler, uv0) +',
    '    texture2D(normalSampler, uv1) +',
    '    texture2D(normalSampler, uv2) +',
    '    texture2D(normalSampler, uv3);',
    '  return (noise.xyz * 0.5 - 1.0) * 0.6;',
    '}',


    'void main()',
    '{',
    '  vec3 worldToEye = eye - worldPosition;',
    '  vec3 eyeDirection = normalize(worldToEye);',

    // Get noise based on the 3d position
    '  vec3 noise = getNoise(modelPosition.xy * 1.5);',
    '  vec3 distordCoord = noise.x * surfaceX + noise.y * surfaceY;',
    '  vec3 distordNormal = (distordCoord + surfaceZ)*1.2;',

    // Revert normal if the eye is bellow the mesh
    '  if(dot(eyeDirection, surfaceZ) < 0.0)',
    '    distordNormal = distordNormal * -1.0;',

    // Compute diffuse and specular light (use normal and eye direction)
    '  vec3 diffuseLight = vec3(0.0);',
    '  vec3 specularLight = vec3(0.0);',
    '  sunLight(distordNormal, eyeDirection, 180.0, 12.0, 0.5, diffuseLight, specularLight);',

    // Compute final 3d distortion, and project it to get the mirror sampling
    '  float distance = length(worldToEye);',
    '  vec2 distortion = distordCoord.xy * distortionScale * sqrt( distance ) * 0.07;',
    '  vec3 mirrorDistord = mirrorCoord.xyz + vec3(distortion.x, distortion.y , 1.0);',
    '  vec3 reflectionSample = texture2DProj(mirrorSampler, mirrorDistord).xyz;',

    // Compute other parameters as the reflectance and the water appareance
    '  float theta = max(dot(eyeDirection, distordNormal), 0.0);',
    '  float reflectance = 0.3 + (1.0 - 0.3) * pow((1.0 - theta), 3.0);',
    '  vec3 scatter = max(0.0, dot(distordNormal, eyeDirection)) * color;',

    'vec3 mirrorFinal;',
    // 'vec3 specularFinal;',

    // blur mirror image
    // 'if(blur){',

    ' vec3 blurSample = texture2DProj(mirrorSampler, mirrorDistord).xyz;',
    ' for(float i=1.0;i<8.0;i+=2.0){',
    // '   blurSample += texture2DProj(mirrorSampler, mirrorDistord+vec3(-1.0*i,-1.1*i,0.0)).xyz;',
    '   blurSample += texture2DProj(mirrorSampler, mirrorDistord+vec3( 0.0  ,-1.0*i,0.0)).xyz;',
    // '   blurSample += texture2DProj(mirrorSampler, mirrorDistord+vec3( 1.0*i,-1.1*i,0.0)).xyz;',

    '   blurSample += texture2DProj(mirrorSampler, mirrorDistord+vec3(-1.0*i, 0.0  ,0.0)).xyz;',
    '   blurSample += texture2DProj(mirrorSampler, mirrorDistord+vec3( 1.0*i, 0.0  ,0.0)).xyz;',

    // '   blurSample += texture2DProj(mirrorSampler, mirrorDistord+vec3(-1.0*i, 1.1*i,0.0)).xyz;',
    '   blurSample += texture2DProj(mirrorSampler, mirrorDistord+vec3( 0.0  , 1.0*i,0.0)).xyz;',
    // '   blurSample += texture2DProj(mirrorSampler, mirrorDistord+vec3( 1.0*i, 1.1*i,0.0)).xyz;',
     ' };',
     // blurSample / operations / ( limit / increment)
    ' blurSample = (blurSample/ 4.0/ ( 8.0/ 2.0 ) ) * waterReflectivity;',


    // ' vec3 blurSample = texture2DProj(mirrorSampler, mirrorDistord).xyz;',
    // ' for(float i=1.0;i<8.0;i+=4.0){',
    // '   blurSample += texture2DProj(mirrorSampler, mirrorDistord+vec3( 0.0  ,-1.0*i,0.0)).xyz;',
    // '   blurSample += texture2DProj(mirrorSampler, mirrorDistord+vec3( 0.0  , 1.0*i,0.0)).xyz;',
    // ' };',
    // ' blurSample = ( blurSample/(8.0*2.0/4.0) ) * waterReflectivity;',



    // 'reflectionSample *= waterReflectivity;',
    //compute final mirror and specular
    ' mirrorFinal = (reflectance) * blurSample * 1.5 ;',
    // '}',
    // 'else{',
    // ' mirrorFinal = (reflectance ) * reflectionSample * 1.5;',
    // '}',

  //  ' specularFinal = specularLight * reflectionSample * vec3( reflectionSample * reflectionSample ) * 0.6;',


    // Compute final pixel color
     'gl_FragColor = vec4( scatter * scatter + mirrorFinal  , alpha - length( scatter ) * 0.7 );',//' , alpha + (reflectance*(1.0-alpha)) );',//alpha );',
    //'gl_FragColor = vec4( mirrorFinal + color*reflectance *  , 0.5);',//' , alpha + (reflectance*(1.0-alpha)) );',//alpha );',
    THREE.ShaderChunk[ "fog_fragment" ],
    'float seaDistFactor = smoothstep( 0.0 , fogFar*.5, fogDepth );',
    'gl_FragColor.a += mix( 0.0, (1.0 - gl_FragColor.a) , (seaDistFactor) );',
    '}'
  ].join('\n')

};

THREE.Water = function (renderer, camera, scene, options) {

  THREE.Object3D.call(this);
  this.name = 'water_' + this.id;

  function optionalParameter (value, defaultValue) {
    return value !== undefined ? value : defaultValue;
  };

  options = options || {};

  this.matrixNeedsUpdate = true;
  var width = optionalParameter(options.textureWidth, 512);
  var height = optionalParameter(options.textureHeight, 512);
  this.clipBias = optionalParameter(options.clipBias, -0.0001);
  this.alpha = optionalParameter(options.opacity, 0.95);
  this.advance = optionalParameter(options.advance, 0.0);
  this.normalSampler = optionalParameter(options.waterNormals, null);
  this.sunDirection = optionalParameter(options.sunDirection, new THREE.Vector3(0, 0.70707, -0.70707));
  this.sunColor = new THREE.Color(optionalParameter(options.sunColor, 0x000000));
  this.color = new THREE.Color(optionalParameter(options.color, 0x222222)); //0x003344));
  this.waterReflectivity = optionalParameter(options.waterReflectivity, 0.9);
  this.blur = optionalParameter(options.blur, true);

  this.eye = optionalParameter(options.eye, new THREE.Vector3(0, 0, 0));
  this.distortionScale = optionalParameter(options.distortionScale, 200.0);
  this.noiseScale = optionalParameter(options.noiseScale, 1.0);
  this.side = optionalParameter(options.side, THREE.FrontSide);
  this.fog = optionalParameter(options.fog, false);
  this.renderer = renderer;
  this.scene = scene;
//dereference trick  (function(i) { return function() { alert( i ) } })(i);
  this.rfog = (function(d) { return d })(this.scene.fog);

  this.mirrorPlane = new THREE.Plane();
  this.normal = new THREE.Vector3(0, 0, 1);
  this.cameraWorldPosition = new THREE.Vector3();
  this.rotationMatrix = new THREE.Matrix4();
  this.lookAtPosition = new THREE.Vector3(0, 0, -1);
  this.clipPlane = new THREE.Vector4();

  if ( camera instanceof THREE.PerspectiveCamera ) {
    this.camera = camera;
  }
  else  {
    this.camera = new THREE.PerspectiveCamera();
    console.log(this.name + ': camera is not a Perspective Camera!')
  }

  this.textureMatrix = new THREE.Matrix4();

  this.mirrorCamera = this.camera.clone();

  this.texture = new THREE.WebGLRenderTarget(width, height);
  this.tempTexture = new THREE.WebGLRenderTarget(width, height);

  var mirrorShader = THREE.ShaderLib["water_hy"];

  var mirrorUniforms = THREE.UniformsUtils.clone(mirrorShader.uniforms);

  this.material = new THREE.ShaderMaterial({
    fragmentShader: mirrorShader.fragmentShader,
    vertexShader: mirrorShader.vertexShader,
    uniforms: mirrorUniforms,
    transparent: this.alpha<1.0?true:false,
    side: this.side,
    fog: this.fog,
  });

  this.mesh = new THREE.Object3D();

  this.material.uniforms.mirrorSampler.value = this.texture.texture;
  this.material.uniforms.textureMatrix.value = this.textureMatrix;
  this.material.uniforms.alpha.value = this.alpha;
  this.material.uniforms.advance.value = this.advance;
  this.material.uniforms.normalSampler.value = this.normalSampler;
  this.material.uniforms.sunColor.value = this.sunColor;
  this.material.uniforms.color.value = this.color;
  this.material.uniforms.waterReflectivity.value = this.waterReflectivity;
  this.material.uniforms.blur.value = this.blur;
  this.material.uniforms.sunDirection.value = this.sunDirection;
  this.material.uniforms.distortionScale.value = this.distortionScale;
  this.material.uniforms.noiseScale.value = this.noiseScale;

  this.material.uniforms.eye.value = this.eye;

  if ( !THREE.Math.isPowerOfTwo(width) || !THREE.Math.isPowerOfTwo(height) ) {
    this.texture.texture.generateMipmaps = false;
    this.tempTexture.texture.generateMipmaps = false;
  }
};

THREE.Water.prototype = Object.create(THREE.Object3D.prototype);

THREE.Water.prototype.renderWithMirror = function (otherMirror) {

  // update the mirror matrix to mirror the current view
  this.updateTextureMatrix();
  this.matrixNeedsUpdate = false;

  // set the camera of the other mirror so the mirrored view is the reference view
  var tempCamera = otherMirror.camera;
  otherMirror.camera = this.mirrorCamera;

  // render the other mirror in temp texture
  otherMirror.render(true);

  // render the current mirror
  this.render();
  this.matrixNeedsUpdate = true;

  // restore material and camera of other mirror
  otherMirror.camera = tempCamera;

  // restore texture matrix of other mirror
  otherMirror.updateTextureMatrix();
};



function sign(x) { return x ? x < 0 ? -1 : 1 : 0; }

THREE.Water.prototype.updateTextureMatrix = function () {
  if ( this.parent !== undefined ) {
    this.mesh = this.parent;
  }
  //
  this.updateMatrixWorld();
  this.camera.updateMatrixWorld();

  this.cameraWorldPosition.setFromMatrixPosition(this.camera.matrixWorld);

  this.rotationMatrix.extractRotation(this.matrixWorld);

  this.normal = (new THREE.Vector3(0, 0, 1)).applyEuler(this.mesh.rotation);
  var cameraPosition = this.camera.position.clone().sub( this.mesh.position );
  if ( this.normal.dot(cameraPosition) < 0 ) {
    var meshNormal = (new THREE.Vector3(0, 0, 1)).applyEuler(this.mesh.rotation);
    this.normal.reflect(meshNormal);
  }

  var view = this.mesh.position.clone().sub(this.cameraWorldPosition);
  view.reflect(this.normal).negate();
  view.add(this.mesh.position);

  this.rotationMatrix.extractRotation(this.camera.matrixWorld);

  this.lookAtPosition.set(0, 0, -1);
  this.lookAtPosition.applyMatrix4(this.rotationMatrix);
  this.lookAtPosition.add(this.cameraWorldPosition);

  var target = this.mesh.position.clone().sub(this.lookAtPosition);
  target.reflect(this.normal).negate();
  target.add(this.mesh.position);

  this.up.set(0, -1, 0);
  this.up.applyMatrix4(this.rotationMatrix);
  this.up.reflect(this.normal).negate();

  this.mirrorCamera.position.copy(view);
  this.mirrorCamera.up = this.up;
  this.mirrorCamera.lookAt(target);
  this.mirrorCamera.aspect = this.camera.aspect;

  this.mirrorCamera.updateProjectionMatrix();
  this.mirrorCamera.updateMatrixWorld();
  this.mirrorCamera.matrixWorldInverse.getInverse(this.mirrorCamera.matrixWorld);

  // Update the texture matrix
  this.textureMatrix.set(0.5, 0.0, 0.0, 0.5,
              0.0, 0.5, 0.0, 0.5,
              0.0, 0.0, 0.5, 0.5,
              0.0, 0.0, 0.0, 1.0);
  this.textureMatrix.multiply(this.mirrorCamera.projectionMatrix);
  this.textureMatrix.multiply(this.mirrorCamera.matrixWorldInverse);

  // Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
  // Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
  this.mirrorPlane.setFromNormalAndCoplanarPoint(this.normal, this.mesh.position);
  this.mirrorPlane.applyMatrix4(this.mirrorCamera.matrixWorldInverse);

  this.clipPlane.set(this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant);

  var q = new THREE.Vector4();
  var projectionMatrix = this.mirrorCamera.projectionMatrix;

  q.x = (sign(this.clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
  q.y = (sign(this.clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
  q.z = -1.0;
  q.w = (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];

  // Calculate the scaled plane vector
  var c = new THREE.Vector4();
  c = this.clipPlane.multiplyScalar(2.0 / this.clipPlane.dot(q));

  // Replacing the third row of the projection matrix
  projectionMatrix.elements[2] = c.x;
  projectionMatrix.elements[6] = c.y;
  projectionMatrix.elements[10] = c.z + 1.0 - this.clipBias;
  projectionMatrix.elements[14] = c.w;

  var worldCoordinates = new THREE.Vector3();
  worldCoordinates.setFromMatrixPosition(this.camera.matrixWorld);
  this.eye = worldCoordinates;
  this.material.uniforms.eye.value = this.eye;
};

THREE.Water.prototype.render = function (isTempTexture) {

  if ( this.matrixNeedsUpdate ) {
    this.updateTextureMatrix();
  }

  this.matrixNeedsUpdate = true;

  // Render the mirrored view of the current scene into the target texture
  if ( this.scene !== undefined && this.scene instanceof THREE.Scene ) {
    // Remove the mirror texture from the scene the moment it is used as render texture
    // https://github.com/jbouny/ocean/issues/7
    this.material.visible = false;


    var renderTexture = (isTempTexture !== undefined && isTempTexture)? this.tempTexture : this.texture;
    this.renderer.render(this.scene, this.mirrorCamera, renderTexture, false);

    this.material.visible = true;
    this.material.uniforms.mirrorSampler.value = renderTexture.texture;

  }

};
