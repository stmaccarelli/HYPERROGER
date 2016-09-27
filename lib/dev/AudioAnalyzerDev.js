

/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/


var AA = function( sourceFile, tempFreqArray, numFreqs) {

window.AudioContext = window.AudioContext || window.webkitAudioContext;
sourceFile = sourceFile || null;
var analyzerFreqs = 512;
var analyzerPortion = 1; //takes only first Nth portion of fft, because its meaningful
numFreqs = numFreqs || analyzerFreqs*0.25; //
numFreqs = 512;

var freqByteData = new Uint8Array(analyzerFreqs); // analyzerNode array
var freqArray = new Array();
// if defined specific frequencies to be analyzed, create an array with such indees
if(tempFreqArray!==undefined){
  for(var i in tempFreqArray)
    freqArray[ tempFreqArray[i] ] = 1;
}
else
  for(var i=0;i<numFreqs;i++)
    freqArray[i]=i;

console.log("AudioAnalyzer:");
console.log("sourceFile "+sourceFile);
console.log("numFreqs "+numFreqs);
console.log("freqArray length "+freqArray.length);

var meter;
var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null,
    audioRecorder = null,
    source = null,
    analyserNode = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;
var isLoaded = false;




//create custom event for audio loaded
var audioloadedEvent = new Event("AAload")



function createAudioMeter(clipLevel,averaging,clipLag) {
	var processor = audioContext.createScriptProcessor(analyzerFreqs);
	// processor.onaudioprocess = volumeAudioProcess;
	processor.clipping = false;
	processor.lastClip = 0;
	processor.volume = 1;
	processor.clipLevel = clipLevel || 0.99;
	processor.averaging = averaging || 0.18;
	processor.clipLag = clipLag || 750;
  processor.updating = 30;
	// this will have no effect, since we don't copy the input to the output,
	// but works around a current Chrome bug.
	processor.connect(audioContext.destination);

	processor.checkClipping =
		function(){
			if (!this.clipping)
				return false;
			if ((this.lastClip + this.clipLag) < window.performance.now())
				this.clipping = false;
			return this.clipping;
		};

	processor.shutdown =
		function(){
			this.disconnect();
			this.onaudioprocess = null;
		};

	return processor;
}

function volumeAudioProcess( event ) {
	var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
	var sum = 0;
    var x;

	// Do a root-mean-square on the samples: sum up the squares...
    for (var i=0; i<bufLength; i++) {
    	x = buf[i];
    	if (Math.abs(x)>=this.clipLevel) {
    		this.clipping = true;
    		this.lastClip = window.performance.now();
    	}
    	sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
}



// var multiplier,magnitude,offset;
// function fftArray() {
//   // if(source.playbackState==1) source.start();
//
//     // analyzer draw code here
//     // freqByteData = new Uint8Array(analyserNode.frequencyBinCount);
//
//     analyserNode.getByteFrequencyData(freqByteData);
//      multiplier = analyserNode.frequencyBinCount / numFreqs;
//
//     // Draw rectangle for each frequency bin.
//     for (var i = 0; i < numFreqs; ++i) {
//          magnitude = 0;
//          offset = Math.floor( i * multiplier * analyzerPortion ); //analyzerPortion takes only first nth part of fft spectrum
//         // gotta sum/average the block, or we miss narrow-bandwidth spikes
//         for (var j = 0; j< multiplier; j++)
//             magnitude += freqByteData[offset + j];
//         magnitude = magnitude / multiplier;
//         var magnitude2 = freqByteData[i * multiplier];
//         // analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numFreqs) + ", 100%, 50%)";
//         // analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
//         freqArray[i]=magnitude/256;
//     }
//
//
//   //  socket.emit('fft-data', {'freqArray': freqArray } );
//   //  updateAnalysers();
//     rafID = window.requestAnimationFrame( fftArray );
// }

function fftArray() {
  // if(source.playbackState==1) source.start();
    analyserNode.getByteFrequencyData(freqByteData);
    for(var i in freqArray)
      freqArray[i] = freqByteData[i]/256;
    rafID = window.requestAnimationFrame( fftArray );
}


// if defined specific frequencies to be analyzed, create an array with such indees
//if(tempFreqArray!==undefined)

function fftArrayDefined() {
  // if(source.playbackState==1) source.start();
    analyserNode.getByteFrequencyData(freqByteData);
    for(var i in freqArray)
      freqArray[i] = freqByteData[i]/256;
    rafID = window.requestAnimationFrame( fftArray );
}


//load sample MP3
function loadAudio(stream) {

  if(stream) source = audioContext.createMediaStreamSource(stream);
  else source = audioContext.createBufferSource();

	analyserNode = audioContext.createAnalyser();
	analyserNode.fftSize = 1024;
  analyserNode.smoothingTimeConstant = 0.5;
  // Create a new volume meter and connect it.
  meter = createAudioMeter();
	// Connect audio processing graph
	source.connect(meter);
  source.connect(analyserNode);
  if(!stream){source.connect(audioContext.destination);
	 loadAudioBuffer("sftcr2.mp3");
   console.log("loadSampleAudio");
  }
  else finishLoad(stream);

}

function loadAudioBuffer(url) {
	// Load asynchronously
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	request.onload = function() {


		audioContext.decodeAudioData(request.response, function(buffer) {
				audioBuffer = buffer;
				finishLoad();
		 }, function(e) {
			console.log(e);
		});

	};

	request.send();
  console.log("loadAudioBuffer");

}

function initGetUserMedia() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.mediaDevices.getUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, loadAudio, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
}


function finishLoad(stream) {
  if(!stream){
	source.buffer = audioBuffer;
	source.loop = true;
  }
  fftArray();
  console.log("audio loaded");
  if(!isLoaded)isLoaded=true;
  //dispatch audioloaded event
  window.dispatchEvent(audioloadedEvent);
}




return{
    setNumFreqs: function(n){ numFreqs=n; freqArray = new Array(n)},
    getFreqArray:freqArray,
    getFreq:function(n){return freqArray[n]},
    loadAudio:loadAudio,
    initGetUserMedia:initGetUserMedia,
    start:function(){source.start()},
    isOk:isLoaded
}
}();

  window.addEventListener('load', function(){
      AA.initGetUserMedia();
      // AA.loadAudio();

  });
