/* A finite, visitor-paced photo sequence. Native horizontal scrolling handles touch. */
window.PortfolioProjectHorizontal=(()=>{
 const page=document.querySelector('#project'),heading=page.querySelector('.project-heading'),gallery=page.querySelector('#project-gallery');
 const strip=document.createElement('div');strip.className='project-strip';strip.tabIndex=0;strip.setAttribute('role','region');strip.setAttribute('aria-label','Fotoreeks. Scroll of veeg horizontaal; gebruik de pijltjestoetsen om te bladeren.');
 const ending=document.createElement('section');ending.className='project-ending';
 const endTitle=document.createElement('h2');endTitle.textContent='einde van de serie';ending.append(endTitle,page.querySelector('#project-end'),page.querySelector('#project-navigation'));
 const back=document.createElement('a');back.href='#archief';back.textContent='terug naar het archief ↗';ending.append(back);
 const hint=document.createElement('p');hint.className='project-scroll-hint';hint.textContent='scroll om te kijken →';heading.append(hint);const textPanel=document.createElement('div');textPanel.className='project-heading-content';for(const child of [...heading.children])if(!child.classList.contains('project-breadcrumb'))textPanel.append(child);heading.append(textPanel);const endingSlot=document.createElement('div');endingSlot.className='project-ending-slot';endingSlot.append(ending);strip.append(heading,gallery,endingSlot);page.append(strip);
 const status=document.createElement('span');status.className='project-sequence-count';status.setAttribute('aria-label','Positie in de fotoreeks');document.querySelector('.colophon').append(status);
 const progress=document.createElement('div');progress.className='project-sequence-progress';progress.setAttribute('aria-hidden','true');page.append(progress);
 const title=document.querySelector('#project-title'),titleLine=document.createElement('div');titleLine.className='project-title-line';title.before(titleLine);titleLine.append(title);
 const fullscreen=document.createElement('button');fullscreen.type='button';fullscreen.className='project-fullscreen';fullscreen.setAttribute('aria-label','Bekijk project op volledig scherm');fullscreen.title='Volledig scherm';
 fullscreen.innerHTML='<svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path d="M7 3H3v4M13 3h4v4M3 13v4h4M17 13v4h-4" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';titleLine.append(fullscreen);
 fullscreen.addEventListener('click',()=>gallery.querySelector('.project-row button')?.click());
 let frame=0,headingShift=0,endingShift=0,footerControl,footerTrack,footerThumb;
 const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
 function update(){frame=0;if(page.hidden)return;const pictures=[...gallery.querySelectorAll('figure')],centre=strip.getBoundingClientRect().left+strip.clientWidth/2;let nearest=0,distance=Infinity;
  const logo=document.querySelector('.identity');
  page.style.setProperty('--project-menu-top',(parseFloat(getComputedStyle(logo).top)+logo.offsetHeight+12)+'px');
  document.body.style.setProperty('--project-menu-top',page.style.getPropertyValue('--project-menu-top'));
  const headingTop=Math.max(0,parseFloat(getComputedStyle(logo).top)+logo.offsetHeight+(innerWidth<700?86:24)-parseFloat(getComputedStyle(strip).paddingTop));
  const top=(innerHeight<650&&innerWidth>=700)?0:headingTop;
  heading.style.paddingTop='0px';heading.style.marginTop=top+'px';heading.style.maxHeight='calc(100% - '+top+'px)';
  heading.style.paddingLeft=((innerHeight<650&&innerWidth>=700)?logo.offsetWidth+32:0)+'px';
  // Hold the intro in place only until the opening photo needs its space.
  const opening=pictures[0];
  const photoGap=parseFloat(getComputedStyle(gallery).columnGap)||24;
  let textRight=heading.getBoundingClientRect().left;
  for(const element of heading.querySelectorAll('.project-breadcrumb,h1,.project-year,.project-intro,.project-description summary,.project-description[open] .project-description-content p,.project-scroll-hint')){
   if(!element.getClientRects().length)continue;
   const range=document.createRange();range.selectNodeContents(element);
   for(const rect of range.getClientRects())textRight=Math.max(textRight,rect.right);
  }
  textRight=Math.max(textRight,fullscreen.getBoundingClientRect().right);
  const freeSpace=opening?opening.getBoundingClientRect().left-textRight+headingShift-photoGap/2:0;
  headingShift=Math.min(strip.scrollLeft,Math.max(0,freeSpace));
  heading.style.transform=`translateX(${headingShift}px)`;
  pictures.forEach((photo,index)=>{const r=photo.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-centre);if(d<distance){distance=d;nearest=index}});
  const count=String(nearest+1).padStart(2,'0')+' / '+String(pictures.length).padStart(2,'0');if(status.textContent!==count)status.textContent=count;
  const range=strip.scrollWidth-strip.clientWidth;
  // Mirror the intro: the ending settles in place while the last photo catches up.
  const last=pictures[pictures.length-1];
  const endingSpace=last?ending.getBoundingClientRect().left-last.getBoundingClientRect().right-endingShift-photoGap/2:0;
  endingShift=-Math.min(Math.max(0,range-strip.scrollLeft),Math.max(0,endingSpace));
  ending.style.transform=`translateX(${endingShift}px)`;
  progress.style.setProperty('--progress',range?strip.scrollLeft/range:0);
  if(footerThumb){footerThumb.style.transform=`scaleX(${range?Math.max(0,Math.min(1,strip.scrollLeft/range)):0})`;}
  window.dispatchEvent(new Event('portfolio-composition-change'));
  window.dispatchEvent(new Event('portfolio-project-scroll'));
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 strip.addEventListener('scroll',schedule,{passive:true});textPanel.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
 window.addEventListener('wheel',event=>{
  if(page.hidden||document.querySelector('dialog[open]')||event.ctrlKey||event.defaultPrevented)return;
  const horizontal=Math.abs(event.deltaX)>Math.abs(event.deltaY);
  // Long, expanded descriptions retain their own vertical reading scroll.
  if(!horizontal&&event.target.closest('.project-description-content')&&textPanel.scrollHeight>textPanel.clientHeight+1)return;
  event.preventDefault();const unit=event.deltaMode===1?16:event.deltaMode===2?strip.clientWidth:1;
  strip.scrollLeft+=(horizontal?event.deltaX:event.deltaY)*unit;
 },{passive:false});
 strip.addEventListener('keydown',event=>{if(event.target.closest('a,summary,input,textarea'))return;const delta={ArrowRight:strip.clientWidth*.65,ArrowLeft:-strip.clientWidth*.65,PageDown:strip.clientWidth*.85,PageUp:-strip.clientWidth*.85}[event.key];if(delta){event.preventDefault();strip.scrollBy({left:delta,behavior:reduced()?'instant':'smooth'})}else if(['Home','End'].includes(event.key)){event.preventDefault();strip.scrollTo({left:event.key==='Home'?0:strip.scrollWidth,behavior:reduced()?'instant':'smooth'})}});
 strip.addEventListener('focusin',event=>{const figure=event.target.closest('figure');if(figure)figure.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduced()?'instant':'smooth'})});
 document.querySelector('.footer-action').addEventListener('click',()=>{if(!page.hidden)strip.scrollTo({left:0,behavior:reduced()?'instant':'smooth'})});
 function prepareFooter(){
  if(footerControl)return;
  const original=document.querySelector('.footer-scroll-slot .exhibition-scroll');if(!original)return;
  footerControl=original.cloneNode(true);footerControl.classList.add('project-scroll-control');
  footerTrack=footerControl.querySelector('button');footerThumb=footerControl.querySelector('.exhibition-scroll-thumb');
  footerTrack.setAttribute('aria-label','Bladeren door de projectfoto’s. Sleep of gebruik de pijltjestoetsen.');footerTrack.classList.remove('is-dragging');
  document.querySelector('.footer-scroll-slot').append(footerControl);
  let drag=null;
  footerTrack.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={id:event.pointerId,start:event.clientX,last:event.clientX,moved:false};footerTrack.setPointerCapture(event.pointerId);footerTrack.classList.add('is-dragging')});
  footerTrack.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;if(!drag.moved&&Math.abs(event.clientX-drag.start)<3)return;drag.moved=true;strip.scrollLeft+=(event.clientX-drag.last)/Math.max(1,footerTrack.clientWidth)*(strip.scrollWidth-strip.clientWidth);drag.last=event.clientX});
  function release(event){if(!drag||drag.id!==event.pointerId)return;const click=!drag.moved&&event.type==='pointerup';drag=null;footerTrack.classList.remove('is-dragging');if(footerTrack.hasPointerCapture(event.pointerId))footerTrack.releasePointerCapture(event.pointerId);if(click){const r=footerTrack.getBoundingClientRect();strip.scrollBy({left:(event.clientX<r.left+r.width/2?-1:1)*strip.clientWidth*.5,behavior:reduced()?'instant':'smooth'})}}
  footerTrack.addEventListener('pointerup',release);footerTrack.addEventListener('pointercancel',release);
  footerTrack.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();if(event.key==='Home'||event.key==='End')strip.scrollTo({left:event.key==='Home'?0:strip.scrollWidth,behavior:reduced()?'instant':'smooth'});else strip.scrollBy({left:(event.key==='ArrowLeft'?-1:1)*strip.clientWidth*.5,behavior:reduced()?'instant':'smooth'})}});
  footerTrack.addEventListener('click',event=>{if(event.detail===0)strip.scrollBy({left:strip.clientWidth*.5,behavior:reduced()?'instant':'smooth'})});
 }
 return{mount(){prepareFooter();page.querySelector('#project-end').textContent=gallery.querySelectorAll('figure').length+' beelden';textPanel.scrollTop=0;for(const figure of gallery.querySelectorAll('figure')){const image=figure.querySelector('img');figure.style.setProperty('--photo-ratio',image.width/image.height);image.sizes='(max-width: 699px) 88vw, 80vw'}strip.scrollLeft=0;schedule()}};
})();
