/* Restore the seeded, scrollable composition used before the rotating homepage. */
window.PortfolioLiving={create({canvas,figures,photos}){
 let orderedPhotos=PortfolioProjects.sortedPhotos(photos,'newest','all').filter(photo=>PortfolioProjects.projectForPhoto(photo.id).homeEnabled!==false),lastWidth=0;
 function layout(force=false){
  if(document.querySelector('#werk').hidden)return;
  const width=canvas.clientWidth;if(!width||!force&&width===lastWidth)return;lastWidth=width;
  const intro=document.querySelector('.intro').getBoundingClientRect(),base=canvas.getBoundingClientRect();
  const result=PortfolioLayout.compose(width,{x:intro.left-base.left,y:intro.top-base.top,w:intro.width,h:intro.height},orderedPhotos);
  result.boxes.forEach((box,index)=>{const figure=figures.find(f=>f.dataset.photoId===orderedPhotos[index].id);figure.hidden=false;Object.assign(figure.style,{left:box.x+'px',top:box.y+'px',width:box.w+'px'});figure.querySelector('img').sizes=box.w+'px';figure.style.setProperty('--accent-width',box.w*.015+'px')});
  canvas.style.height=result.height+'px';window.dispatchEvent(new Event('portfolio-composition-change'));
 }
 function select(){orderedPhotos=PortfolioProjects.sortedPhotos(photos,'newest','all').filter(photo=>PortfolioProjects.projectForPhoto(photo.id).homeEnabled!==false);figures.forEach(figure=>{figure.hidden=!orderedPhotos.some(photo=>photo.id===figure.dataset.photoId)});document.querySelector('.archive-end>span:last-child').textContent=String(orderedPhotos.length).padStart(3,'0')+' observaties';lastWidth=0;layout(true)}
 document.fonts.ready.then(()=>layout(true));
 return{layout,select};
}};
