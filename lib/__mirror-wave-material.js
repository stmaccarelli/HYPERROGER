/**
 * @author Slayvin / http://slayvin.net
 */

THREE.ShaderLib[ 'mirrorWave' ] = {
	uniforms: THREE.UniformsUtils.merge( [
    THREE.UniformsLib[ "fog" ],
		{ "color": { type: "c", value: new THREE.Color( 0x7F7F7F ) },
			"opacity": { type: "f", value: 0.41 },
			"mirrorSampler": { type: "t", value: null },
			"time": { type: "f", value: 1.0 },
			"step": { type: "f", value: 1.0 },
			"seaHeight": { type: "f", value: 1.0 },
			"worldWidth": { type: "f", value: 1.0 },
			"textureMatrix" : { type: "m4", value: new THREE.Matrix4() }
		}
	]),

	vertexShader: [

		"uniform float worldWidth;",
		"uniform mat4 textureMatrix;",
		"uniform float time;",
		"uniform float step;", // TODO remove if unused
		"uniform float seaHeight;",
		"varying vec4 mirrorCoord;",
		"void main() {",
		"vec4 nPos = vec4(vec3(position.x,position.y,position.z)/worldWidth*2.0+100.0,1.0);",
		"float posY = 2.0 + sin( time * .2 + nPos.x*nPos.x*10.0 + nPos.z*nPos.x*13.05) * seaHeight;",
			"vec4 mvPosition = modelViewMatrix * vec4( position.x, position.y + posY, position.z, 1.0 );",
			"vec4 worldPosition =  modelMatrix * vec4( position.x, position.y + posY, position.z, 1.0 );",
			"mirrorCoord = textureMatrix * worldPosition;",
			"gl_Position = projectionMatrix * mvPosition;",
		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform vec3 color;",
		"uniform sampler2D mirrorSampler;",
		"uniform float worldWidth;",
		"uniform float opacity;",
		"varying vec4 mirrorCoord;",


    THREE.ShaderChunk[ "common" ],
    THREE.ShaderChunk[ "fog_pars_fragment" ],
		"void main() {",
			'vec3 reflectionSample = texture2DProj(mirrorSampler, mirrorCoord).rgb;',
		 	"gl_FragColor = vec4( mix(color,reflectionSample*0.9,0.5), opacity);",
			THREE.ShaderChunk[ "fog_fragment" ],
		"}"

	].join( "\n" )

};

