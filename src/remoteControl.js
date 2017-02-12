// this stores all data coming from websocket / any remote source we want to connect
// TODO socket here
var HLR = {
	//audio
	fft1: 0.0,
	fft2: 0.0,
	fft3: 0.0,
	fft4: 0.0,

	trans1: 0.0,
	trans2: 0.0,
	trans3: 0.0,

	// fft4: 0.0,
	// fft5: 0.0,
	// maxFFT1:0.0001,
	// maxFFT2:0.0001,
	// maxFFT3:0.0001,
	// maxFFT4:0.0001,
	// maxFFT5:0.0001,
	smoothFFT1: 0,
	smoothFFT2: 0,
	smoothFFT3: 0,
	// smoothFFT4:0,
	// smoothFFT5:0,

	// socket
	// connectedUsers:0, // affects fauna
	// key1: false,
	// key2: false,
	// key3: false,
	// key4: false,
	// key5: false,


	//temp vars to be used by scenes
	tempLandHeight: 0,
	tempLandZeroPoint: 0,
	tempNoiseFreq: 0,
	tempNoiseFreq2: 0,

	// global game status
	GAMESTATUS: 0
}


var HLRemote = function() {


	function updateFFT(a, b, c, d) {
		HLR.fft1 = Math.max(a, 0.0001);
		HLR.fft2 = Math.max(b, 0.0001);
		HLR.fft3 = Math.max(c, 0.0001);
		HLR.fft4 = Math.max(d, 0.0001);
	}

	// // TODO bind to SOCKET
	// function updateClientsNumber(clientsConnected) {
	// 	HLE.mobileConnected = Math.round(clientsConnected);
	// 	HLR.connectedUsers = clientsConnected;
	// }

	function updateHLParams(a, b, c, d) {
		// TODO: memory optimization

		updateFFT(a,b,c,d);

		// compute smooths
		HLR.smoothFFT1 += (HLR.fft1 - HLR.smoothFFT1) * 0.04;
		HLR.smoothFFT2 += (HLR.fft2 - HLR.smoothFFT2) * 0.04;
		HLR.smoothFFT3 += (HLR.fft3 - HLR.smoothFFT3) * 0.04;

	}



	function keyboardControls(k) {

		// pause key available in game status 1 or 2 (running or paused)
		if (k.key == ' ' || k.keyCode == 32 || k.key == 'mP' || k.key == 'mP2' ) {

			k.preventDefault();

			if (HLR.GAMESTATUS == 1)
				updateStatus(2);
			else if (HLR.GAMESTATUS == 2)
				updateStatus(1);

		}

		if (HLR.GAMESTATUS == 1) { // game running

			// shoot models
			if (k.key == 'h' || k.key == 'H' || k.keyCode == 72) {
				HLH.startModel(HL.models['heartbomb'],
					THREE.Math.randInt(-1000, 1000),
					THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 20, 'xyz', 4
				);
			}

			if (k.key == 'y' || k.key == 'Y' || k.keyCode == 89) {
				HLH.startGroup(['band', 20, 0, 'y', true, 0, true]);
			}

			if (k.key == 'p' || k.key == 'P' || k.keyCode == 80) {
				HLH.startModel(HL.models['whale'],
					THREE.Math.randInt(-1000, 1000),
					THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 20, null, 10
				);
			}

			if (k.key == 'e' || k.key == 'E' || k.keyCode == 69) {
				HLH.startModel(HL.models['ducky'],
					THREE.Math.randInt(-1000, 1000),
					THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 20, 'xyz', 100
				);
			}

			if (k.key == 'r' || k.key == 'R' || k.keyCode == 82) {
				HLH.startModel(HL.models['airbus'],
					THREE.Math.randInt(-1000, 1000),
					THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 40, null, 5
				);
			}

		} // END IF GAMESTATUS == 1


		if (HLR.GAMESTATUS == 1 || HLR.GAMESTATUS == 2) {
			if (k.keyCode == 13 || k.key == 'mS') { //'Enter'
				// HLE.acceleration = THREE.Math.clamp(HLE.acceleration+=0.009, 0, 2);
				screenshot();
			}
		}

		// DEV / EXTRA
		if (k.key == 'm') {
			AA.connectMic();
		}

		if (k.key == 'f') {
			AA.connectFile();
		}

		if (k.keyCode == 53 || k.key == 'mX') { // 5
			HLH.startGroup(['space', 1, 1, true, false, HLE.WORLD_HEIGHT / 3]);
		}

	} // END keyboardControls()

	// listen keyboard TODO+ check final commands!
	if(!isCardboard)
		window.addEventListener('keyup', keyboardControls);


	// if(isCardboard)
		window.addEventListener('keypress', iCadeControls);

	function iCadeControls(k){

		k.preventDefault();

		// start button = pause
		if ( k.keyCode == 118 ) {
			if (HLR.GAMESTATUS == 1)
				updateStatus(2);
			else if (HLR.GAMESTATUS == 2)
				updateStatus(1);
		}

		switch ( k.keyCode ) {
			case 110: //
				HLH.startGroup(['band', 20, 0, 'y', true, 0, true]);
				break;
			case 102:
				HLH.startModel(HL.models['airbus'],
					THREE.Math.randInt(-1000, 1000),
					HL.cameraGroup.position.y, 20, 'xyz', 1
				);
				break;
			case 114:
				HLH.startModel(HL.models['aurora'],
					THREE.Math.randInt(-1000, 1000),
					THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 20, 'xyz', 1
				);
				break;
			case 116:
				HLH.startModel(HL.models['helicopter'],
					THREE.Math.randInt(-1000, 1000),
					THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 20, 'xyz', 1
				);
				break;
		}

	}

	// 106 j
	// 110 n
	// 117 u
	// 102 f
	// 104 h
	// 114 r
	// 121 y
	// 116 t


	// in mobile mode we have on-screen button
	// so, send buttons ids to keyboard Callback (mX key value format)
	if (isMobile) {
		let mButtons = document.querySelectorAll('.mobileControlButton');
		for (let i = 0; i < mButtons.length; i++) {
			mButtons[i].addEventListener('touchstart', function(e) {
				e.preventDefault();
				let fakeEvent = {
					'key': mButtons[i].id,
					'preventDefault': function(){}
				}
				keyboardControls(fakeEvent);
				return false;
			});
		}
  }

	// buttonAccel.addEventListener('touchend', function(e){ e.preventDefault(); scope.moveForward = false; } );
	// buttonAccel.addEventListener('touchcancel', function(e){ e.preventDefault(); scope.moveForward = false; } );


function screenshot() {
	console.log(screenshot);
	// save current renderer pixelRatio
	var pixelRatio = HL.renderer.getPixelRatio();
	// set high pixel ratio for bigegr image
	HL.renderer.setPixelRatio(1);
	// render bigger image
	HL.renderer.render(HL.scene, HL.camera);
	var imgData = HL.renderer.domElement.toDataURL('image/jpeg');
	// set back working pixel ratio
	HL.renderer.setPixelRatio(pixelRatio);
	window.open(imgData);

	// var html =`
	// <!DOCTYPE html>
	// <html>
	//   <head>
	//     <meta charset="utf-8">
	//     <title>ROGER WATER SCREENSHOT</title>
	//   </head>
	//   <body>
	//     THIS IS A PREVIEW IMAGE, CLOSE WINDOW AND BACK TO GAME
	//     <a id="a" href="`+imgData+`" download="roger_water.jpg">
	//     <img src="`+ imgData +`" alt="ROGER WATER" width="500px" height="500px">
	//     </a>
	//     <script type="text/javascript">
	//       document.addEventListener('load', function(){
	//         var a = document.getElementById('a');
	//         a.click();
	//       });
	//     </script>
	//
	//   </body>
	// </html>`;
	// var win = window.open();//"", "Title", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=780, height=200, top="+(screen.height-400)+", left="+(screen.width-840));
	// win.document.body.innerHTML = html;

	//  var link = document.createElement("a");
	//  link.download = 'capture.jpg';
	//  link.href = imgData;
	//  link.click();
}



// SCREENS MANAGEMENT

// show/hide html element by selector
var setVisibility = (function(selector, visible) {
	var elements = document.querySelectorAll(selector);
	for (var i = 0; i < elements.length; i++) {
		elements[i].style.opacity = visible ? 1 : 0;
		elements[i].style.display = visible ? 'block' : 'none';
		console.log('visible: selector: ' + selector + ' visibile: ' + visible);
	}
});

function updateStatus(gameStatus) {
	// set status
	HLR.GAMESTATUS = gameStatus;
	console.log('updateStatus: ' + gameStatus);

	// handle screens visibility
	switch (gameStatus) {
		case 0: // loading screen
			setVisibility('.screens', false);
			setVisibility('#loading', true);
			AA.pause();
			// AAK.pause();
			break;
		case 1: // game running
			HLMain.play();
			setVisibility('.screens', false);
			AA.play();
			// AAK.play();
			break;
		case 11: // game running in mic mode
			AA.connectMic();
			HLMain.play();
			setVisibility('.screens', false);
			break;
		case 12: // game running in flat mode
			// AA.pauseAnalysis o TODO flat mode (no analysis, set array to 0);
			HLMain.play();
			setVisibility('.screens', false);
			break;
		case 2: // game paused
			HLMain.pause();
			setVisibility('.screens', false);
			setVisibility('#paused', true);
			AA.pause();
			// AAK.pause();
			break;
		case 3: // audio analysis ended
			setVisibility('.screens', false);
			setVisibility('#ended', true);
			break;
	}
	// AA.filePlayPause();
}

// MASTER SCENES ROUTINE

var screensInit = function() {
	var totalLoading = 0;
	HL.modelsLoadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
		document.getElementById('modelsLoading').style.width =
			(100 / itemsTotal) * itemsLoaded + '%';

	};
	HL.texturesLoadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
		document.getElementById('texturesLoading').style.width =
			(100 / itemsTotal) * itemsLoaded + '%';
	};

	window.addEventListener('audioProgress', function(e) {
		document.getElementById('audioLoading').style.width =
			(100 / e.detail.total) * e.detail.loaded + '%';
	});

}

