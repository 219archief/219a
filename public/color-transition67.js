/* Soft project-color reveal. No dependencies; see COLOR_TRANSITION.md for router hooks. */
(function(){
 'use strict';
 const DUUR=1500; // ms
 const RESPECT_REDUCED_MOTION=false; // Prototype: zet op true voor de live site.
 const ZACHT=280; // px
 const CONTENT_FADE_MS=450;
 const STORAGE_KEY='219:overview-scroll';
 const root=document.documentElement,body=document.body;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let currentProject,active;
 body.style.setProperty('--color-content-fade',CONTENT_FADE_MS+'ms');
 const respectReduce=()=>RESPECT_REDUCED_MOTION&&reduced.matches;
 const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
 function getHomeScroll(){try{return Math.max(0,Number(sessionStorage.getItem(STORAGE_KEY))||0)}catch{return 0}}
 function saveHomeScroll(){try{sessionStorage.setItem(STORAGE_KEY,String(scrollY))}catch{}}
 function appearance(project){return PortfolioProjects.projectAppearance(project)}
 function crossesOverview(project){return !!currentProject!==!!project&&appearance(project||currentProject).enabled}
 function origin(photo){
  const rect=photo?.getBoundingClientRect();
  return rect?.width&&rect?.height?{x:rect.left+rect.width/2,y:rect.top+rect.height/2}:{x:innerWidth/2,y:innerHeight/2};
 }
 function hero(){return document.querySelector('#project-gallery img')}
 function finish(state){
  cancelAnimationFrame(state.raf);state.overlay.remove();
  if(active===state){active=undefined;body.classList.remove('color-transition-running','color-transition-fading');root.classList.remove('color-transition-committing');}
  window.dispatchEvent(new Event('project-background-ready'));
 }
 async function run(project,point,commit){
  const overlay=document.createElement('div');overlay.className='kleur-overlay project-color-overlay';overlay.setAttribute('aria-hidden','true');
  const color=project?appearance(project).color:PortfolioTheme.home;
  const radius=Math.hypot(Math.max(Math.abs(point.x),Math.abs(innerWidth-point.x)),Math.max(Math.abs(point.y),Math.abs(innerHeight-point.y)))+ZACHT;
  for(const [name,value] of Object.entries({'--kleur':color,'--x':point.x+'px','--y':point.y+'px','--zacht':ZACHT+'px','--r':'0px'}))overlay.style.setProperty(name,value);
  const state={overlay,raf:0,committing:false};active=state;
  body.prepend(overlay);body.classList.add('color-transition-running');
  window.dispatchEvent(new Event('blur'));
  try{
   await new Promise(resolve=>{
    let start;
    function tick(time){
     if(active!==state){resolve();return}
     start??=time;const progress=Math.min((time-start)/DUUR,1);
     overlay.style.setProperty('--r',radius*ease(progress)+'px');
     if(progress>=.5)body.classList.add('color-transition-fading');
     if(progress<1)state.raf=requestAnimationFrame(tick);else resolve();
    }
    state.raf=requestAnimationFrame(tick);
   });
   if(active!==state)return;
   // Full coverage before changing the actual background or mounting the next page.
   root.classList.add('color-transition-committing');state.committing=true;
   const routed=new Promise(resolve=>state.resolveRoute=resolve);
   commit();await routed;
   getComputedStyle(root).backgroundColor;
   await frame();await frame();
  }finally{finish(state)}
 }
 // Router adapter: native Back/Forward gets the same reveal as ordinary links.
 function beforeRoute(project,initial,resume){
  if(initial||active?.committing)return false;
  if(active){finish(active);return false}
  if(respectReduce()||!crossesOverview(project))return false;
  const photo=project?document.querySelector('.photo>a[href="'+location.hash+'"] img'):hero();
  void run(project,origin(photo),resume);return true;
 }
 function afterRoute(project){currentProject=project;active?.resolveRoute?.()}
 document.addEventListener('click',event=>{
  if(active){event.preventDefault();event.stopImmediatePropagation();return}
  const link=event.target.closest?.('a');
  if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('download'))return;
  const url=new URL(link.href,location.href);
  if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;
  const project=PortfolioProjects.projectFromHash(url.hash);
  if(!currentProject&&project)saveHomeScroll();
  if(respectReduce()||url.hash===location.hash||!crossesOverview(project))return;
  // Only overview anchors are return destinations; unrelated URLs remain native.
  if(!project&&!['#werk','#info','#contact'].includes(url.hash))return;
  event.preventDefault();
  void run(project,origin(project?link.querySelector('img'):hero()),()=>{location.hash=url.hash});
 },true);
 window.addEventListener('pagehide',()=>{if(active)finish(active)});
 window.PortfolioColorTransition={beforeRoute,afterRoute,getHomeScroll,settings:Object.freeze({duration:DUUR,softness:ZACHT,contentFade:CONTENT_FADE_MS,respectReducedMotion:RESPECT_REDUCED_MOTION})};
})();