THREE.Mirror = function ( renderer, camera, options ) {

	THREE.Object3D.call( this );

	this.name = 'mirrorWave_' + this.id;

	options = options || {};

	this.matrixNeedsUpdate = true;

	var width = options.textureWidth !== undefined ? options.textureWidth : 512;
	var height = options.textureHeight !== undefined ? options.textureHeight : 512;

	this.clipBias = options.clipBias !== undefined ? options.clipBias : 0.0;
	this.fog = options.fog !== undefined ? options.fog : false;
	var color = options.color !== undefined ? new THREE.Color( options.color ) : new THREE.Color( 0x7F7F7F );
	var _transparent = options.transparent !== undefined ? options.transparent : false;
	var _opacity = options.opacity !== undefined ? options.opacity : 0.41;
	this.side = options.side !== undefined ? options.side : THREE.FrontSide;

	this.renderer = renderer;
	this.mirrorPlane = new THREE.Plane();
	this.normal = new THREE.Vector3( 0, 0, 1 );
	this.mirrorWorldPosition = new THREE.Vector3();
	this.cameraWorldPosition = new THREE.Vector3();
	this.rotationMatrix = new THREE.Matrix4();
	this.lookAtPosition = new THREE.Vector3( 0, 0, - 1 );
	this.clipPlane = new THREE.Vector4();

	// For debug only, show the normal and plane of the mirror
	var debugMode = options.debugMode !== undefined ? options.debugMode : false;

	if ( debugMode ) {

		var arrow = new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 1 ), new THREE.Vector3( 0, 0, 0 ), 10, 0xffff80 );
		var planeGeometry = new THREE.Geometry();
		planeGeometry.vertices.push( new THREE.Vector3( - 10, - 10, 0 ) );
		planeGeometry.vertices.push( new THREE.Vector3( 10, - 10, 0 ) );
		planeGeometry.vertices.push( new THREE.Vector3( 10, 10, 0 ) );
		planeGeometry.vertices.push( new THREE.Vector3( - 10, 10, 0 ) );
		planeGeometry.vertices.push( planeGeometry.vertices[ 0 ] );
		var plane = new THREE.Line( planeGeometry, new THREE.LineBasicMaterial( { color: 0xffff80 } ) );

		this.add( arrow );
		this.add( plane );

	}

	if ( camera instanceof THREE.PerspectiveCamera ) {

		this.camera = camera;

	} else {

		this.camera = new THREE.PerspectiveCamera();
		console.log( this.name + ': camera is not a Perspective Camera!' );

	}

	this.textureMatrix = new THREE.Matrix4();

	this.mirrorCamera = this.camera.clone();
	this.mirrorCamera.matrixAutoUpdate = true;

	var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };

	this.texture = new THREE.WebGLRenderTarget( width, height, parameters );
	this.tempTexture = new THREE.WebGLRenderTarget( width, height, parameters );

	var mirrorShader = THREE.ShaderLib[ "mirrorWave" ];
	var mirrorUniforms = THREE.UniformsUtils.clone( mirrorShader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		fragmentShader: mirrorShader.fragmentShader,
		vertexShader: mirrorShader.vertexShader,
		uniforms: mirrorUniforms,
    side: this.side,
    fog: this.fog,
		transparent:_transparent,
	//	wireframe:isWire,
	} );

	this.material.uniforms.mirrorSampler.value = this.texture.texture;
	this.material.uniforms.color.value = color;
	this.material.uniforms.textureMatrix.value = this.textureMatrix;
	this.material.uniforms.worldWidth.value = options.worldWidth !== undefined ? options.worldWidth : 1.0;
	this.material.uniforms.opacity.value = _opacity;
	this.material.uniforms.seaHeight.value = options.worldWidth !== undefined ? options.worldWidth*0.001 : 1.0;;


	if ( ! THREE.Math.isPowerOfTwo( width ) || ! THREE.Math.isPowerOfTwo( height ) ) {

		this.texture.texture.generateMipmaps = false;
		this.tempTexture.texture.generateMipmaps = false;

	}

	this.updateTextureMatrix();
	this.render();

};

THREE.Mirror.prototype = Object.create( THREE.Object3D.prototype );
THREE.Mirror.prototype.constructor = THREE.Mirror;

THREE.Mirror.prototype.renderWithMirror = function ( otherMirror ) {

	// update the mirror matrix to mirror the current view
	this.updateTextureMatrix();
	this.matrixNeedsUpdate = false;

	// set the camera of the other mirror so the mirrored view is the reference view
	var tempCamera = otherMirror.camera;
	otherMirror.camera = this.mirrorCamera;

	// render the other mirror in temp texture
	otherMirror.renderTemp();
	otherMirror.material.uniforms.mirrorSampler.value = otherMirror.tempTexture;

	// render the current mirror
	this.render();
	this.matrixNeedsUpdate = true;

	// restore material and camera of other mirror
	otherMirror.material.uniforms.mirrorSampler.value = otherMirror.texture;
	otherMirror.camera = tempCamera;

	// restore texture matrix of other mirror
	otherMirror.updateTextureMatrix();

};

