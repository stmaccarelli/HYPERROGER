var G = function(){

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
        params.landRGB = HLC.land.getHex();
        params.horizonRGB = HLC.horizon.getHex();
      },
      randomizeLand:function(){
        buttons.randomizeTerra();
        buttons.randomizeColors();

         HL.land.material.uniforms.bFactor.value = params.bFactor = Math.random();
         HL.land.material.uniforms.cFactor.value = params.cFactor = Math.random()*0.3;
         HL.land.material.uniforms.buildFreq.value = params.buildFreq = Math.random()*100.0;
         params.map = (Math.random()>.5?'land':'pattern')+(1+Math.round(Math.random()*4));
         HL.land.material.uniforms.map.value = HL.textures[params.map];// null;//HL.textures[Math.round(Math.random()*10)];
         HL.land.material.uniforms.natural.value = params.natural = Math.random();
         HL.land.material.uniforms.rainbow.value = params.rainbow = Math.random();
         HL.land.material.uniforms.squareness.value = params.squareness = 0.00001 + Math.random()*Math.random()*0.49999;
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


    var tilesController = gui.add(params, 'tiles',32,HLE.WORLD_TILES).step(8).listen();
    tilesController.onChange(function(value) {
       HL.land.geometry = new THREE.PlaneBufferGeometry(HLE.WORLD_WIDTH, HLE.WORLD_WIDTH, value,value);
       HL.land.geometry.rotateX(-Math.PI / 2);
       HL.land.material.uniforms.worldTiles.value = value;
      //  HL.land.material.uniforms.repeatUV.value = new THREE.Vector2( * Math.random(), value * Math.random() );
    });

    var repeatUVController = gui.add(params, 'repeatUV',1,params.tiles).step(1).listen();
    repeatUVController.onChange(function(value) {
       HL.land.material.uniforms.repeatUV.value = new THREE.Vector2( value,value );
    });
    gui.add(HL.land.material.uniforms.bFactor, 'value',0.0,1.0).name('bFactor').listen();
    gui.add(HL.land.material.uniforms.cFactor, 'value',0.0,1.0).name('cFactor').listen();
    gui.add(HL.land.material.uniforms.buildFreq, 'value',0,100).name('buildFreq').listen();
    gui.add(HL.land.material.uniforms.natural, 'value',0.0,1.01).name('natural').listen();
    gui.add(HL.land.material.uniforms.rainbow, 'value',0.0,1.01).name('rainbow').listen();
    gui.add(HL.land.material.uniforms.squareness, 'value',0.01,0.5).name('squareness').listen();

    var mapController = gui.add(params, 'map').listen();
    mapController.onChange(function(value){
      HL.land.material.uniforms.map.value = HL.textures[value];// null;//HL.textures[Math.round(Math.random()*10)];
    });

    var horizonRGBController = gui.addColor(params, 'horizonRGB').listen();
    horizonRGBController.onChange( function(value){ console.log(value); HLC.horizon.set(value); } );
    var landRGBController = gui.addColor(params, 'landRGB').listen();
    landRGBController.onChange( function(value){ console.log(value); HLC.land.set(value); } );
  }




return{
  guiInit:guiInit,
  params:params,
}
}();
