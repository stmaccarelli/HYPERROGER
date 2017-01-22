function AAMS(){
  // CUSTOM STYLE FOR console.log
  var console = { log:null, warn:null, error:null };
  for(var k in console){
    console[k] =
      (function(_k){
        return function(message){
          window.console[_k]('%c  %cAAMS:\n'+message,
            "background-image: url(\"https://isitchristmas.com/emojis/microphone.png\"); background-size: cover",
            "color:orange"
            );
        }
      })(k);
  }


  // function to check WebAudio API browser capabilities
  // returns 0 if Web Audio API is not supported
  // returns 1 if can play a file but getUserMedia is not enabled
  // returns 2 if can play a file and get user media is enabled
  function checkAudioSupport(){

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

  // if browser doesn't support WebAudio api, return;
  var as = checkAudioSupport();

  if(as==0) console.log('WebAudio API not supported in this browser');
  if(as==1) console.log('WebAudio API supported, Audio file supported, getUserMedia not supported');
  if(as==2) console.log('WebAudio API supported, Audio file and getUserMedia analysis supported');

  // if browser doesn't support WebAudio api, return;
  if(as == 0) return;

  // declarations / inits
  var t = this;
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var actx = new AudioContext();
  var rafID = null; //requestAnimationFrame ID;

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
       console.log('getUserMedia available: ' + stream);
       micNode = actx.createMediaStreamSource(stream);
       MIC = 1;
     },

     // Error callback
     function(err) {
       console.error('The following gUM error occured: ' + err);
     }
    );
  } else {
     console.warn('getUserMedia not supported on your browser!');
  }


  function connect(source){

    selectedSource = source;
    if(source==MIC){
      //pause audioFile in case it's playing
      audioFile.pause();
      // disconnect
      fileNode.disconnect();
      micNode.connect(analyserNode);
      // micNode.connect(actx.destination); // uncomment if you want audio output
      console.log("MIC connected to analyserNode");
    }
    else if (source==FILE){
      micNode.disconnect();
      fileNode.connect(analyserNode);
      fileNode.connect(actx.destination);
      console.log("FILE connected to analyserNode");
    }
  }



  // START / RUN ANALYSIS
  var frameCount = 0;
  function analysis() {

    ++frameCount;
    if( (selectedSource==FILE && !audioFile.paused) || selectedSource==MIC )
      analyserNode.getByteFrequencyData(dataArray);

    rafID = window.requestAnimationFrame( analysis );
    // if(frameCount%60==0)console.log(dataArray[0]);

  }

  // PAUSE ANALYSIS
  function pauseAnalysis(){
    window.cancelAnimationFrame(rafID);
    rafID = null;
  }


  // AUDIO FILE PLAY / PAUSE
  function audioPlayPause(){
    if(audioFile.paused){
      audioFile.play();
      wasPlayingAudio = true;
      return 1;
    }
    else {
      audioFile.pause();
      wasPlayingAudio = false;
      return 0;
    }
  }



  window.addEventListener('keyup', function(e){

    if(e.key == 'p'){
      audioPlayPause();
    }

    if(e.key == 'm'){
      connect(MIC);
    }

    if(e.key=='f'){
      connect(FILE);
    }
  });

  // pause audio file if window not in focus
  // analysis is rAF based, so it will pause anyway if window in background
  var wasPlayingAudio = false;
  function handleVisibilityChange() {
    if (document.hidden) {
      if(wasPlayingAudio) audioFile.pause();
    } else  {
      if(wasPlayingAudio) audioFile.play();
    }
  }
  document.addEventListener("visibilitychange", handleVisibilityChange, false);



  // RETURNS
  t.audioSupport = as;
  t.getFreq = function(n){
    return dataArray[n]/256;
  }
  t.pauseAnalysis = pauseAnalysis;
  t.startAnalysis = function(){
    if(rafID===null) {
      analysis();
    } else {
      console.warn('analysis already running');
    }
  }
  t.audioPlayPause = audioPlayPause;
  t.connectMic = function(){connect(MIC)};
  t.connectFile = function(){connect(FILE)};
  // DEBUG
  t.audioFile = audioFile;

  // auto-start analysis
  t.startAnalysis();



};