THREE.Mirror.prototype.updateTextureMatrix = function () {

	this.updateMatrixWorld();
	this.camera.updateMatrixWorld();

	this.mirrorWorldPosition.setFromMatrixPosition( this.matrixWorld );
	this.cameraWorldPosition.setFromMatrixPosition( this.camera.matrixWorld );

	this.rotationMatrix.extractRotation( this.matrixWorld );

	this.normal.set( 0, 0, 1 );
	this.normal.applyMatrix4( this.rotationMatrix );

	var view = this.mirrorWorldPosition.clone().sub( this.cameraWorldPosition );
	view.reflect( this.normal ).negate();
	view.add( this.mirrorWorldPosition );

	this.rotationMatrix.extractRotation( this.camera.matrixWorld );

	this.lookAtPosition.set( 0, 0, - 1 );
	this.lookAtPosition.applyMatrix4( this.rotationMatrix );
	this.lookAtPosition.add( this.cameraWorldPosition );

	var target = this.mirrorWorldPosition.clone().sub( this.lookAtPosition );
	target.reflect( this.normal ).negate();
	target.add( this.mirrorWorldPosition );

	this.up.set( 0, - 1, 0 );
	this.up.applyMatrix4( this.rotationMatrix );
	this.up.reflect( this.normal ).negate();

	this.mirrorCamera.position.copy( view );
	this.mirrorCamera.up = this.up;
	this.mirrorCamera.lookAt( target );

	this.mirrorCamera.updateProjectionMatrix();
	this.mirrorCamera.updateMatrixWorld();
	this.mirrorCamera.matrixWorldInverse.getInverse( this.mirrorCamera.matrixWorld );

	// Update the texture matrix
	this.textureMatrix.set( 0.5, 0.0, 0.0, 0.5,
							0.0, 0.5, 0.0, 0.5,
							0.0, 0.0, 0.5, 0.5,
							0.0, 0.0, 0.0, 1.0 );
	this.textureMatrix.multiply( this.mirrorCamera.projectionMatrix );
	this.textureMatrix.multiply( this.mirrorCamera.matrixWorldInverse );

	// Now update projection matrix with new clip plane, implementing code from: http://www.terathon.com/code/oblique.html
	// Paper explaining this technique: http://www.terathon.com/lengyel/Lengyel-Oblique.pdf
	this.mirrorPlane.setFromNormalAndCoplanarPoint( this.normal, this.mirrorWorldPosition );
	this.mirrorPlane.applyMatrix4( this.mirrorCamera.matrixWorldInverse );

	this.clipPlane.set( this.mirrorPlane.normal.x, this.mirrorPlane.normal.y, this.mirrorPlane.normal.z, this.mirrorPlane.constant );

	var q = new THREE.Vector4();
	var projectionMatrix = this.mirrorCamera.projectionMatrix;

	q.x = ( Math.sign( this.clipPlane.x ) + projectionMatrix.elements[ 8 ] ) / projectionMatrix.elements[ 0 ];
	q.y = ( Math.sign( this.clipPlane.y ) + projectionMatrix.elements[ 9 ] ) / projectionMatrix.elements[ 5 ];
	q.z = - 1.0;
	q.w = ( 1.0 + projectionMatrix.elements[ 10 ] ) / projectionMatrix.elements[ 14 ];

	// Calculate the scaled plane vector
	var c = new THREE.Vector4();
	c = this.clipPlane.multiplyScalar( 2.0 / this.clipPlane.dot( q ) );

	// Replacing the third row of the projection matrix
	projectionMatrix.elements[ 2 ] = c.x;
	projectionMatrix.elements[ 6 ] = c.y;
	projectionMatrix.elements[ 10 ] = c.z + 1.0 - this.clipBias;
	projectionMatrix.elements[ 14 ] = c.w;

};

THREE.Mirror.prototype.render = function () {

	if ( this.matrixNeedsUpdate ) this.updateTextureMatrix();

	this.matrixNeedsUpdate = true;

	// Render the mirrored view of the current scene into the target texture
	var scene = this;

	while ( scene.parent !== null ) {

		scene = scene.parent;

	}

	if ( scene !== undefined && scene instanceof THREE.Scene ) {

		// We can't render ourself to ourself
		var visible = this.material.visible;
		this.material.visible = false;

		this.renderer.render( scene, this.mirrorCamera, this.texture, true );

		this.material.visible = visible;

	}

};

THREE.Mirror.prototype.renderTemp = function () {

	if ( this.matrixNeedsUpdate ) this.updateTextureMatrix();

	this.matrixNeedsUpdate = true;

	// Render the mirrored view of the current scene into the target texture
	var scene = this;

	while ( scene.parent !== null ) {

		scene = scene.parent;

	}

	if ( scene !== undefined && scene instanceof THREE.Scene ) {

		this.renderer.render( scene, this.mirrorCamera, this.tempTexture, true );

	}

};
