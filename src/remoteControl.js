// this stores all data coming from websocket / any remote source we want to connect
// TODO socket here
var HLR = {
  //audio
  fft1: 0.0,
  fft2: 0.0,
  fft3: 0.0,
  fft4: 0.0,
  fft5: 0.0,
  maxFFT1:0.0001,
  maxFFT2:0.0001,
  maxFFT3:0.0001,
  maxFFT4:0.0001,
  maxFFT5:0.0001,
  smoothFFT1:0,
  smoothFFT2:0,
  smoothFFT3:0,
  smoothFFT4:0,
  smoothFFT5:0,

  // socket
  connectedUsers:0, // affects fauna
  key1: false,
  key2: false,
  key3: false,
  key4: false,
  key5: false,


  //temp vars to be used by scenes
  tempLandHeight:0,
  tempLandZeroPoint:0,
  tempNoiseFreq:0,
  tempNoiseFreq2:0,

}


var HLRemote = function(){


  function updateFFT(a,b,c,d,e){
    HLR.fft1 = a;
    HLR.fft2 = b;
    HLR.fft3 = c;
    HLR.fft4 = d;
    HLR.fft5 = e;
  }

  // TODO bind to SOCKET
  function updateClientsNumber(clientsConnected){
    HLE.mobileConnected = Math.round(clientsConnected);
    HLR.connectedUsers = clientsConnected;
  }

  function updateHLParams(a,b,c,d,e){
    // TODO: memory optimization

      updateFFT(
        Math.max(a,0.0001),
        Math.max(b,0.0001),
        Math.max(c,0.0001),
        Math.max(d,0.0001),
        Math.max(e,0.0001)
      );

    // begin audioreactive stuff
//    if(!isNaN(HLR.fft1)){
      // compute smooth
      HLR.smoothFFT1 += (HLR.fft1 - HLR.smoothFFT1)*0.005;
      HLR.smoothFFT2 += (HLR.fft2 - HLR.smoothFFT2)*0.005;
      HLR.smoothFFT3 += (HLR.fft3 - HLR.smoothFFT3)*0.005;
      HLR.smoothFFT4 += (HLR.fft4 - HLR.smoothFFT4)*0.005;
      HLR.smoothFFT5 += (HLR.fft5 - HLR.smoothFFT5)*0.005;

      //compute max
      // HLR.maxFFT1 = HLR.fft1>HLR.maxFFT1?HLR.fft1:HLR.maxFFT1; UNUSED
      // HLR.maxFFT2 = HLR.fft2>HLR.maxFFT2?HLR.fft2:HLR.maxFFT2; UNUSED
      // HLR.maxFFT3 = HLR.fft3>HLR.maxFFT3?HLR.fft3:HLR.maxFFT3; UNUSED
      // HLR.maxFFT4 = HLR.fft4>HLR.maxFFT4?HLR.fft4:HLR.maxFFT4; UNUSED
      HLR.maxFFT5 = HLR.fft5>HLR.maxFFT5?HLR.fft5:HLR.maxFFT5; // USED in sceneManaer

  }

  return{
    updateHLParams:function(a,b,c,d,e){return updateHLParams(a,b,c,d,e)},
  }
}();
