/* Homepagezoom gebruikt vanaf het begin de voormalige 4x-snelheid. */
(function(){const selector='.photo>a,.project-row button',states=new WeakMap();let active;
function zoomGeometry(rect,viewport,height=window.innerHeight){
 const maxWidth=viewport*.5,maxHeight=Math.max(1,height-94);
 const scale=Math.min(Math.max(1,maxWidth/rect.width),maxHeight/rect.height);
 const margin=viewport*(viewport<600?.06:.04),top=24,bottom=70;
 const centerX=rect.left+rect.width/2,centerY=rect.top+rect.height/2;
 const halfWidth=rect.width*scale/2,halfHeight=rect.height*scale/2;
 const targetX=Math.max(margin+halfWidth,Math.min(viewport-margin-halfWidth,centerX));
 const targetY=Math.max(top+halfHeight,Math.min(height-bottom-halfHeight,centerY));
 return{scale,shift:targetX-centerX,shiftY:targetY-centerY,maxWidth:rect.width*scale};
}
function zoomProgress(ms){return Math.min(1,Math.max(ms,0)/2000)}
window.PortfolioHover={zoomGeometry,zoomProgress};
function animate(item,to,growing){
 const img=item.querySelector('img');if(!img)return;
 const project=!!item.closest('.project-row'),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let state=states.get(item);if(!state){state={value:{scale:1,shift:0,shiftY:0,rotation:0},frame:0};states.set(item,state)}
 cancelAnimationFrame(state.frame);item.closest('figure')?.classList.add('is-zooming');const from={...state.value},started=performance.now();const duration=project?(growing?Math.abs(to.scale-from.scale)/.03*10000:3000):(reduced?180:1200);img.style.transition='none';
 function tick(now){
  if(!img.isConnected){state.frame=0;return}
  const elapsed=Math.max(0,now-started),wobble=project&&growing&&!reduced;
  const phase=2*Math.PI*elapsed/20000;const progress=project||!growing?(duration===0?1:Math.min(1,elapsed/duration)):zoomProgress(elapsed);
  const t=!growing?1-Math.pow(1-progress,3):progress;
  state.value={scale:from.scale+(to.scale-from.scale)*t,shift:from.shift+(to.shift-from.shift)*t,shiftY:from.shiftY+(to.shiftY-from.shiftY)*t,rotation:from.rotation*(1-t)};
  if(wobble){state.value.shift+=.7*Math.sin(phase)*t;state.value.shiftY+=.7*Math.sin(phase)*t;state.value.rotation+=.15*Math.sin(phase)*t}
  img.style.transform=`translate(${state.value.shift}px,${state.value.shiftY}px) scale(${state.value.scale}) rotate(${state.value.rotation}deg)`;
  if(progress<1||(wobble&&item.classList.contains('is-hovered')))state.frame=requestAnimationFrame(tick);
  else{state.frame=0;if(!project||!growing&&!item.classList.contains('is-hovered'))item.closest('figure')?.classList.remove('is-zooming')}
 }
 state.frame=requestAnimationFrame(tick);
}
function leave(item){item.classList.remove('is-hovered');if(!item.classList.contains('identity'))animate(item,{scale:1,shift:0,shiftY:0},false);if(active===item)active=undefined}
function enter(item){if(item===active)return;if(active)leave(active);active=item;item.classList.add('is-hovered');if(item.classList.contains('identity'))return;const img=item.querySelector('img');if(!img)return;const rect=item.getBoundingClientRect();const geometry=item.closest(".project-row")?{scale:1.03,shift:0,shiftY:0,maxWidth:rect.width*1.03}:zoomGeometry(rect,document.documentElement.clientWidth,Math.min(window.innerHeight,(document.querySelector(".exhibition-scroll")?.getBoundingClientRect().top??window.innerHeight)+70-32));if(!item.closest('.project-row'))img.sizes=Math.ceil(Math.max(parseFloat(img.sizes)||0,geometry.maxWidth))+'px';item.closest('figure')?.classList.add('is-zooming');animate(item,geometry,true)}
document.addEventListener('pointerover',event=>{if(event.pointerType!=='mouse'&&event.pointerType!=='pen')return;const item=event.target.closest?.(selector);if(item)enter(item)});
document.addEventListener('pointerout',event=>{const item=event.target.closest?.(selector);if(item&&!item.contains(event.relatedTarget))leave(item)});
function reset(){document.querySelectorAll('.is-hovered').forEach(leave)}
document.addEventListener('pointercancel',reset);window.addEventListener('blur',reset);window.addEventListener('resize',reset);window.addEventListener('hashchange',reset);window.addEventListener('scroll',()=>{
 // De homepage reset nog steeds; projectfoto's blijven gekoppeld aan echte hover.
 if(active&&!active.closest('.project-row'))leave(active);
 if(!matchMedia('(any-hover:hover)').matches)return;
 requestAnimationFrame(()=>{
  const hovered=document.querySelector('.project-row button:hover');
  if(hovered)enter(hovered);
  else if(active?.closest('.project-row'))leave(active);
 });
},{passive:true});
document.addEventListener('pointermove',event=>{
 if(event.pointerType!=='mouse'&&event.pointerType!=='pen')return;
 const item=event.target.closest?.('.project-row button');if(item&&item!==active)enter(item);
});
})();














