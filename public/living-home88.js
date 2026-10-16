/* Six bounded, independently changing positions; the original project UI stays intact. */
window.PortfolioLiving={create({canvas,figures,photos}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let selected=[],slots=[],width=0,height=0,lastHeight=0,reserved=[],timer,busy=false,epoch=0,cycle=0,turn=0,density=1;
 const rand=PortfolioLayout.collides,random=()=>Math.random();let placementRandom=random,fontsReady=false,openingDone=false,openingGeneration=-1,compositionSeed=219,openingTask=Promise.resolve(),shuffleRunning=false,photoScaleTarget=1.87;
 const desktopProjectWidths={'binnen-en-buiten':.2375,'langs-de-kust':.25875,'ontmoetingen':.1981};
 function seeded(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
 function cover(project){return photos.find(p=>p.id===(project.backgroundCoverPhotoId||project.openingPhotoId||project.photoIds[0]))||photos.find(p=>project.photoIds.includes(p.id))}
 function bounds(el){const a=el.getBoundingClientRect(),b=canvas.getBoundingClientRect();return{x:a.left-b.left,y:a.top-b.top,w:a.width,h:a.height}}
 function intersects(a,b){return rand(a,b,28)}
 function visibleLimit(w,h){return w<600||w<1400||h<800?4:5}
 function place(index,other,near=false){const mobile=width<600,margin=width*(mobile?.06:.04),ratio=slots[index].ratio,gap=mobile?18:Math.max(32,Math.min(48,width*.025));
  const floor=20;
  for(let attempt=0;attempt<5000;attempt++){
   const slot=slots[index],isPhoto=!!slot.project,shrink=isPhoto?1:attempt<1200?1:attempt<2500?.75:.5;
   const old=near?slots[index].box:null;
   const photoScale=isPhoto?photoScaleTarget:1,layoutScale=isPhoto?1:density,cap=isPhoto?.5:.42;
   const targetWidth=!mobile&&isPhoto?desktopProjectWidths[slot.project.id]:null;
   const requestedWidth=targetWidth?width*targetWidth*(photoScale/1.87):old?old.w*(.92+placementRandom()*.16):width*(mobile?.28+placementRandom()*.10:.145+placementRandom()*.075)*photoScale*shrink*layoutScale*(isPhoto?1:.82);
   const w=Math.round(Math.min(requestedWidth,(height-floor-75)*ratio*cap));
   if(w<30)continue;const h=w/ratio+(slots[index].project?(mobile?24:42):0);
   const x=old?Math.max(margin,Math.min(width-margin-w,old.x+(placementRandom()-.5)*Math.min(width*.24,240))):margin+placementRandom()*Math.max(0,width-2*margin-w);
   const y=old?Math.max(floor,Math.min(height-h-65,old.y+(placementRandom()-.5)*Math.min(height*.22,180))):floor+placementRandom()*Math.max(0,height-floor-h-65);
   const box={x:Math.round(x),y:Math.round(y),w,h};
   if(box.y+box.h>height-60)continue;
   if(![...reserved,...other].some(b=>rand(box,b,gap)))return box;
  }
  return null;
 }
 function compositionScore(boxes){
  const area=boxes.reduce((sum,b)=>sum+b.w*b.h,0);if(!area)return Infinity;
  const cx=boxes.reduce((sum,b)=>sum+(b.x+b.w/2)*b.w*b.h,0)/area;
  const cy=boxes.reduce((sum,b)=>sum+(b.y+b.h/2)*b.w*b.h,0)/area;
  let crowding=0;boxes.forEach((a,i)=>boxes.slice(i+1).forEach(b=>{const dx=Math.max(0,a.x-b.x-b.w,b.x-a.x-a.w),dy=Math.max(0,a.y-b.y-b.h,b.y-a.y-a.h);crowding+=1/Math.max(10,Math.hypot(dx,dy))}));
  return Math.abs(cx/width-.5)*2+Math.abs(cy/height-(width<600?.72:.55))+crowding*4;
 }
 function apply(slot,box){slot.box=box;Object.assign(slot.el.style,{left:box.x+'px',top:box.y+'px',width:box.w+'px'});if(slot.project){slot.el.querySelector('img').sizes=box.w+'px';slot.el.style.setProperty('--accent-width',box.w*.015+'px')}else slot.el.style.height=box.w/slot.ratio+'px';}
 function layout(force=false){if(document.querySelector('#werk').hidden||!document.body.classList.contains('living-home'))return;const nextWidth=canvas.clientWidth,nextHeight=Math.round(window.visualViewport?.height||innerHeight);if(!nextWidth)return;if(nextWidth===width&&nextHeight===lastHeight&&!force)return;
  width=nextWidth;height=nextHeight;lastHeight=nextHeight;canvas.style.height=height+'px';
  const limit=visibleLimit(width,height);while(slots.filter(slot=>slot.visible).length>limit){const extra=[...slots].reverse().find(slot=>slot.visible&&!slot.project);if(!extra)break;extra.visible=false;extra.el.hidden=true;extra.box=null}
  for(let i=0;i<Math.min(limit,slots.length);i++){const slot=slots[i];if(!slot.visible){slot.visible=true;slot.el.hidden=false;slot.el.style.opacity=openingDone?'':'0'}}
  const intro=bounds(document.querySelector('.intro')),pad=width<600?10:24;
  reserved=[{x:intro.x-pad,y:intro.y-pad,w:intro.w+2*pad,h:intro.h+2*pad},bounds(document.querySelector('.identity')),bounds(document.querySelector('header>nav'))];
  const visible=slots.filter(slot=>slot.visible);let best,score=Infinity;
  for(const size of [1.87,1.78,1.68,1.56,1.44]){photoScaleTarget=size;placementRandom=seeded(compositionSeed+width*31+height*17+visible.length);score=Infinity;best=null;for(let round=0;round<14&&!best;round++){density=Math.pow(.83,round);for(let sample=0;sample<6;sample++){const boxes=[];for(let i=0;i<visible.length;i++){const box=place(slots.indexOf(visible[i]),boxes);if(!box)break;boxes.push(box)}if(boxes.length===visible.length){const value=compositionScore(boxes);if(value<score){best=boxes;score=value}}}}if(best)break}
  if(best)visible.forEach((slot,i)=>apply(slot,best[i]));placementRandom=random;
  revealOpening();
  window.dispatchEvent(new Event('portfolio-composition-change'));
 }
 function select(projects){epoch++;selected=projects.filter(p=>cover(p));clearTimeout(timer);slots.forEach(s=>{s.el.getAnimations().forEach(a=>a.cancel());if(!s.project)s.el.remove()});figures.forEach(f=>{f.hidden=true;f.style.opacity=""});slots=[];busy=false;turn=0;
  // Shuffle once per selection, then rotate through projects without simultaneous repeats.
  const pool=[...selected];if(openingDone||shuffleRunning)for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  for(let i=0;i<6;i++){const project=pool[i],photo=project&&cover(project);let el;
   if(photo){el=figures.find(f=>f.dataset.photoId===photo.id);el.hidden=false;el.classList.add('living-slot');el.querySelector('.caption-place').textContent=project.title.toLowerCase();}
   else{el=document.createElement('div');el.className='living-placeholder living-slot';el.setAttribute('aria-hidden','true');el.style.backgroundColor=['#B8CDF8','#846C5B','#D9DBA7','#D9DBF1','#C77D68','#8FAFA5'][i%6];canvas.append(el)}
   const limit=visibleLimit(innerWidth,Math.round(window.visualViewport?.height||innerHeight));el.hidden=i>=limit;el.style.opacity=openingDone?'':'0';slots.push({el,project,visible:i<limit,ratio:photo?.ratio||[1.5,.85,1.15][i%3],box:null});
  }
  document.querySelector('.archive-end>span:first-child').textContent='een wisselende selectie';document.querySelector('.archive-end>span:last-child').textContent=selected.length+' projecten';
  layout(true);if(openingDone)schedule(8000);return openingTask;
 }
 function revealOpening(){
  if(openingDone||!fontsReady||!document.body.classList.contains('living-home')||openingGeneration===epoch)return openingTask;
  openingTask=runOpening();return openingTask;
 }
 async function runOpening(){
  if(openingDone||!fontsReady||!document.body.classList.contains('living-home')||openingGeneration===epoch)return;
  const generation=epoch;openingGeneration=generation;const visible=slots.filter(s=>s.visible);
  await Promise.all(visible.map(s=>s.el.querySelector('img')?.decode().catch(()=>{})));
  if(generation!==epoch)return;
  const effects=visible.map((slot,i)=>slot.el.animate([{opacity:0},{opacity:1}],{duration:1400,delay:450+i*420,fill:'both',easing:'cubic-bezier(.4,0,.2,1)'}));
  await Promise.all(effects.map(a=>a.finished.catch(()=>{})));if(generation!==epoch)return;
  visible.forEach(s=>s.el.style.opacity='');effects.forEach(a=>a.cancel());openingDone=true;schedule(8000);
 }
 function blocked(slot){return document.hidden||document.querySelector('#werk').hidden||document.body.classList.contains('color-transition-running')||slot.el.matches(':hover')||slot.el.contains(document.activeElement)||slot.el.classList.contains('is-zooming')}
 function schedule(delay=11000+random()*3000){clearTimeout(timer);timer=setTimeout(tick,delay)}
 async function tick(){
  if(!openingDone)return;
  if(busy||!slots.length||canvas.querySelector('a:hover,a:focus-visible')){schedule();return}
  const ordered=slots.slice(cycle%slots.length).concat(slots.slice(0,cycle%slots.length));
  const available=ordered.filter(s=>s.visible&&!blocked(s)),count=slots.filter(s=>s.visible).length;
  if(available.length<2){schedule();return}
  const desired=[4,5,5,6][Math.floor(random()*4)];
  const adjust=turn++%2===0;
  let add=adjust&&desired>count?slots.find(s=>!s.visible):null;
  const drop=adjust&&desired<count?(available.find(s=>!s.project)||available[0]):null;
  const first=drop||available[0],pair=add?[first,add]:[first,available.find(s=>s!==first)];
  cycle=slots.indexOf(first)+1;
  const generation=epoch,started=performance.now();busy=true;
  const outgoing=pair.filter(s=>s.visible),stagger=900+random()*500;
  const fades=outgoing.map((slot,i)=>slot.el.animate([{opacity:1},{opacity:0}],{duration:1300+random()*300,delay:i*stagger,fill:'both',easing:'cubic-bezier(.4,0,.2,1)'}));
  const abort=()=>{fades.forEach(a=>a.cancel());busy=false;schedule()};
  await Promise.all(fades.map(a=>a.finished.catch(()=>{})));
  await new Promise(resolve=>setTimeout(resolve,650));
  if(generation!==epoch)return;
  if(pair.some(blocked)){abort();return}
  const occupied=new Set(slots.map(s=>s.project?.id).filter(Boolean)),replacements=[];
  for(const slot of outgoing.filter(s=>s!==drop)){const choices=selected.filter(p=>!occupied.has(p.id));
   if(slot.project&&choices.length){const project=choices[Math.floor(random()*choices.length)],photo=cover(project),el=figures.find(f=>f.dataset.photoId===photo.id);occupied.add(project.id);replacements.push({slot,project,photo,el});}
  }
  await Promise.all(replacements.map(r=>r.el.querySelector('img').decode().catch(()=>{})));
  if(generation!==epoch)return;
  if(pair.some(blocked)){abort();return}
  replacements.forEach(r=>{r.slot.el.hidden=true;r.slot.el=r.el;r.slot.project=r.project;r.slot.ratio=r.photo.ratio;r.el.classList.add('living-slot');r.el.querySelector('.caption-place').textContent=r.project.title.toLowerCase();r.el.style.opacity='0';r.el.hidden=false});
  const anchors=slots.filter(s=>s.visible&&!pair.includes(s)).map(s=>s.box).filter(Boolean);
  let incoming=pair.filter(s=>s!==drop),best,score=Infinity;
  for(let attempt=0;attempt<20;attempt++){
   const boxes=[];for(const slot of incoming){const box=place(slots.indexOf(slot),[...anchors,...boxes],slot.visible);if(!box)break;boxes.push(box)}
   if(boxes.length!==incoming.length)continue;
   const value=compositionScore([...anchors,...boxes]);if(value<score){score=value;best=boxes}
  }
  // If no sixth position fits, keep the existing composition rather than forcing it in.
  if(!best&&add){incoming=incoming.filter(s=>s!==add);add=null;}
  if(best)incoming.forEach((slot,i)=>apply(slot,best[i]));
  if(drop){drop.visible=false;drop.el.hidden=true;}
  if(add){add.visible=true;add.el.hidden=false;}
  fades.forEach(a=>a.cancel());incoming.forEach(slot=>slot.el.style.opacity='0');
  const reveals=incoming.map((slot,i)=>slot.el.animate([{opacity:0},{opacity:1}],{duration:1700+random()*300,delay:i*(500+random()*350),fill:'both',easing:'cubic-bezier(.4,0,.2,1)'}));
  await Promise.all(reveals.map(a=>a.finished.catch(()=>{})));
  if(generation!==epoch)return;
  incoming.forEach(slot=>slot.el.style.opacity='');reveals.forEach(a=>a.cancel());busy=false;
  window.dispatchEvent(new Event('portfolio-composition-change'));
  schedule(Math.max(4000,11000+random()*3000-(performance.now()-started)));
 }


 const footerAction=document.querySelector('.footer-action');
 function updateFooterAction(){const home=document.body.classList.contains('living-home'),label=footerAction.querySelector('.footer-action-label'),copy=label.querySelector('.honk-original')||label;copy.textContent=home?'shuffle':'naar boven';label.dataset.text=copy.textContent;if(home){footerAction.setAttribute('role','button');footerAction.setAttribute('aria-label','shuffle beelden')}else{footerAction.removeAttribute('role');footerAction.removeAttribute('aria-label')}}
 async function shuffle(){
  if(shuffleRunning||!document.body.classList.contains('living-home'))return;
  shuffleRunning=true;footerAction.setAttribute('aria-busy','true');clearTimeout(timer);const generation=++epoch;busy=true;
  const visible=slots.filter(s=>s.visible),opacities=visible.map(s=>getComputedStyle(s.el).opacity);
  slots.forEach(s=>s.el.getAnimations().forEach(a=>a.cancel()));
  visible.forEach((s,i)=>s.el.style.opacity=opacities[i]);
  const effects=visible.map((slot,i)=>slot.el.animate([{opacity:opacities[i]},{opacity:0}],{duration:1000,delay:i*100,fill:'both',easing:'ease-in-out'}));
  let rebuilt=false;
  try{
   await Promise.all(effects.map(a=>a.finished.catch(()=>{})));await new Promise(resolve=>setTimeout(resolve,650));
   if(epoch!==generation||!document.body.classList.contains('living-home'))return;
   compositionSeed=(compositionSeed+104729)>>>0;openingDone=false;openingGeneration=-1;
   visible.forEach(s=>s.el.style.opacity='0');effects.forEach(a=>a.cancel());rebuilt=true;
   await select(selected);
  }finally{
   effects.forEach(a=>a.cancel());
   if(!rebuilt&&epoch===generation){visible.forEach(s=>s.el.style.opacity='');openingDone=true;busy=false;schedule(8000)}
   shuffleRunning=false;footerAction.removeAttribute('aria-busy');
  }
 }
 footerAction.addEventListener('click',event=>{if(document.body.classList.contains('living-home')){event.preventDefault();event.stopPropagation();void shuffle()}});
 footerAction.addEventListener('keydown',event=>{if(event.key===' '&&document.body.classList.contains('living-home')){event.preventDefault();void shuffle()}});

 reduced.addEventListener('change',()=>schedule());
 document.fonts.ready.then(()=>{fontsReady=true;layout(true)});window.addEventListener('resize',()=>layout(true));window.visualViewport?.addEventListener('resize',()=>layout(true));
 return{select,layout,shuffle,updateFooterAction, get slots(){return slots},tick};
}};
