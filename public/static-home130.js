/* Virtual circular exhibition. Existing figures are detached templates, never a long strip. */
window.PortfolioLiving={create({canvas,figures,photos}){
 const templates=new Map(figures.map(f=>[f.dataset.photoId,f])),pool=photos.filter(p=>templates.has(p.id));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),live=new Map(),home=document.querySelector('#werk');
 let lanes=[],width=0,height=0,offset=0,target=0,frame=0,lastTime=0,seed=219,drag=null,suppressClickUntil=0,paused=false,lastInput=0,autoOverride=true,hoveredPhoto=null,railDrag=null,railActive=false,railOrigin=0,railReturn=0,springFrame=0,railX=0,railVelocity=0,railSample=0;
 const mod=(v,n)=>((v%n)+n)%n,isHome=()=>!home.hidden&&!document.querySelector('dialog[open]');
 canvas.replaceChildren();canvas.tabIndex=0;canvas.setAttribute('role','region');
 canvas.setAttribute('aria-label','Fototentoonstelling. Scroll, veeg of gebruik de pijltjestoetsen om horizontaal te bladeren. Spatie pauzeert de automatische beweging.');
 function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
 function build(){
  const compact=width<700,short=height<550,caption=short?28:compact?42:72;
  const order=pool.slice();for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
  // Five unequal positions form an invisible chapter. Chapters meet across open space.
  const slots=compact?[
   [.12,.22,.60,.29],[.70,.64,.55,.25],[1.22,.16,.45,.25],[.04,.69,.30,.18],[1.72,.52,.56,.28]
  ]:[
   [.26,.14,.32,.40],[.65,.65,.27,.25],[.79,.15,.18,.27],[.05,.65,.15,.23],[1.15,.46,.25,.33]
  ];
  const chapterWidth=width*(compact?2.55:1.55),chapters=Math.ceil(order.length/slots.length),items=[];
  for(let chapter=0;chapter<chapters;chapter++){
   slots.forEach(([x,y,w,h],slot)=>{
    const index=chapter*slots.length+slot,photo=order[index%order.length];
    const variation=chapter%3===1?.025:chapter%3===2?-.025:0;
    const top=Math.max(short?64:100,height*(y+variation));
    const available=Math.max(20,Math.min(height*h,height-(short?65:84)-top)-caption);
    const size=Math.max(20,Math.min(width*w,available*photo.ratio));
    items.push({id:index,photo,x:chapter*chapterWidth+width*x,y:top,w:size});
   });
  }
  lanes=[{items,period:chapters*chapterWidth,speed:1,phase:0}];
 }
 function render(){
  if(!width||!isHome())return;
  const wanted=new Set(),margin=width*.22;
  lanes.forEach((lane,layer)=>{
   if(!lane.period)return;
   const distance=mod(offset*lane.speed,lane.period);
   for(const item of lane.items){
    const start=item.x+lane.phase-distance,first=Math.ceil((-margin-item.w-start)/lane.period),last=Math.floor((width+margin-start)/lane.period);
    for(let cycle=first;cycle<=last;cycle++){
     const x=start+cycle*lane.period,key=layer+':'+item.id+':'+(cycle+Math.floor(offset*lane.speed/lane.period));wanted.add(key);
     let node=live.get(key);
     if(!node){node=templates.get(item.photo.id).cloneNode(true);node.hidden=false;node.classList.remove('is-zooming');const img=node.querySelector('img');img.style.transform='';img.loading='eager';img.fetchPriority='auto';img.sizes=Math.ceil(Math.max(item.w,width*.5))+'px';node.querySelector('a').classList.remove('is-hovered');const project=PortfolioProjects.projectForPhoto(item.photo.id),series=node.querySelector('.series-label');if(series)series.textContent=project.title.toLowerCase()+' · '+(project.workKind==='commissioned'?'in opdracht':'vrij werk');canvas.append(node);live.set(key,node)}
     node.style.width=item.w+'px';node.style.transform=`translate3d(${x}px,${item.y}px,0)`;node.style.setProperty('--accent-width',item.w*.015+'px');node.dataset.layer=String(layer);
     node.querySelector('a').tabIndex=x+item.w>0&&x<width?0:-1;
    }
   }
  });
  for(const [key,node] of live)if(!wanted.has(key)){node.remove();live.delete(key)}
  updateScrollMarker();window.dispatchEvent(new Event('portfolio-composition-change'));
 }
 function stop(){cancelAnimationFrame(frame);frame=0;lastTime=0;target=offset;drag=null;canvas.classList.remove('is-dragging')}
 function autoEnabled(){return autoOverride}
 function syncMotion(){
  const control=document.querySelector('.footer-action');
  if(home.hidden){control.removeAttribute('aria-pressed');return}
  const enabled=autoEnabled()&&!paused,label=control.querySelector('.footer-action-label'),text=enabled?'pauze':'play';
  (label.querySelector('.honk-original')||label).textContent=text;label.dataset.text=text;
  control.setAttribute('aria-pressed',String(enabled));control.setAttribute('aria-label',enabled?'Pauzeer de automatische beweging':'Start de automatische beweging');
  const icon=control.querySelector('svg');icon.classList.remove('footer-shuffle-icon');icon.classList.add('footer-motion-icon');
  icon.innerHTML=enabled?'<path d="M5 3v10M11 3v10" fill="none" stroke="currentColor" stroke-width="2"/>':'<path d="M5 3l8 5-8 5z" fill="currentColor"/>';
 }
 function canDrift(){return autoEnabled()&&!paused&&!drag&&!railDrag&&!hoveredPhoto?.isConnected&&!document.hidden}
 function wake(){if(!frame&&isHome()&&!document.hidden&&(canDrift()||offset!==target))frame=requestAnimationFrame(tick)}
 function tick(now){
  frame=0;if(!isHome()||document.hidden){stop();return}
  const dt=Math.min(50,lastTime?now-lastTime:16);lastTime=now;
  // Move both coordinates equally: input adds a smooth impulse to the baseline drift.
  if(canDrift()){const drift=(width<700?6:8)*dt/1000;offset+=drift;target+=drift}
  offset+=(target-offset)*(reduced.matches?1:1-Math.exp(-dt/85));
  if(Math.abs(target-offset)<.08)offset=target;
  render();if(offset!==target||canDrift())frame=requestAnimationFrame(tick);else lastTime=0;
 }
 function move(delta,immediate=false){
  if(!isHome()||!Number.isFinite(delta))return;
  const now=performance.now();if(now-lastInput>160)document.dispatchEvent(new Event('pointercancel'));lastInput=now;activateScrollMarker();target+=delta;if(!railDrag)scheduleMarkerReturn();
  if(immediate||reduced.matches){offset=target;render()}else if(!frame)frame=requestAnimationFrame(tick);
 }
 function layout(force=false){if(home.hidden)return;const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;if(!force&&w===width&&h===height){if(!live.size)render();wake();return}stop();width=w;height=h;build();render();wake()}
 function select(){seed=Math.floor(Math.random()*4294967296);layout(true)}
 window.addEventListener('wheel',event=>{if(!isHome()||event.ctrlKey||event.defaultPrevented)return;event.preventDefault();const unit=event.deltaMode===1?16:event.deltaMode===2?width:1;move((Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY)*unit)},{passive:false});
 canvas.addEventListener('pointerdown',event=>{if(event.button!==0||!isHome())return;stop();drag={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,moved:false}});
 canvas.addEventListener('pointermove',event=>{
  if(!drag||drag.id!==event.pointerId)return;if(!drag.moved&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<7)return;
  if(!drag.moved){drag.moved=true;canvas.setPointerCapture(event.pointerId);canvas.classList.add('is-dragging');document.dispatchEvent(new Event('pointercancel'))}
  move(drag.x-event.clientX,true);drag.x=event.clientX;
 });
 function release(event){if(!drag||event.pointerId!==drag.id)return;if(drag.moved)suppressClickUntil=performance.now()+400;drag=null;canvas.classList.remove('is-dragging');if(canvas.hasPointerCapture(event.pointerId))canvas.releasePointerCapture(event.pointerId);wake()}
 window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);window.addEventListener('blur',()=>{drag=null;canvas.classList.remove('is-dragging');wake()});canvas.addEventListener('dragstart',event=>event.preventDefault());
 canvas.addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation()}},true);
 canvas.addEventListener('keydown',event=>{if(event.key===' '&&!event.target.closest('a')){event.preventDefault();paused=!paused;syncMotion();wake();return}const delta={ArrowRight:width*.25,ArrowLeft:-width*.25,PageDown:width*.8,PageUp:-width*.8}[event.key];if(delta){event.preventDefault();move(delta)}});
 canvas.addEventListener('pointerover',event=>{
  if(!['mouse','pen'].includes(event.pointerType)||drag)return;
  const link=event.target.closest('.photo>a');if(!link||link===hoveredPhoto)return;
  hoveredPhoto=link;stop();
 });
 canvas.addEventListener('pointerout',event=>{
  if(hoveredPhoto&&!hoveredPhoto.contains(event.relatedTarget)){hoveredPhoto=null;requestAnimationFrame(wake)}
 });canvas.addEventListener('focusout',()=>requestAnimationFrame(wake));
 canvas.addEventListener('focusin',event=>{const node=event.target.closest('.photo');if(!node)return;const r=node.getBoundingClientRect();if(r.left<24)move(r.left-24,true);else if(r.right>width-24)move(r.right-width+24,true)});
 const control=document.querySelector('.footer-action');
 control.addEventListener('click',event=>{
  if(home.hidden)return;event.preventDefault();event.stopImmediatePropagation();
  autoOverride=!(autoEnabled()&&!paused);paused=false;stop();

  syncMotion();wake();
 });
 control.addEventListener('keydown',event=>{if(event.key===' '&&!home.hidden){event.preventDefault();control.click()}});
 // Relative navigation, rather than a finite progress bar for an endless canvas.
 const rail=document.createElement('div');rail.className='exhibition-scroll';
 const track=document.createElement('button');track.type='button';track.className='exhibition-scroll-track';
 track.setAttribute('aria-label','Horizontaal bladeren. Sleep of gebruik de linker- en rechterpijl.');
 track.title='Sleep om te bladeren · ← →';
 const thumb=document.createElement('span');thumb.className='exhibition-scroll-thumb';thumb.setAttribute('aria-hidden','true');const railWindow=document.createElement('span');railWindow.className='exhibition-scroll-window';railWindow.setAttribute('aria-hidden','true');railWindow.append(thumb);track.append(railWindow);
 const hint=document.createElement('span');hint.className='exhibition-scroll-hint';hint.textContent='↔ scroll / sleep';hint.setAttribute('aria-hidden','true');
 rail.append(track,hint);document.body.append(rail);
 function paintMarker(){thumb.style.transform=`translateX(${railX}px)`}
 function updateScrollMarker(){
  if(!railActive)return;
  const railWidth=track.clientWidth;if(!railWidth||!width)return;
  track.style.setProperty('--rail-length',railWidth+'px');
  const shift=mod((offset-railOrigin)/width*railWidth+railWidth/2,railWidth)-railWidth/2,now=performance.now();
  const dt=(now-railSample)/1000;
  if(dt>.002&&dt<.2){const delta=mod(shift-railX+railWidth/2,railWidth)-railWidth/2;railVelocity=.6*railVelocity+.4*Math.max(-300,Math.min(300,delta/dt))}
  railX=shift;railSample=now;paintMarker();
 }
 function activateScrollMarker(){
  clearTimeout(railReturn);
  if(!railActive){
   cancelAnimationFrame(springFrame);springFrame=0;
   railOrigin=offset-railX/Math.max(1,track.clientWidth)*width;
   railSample=performance.now();railActive=true;
  }
 }
 function returnMarker(){
  railActive=false;cancelAnimationFrame(springFrame);springFrame=0;
  // This small, explicitly requested spring follows user input, not automatic page motion.
  if(!isHome()||document.hidden){railX=railVelocity=0;paintMarker();return}
  let previous=performance.now();
  function spring(now){
   springFrame=0;
   if(railActive||document.hidden||!isHome())return;
   let remaining=Math.min(.05,Math.max(0,(now-previous)/1000));previous=now;
   // Unit mass, spring stiffness and damping. Substeps keep the return stable at any refresh rate.
   while(remaining>0){const dt=Math.min(1/120,remaining);railVelocity+=(-190*railX-7*railVelocity)*dt;railX+=railVelocity*dt;remaining-=dt}
   if(Math.abs(railX)<.02&&Math.abs(railVelocity)<.05){railX=railVelocity=0;paintMarker();return}
   paintMarker();springFrame=requestAnimationFrame(spring);
  }
  springFrame=requestAnimationFrame(spring);
 }
 function scheduleMarkerReturn(){clearTimeout(railReturn);railReturn=setTimeout(()=>{if(!railDrag)returnMarker()},350)}
 track.addEventListener('pointerdown',event=>{
  if(event.button!==0||!isHome())return;
  stop();activateScrollMarker();railDrag={id:event.pointerId,start:event.clientX,last:event.clientX,moved:false};
  track.setPointerCapture(event.pointerId);track.classList.add('is-dragging');
 });
 track.addEventListener('pointermove',event=>{
  if(!railDrag||railDrag.id!==event.pointerId)return;
  if(!railDrag.moved&&Math.abs(event.clientX-railDrag.start)<3)return;
  railDrag.moved=true;
  move((event.clientX-railDrag.last)/track.clientWidth*width,true);railDrag.last=event.clientX;
 });
 function releaseRail(event){
  if(!railDrag||event.pointerId!==railDrag.id)return;
  const click=!railDrag.moved&&event.type==='pointerup';railDrag=null;
  track.classList.remove('is-dragging');updateScrollMarker();scheduleMarkerReturn();
  if(track.hasPointerCapture(event.pointerId))track.releasePointerCapture(event.pointerId);
  if(click){const box=track.getBoundingClientRect();move((event.clientX<box.left+box.width/2?-1:1)*width*.45)}
  wake();
 }
 track.addEventListener('pointerup',releaseRail);track.addEventListener('pointercancel',releaseRail);
 track.addEventListener('click',event=>{if(event.detail===0)move(width*.45)});
 track.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(width*.25*(event.key==='ArrowLeft'?-1:1))}});
 window.addEventListener('blur',()=>{railDrag=null;track.classList.remove('is-dragging');updateScrollMarker();scheduleMarkerReturn();wake()});
 window.addEventListener('resize',()=>layout());window.addEventListener('hashchange',()=>{hoveredPhoto=null;railDrag=null;track.classList.remove('is-dragging');updateScrollMarker();scheduleMarkerReturn();stop();requestAnimationFrame(wake)});window.addEventListener('pageshow',wake);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else wake()});
 reduced.addEventListener('change',()=>{syncMotion();layout(true)});document.fonts.ready.then(()=>layout(true));
 return{layout,select,syncMotion};
}};
