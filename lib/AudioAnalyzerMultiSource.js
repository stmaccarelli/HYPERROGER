function AAMS(audioFileData, params){
  // CUSTOM STYLE FOR console.log
  // var console = { log:null, warn:null, error:null };
  // for(var k in console){
  //   console[k] =
  //     (function(_k){
  //       return function(message){
  //         window.console[_k]('%c  %cAAMS:\n'+message,
  //           "background-image: url(\"https://isitchristmas.com/emojis/microphone.png\"); background-size: cover",
  //           "color:orange"
  //           );
  //       }
  //     })(k);
  // }


  // polyfill AudioContext;
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

  // function to check WebAudio API browser capabilities
  // returns

  // -1  :  no WebAudio API   - can't execute
  // 1   :  file OK | gUM NO  - ok (only FILE)
  // -10 :  file NO | gUM NO  - can't execute
  // 2   :  file OK | gum OK  - ok
  // 20  :  file NO | gUM OK  - ok (only gUM)

  var as = (function(){

    if( ( window.AudioContext ) ) {
      console.log('WebAudio API supported');

      if(navigator.getUserMedia){
        console.log('getUserMedia available');

        if ( typeof audioFileData !== 'string' && ! (audioFileData instanceof Blob) ){
          console.warn('audioFile not provided\nAAMS(audioFileString||audioFileblob [, parameters]);');
          return 20;
        }
        else{
          console.log('audioFile and getUserMedia analysis available.');
          return 2;
        }
      }
      else {
        console.warn('getUserMedia not available');

        if ( typeof audioFileData !== 'string' && ! (audioFileData instanceof Blob) ){
          console.error('audioFile not provided.\nAAMS(audioFileString||audioFileblob [, parameters]);');
          return -10;
        }
        else{
          console.log('audioFile analysis available.');
          return 1;
        }

      }

    }
    else {
      console.error('WebAudio API not supported in this browser');
      return -1;
    }
  })();


  // stop if any analysis is available
  if (as<0) return false;


  // declarations / inits
  var t = this;
  var actx = new AudioContext();
  var rafID = null; //requestAnimationFrame ID;

  // custom events
  var audioEvent = new Event('audioFileEnded');

  // DEFINES
  var FILE = null, GUM = null;
  var selectedSource = null;

  // init analysers
  params = params || {};

  var analyserNode = actx.createAnalyser();
  analyserNode.fftSize = params.fftSize!==undefined?params.fftSize:512;
  analyserNode.smoothingTimeConstant = params.smoothing!==undefined?params.smoothing:0.0;
  var mute = params.mute!==undefined?params.mute:false;

  // analyserNode.maxDecibels = 0;
  var dataArray = new Uint8Array(analyserNode.frequencyBinCount);

  var micNode = null;

  // INIT audioFile
  var audioFile = new Audio( audioFileData instanceof Blob ? URL.createObjectURL(audioFileData) : audioFileData );
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
       var GUMOkEvent = new Event('GUMOk');
       window.dispatchEvent(GUMOkEvent);
       GUM = 1;
     },

     // Error callback
     function(err) {
       console.error('The following gUM error occured: ');
       console.error(err);
       as = 1;
     }
    );
  } else {
     console.warn('getUserMedia not supported on your browser!');
  }


  function connect(source){

    if(source==GUM && ( as==2 || as ==20 ) ){
      selectedSource = source;
      //pause audioFile in case it's playing
      audioFile.pause();
      // disconnect
      fileNode.disconnect();
      analyserNode.disconnect();
      if(micNode!==null) micNode.connect(analyserNode);
      else {
        window.addEventListener('GUMOk', function(){micNode.connect(analyserNode);});
      }
      // if(!mute) micNode.connect(actx.destination); // uncomment if you want audio output
      console.log("GUM connected to analyserNode");
    }
    else if (source==FILE && as>0){
      selectedSource = source;
      if(as==2 && micNode!==null) micNode.disconnect();
      fileNode.connect(analyserNode);
      if(!mute) analyserNode.connect(actx.destination);
      console.log("FILE connected to analyserNode");
    }
  }



  // START / RUN ANALYSIS
  function analysis() {
    analyserNode.getByteFrequencyData(dataArray);
    rafID = window.requestAnimationFrame( analysis );
  }

  // PAUSE ANALYSIS
  function pauseAnalysis(){
    if(selectedSource == FILE){
      audioFile.pause();
      wasPlayingAudio = false;
    }
    window.cancelAnimationFrame(rafID);
    rafID = null;
  }

  // start analysis
  function startAnalysis(){
    if(rafID===null) {
      if(selectedSource == FILE){
        audioFile.play();
        wasPlayingAudio = true;
      }
      analysis();
    } else {
      console.warn('analysis already running');
    }
  }


  // AUDIO FILE PLAY / PAUSE
  // TODO: remove

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


  // // pause audio file if window not in focus
  // // analysis is rAF based, so it will pause anyway if window in background
  // var wasPlayingAudio = false;
  // function handleVisibilityChange() {
  //   if ( document.hidden ) {
  //     if(wasPlayingAudio) audioFile.pause();
  //   } else  {
  //     if(wasPlayingAudio) audioFile.play();
  //   }
  //   console.log('handleVisibilityChange() audioFile '+(audioFile.paused?'paused':'playing'));
  // }
  //
  // if(!isMobile){
  //   document.addEventListener("visibilitychange", handleVisibilityChange, false);
  // }


  // RETURNS
  t.audioSupport = as;
  t.getFreq = function(n){
    var value = dataArray[n];
    if(selectedSource==FILE)
      return value/256;
    else return value/256;

  }
  t.pause = pauseAnalysis;
  t.play = startAnalysis;

  t.filePlayPause = audioPlayPause;
  t.fileRewind = function(){audioFile.currentTime = 0};
  t.fileEventListener = function(event_,function_){audioFile.addEventListener(event_,function_);};
  t.fileGetTime = function(){return audioFile.currentTime};
  t.fileGetDuration = function(){return audioFile.duration};
  t.fileGetPaused = function(){return audioFile.paused};
  t.connectMic = function(){connect(GUM)};
  t.connectFile = function(){connect(FILE)};

  // DEBUG
  t.audioFile = audioFile;
  t.fileNode = fileNode;
  t.analyserNode = analyserNode;
  t.dataArray = dataArray;
  t.getSelectedSource = function(){return selectedSource;};
  t.as = as;
  t.FILE = 0;
  t.MIC = 1;

  // auto-start analysis
  // startAnalysis();



};
