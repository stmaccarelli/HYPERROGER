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
	GAMESTATUS: 0,
	PREVGAMESTATUS: null
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

	function MIDIcontrols() {
		//remidi mapping
		const POLLICE = 36;
		const INDICE = 37;
		const MEDIO = 38;

		// const ANULARE = 40;
		// const MIGNOLO = 39;
		// const PALM_MIGNOLO = 38;
		// const PALM_INDICE = 37;
		// const PALM_POLSO = 36;
		//
		// const KNOB_L = 1;
		// const KNOB_R = 2;
		// const KNOB_PUSH = 3;
		//
		// const L_BUTTON = 4;
		// const R_BUTTON = 5;

	console.log('HLS.MIDIcontrols init');
	  navigator.requestMIDIAccess().then(
	    onMIDIInit,
	    onMIDISystemError );

	  function onMIDISystemError(e){
	    console.log(e);
	  }

	  function onMIDIInit( midi ) {
	    // sys_midi = midi;
	    for (var input of midi.inputs.values())
	      input.onmidimessage = midiMessageReceived;
	  }

		var Yaxis = 0, nYaxis = 0;

		function MIDIrotation(){
			requestAnimationFrame(MIDIrotation);
			HL.cameraGroup.rotation.y += Yaxis * 0.03;
		}
		requestAnimationFrame(MIDIrotation);

	  function midiMessageReceived( ev ) {

			let chan = ev.data[0]; // non è il canale, porta vari dati
			let note = ev.data[1];
			let velocity = ev.data[2];

			// if(note!= 22 && note!= 24)
			// 	console.log(note);

			// if(note!=22 && note!=24){
			// 	console.log(ev);
			// } else
			if(note == 22 ){
					nYaxis = ( ( 1 - ev.data[2] / 127 ) - 0.5 );
					Yaxis += (nYaxis - Yaxis) * 0.05;
										//if( Math.abs(nVal - HL.cameraGroup.rotation.y) < .05) {
						// HL.cameraGroup.rotation.y = nVal;
						// HL.cameraGroup.rotation.y += Yaxis * 0.3;
					//}
//				HL.cameraGroup.rotateY( (0.1 - ev.data[2] / 1270) - 0.05 );
			}

// 			if(note == 22 ){
// 				let nVal = HL.cameraGroup.rotation.x + ( ( ev.data[2] / 127 ) - 0.5 ) / 2;
// 				HL.cameraGroup.rotation.x += ( nVal - HL.cameraGroup.rotation.x ) * 0.051;
// //				HL.cameraGroup.rotateY( (0.1 - ev.data[2] / 1270) - 0.05 );
// 			}

			if(note == INDICE){
				let val = ev.data[2]/127;
				val *= val * val * val * val * val;
				HL.camera.zoom = 1 + val * 2;
				HL.camera.updateProjectionMatrix();
			}

			if(note == MEDIO){
				let val = ev.data[2]/127;
				val *= val * val * val * val * val;
				HL.materials.land.uniforms.buildFreq.value += val * 0.1;
			}

			if(note == POLLICE){
				let val = ev.data[2]/127;
				val *= val * val * val * val * val;
				HLE.acceleration = THREE.Math.clamp( val * 6, 0, 3);
			}

	    // var midiInputIndex = 144 // channel in DJ mode without hex calculations
			//
	    // for (var key in HLSP) {
	    //     if (ev.data[2]>0 && ev.data[1]==103 && ev.data[0]== midiInputIndex++) {
	    //       HLS.startScene(key);
	    //     }
	    // }
			//
			//
	    // if (ev.data[2]>0 && ev.data[1]==0) //5
	    //   if(HLS.modelsParams !== null)
	    //     HLH.startGroup(HLS.modelsParams);
			//
	    // if (ev.data[0]==156 && ev.data[2]>0 && ev.data[1]==1) { //9
	    //   HLE.CENTER_PATH=!HLE.CENTER_PATH;
	    //   HL.materials.land.uniforms.withCenterPath.value = HLE.CENTER_PATH;
	    // }

	  }

	}

	MIDIcontrols();



	function keyboardControls(k) {

		// pause key available in game status 1 or 2 (running or paused)
		if (k.key == ' ' || k.keyCode == 32 || k.key == 'mP' || k.key == 'mP2' ) {

			k.preventDefault();

			if (HLR.GAMESTATUS > 0 && HLR.GAMESTATUS < 20){
				updateStatus(20);
			}
			else if (HLR.GAMESTATUS == 20)
				updateStatus(-1);

		}

		if (HLR.GAMESTATUS > 0 && HLR.GAMESTATUS < 20) { // game running

			// shoot models
			if (k.key == 'h' || k.key == 'H' || k.keyCode == 72) {
				HLH.startModel(HL.models['elephant'],
					THREE.Math.randInt(-1000, 1000),
					-20, 0, null, 10
				);
			}

			if (k.key == 'y' || k.key == 'Y' || k.keyCode == 89) {
				HLH.startGroup(['band', 20, 0, 'y', true, 0, true]);
			}

			if (k.key == 'p' || k.key == 'P' || k.keyCode == 80) {
				HLH.startGroup(['sea', 20, 1, 'xyz', true, 5, true]);
			}
// model,xPosition,y,speed,rotations, scale, isParticle, towardsCamera
			if (k.key == 'e' || k.key == 'E' || k.keyCode == 69) {
				HLH.startGroup(['buildings', 1, 0, 'xyz', true, 0, true]);
			}

			if (k.key == 'r' || k.key == 'R' || k.keyCode == 82) {
				HLH.startGroup(['waste', 20, 0, 'y', true, 0, true]);
			}

			//mobile shot
			if (k.keyCode == 53 || k.key == 'mX') { // 5
				HLH.startGroup(['space', 1, 1, true, false, HLE.WORLD_HEIGHT / 3]);
			}

		}


		if (HLR.GAMESTATUS > 0) {
			if (k.keyCode == 13 || k.key == 'mS') { //'Enter'
				// HLE.acceleration = THREE.Math.clamp(HLE.acceleration+=0.009, 0, 2);
				screenshot();

			}
		}

		// DEV / EXTRA
		if (k.keyCode == 77 || k.key == 'm') {
			AA.connectMic();
		}

		if (k.keyCode == 70 || k.key == 'f') {
			AA.connectFile();
		}

	} // END keyboardControls()

	// listen keyboard TODO+ check final commands!
	if(!isCardboard)
		window.addEventListener('keyup', keyboardControls);


  if(isCardboard)
		window.addEventListener('keypress', iCadeControls, false);




	function iCadeControls(k){


		// start button = pause
		if ( k.keyCode == 118 ) {
			k.preventDefault();
			k.stopPropagation();
			if (HLR.GAMESTATUS == 10)
				updateStatus(20);
			else if (HLR.GAMESTATUS == 20)
				updateStatus(10);
		}

		switch ( k.keyCode ) {
			case 110: //
				k.preventDefault();
				k.stopPropagation();
				HLH.startGroup(['band', 20, 0, 'y', true, 0, true]);
				break;
			case 102:
				k.preventDefault();
				k.stopPropagation();
				HLH.startModel(HL.models['airbus'],
					THREE.Math.randInt(-1000, 1000),
					HL.cameraGroup.position.y, 20, 'xyz', 1
				);
				break;
			case 114:
				k.preventDefault();
				k.stopPropagation();
				HLH.startModel(HL.models['aurora'],
					THREE.Math.randInt(-1000, 1000),
					THREE.Math.randInt(HLE.WORLD_HEIGHT, HLE.WORLD_HEIGHT * 1.5), 20, 'xyz', 1
				);
				break;
			case 116:
				k.preventDefault();
				k.stopPropagation();
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
				e.stopPropagation();
				let fakeEvent = {
					'key': mButtons[i].id,
					'preventDefault': function(){},
					'stopPropagation': function(){}
				}
				keyboardControls(fakeEvent);
				return false;
			});
		}

	// in cardboard mode, touching screen pauses game
	if (isCardboard) {
			window.addEventListener('touchstart', function(e) {
				e.preventDefault();
				e.stopPropagation();
				let fakeEvent = {
					'key': ' ',
					'preventDefault': function(){},
					'stopPropagation': function(){}
				}
				keyboardControls(fakeEvent);
				return false;
			});
		}

	}
	// buttonAccel.addEventListener('touchend', function(e){ e.preventDefault(); scope.moveForward = false; } );
	// buttonAccel.addEventListener('touchcancel', function(e){ e.preventDefault(); scope.moveForward = false; } );


