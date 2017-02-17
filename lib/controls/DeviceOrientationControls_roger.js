/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function ( object, params ) {

	var scope = this;

	this.object = object;
	this.object.rotation.reorder( "YXZ" );

	params = params || {};
	params.floor 		= params.floor  !== undefined ? params.floor   : 20;
	params.ceiling 	= params.ceiling!== undefined ? params.ceiling : HLE.WORLD_HEIGHT*4;

	this.enabled = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;


	var onDeviceOrientationChangeEvent = function ( event ) {
		scope.deviceOrientation = event;

	};

	var onScreenOrientationChangeEvent = function (e) {

		scope.screenOrientation = window.orientation || 0;

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	var setObjectQuaternion = function () {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function ( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler );                               // orient the device

			quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation

		}

	}();

	this.connect = function() {

		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = true;

	};

	this.disconnect = function() {

		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};

	this.update = function () {

		if ( scope.enabled === false ) return;

		var alpha  = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha  ) : 0; // Z
		var beta   = scope.deviceOrientation.beta  ? THREE.Math.degToRad( scope.deviceOrientation.beta   ) : 0; // X'
		var gamma  = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma  ) : 0; // Y''
		var orient = scope.screenOrientation       ? THREE.Math.degToRad( scope.screenOrientation        ) : 0; // O

		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );

		// buttons
		if ( scope.moveForward ){
			HLE.acceleration = THREE.Math.clamp(HLE.acceleration+=0.007, 0, 1);
		}

		else {
			HLE.acceleration = THREE.Math.clamp(HLE.acceleration-=0.015, 0, 1);
		}


		// camera  up / down
		if(scope.moveForward){
			scope.rv.setFromQuaternion(scope.object.quaternion,'YXZ');
			}
		if(HLE.acceleration > 0.01){
			scope.object.position.y =
				THREE.Math.clamp(
					scope.object.position.y + scope.rv.x * HLE.MAX_MOVE_SPEED * HLE.acceleration,
					params.floor, params.ceiling
				);
		}

		// if(frameCount%60==0)
		// 	console.log(this.object.position.y);

	}

	this.rv = new THREE.Euler( 0, 0, 0, 'YXZ' );


	this.dispose = function () {

		this.disconnect();

	};

	this.connect();


	// mobileSoftButton acceleration
	softKeyA = document.getElementById('buttonAccel');
	softKeyA.addEventListener('touchstart', function(){
		scope.moveForward = true;
	});
	softKeyA.addEventListener('touchend', function(){
		scope.moveForward = false;
	});

	// iCade buttons
	this.moveForward = false;
	window.addEventListener('keypress', function(e){

		// block arrows
		if(e.keyCode==37 || e.keyCode==38 || e.keyCode == 39 || e.keyCode == 40){
			e.preventDefault();
			e.stopPropagation();
		}

		if(e.keyCode == 97 || e.key=='a' || e.keyCode == 119|| e.key=='w'){
			e.preventDefault();
			e.stopPropagation();
			scope.moveForward = true;
		}

		if(e.keyCode == 113 || e.key == 'q' || e.keyCode == 101|| e.key == 'e'){
			e.preventDefault();
			e.stopPropagation();
			scope.moveForward = false;
		}

	} );
};
