/* Shared, decorative 16px pixel symbols. Text remains the accessible label. */
(()=>{
 const paths={left:'M6 3h2v2H6v2h8v2H6v2h2v2H6v-2H4V9H2V7h2V5h2z',right:'M8 3h2v2h2v2h2v2h-2v2h-2v2H8v-2h2V9H2V7h8V5H8z',diagonal:'M5 2h9v9h-2V6l-8 8-2-2 8-8H5z',close:'M3 2l5 5 5-5 1 1-5 5 5 5-1 1-5-5-5 5-1-1 5-5-5-5z'};
 function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),p=document.createElementNS(svg.namespaceURI,'path');svg.setAttribute('viewBox','0 0 16 16');svg.setAttribute('width','16');svg.setAttribute('height','16');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.classList.add('pixel-symbol');p.setAttribute('d',paths[name]||paths.right);p.setAttribute('fill','currentColor');svg.append(p);return svg}
 function split(text){text=text.trim();if(text.startsWith('←'))return {text:text.slice(1).trim(),name:'left',leading:true};const last=text.slice(-1),names={'→':'right','↗':'diagonal','×':'close'};return names[last]?{text:text.slice(0,-1).trim(),name:names[last],leading:false}:{text}}
 function decorate(control){const part=split(control.textContent);if(!part.name)return;const label=document.createElement('span');label.className='control-copy';label.textContent=part.text;control.replaceChildren();control.classList.add('pixel-control');if(part.leading)control.append(icon(part.name));control.append(label);if(!part.leading)control.append(icon(part.name))}
 document.querySelectorAll('#prev,#next,#close,#contact-form button[type=submit],.info-archive-link').forEach(decorate);
 let markTimer,marked;
 window.addEventListener('archive-return-complete',event=>{
  clearTimeout(markTimer);marked?.classList.remove('has-return-mark');
  marked=[...document.querySelectorAll('.photo')].find(el=>el.dataset.photoId===event.detail?.photoId)?.querySelector('a');
  if(!marked||document.querySelector('#werk').hidden)return;
  marked.classList.add('has-return-mark');markTimer=setTimeout(()=>{marked?.classList.remove('has-return-mark');marked=undefined},700);
 });
 window.addEventListener('hashchange',()=>{clearTimeout(markTimer);marked?.classList.remove('has-return-mark');marked=undefined});
 // A caption-only relationship cue; photography never dims or gains a frame.
 function related(link){const figure=link?.closest('.photo'),id=figure?.dataset.projectId;document.querySelectorAll('.photo').forEach(el=>el.classList.toggle('is-series-related',!!id&&el!==figure&&el.dataset.projectId===id))}
 document.addEventListener('pointerover',e=>{if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;const link=e.target.closest?.('.photo>a');if(link)related(link)});
 document.addEventListener('pointerout',e=>{const link=e.target.closest?.('.photo>a');if(link&&!link.contains(e.relatedTarget))related(document.activeElement?.closest('.photo>a'))});
 document.addEventListener('focusin',e=>{const link=e.target.closest?.('.photo>a');if(link)related(link)});
 document.addEventListener('focusout',e=>{if(e.target.closest?.('.photo>a'))related(e.relatedTarget?.closest?.('.photo>a'))});
 window.addEventListener('blur',()=>related());window.addEventListener('hashchange',()=>related());
 const stage=document.querySelector('.viewer-image'),image=document.querySelector('#full-image'),dialog=document.querySelector('dialog');
 const left=document.createElement('span'),right=document.createElement('span');
 for(const [el,name] of [[left,'left'],[right,'right']]){el.className='viewer-direction viewer-direction--'+name;el.setAttribute('aria-hidden','true');el.append(icon(name));stage.append(el)}
 let pointer,raf;
 function direction(){raf=0;if(!pointer||image.hidden||!stage.classList.contains('has-viewer-photo')){delete stage.dataset.direction;return}const rect=image.getBoundingClientRect(),bounds=stage.getBoundingClientRect();const inside=pointer.x>=rect.left&&pointer.x<=rect.right&&pointer.y>=rect.top&&pointer.y<=rect.bottom;if(!inside){delete stage.dataset.direction;return}left.hidden=rect.left-bounds.left<22;right.hidden=bounds.right-rect.right<22;stage.style.setProperty('--direction-y',(rect.top+rect.height/2-bounds.top)+'px');stage.dataset.direction=pointer.x<rect.left+rect.width/2?'left':'right'}
 stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;pointer={x:e.clientX,y:e.clientY};if(!raf)raf=requestAnimationFrame(direction)});
 stage.addEventListener('pointerleave',()=>{pointer=undefined;delete stage.dataset.direction});
 dialog.addEventListener('close',()=>{pointer=undefined;delete stage.dataset.direction});
 window.addEventListener('resize',direction);
 window.PortfolioDetails={icon,split,decorate};
})();