// once HL environment and assets fully load
window.addEventListener('HLEload', function() {
	// connect FILE
	AA.connectFile();
	// AAK.connectFile();
	// we'll wait for a START button press to gamestatus 1
	var startButton = document.getElementById('startButton');
	startButton.disabled = false;
	startButton.addEventListener('click', function() {
		updateStatus(1);
	});


	// add listener for ending screen when audio ends
	AA.fileEventListener('ended', function() {
		// rewind audio file
		AA.fileRewind();
		// AAK.fileRewind();
		// uptade game to status 2 (ENDED)
		updateStatus(3);

	});

	// update audio progress bar
	AA.fileEventListener('timeupdate', function() {
		if (AA.fileGetTime() > 0) {
			var value = (100 / AA.fileGetDuration()) * AA.fileGetTime();
		}
		document.getElementById('audioProgressBar').style.width = value + "%";
	});


	// pause audio file if window not in focus
	// analysis is rAF based, so it will pause anyway if window in background
	function handleVisibilityChange(e) {

		if (HLR.GAMESTATUS == 1)
			updateStatus(2);
		// else if ( HLR.GAMESTATUS == 2 && ! isMobile && e.target.visibilityState == 'visible' )
		// 	updateStatus(1);
	}

	// if( !isMobile )
		document.addEventListener("visibilitychange", function(e){ handleVisibilityChange(e); }, false);

// TODO: orientation change pauses game
	// window.addEventListener("orientationchange", function(){
	// 	 if(window.screen.orientation.angle == 90 ){
	// 		 updateStatus(2);
	// 	 }
	// });

});

return {
	updateHLParams: function(a, b, c, d) {
		return updateHLParams(a, b, c, d)
	},
	updateTrans: function(a, b, c) {
		return updateTrans(a, b, c)
	},
	updateStatus: function(a) {
		return updateStatus(a)
	},
	screensInit: screensInit,
	setVisibility: function(a, b) {
		return setVisibility(a, b)
	},
}
}();
