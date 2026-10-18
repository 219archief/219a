/* Paint a persistent logo canvas: no changing mask URLs or backdrop-filter layers. */
(function(){
 const logo=document.querySelector('.identity'),source=logo?.querySelector('img');if(!source)return;
 const canvas=document.createElement('canvas'),context=canvas.getContext('2d');if(!context)return;
 canvas.className='logo-contrast-canvas';canvas.setAttribute('aria-hidden','true');logo.append(canvas);
 let frame=0,until=0,last='';
 function schedule(){until=performance.now()+600;if(!frame)frame=requestAnimationFrame(update)}
 function update(now){
  frame=0;if(!source.complete||!source.naturalWidth)return;
  const box=logo.getBoundingClientRect(),w=logo.clientWidth,h=logo.clientHeight;if(!w||!h||!box.width||!box.height)return;
  const sx=w/box.width,sy=h/box.height,dpr=Math.min(devicePixelRatio||1,3);
  const images=window.PortfolioImageBounds.get().filter(r=>r.right>box.left&&r.left<box.right&&r.bottom>box.top&&r.top<box.bottom);
  const key=JSON.stringify([w,h,dpr,box.width,box.height,...images.map(r=>[r.image?.currentSrc,r.left-box.left,r.top-box.top,r.right-box.left,r.bottom-box.top,r.opacity])]);
  if(key!==last){
   const pixelWidth=Math.ceil(w*dpr),pixelHeight=Math.ceil(h*dpr);
   if(canvas.width!==pixelWidth||canvas.height!==pixelHeight){canvas.width=pixelWidth;canvas.height=pixelHeight}
   context.setTransform(dpr,0,0,dpr,0,0);context.globalCompositeOperation='source-over';context.globalAlpha=1;context.filter='none';
   context.clearRect(0,0,w,h);context.fillStyle='#000';context.fillRect(0,0,w,h);
   for(const rect of images){
    const image=rect.image,actual=rect.imageRect;if(!image||!actual)continue;
    context.save();context.beginPath();context.rect((rect.left-box.left)*sx,(rect.top-box.top)*sy,(rect.right-rect.left)*sx,(rect.bottom-rect.top)*sy);context.clip();
    context.globalAlpha=rect.opacity;context.filter='grayscale(1) invert(1)';
    context.drawImage(image,(actual.left-box.left)*sx,(actual.top-box.top)*sy,actual.width*sx,actual.height*sy);context.restore();
   }
   context.filter='none';context.globalAlpha=1;context.globalCompositeOperation='destination-in';context.drawImage(source,0,0,w,h);
   context.globalCompositeOperation='source-over';logo.classList.add('logo-canvas-ready');last=key;
  }
  if(now<until||document.querySelector('.photo.is-zooming,.project-row figure.is-zooming,.project-color-overlay'))frame=requestAnimationFrame(update);
 }
 for(const event of ['scroll','resize','hashchange','pageshow','pointerover','pointerout','project-background-ready','portfolio-composition-change'])window.addEventListener(event,schedule,{passive:true});
 document.addEventListener('load',event=>{if(event.target.tagName==='IMG')schedule()},true);
 new MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.target.tagName==='IMG'||r.target.classList?.contains('project-color-overlay')))schedule()}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','hidden','class']});
 schedule();
})();
