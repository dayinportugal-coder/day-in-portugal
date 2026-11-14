// Netmend free Pinterest pin maker (1000x1500). Runs in the browser with <canvas>.
var cv=document.getElementById('cv'),ctx=cv.getContext('2d'),IMG=null;
var PALS=[['#0B1F33','#FF5A36','#F4F1EA'],['#2f4a40','#e9c46a','#fbf7ef'],['#3d2c8d','#ff6f91','#fff5f8'],['#111111','#f5d000','#ffffff'],['#7a3e2b','#f2a65a','#fff8f0'],['#0f4c5c','#5fd3c4','#effcfb']];
function wrap(text,maxW,font){ctx.font=font;var words=text.split(/\s+/),lines=[],cur='';words.forEach(function(w){var t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t});if(cur)lines.push(cur);return lines}
function fitTitle(text,maxW,maxH,weight){for(var s=118;s>=44;s-=4){var f=weight+' '+s+'px "Space Grotesk",Inter,system-ui,sans-serif';var L=wrap(text,maxW,f);if(L.length*s*1.12<=maxH)return{lines:L,size:s,font:f}}var f2=weight+' 44px system-ui';return{lines:wrap(text,maxW,f2),size:44,font:f2}}
function cover(){if(!IMG)return;var r=Math.max(1000/IMG.width,1500/IMG.height),w=IMG.width*r,h=IMG.height*r;ctx.drawImage(IMG,(1000-w)/2,(1500-h)/2,w,h)}
function draw(){
  var T=document.getElementById('t').value||'Your blog post title goes here',S=document.getElementById('s').value,U=document.getElementById('u').value,tpl=+document.getElementById('tpl').value,P=PALS[+document.getElementById('pal').value];
  var dark=P[0],acc=P[1],light=P[2];ctx.clearRect(0,0,1000,1500);ctx.textBaseline='top';
  if(tpl===0){ // photo top, band bottom
    ctx.fillStyle=light;ctx.fillRect(0,0,1000,1500);if(IMG){ctx.save();ctx.beginPath();ctx.rect(0,0,1000,820);ctx.clip();cover();ctx.restore()}else{ctx.fillStyle=acc;ctx.fillRect(0,0,1000,820)}
    ctx.fillStyle=dark;ctx.fillRect(0,760,1000,740);var f=fitTitle(T.toUpperCase(),860,430,'800');ctx.fillStyle=light;f.lines.forEach(function(l,i){ctx.font=f.font;ctx.fillText(l,70,830+i*f.size*1.12)});
    if(S){ctx.font='500 40px system-ui';ctx.fillStyle=acc;wrap(S,860,ctx.font).slice(0,2).forEach(function(l,i){ctx.fillText(l,70,1290+i*50)})}
  }else if(tpl===1){ // full photo with box
    ctx.fillStyle=dark;ctx.fillRect(0,0,1000,1500);if(IMG){cover();ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(0,0,1000,1500)}
    ctx.fillStyle=light;var bx=80,by=420,bw=840,bh=660;ctx.fillRect(bx,by,bw,bh);ctx.fillStyle=acc;ctx.fillRect(bx,by,bw,18);
    var f=fitTitle(T,720,430,'800');ctx.fillStyle=dark;f.lines.forEach(function(l,i){ctx.font=f.font;ctx.fillText(l,bx+60,by+80+i*f.size*1.12)});
    if(S){ctx.font='500 38px system-ui';ctx.fillStyle=acc;wrap(S,720,ctx.font).slice(0,2).forEach(function(l,i){ctx.fillText(l,bx+60,by+bh-140+i*48)})}
  }else if(tpl===2){ // big number list style
    ctx.fillStyle=light;ctx.fillRect(0,0,1000,1500);ctx.fillStyle=acc;ctx.beginPath();ctx.arc(860,180,260,0,7);ctx.fill();
    if(IMG){ctx.save();ctx.beginPath();ctx.roundRect?ctx.roundRect(70,880,860,460,30):ctx.rect(70,880,860,460);ctx.clip();var r=Math.max(860/IMG.width,460/IMG.height);ctx.drawImage(IMG,70+(860-IMG.width*r)/2,880+(460-IMG.height*r)/2,IMG.width*r,IMG.height*r);ctx.restore()}
    var f=fitTitle(T,860,640,'800');ctx.fillStyle=dark;f.lines.forEach(function(l,i){ctx.font=f.font;ctx.fillText(l,70,180+i*f.size*1.12)});
    if(S){ctx.font='600 40px system-ui';ctx.fillStyle=dark;ctx.fillText(S.slice(0,48),70,IMG?810:900)}
  }else{ // split colour, no photo needed
    ctx.fillStyle=acc;ctx.fillRect(0,0,1000,1500);ctx.fillStyle=dark;ctx.fillRect(0,0,1000,520);
    ctx.font='700 46px system-ui';ctx.fillStyle=acc;ctx.fillText((S||'NEW POST').toUpperCase().slice(0,30),70,380);
    var f=fitTitle(T,860,760,'800');ctx.fillStyle=dark;f.lines.forEach(function(l,i){ctx.font=f.font;ctx.fillText(l,70,600+i*f.size*1.12)});
  }
  if(U){ctx.font='700 34px system-ui';var w=ctx.measureText(U).width+60;ctx.fillStyle=dark;ctx.fillRect((1000-w)/2,1400,w,64);ctx.fillStyle=light;ctx.fillText(U,(1000-w)/2+30,1414)}
}
['t','s','u','tpl','pal'].forEach(function(i){document.getElementById(i).addEventListener('input',draw)});
document.getElementById('img').addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;var i=new Image();i.onload=function(){IMG=i;draw()};i.src=URL.createObjectURL(f)});
document.getElementById('rnd').addEventListener('click',function(){document.getElementById('tpl').value=Math.floor(Math.random()*4);document.getElementById('pal').value=Math.floor(Math.random()*PALS.length);draw()});
document.getElementById('dl').addEventListener('click',function(){var a=document.createElement('a');a.href=cv.toDataURL('image/png');a.download=(document.getElementById('t').value||'pin').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)+'-pin.png';a.click()});
document.fonts&&document.fonts.ready.then(draw);draw();
