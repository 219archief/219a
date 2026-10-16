/* Read the shared project collection at render time; no parallel content store. */
(()=>{
 const page=document.querySelector('#archive'),body=page.querySelector('tbody'),table=page.querySelector('table');
 const collator=new Intl.Collator('nl',{numeric:true,sensitivity:'base'}),fine=matchMedia('(hover:hover) and (pointer:fine)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const preview=document.createElement('div'),mount=document.createElement('div'),image=document.createElement('img');preview.className='directory-preview';preview.setAttribute('aria-hidden','true');mount.className='directory-preview-photo';image.alt='';image.decoding='async';mount.append(image);preview.append(mount);document.body.append(preview);
 const lastPreviewPhotos=new Map();
 let sort='date',ascending=false,currentId,request=0,fadeTimer,leaveTimer,frame=0,target={x:0,y:0},position={x:0,y:0},lastTime=0,held=false;
 const folder='<svg class="directory-folder" viewBox="0 0 18 16" aria-hidden="true" focusable="false"><path d="M1 3h6l2 2h8v9H1zM1 6h16" fill="none" stroke="currentColor" stroke-width="1"/></svg>';
 function type(p){return p.workKind==='commissioned'?'in opdracht':p.workKind==='free'?'vrij werk':p.category||'—'}
 function fileCount(p){return PortfolioProjects.photosForProject(p,PortfolioLayout.photos).length}
 function value(p,key){return key==='name'?p.title:key==='date'?(p.date||p.year||''):key==='location'?(p.location||''):key==='files'?fileCount(p):type(p)}
 function render(){
  hide();const projects=PortfolioProjects.projects.filter(p=>p.hidden!==true&&p.status!=='draft');
  projects.sort((a,b)=>(ascending?1:-1)*collator.compare(String(value(a,sort)),String(value(b,sort)))||collator.compare(a.id,b.id));
  body.replaceChildren();
  for(const project of projects){
   const row=document.createElement('tr');row.className='directory-row';row.dataset.projectId=project.id;
   const appearance=PortfolioProjects.projectAppearance(project);
   if(appearance.enabled){
    row.classList.add('has-project-color');row.style.setProperty('--directory-project-color',appearance.color);
   }
   const name=document.createElement('td'),link=document.createElement('a');link.className='directory-project-link';link.href='#/project/'+project.id;link.innerHTML=folder;
   const label=document.createElement('span');label.textContent=project.title.trim().toLocaleLowerCase('nl').replace(/\s+/g,'_')+'/';link.append(label);name.append(link);row.append(name);
   for(const text of [project.date||project.year||'—',project.location||'—',fileCount(project),type(project)]){
    const cell=document.createElement('td');
    if(row.children.length===1){cell.className='directory-date';const date=document.createElement('span');date.className='directory-date-value';date.textContent=text;cell.append(date)}
    else if(row.children.length===4){
     cell.className='directory-type';const content=document.createElement('div'),label=document.createElement('span');content.className='directory-type-content';label.textContent=text;content.append(label);
     if(appearance.enabled){const colorLink=document.createElement('a'),marker=document.createElement('span');colorLink.className='directory-color-link';colorLink.href=link.href;colorLink.setAttribute('aria-label','Open project: '+project.title+' — projectkleur');marker.className='directory-color-marker';marker.setAttribute('aria-hidden','true');colorLink.append(marker);content.append(colorLink)}
     cell.append(content);
    }else cell.textContent=text;row.append(cell);
   }
   row.addEventListener('click',event=>{if(event.target.closest('a')||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;link.click()});
   row.addEventListener('pointerenter',event=>{if(fine.matches&&event.pointerType!=='touch'){move(event.clientX,event.clientY,true);show(project)}});
   row.addEventListener('pointermove',event=>{if(fine.matches&&event.pointerType!=='touch')move(event.clientX,event.clientY)});
   row.addEventListener('pointerleave',()=>{clearTimeout(leaveTimer);leaveTimer=setTimeout(hide,80)});
   link.addEventListener('focus',()=>{if(!fine.matches||!link.matches(':focus-visible'))return;const rect=row.getBoundingClientRect();move(rect.right-245,rect.bottom,true);show(project)});
   link.addEventListener('blur',hide);body.append(row);
  }
  for(const heading of table.querySelectorAll('th')){const active=heading.dataset.sort===sort;heading.setAttribute('aria-sort',active?(ascending?'ascending':'descending'):'none');heading.querySelector('.directory-sort-mark').textContent=active?(ascending?'↑':'↓'):''}
  page.querySelector('.directory-count-number').textContent=projects.length+' '+(projects.length===1?'map':'mappen');
 }
 table.querySelectorAll('th button').forEach(button=>button.addEventListener('click',()=>{const next=button.closest('th').dataset.sort;ascending=next===sort?!ascending:next!=='date';sort=next;render()}));
 function move(x,y,immediate=false){if(held)return;const width=preview.offsetWidth||230,height=200;target={x:Math.max(12,Math.min(x+24,innerWidth-width-20)),y:Math.max(15,Math.min(y+24,innerHeight-height-65))};if(immediate&&!preview.classList.contains('is-visible')){position={...target};paint()}if(!frame){lastTime=0;frame=requestAnimationFrame(glide)}}
 function paint(){preview.style.transform=`translate3d(${position.x}px,${position.y}px,0)`}
 function glide(time){frame=0;const dt=lastTime?Math.min(time-lastTime,40):16;lastTime=time;const factor=reduced.matches?1:1-Math.exp(-dt/70);position.x+=(target.x-position.x)*factor;position.y+=(target.y-position.y)*factor;paint();if(Math.hypot(target.x-position.x,target.y-position.y)>.2)frame=requestAnimationFrame(glide)}
 async function show(project){
  if(held)return;
  clearTimeout(leaveTimer);if(currentId===project.id)return;currentId=project.id;const version=++request;clearTimeout(fadeTimer);
  const photos=PortfolioProjects.photosForProject(project,PortfolioLayout.photos),choices=photos.length>1?photos.filter(p=>p.id!==lastPreviewPhotos.get(project.id)):photos;
  const photo=choices[Math.floor(Math.random()*choices.length)];if(!photo){hide();return}
  const preload=new Image();preload.src=`assets/responsive/${photo.id}-480.webp`;try{await preload.decode()}catch{if(version===request)hide();return}if(version!==request||page.hidden)return;
  const replace=()=>{if(version!==request)return;lastPreviewPhotos.set(project.id,photo.id);image.src=preload.src;image.srcset=`assets/responsive/${photo.id}-480.webp 480w, assets/responsive/${photo.id}-720.webp 720w`;image.sizes='230px';preview.dataset.projectId=project.id;const appearance=PortfolioProjects.projectAppearance(project);preview.style.setProperty('--directory-preview-color',appearance.enabled?appearance.color:'transparent');preview.classList.remove('is-changing');preview.classList.add('is-visible')};
  if(preview.classList.contains('is-visible')){preview.classList.add('is-changing');fadeTimer=setTimeout(replace,reduced.matches?0:140)}else replace();
 }
 function hide(){if(held)return;currentId=undefined;request++;clearTimeout(fadeTimer);clearTimeout(leaveTimer);preview.classList.remove('is-visible','is-changing');cancelAnimationFrame(frame);frame=0}
 window.addEventListener('hashchange',hide);window.addEventListener('scroll',hide,{passive:true});window.addEventListener('blur',hide);window.addEventListener('resize',hide);fine.addEventListener('change',hide);document.addEventListener('keydown',event=>{if(event.key==='Escape')hide()});
 function visiblePreview(project){return preview.classList.contains('is-visible')&&!preview.classList.contains('is-changing')&&preview.dataset.projectId===project.id&&getComputedStyle(preview).display!=='none'}
 function holdPreview(project){
  if(page.hidden||!visiblePreview(project))return false;
  held=true;request++;clearTimeout(fadeTimer);clearTimeout(leaveTimer);cancelAnimationFrame(frame);frame=0;preview.classList.add('is-held');return true;
 }
 function releasePreview(){held=false;preview.classList.remove('is-held');hide()}
 function transitionOrigin(project){
  if(page.hidden)return;
  const visible=visiblePreview(project);
  const source=visible?image:[...body.children].find(row=>row.dataset.projectId===project.id);
  const rect=source?.getBoundingClientRect();if(rect?.width&&rect?.height)return{x:rect.left+rect.width/2,y:rect.top+rect.height/2};
 }
 window.PortfolioDirectory={render,hide,transitionOrigin,holdPreview,releasePreview};
})();
