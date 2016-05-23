var HUD ={
  isCanvas:null,

  raf:null,
  timer:null,
  duration:null,
};

HUD.initCanvas = function(){
  HUD.isCanvas = true;
  HUD.canvas = document.createElement('canvas');
  HUD.canvas.setAttribute("style", "position: absolute; top:0;left:0; background:transparent; z-index:999;"); // Multiple style properties
  HUD.canvas.width = window.innerWidth;
  HUD.canvas.height = window.innerHeight;
  document.body.appendChild(HUD.canvas);

  HUD.c = HUD.canvas.getContext('2d');

  HUD.c.font = "Normal "+(window.innerWidth/10)+"px Arial";
  HUD.c.textAlign = 'center';
  HUD.c.fillStyle = "rgba(245,245,245,0.75)";
}

HUD.initDiv = function(){
  HUD.isCanvas = false;
  HUD.div = document.createElement('div');
  HUD.div.setAttribute("style", "position: absolute; top:0;left:0; background:transparent; z-index:999; font-size:"+(window.innerHeight*0.05)+"px;"); // Multiple style properties
  HUD.div.width = window.innerWidth;
  HUD.div.height = window.innerHeight;
  document.body.appendChild(HUD.div);

}


HUD.display = function(text,duration){

    window.cancelAnimationFrame(HUD.raf);
    HUD.timer = millis;
    HUD.duration = duration;

    if(HUD.isCanvas){
      HUD.text = text;
      HUD.raf = window.requestAnimationFrame(HUD.showText);
    }
    else {
      HUD.div.innerHTML = text;
      HUD.raf = window.requestAnimationFrame(HUD.showTextDiv);
    }

    console.log("init hud canvas anim");

}

HUD.showText = function(){
  if(HUD.raf!==null){
    HUD.raf = window.requestAnimationFrame(HUD.showText);

    HUD.c.fillStyle = "rgba(245,245,245,"+(1-(millis-HUD.timer)/HUD.duration)+")";
    HUD.c.clearRect(0, 0, HUD.canvas.width, HUD.canvas.height);
    HUD.c.fillText(HUD.text, HUD.canvas.width / 2, HUD.canvas.height / 2);
  }

  if(millis-HUD.timer>HUD.duration){
    window.cancelAnimationFrame(HUD.raf);
    HUD.raf=null;
    HUD.timer=null;
    console.log("cancel hud anim");
  }
}

HUD.showTextDiv = function(){
  if(HUD.raf!==null){
    HUD.raf = window.requestAnimationFrame(HUD.showTextDiv);
    HUD.div.style.color = "rgba(245,245,245,"+(1-(millis-HUD.timer)/HUD.duration)+")";
  }

  console.log("showTextDiv");

  if(millis-HUD.timer>HUD.duration){
    window.cancelAnimationFrame(HUD.raf);
    HUD.raf=null;
    HUD.timer=null;
    console.log("cancel hud anim");
  }
}
