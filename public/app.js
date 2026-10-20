const {photos}=PortfolioLayout;
const {projectForPhoto,projectFromHash,rowsFor}=PortfolioProjects;
const canvas=document.querySelector('.canvas'),dialog=document.querySelector('dialog'),fullImage=document.querySelector('#full-image'),projectPage=document.querySelector('#project'),homePage=document.querySelector('#werk'),footer=document.querySelector('footer'),infoPage=document.querySelector('#info');

let projectReturnHash='#werk';
try{const saved=sessionStorage.getItem('219:project-return');if(['#werk','#archief','#info','#contact'].includes(saved))projectReturnHash=saved}catch{}
const archivePage=document.querySelector('#archive');
let active=0,lastFocus,homeFocusPhotoId,currentProject,viewerPhotos=photos,homeScroll=window.PortfolioColorTransition?.getHomeScroll()||0,previousHash=location.hash;
document.querySelector('#year').textContent=new Date().getFullYear();document.querySelector('.archive-end>span:last-child').textContent=String(photos.length).padStart(3,'0')+' observaties';
const url=(p,w)=>`assets/responsive/${p.id}-${w}.webp`;
function imageFor(p,eager=false){const img=document.createElement('img');Object.assign(img,{alt:p.alt,width:Math.round(p.ratio*1000),height:1000,decoding:'async',loading:eager?'eager':'lazy',fetchPriority:eager?'high':'auto',src:url(p,960)});img.srcset=[320,480,720,960,1440,2200].map(w=>`${url(p,w)} ${w}w`).join(', ');return img}
function captionFor(p,i,archive=false){const caption=document.createElement('figcaption'),label=document.createElement('span'),number=document.createElement('span');label.textContent=p.place;number.className='number';number.textContent=projectForPhoto(p.id).year;label.className='caption-place';caption.append(label,number);if(archive){const project=projectForPhoto(p.id),series=document.createElement('span');series.className='series-label';series.textContent='uit '+project.title.toLowerCase();series.style.setProperty('--series-color',PortfolioProjects.projectAppearance(project).enabled?project.backgroundColor:'#161616');caption.append(series)}return caption}
const firstHomePhotoId=PortfolioProjects.sortedPhotos(photos).find(photo=>projectForPhoto(photo.id).homeEnabled!==false)?.id;
const figures=photos.map((p,i)=>{const figure=document.createElement('figure');figure.className='photo';figure.dataset.photoId=p.id;figure.style.setProperty('--ratio',p.ratio);figure.style.setProperty('--delay',Math.min(i*50,350)+'ms');const link=document.createElement('a');const project=projectForPhoto(p.id);link.href=`#/project/${project.id}`;link.setAttribute('aria-label',`Open project: ${project.title} — ${p.place}`);const appearance=PortfolioProjects.projectAppearance(project,p.id);if(appearance.coverEnabled){figure.classList.add('has-project-accent');figure.style.setProperty('--project-accent',appearance.color)}link.append(imageFor(p,p.id===firstHomePhotoId));figure.dataset.projectId=project.id;figure.append(link,captionFor(p,i,true));canvas.append(figure);return figure});
const livingHome=PortfolioLiving.create({canvas,figures,photos});
function layout(){livingHome.layout()}

