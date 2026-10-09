'use strict';
(() => {
 const space=document.querySelector('.paper-workspace');
 if(!space)return;
 const cards=[...space.querySelectorAll('.project-paper')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const library=!!(window.gsap&&window.Draggable);
 if(library)gsap.registerPlugin(Draggable);
 let z=4;
 const states=cards.map((el,i)=>({el,i,x:0,y:0,angle:[-10,7,-5][i],ready:false,suppress:0,drag:null}));
 const clamp=(v,min,max)=>Math.min(Math.max(v,min),Math.max(min,max));
 function bounds(s){
  const w=s.el.offsetWidth,h=s.el.offsetHeight,a=Math.abs(s.angle)*Math.PI/180;
  const px=Math.max(18,(w*Math.cos(a)+h*Math.sin(a)-w)/2+8);
  const py=Math.max(18,(h*Math.cos(a)+w*Math.sin(a)-h)/2+8);
  return{minX:px,maxX:space.clientWidth-w-px,minY:py,maxY:space.clientHeight-h-py};
 }
 function draw(s){if(library)gsap.set(s.el,{x:s.x,y:s.y,rotation:s.angle});else s.el.style.transform=`translate3d(${s.x}px,${s.y}px,0) rotate(${s.angle}deg)`;}
 function constrain(s){const b=bounds(s);s.x=clamp(s.x,b.minX,b.maxX);s.y=clamp(s.y,b.minY,b.maxY);draw(s);s.drag?.update();s.drag?.applyBounds(b);}
 function raise(s){s.el.style.zIndex=++z;}
 function enable(s){s.ready=true;s.el.dataset.landed="true";
  if(library){s.drag=Draggable.create(s.el,{type:'x,y',trigger:matchMedia('(pointer:coarse)').matches?s.el.querySelector('.paper-grip'):s.el,bounds:bounds(s),edgeResistance:1,minimumMovement:7,dragClickables:true,allowNativeTouchScrolling:false,zIndexBoost:false,onPress(){raise(s);},onDragStart(){s.el.classList.add('dragging');},onDrag(){s.x=this.x;s.y=this.y;},onDragEnd(){s.x=this.x;s.y=this.y;s.suppress=performance.now()+350;s.el.classList.remove('dragging');}})[0];}
  else{let pointer;
   s.el.addEventListener('pointerdown',e=>{if(e.button!==0||!s.ready)return;if(e.pointerType==='touch'&&!e.target.closest('.paper-grip'))return;raise(s);pointer={id:e.pointerId,px:e.clientX,py:e.clientY,x:s.x,y:s.y,moved:false};s.el.setPointerCapture(e.pointerId);});
   s.el.addEventListener('pointermove',e=>{if(!pointer||e.pointerId!==pointer.id)return;const dx=e.clientX-pointer.px,dy=e.clientY-pointer.py;if(Math.hypot(dx,dy)>7)pointer.moved=true;if(pointer.moved){s.el.classList.add('dragging');s.x=pointer.x+dx;s.y=pointer.y+dy;constrain(s);}});
   const release=()=>{if(pointer?.moved)s.suppress=performance.now()+350;pointer=null;s.el.classList.remove('dragging');};s.el.addEventListener('pointerup',release);s.el.addEventListener('pointercancel',release);
  }
 }
 states.forEach(s=>{
  // Standard anchors remain functional when JavaScript or the animation CDN is unavailable.
  s.el.addEventListener('click',e=>{if(performance.now()<s.suppress)e.preventDefault();});
  s.el.querySelector('.paper-grip').addEventListener('click',e=>e.preventDefault());
  s.el.addEventListener('dragstart',e=>e.preventDefault());
  s.el.addEventListener('focus',()=>{if(s.ready)raise(s);});
  s.el.addEventListener('keydown',e=>{const delta={ArrowLeft:[-18,0],ArrowRight:[18,0],ArrowUp:[0,-18],ArrowDown:[0,18]}[e.key];if(!delta||!s.ready)return;e.preventDefault();s.x+=delta[0];s.y+=delta[1];constrain(s);});
 });
 function initial(s){const mobile=space.clientWidth<650,w=s.el.offsetWidth,h=s.el.offsetHeight;
  s.x=mobile?[24,space.clientWidth-w-24,space.clientWidth*.18][s.i]:space.clientWidth/2-w/2+[-.68,0,.68][s.i]*w;
  s.y=mobile?[24,Math.min(145,h*.4),Math.min(285,h*.82)][s.i]:space.clientHeight/2-h/2+[-.045,.045,-.065][s.i]*h;s.el.style.left='0';s.el.style.top='0';constrain(s);
 }
 states.forEach(initial);
 // Gravity-driven descent followed by a damped spring: one restrained settling bounce.
 let raf,started=performance.now();const falls=states.map(s=>({target:s.y,y:-s.el.offsetHeight-space.getBoundingClientRect().top-120,v:0,landed:false,done:false}));
 function finish(){cancelAnimationFrame(raf);states.forEach((s,i)=>{if(!s.ready){s.y=falls[i].target;s.angle=[-10,7,-5][i];draw(s);enable(s);}});}
 if(reduced.matches)finish();else{
  states.forEach(s=>{s.el.style.visibility='hidden';});let previous=started;
  function frame(now){const dt=Math.min((now-previous)/1000,.025);previous=now;let active=false;
   states.forEach((s,i)=>{const f=falls[i];if(f.done)return;active=true;if(now-started<i*260)return;s.el.style.visibility='visible';
    if(!f.landed){f.v+=2450*dt;f.y+=f.v*dt;if(f.y>=f.target){f.y=f.target;f.v=-Math.min(f.v*.10,125);f.landed=true;}}
    else{f.v+=(-180*(f.y-f.target)-24*f.v)*dt;f.y+=f.v*dt;}
    s.y=f.y;s.angle=[-10,7,-5][i]+(f.landed?0:(f.target-f.y)*.025*(i%2?-1:1));draw(s);
    if(f.landed&&Math.abs(f.v)<2&&Math.abs(f.y-f.target)<.6){f.done=true;s.y=f.target;draw(s);enable(s);}
   });if(active)raf=requestAnimationFrame(frame);
  }raf=requestAnimationFrame(frame);
 }
 reduced.addEventListener('change',e=>{if(e.matches){states.forEach(s=>s.el.style.visibility='visible');finish();}});
 let previousSize={w:space.clientWidth,h:space.clientHeight};
 new ResizeObserver(()=>{
  const next={w:space.clientWidth,h:space.clientHeight};
  states.forEach((s,i)=>{
   if(s.ready){s.x*=next.w/previousSize.w;s.y*=next.h/previousSize.h;constrain(s);}
   else{const oldY=s.y;initial(s);falls[i].target=s.y;s.y=oldY;}
  });previousSize=next;
 }).observe(space);
})();
