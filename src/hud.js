var HUD ={
  canvas:null,
  c:null,
  text:null,

  raf:null,
  timer:null,
  duration:null,
};

HUD.init = function(){
  HUD.canvas = document.getElementById('hud');
  HUD.canvas.width = window.innerWidth;
  HUD.canvas.height = window.innerHeight;
  HUD.c = HUD.canvas.getContext('2d');

  HUD.c.font = "Normal "+(window.innerWidth/10)+"px Arial";
  HUD.c.textAlign = 'center';
  HUD.c.fillStyle = "rgba(245,245,245,0.75)";
}

HUD.initDiv = function(){
  HUD.div = document.getElementById('divHud');
  HUD.div.width = window.innerWidth;
  HUD.div.height = window.innerHeight;
}


HUD.display = function(text,duration){

    window.cancelAnimationFrame(HUD.raf);
    HUD.timer = millis;
    HUD.duration = duration;
    HUD.text = text;
    console.log("init forced hud anim");
    HUD.raf = window.requestAnimationFrame(HUD.showText);
}

HUD.displayDiv = function(text,duration){

    window.cancelAnimationFrame(HUD.raf);
    HUD.timer = millis;
    HUD.duration = duration;
    HUD.div.innerHTML = text;
    console.log("init forced hud anim");
    HUD.raf = window.requestAnimationFrame(HUD.showTextDiv);
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
    HUD.div.style = "color: rgba(245,245,245,"+(1-(millis-HUD.timer)/HUD.duration)+")";
  }

  if(millis-HUD.timer>HUD.duration){
    window.cancelAnimationFrame(HUD.raf);
    HUD.raf=null;
    HUD.timer=null;
    console.log("cancel hud anim");
  }
}
