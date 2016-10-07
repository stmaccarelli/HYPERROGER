var GUI = function(){

  var s = this;
  var gui;

  var params = {
    tiles:HLE.WORLD_TILES,
    repeatUV:1,
    bFactor:0.5,
    cFactor:0.5,
    buildFreq:10,
    natural:0.5,
    rainbow:0.5,
    squareness:.25, //.01 - .5
    map:'land1',
    landRGB:0,
    horizonRGB:0,
  }

  function guiInit(){
    gui = new dat.GUI();
    // HL.land.material.uniforms.bFactor.value = Math.random();
    // HL.land.material.uniforms.cFactor.value = Math.random()*0.3;
    // HL.land.material.uniforms.buildFreq.value = Math.random()*100.0;
    // HL.land.material.uniforms.map.value = HL.textures[(Math.random()>.5?'land':'pattern')+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];
    // HL.land.material.uniforms.natural.value = Math.random();
    // HL.land.material.uniforms.rainbow.value = Math.random();
    // HL.land.material.uniforms.squareness.value = Math.random()*Math.random();
    var buttons = {
      randomizeMap:function(){
        HL.land.material.uniforms.map.value = HL.textures[(Math.random()>.5?'land':'pattern')+(1+Math.round(Math.random()*4))];// null;//HL.textures[Math.round(Math.random()*10)];
      },
      randomizeTerra:function(){
        params.tiles = Math.round(Math.random()*HLE.WORLD_TILES);
        params.repeatUV = params.tiles * Math.random();

         HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, params.tiles,params.tiles);
         HL.land.geometry.rotateX(-Math.PI / 2);
         HL.land.material.uniforms.worldTiles.value = params.tiles;
         HL.land.material.uniforms.repeatUV.value = new THREE.Vector2(params.repeatUV, params.repeatUV );
      },
      randomizeColors:function(){
        HLC.land.setRGB(0.5+Math.random()*0.5, 0.5+Math.random()*0.5, 0.5+Math.random()*0.5);
        HLC.horizon.setRGB(Math.random()/2,Math.random()/2,Math.random()/2);
        HLC.tempHorizon.set(HLC.horizon);
        params.landRGB = HLC.land.getHex();
        params.horizonRGB = HLC.horizon.getHex();
      },
      randomizeLand:function(){
        buttons.randomizeTerra();
        buttons.randomizeColors();

         HL.land.material.uniforms.bFactor.value = params.bFactor = Math.random();
         HL.land.material.uniforms.cFactor.value = params.cFactor = Math.random()*0.3;
        //  HL.land.material.uniforms.buildFreq.value = params.buildFreq = Math.random()*100.0;
         params.map = (Math.random()>.5?'land':'pattern')+(1+Math.round(Math.random()*4));
         HL.land.material.uniforms.map.value = HL.textures[params.map];// null;//HL.textures[Math.round(Math.random()*10)];
         HL.land.material.uniforms.natural.value = params.natural = Math.random();
         HL.land.material.uniforms.rainbow.value = params.rainbow = Math.random();
         HL.land.material.uniforms.squareness.value = params.squareness = Math.random()*0.125;
         HL.skybox.rotateY(Math.random());
      },
      showParams : function(){
        alert(JSON.stringify(params, null, 4))
      }
    };


    gui.add(buttons,'randomizeMap');
    gui.add(buttons,'randomizeTerra');
    gui.add(buttons,'randomizeColors');
    gui.add(buttons,'randomizeLand');
    gui.add(buttons,'showParams');



    var tilesController = gui.add(HL.land.material.uniforms.worldTiles, 'value',1,HLE.WORLD_TILES).step(1).name('tiles').listen();
    tilesController.onChange(function(value) {
       HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, value,value);
       HL.land.geometry.rotateX(-Math.PI / 2);
       HL.land.material.uniforms.worldTiles.value = value;
       params.tiles = value;
    });

    var repeatUVController = gui.add(params, 'repeatUV',1,params.tiles).step(1).listen();
    repeatUVController.onChange(function(value) {
       HL.land.material.uniforms.repeatUV.value = new THREE.Vector2( value,value );
       params.repeatUV = value;
    });

    var bFactor = gui.add(HL.land.material.uniforms.bFactor, 'value',0.0,1.001).name('bFactor').listen();
    bFactor.onChange(function(v){params.bFactor = v;});

    var cFactor = gui.add(HL.land.material.uniforms.cFactor, 'value',0.0,1.001).name('cFactor').listen();
    cFactor.onChange(function(v){params.cFactor = v;});

    var buildFreq = gui.add(HL.land.material.uniforms.buildFreq, 'value',0.0,100.1).name('buildFreq').listen();
    buildFreq.onChange(function(v){params.buildFreq = v;});

    var natural = gui.add(HL.land.material.uniforms.natural, 'value',0.0,1.001).name('natural').listen();
    natural.onChange(function(v){params.natural = v;});

    var rainbow = gui.add(HL.land.material.uniforms.rainbow, 'value',0.0,1.001).name('rainbow').listen();
    rainbow.onChange(function(v){params.rainbow = v;});

    var squareness = gui.add(HL.land.material.uniforms.squareness, 'value',0.00001,0.2501).name('squareness').listen();
    squareness.onChange(function(v){params.squareness = v;});

    var mapController = gui.add(params, 'map').listen();
    mapController.onChange(function(value){
      HL.land.material.uniforms.map.value = HL.textures[value];// null;//HL.textures[Math.round(Math.random()*10)];
      params.map = value;
    });

    var horizonRGBController = gui.addColor(params, 'horizonRGB').listen();
    horizonRGBController.onChange( function(value){
      HLC.horizon.set(value); HLC.tempHorizon.set(value);
      params.horizonRGB=HLC.horizon.getHex();
    } );
    var landRGBController = gui.addColor(params, 'landRGB').listen();
    landRGBController.onChange( function(value){
      HLC.land.set(value);
      params.landRGB = HLC.land.getHex();
    });
  }




return{
  guiInit:guiInit,
  params:params,
  gui:gui,
}
};