function screenshot() {
	//console.log(screenshot);
	// save current renderer pixelRatio
	var pixelRatio = HL.renderer.getPixelRatio();
	// set high pixel ratio for bigegr image
	HL.renderer.setPixelRatio(1);
	// render bigger image
	HL.cameraCompanion.position.z = -400 - HL.cameraGroup.position.y*0.25;

	// HLS.logoChange('logo');
	HL.renderer.render(HL.scene, HL.camera);
	var imgData = HL.renderer.domElement.toDataURL('image/jpeg');
	// set back working pixel ratio
	HL.renderer.setPixelRatio(pixelRatio);
	window.open(imgData);
	HL.cameraCompanion.visible = false;


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
		// console.log('visible: selector: ' + selector + ' visibile: ' + visible);
	}
});

function updateStatus(gameStatus) {

	//console.log("gameStatus "+ gameStatus);
	// set status
	if( gameStatus == 20 ) HLR.PREVGAMESTATUS = HLR.GAMESTATUS;

	if( gameStatus == -1 ){
		HLR.GAMESTATUS = HLR.PREVGAMESTATUS;
	}
	else {
		HLR.GAMESTATUS = gameStatus;
	}

	//console.log('updateStatus: ' + HLR.GAMESTATUS);

	// handle screens visibility
	switch (HLR.GAMESTATUS) {
		case 0: // loading screen
			setVisibility('.screens', false);
			setVisibility('#loading', true);
			AA.pause();
			// AAK.pause();
			break;
		case 10: // game running
			if(AA.getSelectedSource()!=AA.FILE) AA.connectFile();

			HLMain.play();
			AA.play();
			setVisibility('.screens', false);
			// AAK.play();
			break;
		case 11: // game running in mic mode
			if(AA.getSelectedSource()!=AA.MIC) AA.connectMic();
			HLMain.play();
			AA.play();
			setVisibility('.screens', false);
			break;
		case 12: // game running in flat mode
			// AA.pauseAnalysis o TODO flat mode (no analysis, set array to 0);
			HLMain.play();
			setVisibility('.screens', false);
			break;
		case 20: // game paused
			HLMain.pause();
			setVisibility('.screens', false);
			setVisibility('#paused', true);
			AA.pause();
			// AAK.pause();
			break;
		case 30: // audio analysis ended
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

	document.getElementById('loadingTag').style.opacity = 0;

	// we'll wait for a START button press to gamestatus 1
	var startButton = document.getElementById('startButton');
	startButton.disabled = false;
	startButton.addEventListener('click', function() {
		updateStatus(10);
	}, false);


	// add listener for ending screen when audio ends
	AA.fileEventListener('ended', function() {
		// rewind audio file
		AA.fileRewind();
		// AAK.fileRewind();
		// uptade game to status 2 (ENDED)
		updateStatus(30);

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

		if (HLR.GAMESTATUS > 0 && HLR.GAMESTATUS<20)
			updateStatus(20);
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

	// document.getElementById('enableMicButton').addEventListener('mouseup', function(){
	// 	updateStatus(11);
	// }, false);

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
