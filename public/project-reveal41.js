/* Kleur eerst; pas daarna verschijnen de geladen projectfoto's. */
(function(){
 const gallery=document.querySelector('#project-gallery');let generation=0,animation,controller;
 const frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 function begin(project){generation++;controller?.abort();controller=new AbortController();animation?.cancel();gallery.style.opacity=project?'0':'';}
 async function show(){const current=generation,signal=controller.signal;
  await frame();await frame();
  if(document.querySelector('.project-color-overlay'))await new Promise(resolve=>{window.addEventListener('project-background-ready',resolve,{once:true,signal});signal.addEventListener('abort',resolve,{once:true})});
  if(current!==generation)return;
  await Promise.all(document.documentElement.getAnimations().map(a=>a.finished.catch(()=>{})));
  if(current!==generation)return;
  const visible=[...gallery.querySelectorAll('img')].filter((img,i)=>i===0||img.getBoundingClientRect().top<innerHeight);
  await Promise.all(visible.map(img=>img.decode?img.decode().catch(()=>{}):Promise.resolve()));
  if(current!==generation)return;
  gallery.style.opacity='1';
  if(typeof gallery.animate==='function'){animation=gallery.animate([{opacity:0},{opacity:1}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?250:1600,easing:'ease-in-out'});await animation.finished.catch(()=>{});}
 }
 window.PortfolioProjectReveal={begin,show};
})();
