 var HLSP = {
/*
set squareness to 0 for a flat land
*/

//      // intensità colore land audioreattivab più bassa
//      mizu: {
//          cameraPositionY: 10,
//          seaLevel: 0,
//
//          displayText: 'CHAPTER ONE, MIZU<br>TO BE TRAPPED INTO THE MORNING UNDERTOW',
//          speed: 10,
//          modelsParams: ['stones', function(){return 1+Math.random()*40}, 3, true, true, 0],
//
//          tiles: 62,
//         repeatUV: 1,
//         bFactor: 0.5,
//         cFactor: 0.07594379703811609,
//         buildFreq: 10,
//         natural: 0.6834941733430447,
//         rainbow: 0.5641539208545766,
//          squareness: 0.022450016948639295,
//          map: 'white',
//          landRGB: 1966335,
//          horizonRGB: 0,
//          skyMap: 'sky4',
//      },
//
//      // fft1 più speedup moveSpeed
//      solar_valley: {
//          cameraPositionY: -180,
//          seaLevel: -450,
//          fogDensity: 0.00054,
//
//          displayText: 'CHAPTER TWO, SOLAR VALLEY<br>FIRE EXECUTION STOPPED BY CLOUDS',
//          speed: 10,
//          modelsParams: ['stones', function(){return 1+Math.random()*5}, 40, true, false, -750],
//
//          tiles: 200,
//          repeatUV: 7,
//          bFactor: 0.6617959456178687,
//          cFactor: 0.3471716436028164,
//          buildFreq: 10,
//          natural: 0.18443493566399619,
//          rainbow: 0.03254734158776403,
//          squareness: 0.00001,
//          map: 'land3',
//          landRGB: 9675935,
//          horizonRGB: 3231404,
//          skyMap: 'sky4',
//      },
//
//      // camera underwater
//      escher_surfers: {
//          cameraPositionY: 40,
//          seaLevel: 50,
//
//          displayText: 'CHAPTER THREE, ESCHER SURFERS<br>TAKING REST ON K 11',
//          speed: 10,
//          modelsParams: ['cube', 3, 1, true, true, 0 ],
//
//          tiles: 73,
//          repeatUV: 112,
//          bFactor: 1.001,
//          cFactor: 0,
//          buildFreq: 10,
//          natural: 0,
//          rainbow: 0.492,//0.16273670793882017,
//          squareness: 0.08945796327125173,
//
//          map: 'pattern1',
//          landRGB: 0xff1166,//16727705,
//          horizonRGB: 7935,
//          skyMap: 'sky1',
//      },
//
//      // sea level più basso
//      // modelli: cubid
//      currybox: {
//          cameraPositionY: 100,//HLE.WORLD_HEIGHT*.5,
//          seaLevel: -100,
//
//          displayText: 'CHAPTER FOUR, CURRYBOX<br>A FLAKE ON THE ROAD AND A KING AND HIS BONES',
//          speed: 5,
//          modelsParams: ['band', function(){return 50+Math.random()*20}, 2, false, true, -150],
//
//         //  modelsParams: [['cube'], function(){return 1+Math.random()*5}, 1, true, false,-100],
//
//          tiles: 145,
//          repeatUV: 1,
//          bFactor: 0.751,
//          cFactor: 0.054245569312940056,
//          buildFreq: 10,
//          natural: 0.176420247632921,
//          rainbow: 0.21934025248846812,
//          squareness: 0.01,
//          map: 'white',
//          landRGB: 13766158,
//          horizonRGB: 2665099,
//
//          skyMap: 'sky1',
//      },
//
//      // sealevel basso
//      galaxy_glacier: {
//          cameraPositionY: 50,
//          seaLevel: -100,
//
//          displayText: 'CHAPTER FIVE, GALAXY GLACIER<br>HITTING ICEBERGS BLAMES',
//          speed: 2,
//          modelsParams: [null, 1, true, true],
//
//          tiles: 160,
//          repeatUV: 1,
//          bFactor: 0.287989180087759,
//          cFactor: 0.6148319562024518,
//          buildFreq: 61.5837970429,
//          natural: 0.4861551769529205,
//          rainbow: 0.099628324585666777,
//          squareness: 0.01198280149135716,
//          map: 'pattern5', //%
//          landRGB: 11187452,
//          horizonRGB: 6705,
//          skyMap: 'sky1',
//      },
//
//      firefly: {
//
//          cameraPositionY: 50,
//          seaLevel: 0,
//
//          displayText: 'CHAPTER SIX, FIREFLY',
//
//          speed: 1,
//          modelsParams: [null, 1, true, true],
//
//          tiles: 100,
//          repeatUV: 1,
//          bFactor: 1,
//          cFactor: 1,
//          buildFreq: 1,
//          natural: 1,
//          rainbow: 0,
//          squareness: 0,
//          map: 'white',
//          landRGB: 2763306,
//          horizonRGB: 0,
//          skyMap: 'sky1',
//      },
//
//
//      //camera position.y -400
//      // partire sopra acqua, e poi gradualmente finire sott'acqua
//
// //G
//      drift: {
//          cameraPositionY: -450,
//          seaLevel: 0,
//
//          displayText: 'CHAPTER SEVEN, DRIFT<br>LEAVING THE BOAT',
//          speed: 3,
//          modelsParams: ['stones', function(){return 1+Math.random()*2}, 2, true, true, 0],
//
//          tiles: 128,
//          repeatUV: 0,
//          bFactor: 0.24952961883952426,
//          cFactor: 0.31,
//          buildFreq: 15.188759407623216,
//          natural: 0.3471716436028164,
//          rainbow: 1.001,
//          squareness: 0.00001,
//          map: 'land1',
//          landRGB: 16777215,
//
//          horizonRGB: 6039170,
//          skyMap: 'sky2',
//      },

//H
     interactiveRogerWater: {
         cameraPositionY: 400,

         displayText: 'CHAPTER EIGHT, HYPEROCEAN<br>CRAVING FOR LOVE LASTS FOR LIFE',
         speed: 5,
         modelsParams: ['space', 2, 40, true, false, 160],

         tiles: isMobile?128:256,
         repeatUV: 24,
         bFactor: 0.901,
         cFactor: 0.519,
         buildFreq: 150.188759407623216,
         natural: 0.9651924010682208,
         rainbow: 0.38,
         squareness: 0.00001,
         map: 'land5',
         map2: 'land4',
         landRGB: 0xffffff,
         horizonRGB: 7173242,
         skyMap: 'sky2',
     },

     // balene
     // capovolgere di conseguenza modelli balene
//I
//      twin_horizon: {
//          cameraPositionY: 100,
//
//          displayText: 'CHAPTER NINE, TWIN HORIZON<br>ON THE RIGHT VISION TO THE RIGHT SEASON',
//          speed: 10,
//          modelsParams: ['sea', function(){return 20+Math.random()*20}, 20, false, false, 550],
//
//          tiles: 99,
//          repeatUV: 1,
//          bFactor: 0.20445411338494512,
//          cFactor: 0.33632252974022836,
//          buildFreq: 45.50809304437684,
//          natural: 0.4448136683661085,
//          rainbow: 0,
//          squareness: 0.0013619887944460984,
//          map: 'white',
//          landRGB: 0x000fff,
//          horizonRGB: 16728899,
//          skyMap: 'sky1',
//
//      },
//
//      // da un certo punto random colors (quando il pezzo aumenta)
//      // da stesso punto aumenta velocità
//      // sea level basso
//      // modelli elettrodomestici / elettronica
// //J
//      else: {
//          cameraPositionY: 50,
//
//          displayText: 'CHAPTER TEN, ELSE<br>DIE LIKE AN ELECTRIC MACHINE',
//          speed: 10,
//
//          modelsParams: ['band', function(){return 50+Math.random()*100}, 2, true, true, -50],
//
//          tiles: 104,
//          repeatUV: 128,
//          bFactor: 0.5641539208545766,
//          cFactor: 0,
//          buildFreq: 30.804098302357595,
//          natural: 0.0,
//          rainbow: 0.6458797021572349,
//          squareness: 0.013562721707765414,
//          map: 'pattern2',
//          landRGB: 65399,
//          horizonRGB: 0x000000,
//          skyMap: 'sky3',
//      },
//
//      // quando iniziano i kick randomizza landscape
//      // odissea nello spazio
//      // cielo stellato (via lattea)
//
// //K
//      roger_water: {
//          cameraPositionY: 500,
//
//          displayText: 'CHAPTER ELEVEN, ROGER WATER<br>PROTECT WATER',
//          speed: 10,
//          modelsParams: [null, 0, 0, true, true, 0],
//          // HLH.startGroup(group, scale, speed,rotation,floating, midpoint){
//
//          tiles: 80,
//          repeatUV: 1,
//          bFactor: 0,
//          cFactor: 0.20613316338917223,
//          buildFreq: 10,
//          natural: 1.001,
//          rainbow: 0.1735858218014082,
//          squareness: 0.00001,
//          map: 'white',
//          landRGB: 2105376,
//          horizonRGB: 0,
//          skyMap: 'sky1',
//      },
//
// //L
//      alpha_11: {
//          cameraPositionY: 50,
//
//          displayText: 'CHAPTER TWELVE, ALPHA 11<br>A MASSIVE WAVE IS DRIVING ME HOME',
//          speed: 1,
//          modelsParams: ['stones', function(){return 1+Math.random()*40}, 3, true, true, 0],
//
//          tiles: 6,
//          repeatUV: 1,
//          bFactor: 0,
//          cFactor: 0,
//          buildFreq: 44.48136683661085,
//          natural: 0,
//          rainbow: 0,
//          squareness: 0.00001,
//          map: 'white',
//          landRGB: 0,
//          horizonRGB: 3980219,
//          skyMap: 'sky1',
//
//      },
//
// //M
//      blackpool: {
//
//          displayText: 'BLACKPOOL',
//          speed: -10,
//          modelsParams: ['space', 2, 400, true, false, 200],
//
//          cameraPositionY: 110,
//          seaLevel: 10,
//
//         //  speed: 4,
//         //  modelsParams: ['sea', 1, true, true],
//
//          tiles: 182,
//          repeatUV: 16.555478741450983,
//          bFactor: 0.6048772396441062,
//          cFactor: 0.016358953883098624,
//          buildFreq: 73.3797815423632,
//          natural: 0.9833741906510363,
//          rainbow: 0.10821609644148733,
//          squareness: 0.00599663055740593,
//          map: 'land3',
//          landRGB: 12105440,
//          horizonRGB: 2571781,
//
//          skyMap: 'sky1',
//      },
//
//      vanillacola:
//      {
//        cameraPositionY: 100,//HLE.WORLD_HEIGHT*.5,
//        seaLevel: 0,
//
//        speed: 5,
//        modelsParams: ['band', function(){return 40+Math.random()*20}, 1, false, true, -20],
//        displayText: 'VANILLACOLA<br>THE FILM IS OUT OF COLOR',
//
//        tiles: 256,
//        repeatUV: 64,
//        bFactor: 0.57059,
//        cFactor: 0.04105,
//        buildFreq: 10,
//        natural: 0.625669164732314,
//        rainbow: 0.30715903408406997,
//        squareness: 0.1785271559526051,
//        map: 'land1',
//        landRGB: 10848182,
//        horizonRGB: 8195175,
//        skyMap: 'sky3'
//
//      },
//
//      intro: {
//          cameraPositionY: 650,
//          seaLevel:0,
//
//          displayText: 'INTRO',
//          speed: 0,
//          modelsParams: ['sea', 1, true, true],
//
//          tiles: 100,
//          repeatUV: 1,
//          bFactor: 0,
//          cFactor: 0,
//          buildFreq: 10,
//          natural: 1,
//          rainbow: 0,
//          squareness: 0,
//
//          map: 'sky1',
//          landRGB: 0x111111,
//          horizonRGB: 0x6f6f6f,
//          skyMap: 'sky3'
//      },
//
//      offline: {
//          cameraPositionY: 50,
//
//          displayText: 'OFFLINE SCENE',
//          speed: 0,//18,
//          modelsParams: null,
//
//          tiles: 200,
//          repeatUV: 12,
//          bFactor: 1.001,
//          cFactor: 0.21934025248846812,
//          buildFreq: 15.188759407623216,
//          natural: 0.7051924010682208,
//          rainbow: 0.1952840495265842,
//          squareness: 0.00001,
//          map: 'land5',
//          landRGB: 14798516,
//          horizonRGB: 7173242,
//          skyMap: 'sky2',
//      },


 }
