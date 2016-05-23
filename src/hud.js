function HUD(iscanvas){
  var isCanvas = iscanvas || false;
  var raf = null;
  var timer=null;
  var duration=null;

  var _HUD = {};

  _HUD.initCanvas = function(){
     _HUD.isCanvas = true;
    _HUD.canvas = document.createElement('canvas');
    _HUD.canvas.setAttribute("style", "position: absolute; top:0;left:0; background:transparent; z-index:999;"); // Multiple style properties
    _HUD.canvas.width = window.innerWidth;
    _HUD.canvas.height = window.innerHeight;
    document.body.appendChild(_HUD.canvas);

    _HUD.c = _HUD.canvas.getContext('2d');

    _HUD.c.font = "Normal "+(window.innerWidth/10)+"px Arial";
    _HUD.c.textAlign = 'center';
    _HUD.c.fillStyle = "rgba(245,245,245,0.75)";
  }

  _HUD.initDiv = function(){
     _HUD.isCanvas = false;
    _HUD.div = document.createElement('div');
    _HUD.div.setAttribute("style", "position: absolute; top:0;left:0; background:transparent; z-index:999; font-size:"+(window.innerHeight*0.05)+"px;"); // Multiple style properties
    _HUD.div.width = window.innerWidth;
    _HUD.div.height = window.innerHeight;
    document.body.appendChild(_HUD.div);
  }


  _HUD.display = function(text,duration){

      window.cancelAnimationFrame(_HUD.raf); // cancel previous animations
      _HUD.timer = millis;
      _HUD.duration = duration;

      if(_HUD.isCanvas===true){
        _HUD.text = text;
        _HUD.raf = window.requestAnimationFrame(_HUD.showText);
      }
      else if(_HUD.isCanvas===false){
        _HUD.div.innerHTML = text;
        _HUD.raf = window.requestAnimationFrame(_HUD.showTextDiv);
      }

  }

  _HUD.showText = function(){
    if(_HUD.raf!==null){
      _HUD.raf = window.requestAnimationFrame(_HUD.showText);

      _HUD.c.fillStyle = "rgba(245,245,245,"+(1-(millis-_HUD.timer)/_HUD.duration)+")";
      _HUD.c.clearRect(0, 0, _HUD.canvas.width, _HUD.canvas.height);
      _HUD.c.fillText(_HUD.text, _HUD.canvas.width / 2, _HUD.canvas.height / 2);
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
    }

    if(millis-_HUD.timer>_HUD.duration){
      window.cancelAnimationFrame(_HUD.raf);
      _HUD.raf=null;
      _HUD.timer=null;
    }
  }


  if(_HUD.isCanvas===true)
    _HUD.initCanvas();
  else _HUD.initDiv();

  return{
    display:function(a,b){_HUD.display(a,b)},
  }
}
