/* Direct openen; de projectfoto's vervagen kort in zodra ze geladen zijn. */
(function(){
 const gallery=document.querySelector('#project-gallery');let generation=0,animation;
 function begin(project){generation++;animation?.cancel();gallery.style.opacity=project?'0':'';}
 async function show(){
  const current=generation;
  const visible=[...gallery.querySelectorAll('img')].filter((img,i)=>i===0||img.getBoundingClientRect().top<innerHeight);
  await Promise.all(visible.map(img=>img.decode?img.decode().catch(()=>{}):Promise.resolve()));
  if(current!==generation)return;
  if(typeof gallery.animate==='function'){
   animation=gallery.animate([{opacity:0},{opacity:1}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?150:500,easing:'ease-out',fill:'both'});
   const running=animation;
   await running.finished.catch(()=>{});
   if(current!==generation)return;
   gallery.style.opacity='1';running.cancel();
  }else gallery.style.opacity='1';
 }
 window.PortfolioProjectReveal={begin,show};
})();