let frame;new ResizeObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(layout)}).observe(canvas);
function showPhoto(i){active=(i+viewerPhotos.length)%viewerPhotos.length;const p=viewerPhotos[active];void PortfolioViewer.show({photo:p,index:active,total:viewerPhotos.length,year:projectForPhoto(p.id).year,src:url(p,2200)})}
function openPhoto(i){lastFocus=document.activeElement;showPhoto(i);dialog.showModal();document.body.style.overflow='hidden';document.querySelector('#close').focus()}
function renderProject(project){document.querySelector("#project-path-name").textContent=project.title.toLowerCase();PortfolioProjectContext.render(project);document.querySelector('#project-title').textContent=project.title.toLowerCase();document.querySelector("#project-year").textContent=project.year+' / '+project.photoIds.length+' beelden';document.querySelector('#project-end').textContent=project.photoIds.length+' beelden / einde van de serie';const gallery=document.querySelector('#project-gallery');gallery.replaceChildren();viewerPhotos=PortfolioProjects.photosForProject(project,photos);let index=0,rowIndex=0;for(const row of [viewerPhotos.slice(0,1),...rowsFor(viewerPhotos.slice(1))].filter(row=>row.length)){const container=document.createElement('div');container.className='project-row'+(rowIndex++===0?' project-opening-row':'');for(const p of row){const photoIndex=index++,figure=document.createElement('figure');figure.className=p.ratio>=1?'landscape':'portrait';figure.dataset.photoId=p.id;const button=document.createElement('button');button.type='button';button.setAttribute('aria-label',`Vergroot foto: ${p.place}`);const img=imageFor(p,photoIndex===0);img.sizes=p.ratio>=1?'(min-width: 1440px) 1325px, 92vw':'(max-width: 599px) 88vw, 44vw';button.append(img);button.addEventListener('click',()=>openPhoto(photoIndex));figure.append(button,captionFor(p,photoIndex));container.append(figure)}gallery.append(container)}const navigationProjects=PortfolioProjects.sortedProjects('newest','all');const position=navigationProjects.indexOf(project),navigation=document.querySelector('#project-navigation');navigation.replaceChildren();navigation.hidden=navigationProjects.length<2;if(navigation.hidden)return;for(const [offset,prefix] of [[-1,'← '],[1,'']]){const other=navigationProjects[(position+offset+navigationProjects.length)%navigationProjects.length],link=document.createElement('a');link.href=`#/project/${other.id}`;link.textContent=prefix+other.title.toLowerCase()+(offset===1?' →':'');navigation.append(link)}}
function route(initial=false){
 const project=projectFromHash(location.hash),isInfo=['#info','#contact'].includes(location.hash),isArchive=location.hash==='#archief',wasInfo=document.body.classList.contains('info-open'),wasArchive=document.body.classList.contains('archive-open');
 if(window.PortfolioColorTransition?.beforeRoute(project,initial,()=>route()))return;
 const wasProject=!!currentProject;
 if(project&&!wasProject&&!initial){projectReturnHash=wasArchive?'#archief':wasInfo?'#info':'#werk';try{sessionStorage.setItem('219:project-return',projectReturnHash)}catch{}}
 currentProject=project;PortfolioProjectReveal.begin(project);if(dialog.open)dialog.close();PortfolioTheme.apply(project);
 document.body.classList.toggle('project-open',!!project);document.body.classList.toggle('info-open',isInfo);document.body.classList.toggle('archive-open',isArchive);document.body.classList.toggle('living-home',!project&&!isInfo&&!isArchive);
 homePage.hidden=!!project||isInfo||isArchive;projectPage.hidden=!project;infoPage.hidden=!isInfo;archivePage.hidden=!isArchive;footer.hidden=!!project||isInfo||isArchive;
 if(project){renderProject(project);void PortfolioProjectReveal.show();document.title=project.title.toLowerCase()+' — 219';window.scrollTo(0,0);if(!initial)projectPage.focus({preventScroll:true})}
 else if(isArchive){viewerPhotos=photos;PortfolioDirectory.render();document.title='archief — 219';window.scrollTo(0,0);if(!initial)archivePage.focus({preventScroll:true})}
 else{viewerPhotos=photos;document.title='219 — fotografisch archief';layout();
  if(isInfo){document.title='info & contact — 219';window.scrollTo(0,0);if(!initial)infoPage.focus({preventScroll:true});if(location.hash==='#contact')document.querySelector('#contact-form').scrollIntoView({block:'center'})}
  else if(wasProject){window.scrollTo(0,homeScroll);if(!initial){const homeFigures=[...canvas.querySelectorAll('.photo')];const target=homeFigures.find(f=>f.dataset.photoId===homeFocusPhotoId&&f.getBoundingClientRect().right>0&&f.getBoundingClientRect().left<innerWidth)||homeFigures.find(f=>!f.hidden&&f.querySelector('a')?.hash===previousHash);target?.querySelector('a').focus({preventScroll:true})}}
  else if(wasInfo||wasArchive){window.scrollTo(0,0)}
 }
 const isHome=!project&&!isInfo&&!isArchive,action=document.querySelector('.footer-action'),label=action.querySelector('.footer-action-label');
 const actionText=isHome?'play':'naar boven';
 (label.querySelector('.honk-original')||label).textContent=actionText;
 label.dataset.text=actionText;
 if(isHome){action.setAttribute('role','button');action.setAttribute('aria-label','Start de automatische beweging')}else{action.removeAttribute('role');action.removeAttribute('aria-label')}
 livingHome.syncMotion();
 const footerPageLabel=(project?project.title.toLowerCase():isInfo?'info':isArchive?'archief':'index')+' / 219';
 const footerPage=document.querySelector('#footer-page');if(footerPage.textContent!==footerPageLabel)footerPage.textContent=footerPageLabel;
 document.querySelector('.colophon a').href=project?location.hash:isInfo?'#info':isArchive?'#archief':'#werk';
 for(const link of document.querySelectorAll('header nav a')){const selected=link.hash===(project?projectReturnHash:isInfo?'#info':isArchive?'#archief':'#werk');if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current')}
 previousHash=location.hash;window.PortfolioColorTransition?.afterRoute(project);
}
// Gewone links blijven bruikbaar met toetsenbord, browser-terug en in een nieuw tabblad.
document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;if((currentProject||document.body.classList.contains('info-open')||document.body.classList.contains('archive-open'))&&link.matches('.colophon a')){event.preventDefault();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return}if(!currentProject&&link.hash.startsWith('#/project/')){homeScroll=window.scrollY;homeFocusPhotoId=link.closest('.photo')?.dataset.photoId;}if(link.hash===location.hash&&['#werk','#info','#contact','#archief'].includes(link.hash)){event.preventDefault();route();if(link.hash==='#werk')window.scrollTo(0,0)}});
window.addEventListener('hashchange',()=>route());
fullImage.addEventListener('error',()=>{fullImage.hidden=true;document.querySelector('#image-error').hidden=false});document.querySelector('#close').addEventListener('click',()=>dialog.close());document.querySelector('#prev').addEventListener('click',()=>showPhoto(active-1));document.querySelector('#next').addEventListener('click',()=>showPhoto(active+1));dialog.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus()});dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showPhoto(active-1)}if(e.key==='ArrowRight'){e.preventDefault();showPhoto(active+1)}});
function reorderFigures(){livingHome.select();}
// Measure the restored archive synchronously; no temporary layout is painted.
window.PortfolioArchiveReturn={prepare(photo){
 const y=scrollY,wasHomeHidden=homePage.hidden,wasProjectHidden=projectPage.hidden,wasFooterHidden=footer.hidden,wasProject=document.body.classList.contains('project-open');
 document.body.classList.remove('project-open');document.body.classList.add('living-home');homePage.hidden=false;projectPage.hidden=true;footer.hidden=false;layout();
 const rect=photo?.getBoundingClientRect();
 let targetScroll=Math.max(0,Math.min(homeScroll,document.documentElement.scrollHeight-innerHeight));
 if(rect){const center=rect.top+scrollY+rect.height/2;if(center-targetScroll<40||center-targetScroll>innerHeight-70)targetScroll=Math.max(0,Math.min(center-innerHeight/2,document.documentElement.scrollHeight-innerHeight));}
 const point=rect?{x:rect.left+rect.width/2,y:rect.top+scrollY+rect.height/2-targetScroll}:{x:innerWidth/2,y:innerHeight/2};
 homePage.hidden=wasHomeHidden;projectPage.hidden=wasProjectHidden;footer.hidden=wasFooterHidden;document.body.classList.toggle('project-open',wasProject);document.body.classList.toggle('living-home',!wasProject&&!document.body.classList.contains('info-open'));window.scrollTo(0,y);homeScroll=targetScroll;
 return point;
}};

reorderFigures();route(true);
