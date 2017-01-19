// let's assume fftArray has 60 frames per second, every frame is a serialized string

var audioObject = function(audioFilePath, fftArray, fps){

  var _p = this;

  this.audioFile = new Audio(audioFilePath);
  if (fftArray === undefined) return false;

  this.currentTime = 0;
  this.duration = audioFile.duration;
  this.frameIndex = 0;

  function start(){
    audioFile.play();
    analyze();
  }

  function pause(){
    audioFile.pause();
    // pause analyze;
  }

  function analyze(){
    if(audioFile.currentTime > audioFile.duration)
      return -1;

    requestAnimationFrame(_p.analyze);

    _p.frameIndex = Math.round(
      audioFile.currentTime*30
    );
  }

  function get(freqIndex){ // which frequency do you want?
     if(_p.frameIndex < fftArray.length)
      return fftArray[_p.frameIndex][freqIndex] / 150.0;
     else
      return 999.0;
  }

  _p.start = start;
  _p.getFreq = get;
  _p.pause = pause;
  _p.analyze = analyze;

  return _p;

};
