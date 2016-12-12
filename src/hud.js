function HUD(iscanvas, _parentScene){

  var isCanvas = iscanvas || false;
  var raf = null;
  var timer=null;
  var duration=null;

  var _HUD = {
    width:window.innerWidth,
    height:window.innerHeight,
    canvas:null,
    div:null,
  };

  // HUD.dynTexture = document.createElement('canvas');
  // HUD.dynTexture.width = window.innerWidth;
  // HUD.dynTexture.height = window.innerHeight;
  // HUD.dynTexture['c'] = HUD.dynTexture.getContext('2d');
  // HUD.dynTexture['texture'] = new THREE.Texture(HUD.dynTexture);
  // HUD.dynTexture['texture'].wrapS = THREE.RepeatWrapping;
  // HUD.dynTexture['texture'].wrapT = THREE.RepeatWrapping;
  //
  // HUD.dynTexture['material'] = new THREE.MeshBasicMaterial( {map: HUD.dynTexture.texture, transparent:true } );
  // HUD.dynTexture['camera'] = new THREE.OrthographicCamera(
  // -window.innerWidth/2, window.innerWidth/2,
  // window.innerHeight/2, -window.innerHeight/2,
  // 0, 30
  // );
  //
  // HUD.dynTexture.c.clearRect(0,0,HUD.dynTexture.width,HUD.dynTexture.height);
  // HUD.dynTexture.c.font = "Normal 80px Arial";
  // HUD.dynTexture.c.textAlign = 'center';
  // HUD.dynTexture.c.fillStyle = "rgba(245,245,245,0.75)";
  // HUD.dynTexture.c.fillText('Initializing...', window.innerWidth / 2, window.innerHeight / 2);
  //
  // HUD.dynTexture.texture.needsUpdate = true;
  // HUD.dynTexture.material.needsUpdate = true;

  // _parentRenderer.render(HUD.dynTexture.scene, HUD.dynTexture.camera);


  // HL.dynamicTextures.stars.c.fillText("XXXXX",256, 256);
  // HL.dynamicTextures.stars.texture.needsUpdate=true;
  //
  // HL.cameraGroup.children[1].material.map = HL.dynamicTextures.stars.texture;
  // HL.cameraGroup.children[1].material.needsUpdate = true;

  // CREATE TEXT GEOMETRIES FOR TITLES - TODO unused
  // HUD.textGeometries = {}
  //
  // var fontLoader = new THREE.FontLoader();
  // fontLoader.load( 'lib/gentilis_regular.typeface.json', function ( response ) {
  //   HUD.font = response;
  //
  //   HUD.createTextGeometries();
  //
  // } );
  //
  // HUD.createTextGeometries = function() {
  //
  //   for( var i in HLSP){
  //
  //     // console.warn( HLSP[i] );
  //     HUD.textGeometries[i] = new THREE.TextGeometry( HLSP[i].displayText, {
  //       font: HUD.font,
  //       size: 1,
  //       height: .1,
  //       curveSegments: 3,
  //       // bevelThickness: bevelThickness,
  //       // bevelSize: bevelSize,
  //       // bevelEnabled: bevelEnabled,
  //       material: 0,
  //       extrudeMaterial: 1
  //     });
  //     HUD.textGeometries[i].computeBoundingBox();
  //     HUD.textGeometries[i].translate(
  //       - (HUD.textGeometries[i].boundingBox.max.x -
  //       HUD.textGeometries[i].boundingBox.min.x ) * 0.5, 0, 0
  //     )
  //   }
  //
  // }

  _HUD.initCanvas = function(){
    _HUD.canvas = document.createElement('canvas');
    _HUD.canvas.setAttribute("style", "position: absolute; top:0;left:0; background:transparent;"); // Multiple style properties
    _HUD.canvas.width = _HUD.width;
    _HUD.canvas.height = _HUD.height;
    document.body.appendChild(_HUD.canvas);

    _HUD.c = _HUD.canvas.getContext('2d');
    _HUD.c.font = "Normal "+(_HUD.height*0.05)+"px Arial";
    _HUD.c.textAlign = 'center';
  }

  _HUD.initDiv = function(){
    _HUD.div = document.createElement('div');
    _HUD.div.setAttribute("style", "position: absolute; top:0;left:0;"+
    "width: "+_HUD.width+"px; "+"height: "+_HUD.height+"px; "+
    "background:transparent;  font-size:"+(_HUD.height*0.05)+"px; line-height:"+(_HUD.height*0.07)+"px;"+
    " padding:50px; font-family:Serif;");
    document.body.appendChild(_HUD.div);
  }


  _HUD.display = function(text,duration,background){

      window.cancelAnimationFrame(_HUD.raf); // cancel previous animations
      _HUD.timer = millis;
      _HUD.duration = duration;
      _HUD.bg = background;

      if(isCanvas){
        _HUD.canvas.style.zIndex = 999;
        _HUD.text = text;
        _HUD.raf = window.requestAnimationFrame(_HUD.showTextCanvas);
      }
      else{
        _HUD.div.style.zIndex = 999;
        _HUD.div.innerHTML = text;
        _HUD.raf = window.requestAnimationFrame(_HUD.showTextDiv);
      }

      // HUD.dynTexture.c.clearRect(0,0,HUD.dynTexture.width,HUD.dynTexture.height);
      // // HUD.dynTexture.c.font = "Normal 80px Arial";
      // // HUD.dynTexture.c.textAlign = 'center';
      // // HUD.dynTexture.c.fillStyle = "rgba(245,245,245,0.75)";
      // HUD.dynTexture.c.fillText(text, window.innerWidth / 2, window.innerHeight / 2);
      //
      // HUD.dynTexture.texture.needsUpdate = true;
      // HUD.dynTexture.material.needsUpdate = true;
      //
      // HL.cameraCompanion.geometry = HL.cameraBillboard;
      // HL.cameraCompanion.material = HUD.dynTexture.material;
      //
      // HL.cameraCompanion.visible = true;

  }

  _HUD.showTextCanvas = function(){

    if(_HUD.raf!==null){
      _HUD.raf = window.requestAnimationFrame(_HUD.showTextCanvas);

      _HUD.c.clearRect(0, 0, _HUD.width, _HUD.height);
      if(_HUD.bg!==undefined){
        _HUD.c.fillStyle = "rgba(1,1,1,"+(1-(millis-_HUD.timer)/_HUD.duration)+")";
        _HUD.c.fillRect(0, 0, _HUD.width, _HUD.height);
      }

      // don't show titles canvas on stereo view. we'd need a stereo title
      if(!isMobile){
        _HUD.c.fillStyle = "rgba(245,0,0,"+(1-(millis-_HUD.timer)/_HUD.duration)+")";
        _HUD.tempText = _HUD.text.split('<br>');

        var r=2;

        for(var i=0; i<_HUD.tempText.length; i++){

          _HUD.c.font = "Normal "+(_HUD.height*(0.05-0.015*i))+"px Futura";

          _HUD.c.fillText(_HUD.tempText[i], _HUD.width / 2, _HUD.height / 2.1 + i*_HUD.height/15);
          r+=i;

        }

        _HUD.c.fillStyle = "rgba(245,245,245,"+(1-(millis-_HUD.timer)/_HUD.duration)+")";
        _HUD.c.font = "Normal "+(_HUD.height*0.025)+"px Futura";
        // _HUD.c.fillText("PLEASE CONNECT 📱 -> H T T P : / / H Y L A N D . X Y Z", _HUD.width / 2, _HUD.height / 10);
         _HUD.c.fillText("PLEASE CONNECT 📱 -> H T T P : / / H Y L A N D . X Y Z", _HUD.width / 2, _HUD.height / 5);
      }

    }

    if(millis-_HUD.timer>_HUD.duration){
      _HUD.canvas.style.zIndex = -9;
      window.cancelAnimationFrame(_HUD.raf);
      _HUD.raf=null;
      _HUD.timer=null;
    }
  }

  _HUD.showTextDiv = function(){
    if(_HUD.raf!==null){
      _HUD.raf = window.requestAnimationFrame(_HUD.showTextDiv);
      _HUD.div.style.color = "rgba(245,245,245,"+(1-(millis-_HUD.timer)/_HUD.duration)+")";
      if(_HUD.bg!==undefined)
        _HUD.div.style.background = "rgba(0,0,0,"+(1-(millis-_HUD.timer)/_HUD.duration)+")";
    }

    if(millis-_HUD.timer>_HUD.duration){
      _HUD.div.style.zIndex = -9;
      window.cancelAnimationFrame(_HUD.raf);
      _HUD.raf=null;
      _HUD.timer=null;
    }
  }

  _HUD.resize = function(){
    _HUD.width = window.innerWidth;
    _HUD.height= window.innerHeight;

    if(isCanvas===true){
      _HUD.canvas.width = _HUD.width;
      _HUD.canvas.height = _HUD.height;
      _HUD.c = _HUD.canvas.getContext('2d');
      _HUD.c.font = "Normal "+(_HUD.height*0.05)+"px Arial";
      _HUD.c.textAlign = 'center';
    }
    else {
      _HUD.div.setAttribute("style", "position: absolute; top:0;left:0;"+
      "width: "+_HUD.width+"px; "+"height: "+_HUD.height+"px; "+
      "background:transparent; z-index:999; font-size:"+(_HUD.height*0.05)+"px;");
    }

  }

  window.addEventListener("resize", _HUD.resize, true);

  if(isCanvas===true)
    _HUD.initCanvas();
  else _HUD.initDiv();

  return{
    display:function(a,b,c){_HUD.display(a,b,c)},
    resize:function(){_HUD.resize()},
    HUD:_HUD,
  }
}
