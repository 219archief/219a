/* Direct photo changes after decoding; retain the initial viewer reveal. */
(function(){
 const FADE_MS=220;
 const dialog=document.querySelector('dialog'),stage=document.querySelector('.viewer-image'),image=document.querySelector('#full-image');
 const loading=document.querySelector('#viewer-loading'),error=document.querySelector('#image-error');
 let generation=0,effects=[];
 function clearEffects(){effects.forEach(effect=>effect.cancel());effects=[];}
 function reset(){generation++;clearEffects();stage.classList.remove('is-loading','has-viewer-photo');stage.setAttribute('aria-busy','false');loading.hidden=true;image.hidden=true;error.hidden=true}
 function labels(photo,index,total,year){document.querySelector('#full-caption').textContent=`${photo.place} — ${year}`;const counter=document.querySelector('#viewer-count');counter.textContent=`${index+1} / ${total}`;counter.setAttribute('aria-label',`foto ${index+1} van ${total}`);}
 async function show({photo,index,total,year,src}){
  const current=++generation,hasPhoto=stage.classList.contains('has-viewer-photo')&&!image.hidden;
  stage.classList.add('is-loading');stage.setAttribute('aria-busy','true');loading.hidden=false;error.hidden=true;
  if(!hasPhoto){image.hidden=true;labels(photo,index,total,year)}
  const prepared=new Image();prepared.decoding='async';prepared.src=src;
  try{
   await prepared.decode();if(current!==generation)return;
   clearEffects();
   image.src=src;image.alt=photo.alt;image.hidden=false;await image.decode();if(current!==generation)return;
   labels(photo,index,total,year);stage.classList.remove('is-loading');stage.classList.add('has-viewer-photo');stage.setAttribute('aria-busy','false');loading.hidden=true;
   const animate=!hasPhoto&&(!matchMedia('(prefers-reduced-motion: reduce)').matches||window.PortfolioColorTransition?.settings.respectReducedMotion===false);
   if(animate&&typeof image.animate==='function'){
    effects=[image.animate([{opacity:0},{opacity:1}],{duration:FADE_MS,easing:'ease-in-out',fill:'both'})];
    await Promise.all(effects.map(effect=>effect.finished.catch(()=>{})));if(current!==generation)return;
   }
   clearEffects();
  }catch{
   if(current!==generation)return;
   clearEffects();stage.classList.remove('is-loading','has-viewer-photo');stage.setAttribute('aria-busy','false');loading.hidden=true;image.hidden=true;error.hidden=false;
  }
 }
 dialog.addEventListener('close',reset);
 window.PortfolioViewer={show,reset,settings:Object.freeze({fadeDuration:FADE_MS})};
})();

