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

var AA = function(sourceFile) {

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var sourceFile = sourceFile || null;
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

var numFreqs = 128;
var freqArray = new Array(numFreqs);


//create custom event for audio loaded
var audioloadedEvent = document.createEvent('Event');
// Define that the event name is 'build'.
audioloadedEvent.initEvent('customaudioloaded', true, true);



function createAudioMeter(clipLevel,averaging,clipLag) {
	var processor = audioContext.createScriptProcessor(512);
	processor.onaudioprocess = volumeAudioProcess;
	processor.clipping = false;
	processor.lastClip = 0;
	processor.volume = 1;
	processor.clipLevel = clipLevel || 0.98;
	processor.averaging = averaging || 0.95;
	processor.clipLag = clipLag || 750;

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



var freqByteData, multiplier,magnitude,offset;
function fftArray() {
  // if(source.playbackState==1) source.start();

    // analyzer draw code here
     freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

    analyserNode.getByteFrequencyData(freqByteData);
     multiplier = analyserNode.frequencyBinCount / numFreqs;

    // Draw rectangle for each frequency bin.
    for (var i = 0; i < numFreqs; ++i) {
         magnitude = 0;
         offset = Math.floor( i * multiplier );
        // gotta sum/average the block, or we miss narrow-bandwidth spikes
        for (var j = 0; j< multiplier; j++)
            magnitude += freqByteData[offset + j];
        magnitude = magnitude / multiplier;
        var magnitude2 = freqByteData[i * multiplier];
        // analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numFreqs) + ", 100%, 50%)";
        // analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
        freqArray[i]=magnitude/256;
    }


  //  socket.emit('fft-data', {'freqArray': freqArray } );
  //  updateAnalysers();
    rafID = window.requestAnimationFrame( fftArray );
}

//load sample MP3
function loadAudio(stream) {

  if(stream) source = audioContext.createMediaStreamSource(stream);
  else source = audioContext.createBufferSource();

	analyserNode = audioContext.createAnalyser();
	analyserNode.fftSize = 5;
  analyserNode.smoothingTimeConstant = 0;
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

function initGUMedia() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
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
    getFreqArray:function(){return freqArray},
    getFreq:function(n){return freqArray[n]},
    loadAudio:loadAudio,
    initGUMedia:initGUMedia,
    start:function(){source.start()},
    isOk:isLoaded
}
}();

  window.addEventListener('load', function(){
      AA.initGUMedia();
      // AA.loadAudio();

  });
