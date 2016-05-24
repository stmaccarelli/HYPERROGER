function HUD(iscanvas){
  var isCanvas = iscanvas || false;
  var raf = null;
  var timer=null;
  var duration=null;

  var _HUD = {
    width:window.innerWidth,
    height:window.innerHeight,
  };

  _HUD.initCanvas = function(){
    _HUD.canvas = document.createElement('canvas');
    _HUD.canvas.setAttribute("style", "position: absolute; top:0;left:0; background:transparent; z-index:999;"); // Multiple style properties
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
    "background:transparent; z-index:999; font-size:"+(_HUD.height*0.05)+"px;");
    document.body.appendChild(_HUD.div);
  }


  _HUD.display = function(text,duration,background){

      window.cancelAnimationFrame(_HUD.raf); // cancel previous animations
      _HUD.timer = millis;
      _HUD.duration = duration;
      _HUD.bg = background;

      if(isCanvas===true){
        _HUD.text = text;
        _HUD.raf = window.requestAnimationFrame(_HUD.showTextCanvas);
      }
      else if(isCanvas===false){
        _HUD.div.innerHTML = text;
        _HUD.raf = window.requestAnimationFrame(_HUD.showTextDiv);
      }

  }

  _HUD.showTextCanvas = function(){
    if(_HUD.raf!==null){
      _HUD.raf = window.requestAnimationFrame(_HUD.showTextCanvas);

      _HUD.c.clearRect(0, 0, _HUD.width, _HUD.height);
      if(_HUD.bg!==undefined){
        _HUD.c.fillStyle = "rgba(1,1,1,"+(1-(millis-_HUD.timer)/_HUD.duration)+")";
        _HUD.c.fillRect(0, 0, _HUD.width, _HUD.height);
      }
      _HUD.c.fillStyle = "rgba(245,245,245,"+(1-(millis-_HUD.timer)/_HUD.duration)+")";
      _HUD.c.fillText(_HUD.text, _HUD.width / 2, _HUD.height / 2);
    }

    if(millis-_HUD.timer>_HUD.duration){
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
      window.cancelAnimationFrame(_HUD.raf);
      _HUD.raf=null;
      _HUD.timer=null;
    }
  }

  _HUD.resize = function(){
    _HUD.width = window.innerWidth;
    _HUD.height=window.innerHeight;

    if(isCanvas===true){
      _HUD.canvas.width = _HUD.width;
      _HUD.canvas.height = _HUD.height;
      _HUD.c.font = "Normal "+(_HUD.height*0.05)+"px Arial";
      _HUD.c.textAlign = 'center';
    }
    else {
      _HUD.div.setAttribute("style", "position: absolute; top:0;left:0;"+
      "width: "+_HUD.width+"px; "+"height: "+_HUD.height+"px; "+
      "background:transparent; z-index:999; font-size:"+(_HUD.height*0.05)+"px;");
    }
  }

  if(isCanvas===true)
    _HUD.initCanvas();
  else _HUD.initDiv();

  window.addEventListener('resize',_HUD.resize);

  return{
    display:function(a,b,c){_HUD.display(a,b,c)},
    HUD:_HUD,
  }
}
