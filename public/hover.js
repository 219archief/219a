/* Tijdgestuurde cursorzoom: na 2 seconden exact 4x sneller, zonder CSS-easing. */
(function(){const selector='.photo>a,.project-row button',states=new WeakMap();let active;
function zoomGeometry(rect,viewport,height=window.innerHeight){
 const margin=viewport*(viewport<600?.06:.04),top=24,bottom=70;
 const maxWidth=viewport-2*margin,maxHeight=Math.max(1,height-top-bottom);
 const scale=Math.min(maxWidth/rect.width,maxHeight/rect.height);
 const halfHeight=rect.height*scale/2,centerY=rect.top+rect.height/2;
 const targetY=Math.max(top+halfHeight,Math.min(height-bottom-halfHeight,centerY));
 return{scale,shift:viewport/2-(rect.left+rect.width/2),shiftY:targetY-centerY,maxWidth:rect.width*scale};
}
function zoomProgress(ms){return Math.min(1,(Math.min(Math.max(ms,0),2000)+Math.max(0,ms-2000)*4)/8000)}
window.PortfolioHover={zoomGeometry,zoomProgress};
function animate(item,to,growing){
 const img=item.querySelector('img');if(!img)return;
 const project=!!item.closest('.project-row'),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let state=states.get(item);if(!state){state={value:{scale:1,shift:0,shiftY:0,rotation:0},frame:0};states.set(item,state)}
 cancelAnimationFrame(state.frame);const from={...state.value},started=performance.now();const duration=reduced?180:project?(growing?Math.abs(to.scale-from.scale)/.03*80000:3000):1200;img.style.transition='none';
 function tick(now){
  if(!img.isConnected){state.frame=0;return}
  const elapsed=Math.max(0,now-started),wobble=project&&growing&&!reduced;
  const phase=2*Math.PI*elapsed/20000;const progress=project||!growing?(duration===0?1:Math.min(1,elapsed/duration)):zoomProgress(elapsed);
  const t=!growing?1-Math.pow(1-progress,3):progress;
  state.value={scale:from.scale+(to.scale-from.scale)*t,shift:from.shift+(to.shift-from.shift)*t,shiftY:from.shiftY+(to.shiftY-from.shiftY)*t,rotation:from.rotation*(1-t)};
  if(wobble){state.value.shift+=.7*Math.sin(phase)*t;state.value.shiftY+=.7*Math.sin(phase)*t;state.value.rotation+=.15*Math.sin(phase)*t}
  img.style.transform=`translate(${state.value.shift}px,${state.value.shiftY}px) scale(${state.value.scale}) rotate(${state.value.rotation}deg)`;
  if(progress<1||(wobble&&item.classList.contains('is-hovered')))state.frame=requestAnimationFrame(tick);
  else{state.frame=0;if(!growing&&!item.classList.contains('is-hovered'))item.closest('figure')?.classList.remove('is-zooming')}
 }
 state.frame=requestAnimationFrame(tick);
}
function leave(item){item.classList.remove('is-hovered');if(!item.classList.contains('identity'))animate(item,{scale:1,shift:0,shiftY:0},false);if(active===item)active=undefined}
function enter(item){if(item===active)return;if(active)leave(active);active=item;item.classList.add('is-hovered');if(item.classList.contains('identity'))return;const img=item.querySelector('img');if(!img)return;const rect=item.getBoundingClientRect();const geometry=item.closest(".project-row")?{scale:1.03,shift:0,shiftY:0,maxWidth:rect.width*1.03}:zoomGeometry(rect,document.documentElement.clientWidth);img.sizes=Math.ceil(geometry.maxWidth)+'px';item.closest('figure')?.classList.add('is-zooming');animate(item,geometry,true)}
document.addEventListener('pointerover',event=>{if(event.pointerType!=='mouse'&&event.pointerType!=='pen')return;const item=event.target.closest?.(selector);if(item)enter(item)});
document.addEventListener('pointerout',event=>{const item=event.target.closest?.(selector);if(item&&!item.contains(event.relatedTarget))leave(item)});
function reset(){document.querySelectorAll('.is-hovered').forEach(leave)}
document.addEventListener('pointercancel',reset);window.addEventListener('blur',reset);window.addEventListener('resize',reset);window.addEventListener('hashchange',reset);window.addEventListener('scroll',reset,{passive:true});
})();











