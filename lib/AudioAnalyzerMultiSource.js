// check browser capabilities, se il browser non ha audiocontext l'app non può girare.
// se il browser non permette getusermedia il mic non può essere attivato

function checkAudioCapability(){
  // returns 0 if Web Audio API is not supported
  // returns 1 if can play a file but getUserMedia is not enabled
  // returns 2 if can play a file and get user media is enabled
  var audioCapability = null;
  if( ( window.AudioContext||window.webkitAudioContext ) ) {
    if(navigator.getUserMedia){
      return 2;
    }
    else{ return 1;}
  }
  else {
      return 0;
  }
};

// window.audioCapability = checkAudioCapability();
console.log(checkAudioCapability());
// window.addEventListener('load', function(){ console.log(audioCapability.status()); });





function AAMS(){
  var t = this;
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var actx = new AudioContext();

  // DEFINES
  var FILE = null, MIC = null;
  var selectedSource = null;

  // init analyser
  var frequencies = 512;
  var analyserNode = actx.createAnalyser();
  analyserNode.fftSize = frequencies || 256;
  var bufferLength = analyserNode.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  // var gainNode = actx.createGain();

  var micNode = null;

  // INIT audioFile
  var audioFile = new Audio("assets/audio/rogerwater2.mp3");// new Audio(audioFilePath);
  var fileNode = actx.createMediaElementSource(audioFile);
  FILE = 0;

  // INIT MediaSource
  if (navigator.getUserMedia) {
   navigator.getUserMedia (
     // constraints - only audio needed for this app
     {
       audio: true
     },

     // Success callback
     function(stream) {
       console.log('gUM available: ' + stream);
       micNode = actx.createMediaStreamSource(stream);
       MIC = 1;
     },

     // Error callback
     function(err) {
       console.log('The following gUM error occured: ' + err);
     }
    );
  } else {
     console.log('getUserMedia not supported on your browser!');
  }


  function connect(source){

    selectedSource = source;
    if(source==MIC){
      fileNode.disconnect();
      micNode.connect(analyserNode);
      // micNode.connect(actx.destination); // uncomment if you want audio routing
      console.log("MIC connected to analyserNode");
    }
    else if (source==FILE){
      micNode.disconnect();
      fileNode.connect(analyserNode);
      fileNode.connect(actx.destination);
      console.log("FILE connected to analyserNode");
    }
  }

  this.audioFile = audioFile;
  this.fileNode = fileNode;

  var audioPlaying = false;
  window.addEventListener('keyup', function(e){

    if(e.key == 'p'){
      audioPlaying = !audioPlaying;
      if(audioPlaying) audioFile.play();
      else audioFile.pause();
    }

    if(e.key == 'm'){
      //stop audio if playing
      audioPlaying = false;
      audioFile.pause();
      // select MIC
      connect(MIC);
    }

    if(e.key=='f'){
      connect(FILE);
    }
  });

  var frameCount = 0;
  function fftAnalyse() {
    ++frameCount;
    if( (selectedSource==FILE && !audioFile.paused) || selectedSource==MIC )
      analyserNode.getByteFrequencyData(dataArray);
    rafID = window.requestAnimationFrame( fftAnalyse );
    if(frameCount%60==0)
      console.log(t.getFreq(0));
  }


  // RETURNS
  t.getFreq = function(n){
    return dataArray[n]/256;
  }

  // auto-start analysis
  fftAnalyse();

};
