/* Optionele projectcontext: een compacte intro en gewone toegankelijke details. */
(function(){
 const host=document.querySelector('#project-context');
 function render(project){
  host.replaceChildren();host.hidden=true;
  const intro=typeof project.intro==='string'?project.intro.trim():'';
  const description=typeof project.description==='string'?project.description.trim():'';
  if(intro){const p=document.createElement('p');p.className='project-intro';p.textContent=intro;host.append(p)}
  if(description){const details=document.createElement('details');details.className='project-description';const summary=document.createElement('summary');summary.textContent='over dit project';const content=document.createElement('div');content.className='project-description-content';for(const paragraph of description.split(/\n\s*\n/).filter(Boolean)){const p=document.createElement('p');p.textContent=paragraph;content.append(p)}details.append(summary,content);host.append(details)}
  host.hidden=!host.childElementCount;
 }
 window.PortfolioProjectContext={render};
})();
