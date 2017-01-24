function AAMS(audioFilePath){
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

  // custom events
  var audioEvent = new Event('audioFileEnded');

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
  var audioFile = new Audio(audioFilePath||null);
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

    if(source==MIC && as==2){
      selectedSource = source;
      //pause audioFile in case it's playing
      audioFile.pause();
      // disconnect
      fileNode.disconnect();
      micNode.connect(analyserNode);
      // micNode.connect(actx.destination); // uncomment if you want audio output
      console.log("MIC connected to analyserNode");
    }
    else if (source==FILE && as>0){
      selectedSource = source;
      if(as==2) micNode.disconnect();
      fileNode.connect(analyserNode);
      fileNode.connect(actx.destination);
      console.log("FILE connected to analyserNode");
    }
  }



  // START / RUN ANALYSIS
  function analysis() {

  //  if( (selectedSource==FILE && !audioFile.paused) || selectedSource==MIC )
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
    var play = function(){
      audioFile.play();
      wasPlayingAudio = true;
      console.log('audioPlayPause() audioFile '+(audioFile.paused?'paused':'playing'));
      return 1;
    }
    var pause = function(){
      audioFile.pause();
      wasPlayingAudio = false;
      console.log('audioPlayPause() audioFile '+(audioFile.paused?'paused':'playing'));
      return 0;
    }

    if(audioFile.paused){
      play();
    }
    else {
      pause();
    }

  }

  // pause audio file if window not in focus
  // analysis is rAF based, so it will pause anyway if window in background
  var wasPlayingAudio = false;
  function handleVisibilityChange() {
    if (document.hidden) {
      if(wasPlayingAudio) audioFile.pause();
    } else  {
      if(wasPlayingAudio) audioFile.play();
    }
    console.log('handleVisibilityChange() audioFile '+(audioFile.paused?'paused':'playing'));
  }
  document.addEventListener("visibilitychange", handleVisibilityChange, false);



  // RETURNS
  t.audioSupport = as;
  t.getFreq = function(n){
    if(selectedSource==FILE) return dataArray[n]/256;
    else return dataArray[n]/200;
  }
  t.pauseAnalysis = pauseAnalysis;
  t.startAnalysis = function(){
    if(rafID===null) {
      analysis();
    } else {
      console.warn('analysis already running');
    }
  }
  t.filePlayPause = audioPlayPause;
  t.fileRewind = function(){audioFile.currentTime = 0};
  t.fileEventListener = function(event_,function_){audioFile.addEventListener(event_,function_);};
  t.fileGetTime = function(){return audioFile.currentTime};
  t.fileGetDuration = function(){return audioFile.duration};
  t.fileGetPaused = function(){return audioFile.paused};
  t.connectMic = function(){connect(MIC)};
  t.connectFile = function(){connect(FILE)};
  // DEBUG
  t.audioFile = audioFile;
  t.analyserNode = analyserNode;

  // auto-start analysis
  t.startAnalysis();



};
