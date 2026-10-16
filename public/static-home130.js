/* A fixed, viewport-sized photographic tableau; project pages keep their own layout. */
window.PortfolioLiving={create({canvas,figures,photos}){
 let orderedPhotos=[],lastSize='',shuffling=false;
 function layout(force=false){
  if(document.querySelector('#werk').hidden)return;
  const width=canvas.clientWidth,height=canvas.clientHeight,key=width+'x'+height;
  if(!width||!height||!force&&lastSize===key)return;lastSize=key;
  const compact=width<700;
  // Each slot defines a bounding area, not a crop: natural image ratios are retained.
  const slots=compact?[
   [.07,.16,.47,.19],[.65,.25,.29,.15],[.035,.42,.16,.13],[.13,.69,.46,.20],[.68,.65,.26,.19]
  ]:[
   [.105,.15,.27,.29],[.70,.13,.22,.35],[.05,.56,.16,.19],[.29,.72,.29,.20],[.735,.60,.20,.28]
  ];
  orderedPhotos.forEach((photo,index)=>{
   const figure=figures.find(f=>f.dataset.photoId===photo.id),[x,y,w,h]=slots[index];
   const caption=figure.querySelector('figcaption');
   const maxWidth=width*w,maxHeight=Math.max(12,height*h-45);
   let size=Math.min(maxWidth,maxHeight*photo.ratio);
   figure.style.width=size+'px';
   const captionHeight=caption.getBoundingClientRect().height;
   size=Math.min(maxWidth,Math.max(12,height*h-captionHeight-8)*photo.ratio);
   Object.assign(figure.style,{left:width*x+'px',top:height*y+'px',width:size+'px'});
   figure.querySelector('img').sizes=Math.ceil(size)+'px';figure.style.setProperty('--accent-width',size*.015+'px');
  });
  window.dispatchEvent(new Event('portfolio-composition-change'));
 }
 function choosePhotos(){
  const pool=photos.filter(photo=>PortfolioProjects.projectForPhoto(photo.id));
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
  let selected=pool.slice(0,5);
  // When more than five images exist, always introduce a different image.
  if(pool.length>5&&selected.every(photo=>orderedPhotos.includes(photo))){selected[selected.length-1]=pool.find(photo=>!orderedPhotos.includes(photo))}
  if(selected.every((photo,i)=>photo===orderedPhotos[i])&&selected.length>1)selected=selected.slice(1).concat(selected[0]);
  return selected;
 }
 function showSelection(){figures.forEach(figure=>{figure.hidden=!orderedPhotos.some(photo=>photo.id===figure.dataset.photoId)});lastSize='';layout(true)}
 function select(){orderedPhotos=choosePhotos();showSelection()}
 async function shuffle(){
  if(shuffling||document.querySelector('#werk').hidden)return;
  shuffling=true;const control=document.querySelector('.footer-action');control.setAttribute('aria-disabled','true');
  const visible=figures.filter(f=>!f.hidden),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fade=(items,from,to)=>items.map((figure,index)=>figure.animate([{opacity:from},{opacity:to}],{duration:reduced?0:420,delay:reduced?0:index*55,fill:'forwards',easing:'ease-in-out'}));
  let animations=[];
  try{
   document.dispatchEvent(new Event('pointercancel'));
   animations=fade(visible,1,0);await Promise.all(animations.map(a=>a.finished));
   if(!reduced)await new Promise(resolve=>setTimeout(resolve,180));
   orderedPhotos=choosePhotos();
   // Prepare every incoming image while transparent, including newly selected ones.
   const nextFigures=orderedPhotos.map(photo=>figures.find(f=>f.dataset.photoId===photo.id));
   const hidden=nextFigures.map(figure=>figure.animate([{opacity:0},{opacity:0}],{duration:0,fill:'forwards'}));
   showSelection();
   await Promise.all(nextFigures.map(async figure=>{const img=figure.querySelector('img');img.loading='eager';try{await img.decode()}catch{}}));
   const incoming=fade(nextFigures,0,1);animations.forEach(a=>a.cancel());hidden.forEach(a=>a.cancel());animations=incoming;
   await Promise.all(incoming.map(a=>a.finished));
  }finally{animations.forEach(a=>a.cancel());shuffling=false;control.removeAttribute('aria-disabled');window.dispatchEvent(new Event('portfolio-composition-change'));}
 }
 const shuffleControl=document.querySelector('.footer-action');
 shuffleControl.addEventListener('click',event=>{if(document.querySelector('#werk').hidden)return;event.preventDefault();event.stopImmediatePropagation();void shuffle()});
 shuffleControl.addEventListener('keydown',event=>{if(event.key===' '&&!document.querySelector('#werk').hidden){event.preventDefault();shuffleControl.click()}});
 window.addEventListener('resize',()=>layout());
 document.fonts.ready.then(()=>layout(true));
 return{layout,select};
}};
