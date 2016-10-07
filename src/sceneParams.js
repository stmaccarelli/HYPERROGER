 var HLSP = [];
 HLSP['scenesParams'] = {
     // intensità colore land audioreattivab più bassa
     mizu: {
         "cameraPositionY": 10,
         "seaLevel": 0,

         "displayText": 'MIZU',
         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 32,
         "repeatUV": 512,
         "bFactor": 0.22087281339397613,
         "cFactor": 0.01543734109853323,
         "buildFreq": 50.332836415087655,
         "natural": 0.49748154523558328,
         "rainbow": 0.8787699998982024,
         "squareness": 0.022450016948639295,
         "map": "white",
         "landRGB": 1966335,
         "horizonRGB": 0,
         "skyMap": "white",
     },

     // fft1 più speedup moveSpeed
     solar_valley: {
         "cameraPositionY": -350,
         "seaLevel": -450,
         "fogDensity": 0.00054,

         "displayText": 'SOLAR VALLEY',
         "speed": 10,
         "modelsParams": ['stones', 40, true, false, -750],

         "tiles": 200,
         "repeatUV": 7,
         "bFactor": 0.6617959456178687,
         "cFactor": 0.3471716436028164,
         "buildFreq": 10,
         "natural": 0.18443493566399619,
         "rainbow": 0.03254734158776403,
         "squareness": 0.00001,
         "map": "land3",
         "landRGB": 9675935,
         "horizonRGB": 3231404,
         "skyMap": "sky1",
     },

     // camera underwater
     escher_surfers: {
         "cameraPositionY": 40,
         "seaLevel": 50,

         "displayText": 'ESCHER SURFERS',
         "speed": 20,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 73,
         "repeatUV": 112,
         "bFactor": 1.001,
         "cFactor": 0,
         "buildFreq": 10,
         "natural": 0,
         "rainbow": 0.16273670793882017,
         "squareness": 0.08945796327125173,

         "map": "pattern1",
         "landRGB": 16727705,
         "horizonRGB": 7935,
         "skyMap": "sky1",
     },

     // sea level più basso
     // modelli: cubid
     currybox: {
         "cameraPositionY": 500,//HLE.WORLD_HEIGHT*.5,
         "seaLevel": -100,

         "displayText": 'CURRYBOX',
         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 145,
         "repeatUV": 1,
         "bFactor": 0.10849113862588011,
         "cFactor": 0.054245569312940056,
         "buildFreq": 10,
         "natural": 0.176420247632921,
         "rainbow": 0.21934025248846812,
         "squareness": 0.01,
         "map": "white",
         "landRGB": 13766158,
         "horizonRGB": 2665099,

         "skyMap": "sky1",
     },

     // sealevel basso
     galaxy_glacier: {
         "cameraPositionY": 50,
         "seaLevel": -100,

         "displayText": 'GALAXY GLACIER',
         "speed": 2,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 160,
         "repeatUV": 1,
         "bFactor": 0.287989180087759,
         "cFactor": 0.6148319562024518,
         "buildFreq": 61.5837970429,
         "natural": 0.4861551769529205,
         "rainbow": 0.099628324585666777,
         "squareness": 0.01198280149135716,
         "map": "pattern5", //%
         "landRGB": 11187452,
         "horizonRGB": 6705,
         "skyMap": "sky1",
     },


     //camera position.y -400
     // partire sopra acqua, e poi gradualmente finire sott'acqua

     drift: {
         "cameraPositionY": -450,
         "seaLevel": 0,

         "displayText": 'DRIFT',
         "speed": 3,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 128,
         "repeatUV": 0,
         "bFactor": 0.24952961883952426,
         "cFactor": 0.31,
         "buildFreq": 15.188759407623216,
         "natural": 0.3471716436028164,
         "rainbow": 1.001,
         "squareness": 0.00001,
         "map": "land1",
         "landRGB": 16777215,

         "horizonRGB": 6039170,
         "skyMap": "sky2",
     },


     // scorrimento veloce
     // cielo con meno lampi
     // buildFreq: fft2
     // aerei

     hyperocean: {
         "cameraPositionY": 50,

         "displayText": 'HYPEROCEAN',
         "speed": 18,
         "modelsParams": ['sea', 6, false, false],

         "tiles": 320,
         "repeatUV": 12,
         "bFactor": 1.001,
         "cFactor": 0.21934025248846812,
         "buildFreq": 15.188759407623216,
         "natural": 0.7051924010682208,
         "rainbow": 0.1952840495265842,
         "squareness": 0.005,
         "map": "land5",
         "landRGB": 14798516,
         "horizonRGB": 7173242,
         "skyMap": "sky2",
     },

     // balene
     // capovolgere di conseguenza modelli balene

     twin_horizon: {
         "cameraPositionY": 100,

         "displayText": 'TWIN HORIZON',
         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 99,
         "repeatUV": 1,
         "bFactor": 0.20445411338494512,
         "cFactor": 0.33632252974022836,
         "buildFreq": 45.50809304437684,
         "natural": 0.4448136683661085,
         "rainbow": 0,
         "squareness": 0.0013619887944460984,
         "map": "white",
         "landRGB": "#000fff",
         "horizonRGB": 16728899,
         "skyMap": "sky1",

     },

     // da un certo punto random colors (quando il pezzo aumenta)
     // da stesso punto aumenta velocità
     // sea level basso
     // modelli elettrodomestici / elettronica

     else: {
         "cameraPositionY": 50,

         "displayText": 'ELSE',
         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 104,
         "repeatUV": 128,
         "bFactor": 0.5641539208545766,
         "cFactor": 0,
         "buildFreq": 30.804098302357595,
         "natural": 0.0,
         "rainbow": 0.6458797021572349,
         "squareness": 0.013562721707765414,
         "map": "pattern2",
         "landRGB": 65399,
         "horizonRGB": "#000000",
         "skyMap": "sky3",
     },

     // quando iniziano i kick randomizza landscape
     // odissea nello spazio
     // cielo stellato (via lattea)

     roger_water: {
         "cameraPositionY": 50,

         "displayText": 'ROGER WATER',
         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 80,
         "repeatUV": 1,
         "bFactor": 0,
         "cFactor": 0.20613316338917223,
         "buildFreq": 10,
         "natural": 1.001,
         "rainbow": 0.1735858218014082,
         "squareness": 0.00001,
         "map": "",
         "landRGB": 2105376,
         "horizonRGB": 0,
         "skyMap": "sky1",
     },

     //seaLevel basso

     popeye: {
         "cameraPositionY": 50,

         "displayText": 'POPEYE',
         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 293,
         "repeatUV": 54.349171736919395,
         "bFactor": 0.8743549159244348,
         "cFactor": 0.2755886532412846,
         "buildFreq": 95.57195980997615,
         "natural": 0.45637631140860924,
         "rainbow": 0.896952206289563,
         "squareness": 0.000683205327040215,
         "map": "land2",
         "landRGB": 16288161,
         "horizonRGB": 4334933,
         "skyMap": "sky1",
     },

     alpha_11: {
         "cameraPositionY": 50,

         "displayText": 'ALPHA 11',
         "speed": 1,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 6,
         "repeatUV": 1,
         "bFactor": 0,
         "cFactor": 0,
         "buildFreq": 44.48136683661085,
         "natural": 0,
         "rainbow": 0,
         "squareness": 0.00001,
         "map": "white",
         "landRGB": 0,
         "horizonRGB": 3980219,
         "skyMap": "sky1",

     },

     //extras
     extra1: {
         "cameraPositionY": 50,

         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 192,
         "repeatUV": 1,
         "bFactor": 0.693165412563634,
         "cFactor": 0.19953982057571704,
         "buildFreq": 10.113094716996041,
         "natural": 0.3039475909118414,
         "rainbow": 0.39132778953353453,
         "squareness": 0.01737942804281068,
         "map": "pattern4",
         "landRGB": 16238264,
         "horizonRGB": 4472153,
         "skyMap": "sky1",
     },

     //extrarainbow
     extra2: {
         "cameraPositionY": 50,

         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 208,
         "repeatUV": 1,
         "bFactor": 0.693165412563634,
         "cFactor": 0.19953982057571704,
         "buildFreq": 10.113094716996041,
         "natural": 0.3039475909118414,
         "rainbow": 0.39132778953353453,
         "squareness": 0.01737942804281068,
         "map": "pattern1",
         "landRGB": 16777215,
         "horizonRGB": 0,
         "skyMap": "sky1",
     },

     //extra3
     extra3: {
         "cameraPositionY": 50,

         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 268,
         "repeatUV": 8.090002933527465,
         "bFactor": 0.6875942559401627,
         "cFactor": 0.013916406159565419,
         "buildFreq": 81.46100634271541,
         "natural": 0.1884444463154662,
         "rainbow": 0.6364309276708011,
         "squareness": 0.010534527021420541,
         "map": "pattern1",
         "landRGB": 16777215,
         "horizonRGB": 0,
         "skyMap": "sky1",
     },
     //natural
     extra4: {
         "cameraPositionY": 50,

         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 195,
         "repeatUV": 172.53953149784417,
         "bFactor": 0.3722544776755994,
         "cFactor": 0.19668421433349875,
         "buildFreq": 58.22950247169298,
         "natural": 0.7850066649699574,
         "rainbow": 0.44153157788454345,
         "squareness": 0.009631920065919009,
         "map": "land4",
         "landRGB": 9552294,
         "horizonRGB": 4152953,
         "skyMap": "sky1",
     },
     static: {
         "cameraPositionY": 150,

         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 100,
         "repeatUV": 1,
         "bFactor": 1,
         "cFactor": 1,
         "buildFreq": 1,
         "natural": 1,
         "rainbow": 0,
         "squareness": 0,
         "map": "white",
         "landRGB": 2763306,
         "horizonRGB": 0,
         "skyMap": "sky1",
     },
     solar_valley_2: {
         "cameraPositionY": -200,
         "seaLevel": -550,

         "displayText": 'SOLAR VALLEY 2',
         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 102,
         "repeatUV": 13.02569701137036,
         "bFactor": 0.767643282574842,
         "cFactor": 0.13761933657937025,
         "buildFreq": 29.107351842026375,
         "natural": 0,
         "rainbow": 0.054245569312940056,
         "squareness": 0.01898381039087158,
         "map": "land1",
         "landRGB": 13169344,
         "horizonRGB": 5452576,
         "skyMap": "sky1",
     },

     intro: {

         "displayText": 'SOLAR VALLEY 2',
         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "cameraPositionY": 150,
         "seaLevel": 10,

         "speed": 4,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 100,
         "repeatUV": 1,
         "bFactor": 1,
         "cFactor": 1,
         "buildFreq": 1,
         "natural": 1,
         "rainbow": 0,
         "squareness": 0,
         "map": "white",
         "landRGB": 2763306,
         "horizonRGB": 0,
         "skyMap": "sky1",
     },

     blackpool: {

         "displayText": 'BLACKPOOL',
         "speed": 10,
         "modelsParams": ['sea', 1, true, true],

         "cameraPositionY": 150,
         "seaLevel": 10,

         "speed": 4,
         "modelsParams": ['sea', 1, true, true],

         "tiles": 181,
         "repeatUV": 16.555478741450983,
         "bFactor": 0.6048772396441062,
         "cFactor": 0.016358953883098624,
         "buildFreq": 73.3797815423632,
         "natural": 0.9833741906510363,
         "rainbow": 0.10821609644148733,
         "squareness": 0.00599663055740593,
         "map": "land3",
         "landRGB": 12105440,
         "horizonRGB": 2571781,

         "skyMap": "sky1",
     }


 }
