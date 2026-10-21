/* Inline thumbnails belong to the project, alongside its horizontal photo sequence. */
window.PortfolioProjectThumbnails=(()=>{
 const page=document.querySelector('#project'),gallery=page.querySelector('#project-gallery'),strip=page.querySelector('.project-strip');
 const count=document.querySelector('.project-sequence-count'),tools=document.createElement('div');
 tools.className='project-footer-tools';count.before(tools);
 const toggle=document.createElement('button');toggle.type='button';toggle.className='project-overview-toggle';
 toggle.innerHTML='<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M2 2h4v4H2zM10 2h4v4h-4zM2 10h4v4H2zM10 10h4v4h-4z" fill="none" stroke="currentColor"/></svg><span>thumbnails</span>';
 toggle.setAttribute('aria-label','Toon thumbnails van dit project');toggle.setAttribute('aria-controls','project-thumbnails');toggle.setAttribute('aria-expanded','false');tools.append(toggle,count);
 const panel=document.createElement('section');panel.id='project-thumbnails';panel.className='project-thumbnails';panel.hidden=true;panel.setAttribute('aria-label','Alle foto’s van dit project');
 panel.innerHTML='<div class="project-thumbnails-heading"><span class="project-thumbnails-count"></span><button type="button" class="project-thumbnails-close" aria-label="Verberg thumbnails">verberg ×</button></div><ol class="project-thumbnails-list"></ol>';
 page.append(panel);
 const list=panel.querySelector('ol'),close=panel.querySelector('button');
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 let selected=0;
 function figures(){return [...gallery.querySelectorAll('figure')]}
 function nearest(){let index=0,distance=Infinity;const centre=strip.getBoundingClientRect().left+strip.clientWidth/2;figures().forEach((figure,i)=>{const r=figure.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-centre);if(d<distance){distance=d;index=i}});return index}
 function goTo(index,smooth=true){const figure=figures()[index];if(!figure)return;const rect=figure.getBoundingClientRect();strip.scrollBy({left:rect.left+rect.width/2-(strip.getBoundingClientRect().left+strip.clientWidth/2),behavior:smooth&&!reduced()?'smooth':'instant'})}
 function sync(){if(panel.hidden)return;selected=nearest();[...list.querySelectorAll('button')].forEach((button,index)=>{if(index===selected)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current')})}
 function measure(){if(panel.hidden)return;const footer=document.querySelector('.colophon').getBoundingClientRect();panel.style.bottom=(innerHeight-footer.top+8)+'px';document.body.style.setProperty('--project-thumbnail-space',(panel.offsetHeight+16)+'px');window.dispatchEvent(new Event('portfolio-thumbnails-change'))}
 function show(visible,restore=true){
  const wasAtStart=strip.scrollLeft<1,anchor=nearest();selected=anchor;panel.hidden=!visible;document.body.classList.toggle('project-thumbnails-open',visible);
  toggle.setAttribute('aria-expanded',String(visible));toggle.setAttribute('aria-label',(visible?'Verberg':'Toon')+' thumbnails van dit project');
  if(visible)measure();else{document.body.style.removeProperty('--project-thumbnail-space');window.dispatchEvent(new Event('portfolio-thumbnails-change'))}
  requestAnimationFrame(()=>{if(restore&&!wasAtStart)goTo(anchor,false);sync()});
 }
 function mount(){
  show(false,false);list.replaceChildren();
  const photos=figures();panel.querySelector('.project-thumbnails-count').textContent=photos.length+' beelden / het hele project';
  photos.forEach((figure,index)=>{
   const item=document.createElement('li'),button=document.createElement('button'),image=figure.querySelector('img').cloneNode(),number=document.createElement('span');
   button.type='button';button.className='project-thumbnail';button.setAttribute('aria-label','Ga naar foto '+(index+1)+': '+figure.querySelector('.caption-place').textContent);
   image.removeAttribute('style');image.alt='';image.sizes='120px';image.loading='lazy';image.fetchPriority='auto';number.textContent=String(index+1).padStart(2,'0');button.append(image,number);item.append(button);list.append(item);
   button.addEventListener('click',()=>goTo(index));
  });
 }
 toggle.addEventListener('click',()=>show(panel.hidden));close.addEventListener('click',()=>{show(false);toggle.focus({preventScroll:true})});
 panel.addEventListener('wheel',event=>{if(event.ctrlKey)return;event.stopPropagation();if(Math.abs(event.deltaY)>Math.abs(event.deltaX)&&list.scrollWidth>list.clientWidth){event.preventDefault();list.scrollLeft+=event.deltaY*(event.deltaMode===1?16:1)}},{passive:false});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden&&!document.querySelector('dialog[open]')){show(false);toggle.focus({preventScroll:true})}});
 window.addEventListener('portfolio-project-scroll',sync);window.addEventListener('resize',()=>{const anchor=selected,atStart=strip.scrollLeft<1;measure();requestAnimationFrame(()=>{if(!panel.hidden&&!atStart)goTo(anchor,false)})});
 window.addEventListener('hashchange',()=>show(false,false));
 return{mount};
})();
