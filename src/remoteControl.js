// this stores all data coming from websocket / any remote source we want to connect

var HLR = {
  fft1: 0.0,
  fft2: 0.0,
  fft3: 0.0,
  fft4: 0.0,
  fft5: 0.0,

  connectedUsers:0, // affects fauna

  key1: false,
  key2: false,
  key3: false,
  key4: false,
  key5: false,
}

  HLR.updateFFT = function(a,b,c,d,e){
    HLR.fft1 = a;
    HLR.fft2 = b;
    HLR.fft3 = c;
    HLR.fft4 = d;
    HLR.fft5 = e;
  }

  HLR.updateClientsNumber = function(a){
    HLR.connectedClient = a;
  }

  HLR.listenKeys = function(){}

  var tempFFT1 = 0,
  tempFFT2 = 0,
  tempDevLandHeight=0;

  HLR.updateHLParams = function(){
    if(!isNaN(HLR.fft1)){
      // moveSpeed in anim deve avere una costante più questo valore
      HLG.movespeed =  HLG.movespeed + (HLR.fft2*7.5 - HLG.movespeed) * 0.1;

  //  HLG.seaSpeed = HLR.fft2;

  tempFFT1 += (HLR.fft1 - tempFFT1)*0.0005;
  tempFFT2 += (HLR.fft3 - tempFFT2)*0.0005;

    HLG.noiseFrequency = 11 - tempFFT1*10 + tempFFT2*10;
    HLG.noiseFrequency2 += (HLR.fft3*2000 - HLG.noiseFrequency2)*0.0005;

    //devLandBase:-15;
    tempDevLandHeight += (HLR.fft2*200 - tempDevLandHeight)*0.001;
    HLG.devLandHeight = 100;//tempDevLandHeight;// + Math.sin(tempFFT1*millis*.15)*100;// + HL.noise.noise(tempFFT1,HLG.landStepsCount*2, 1000)*150;
    //HLG.devLandBase = -HLG.devLandHeight*0.5 - tempFFT1;


    HL.materials.clouds.opacity = HLR.fft1*0.5;
    HL.materials.fauna.opacity = HLR.fft3*0.5;
    }
  }
