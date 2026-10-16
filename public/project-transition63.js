/* Een gedeelde overgang voor elke geconfigureerde projectcover. */
(function(){
  let active;
  const root=document.documentElement,body=document.body;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  function cleanup(state){
    state.animation?.cancel();state.overlay.remove();window.dispatchEvent(new Event("project-background-ready"));
    if(active===state){active=undefined;root.classList.remove('project-color-handoff');body.classList.remove('project-content-entering');}
  }
  function validRect(rect){return rect.width>0&&rect.height>0&&[rect.top,rect.right,rect.bottom,rect.left].every(Number.isFinite)}
  async function open(link,img,appearance){
    const rect=img.getBoundingClientRect();
    if(!validRect(rect))return false;
    // Een rustige dissolve: de nieuwe kleur neemt het overzicht in één seconde over.
    const overlay=document.createElement('div');
    overlay.className='project-color-overlay';overlay.setAttribute('aria-hidden','true');
    Object.assign(overlay.style,{backgroundColor:appearance.color,opacity:'0'});
    body.append(overlay);
    const state={overlay,startHash:location.hash,targetHash:link.hash,handoff:false,animation:undefined};active=state;
    // Geometrie is al vastgelegd; voorkom dat de bestaande hoverzoom doorloopt.
    window.dispatchEvent(new Event('blur'));
    try{
      state.animation=overlay.animate([{opacity:0},{opacity:1}],{duration:reducedMotion.matches?200:1000,easing:'ease-in-out',fill:'forwards'});
      await state.animation.finished;
      if(active!==state||location.hash!==state.startHash)return true;
      state.handoff=true;root.classList.add('project-color-handoff');body.classList.add('project-content-entering');
      // De normale router blijft verantwoordelijk voor inhoud, focus en geschiedenis.
      const routed=new Promise(resolve=>window.addEventListener('hashchange',()=>requestAnimationFrame(resolve),{once:true}));
      location.hash=state.targetHash;
            await routed;
      // Rond de echte achtergrond af terwijl het scherm nog volledig bedekt is.
      // Zo kan het verdwijnen van de overlay geen tweede kleurtransitie onthullen.
      getComputedStyle(root).backgroundColor;
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      if(active!==state||location.hash!==state.targetHash)return true;
      body.classList.remove('project-content-entering');
    }catch{
      // Een mislukte of niet beschikbare animatie blokkeert de projectlink niet.
      if(active===state&&location.hash===state.startHash)location.hash=state.targetHash;
    }finally{cleanup(state)}
    return true;
  }
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('.photo>a');
    if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('download'))return;
    if(active){event.preventDefault();return;}
    const project=PortfolioProjects.projectFromHash(link.hash),photoId=link.closest('.photo')?.dataset.photoId;
    const appearance=PortfolioProjects.projectAppearance(project,photoId),img=link.querySelector('img');
    if(PortfolioProjects.projectFromHash(location.hash)||!appearance.enabled||!appearance.transitionEnabled||!img||typeof img.animate!=='function'||!validRect(img.getBoundingClientRect()))return;
    event.preventDefault();void open(link,img,appearance);
  },true);
  window.addEventListener('hashchange',()=>{if(active&&(!active.handoff||location.hash!==active.targetHash))cleanup(active)});
  window.addEventListener('pagehide',()=>{if(active)cleanup(active)});
})();







