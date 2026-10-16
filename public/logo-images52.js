/* Eén alfamasker per laag voorkomt rechthoekige backdrop-filterartefacten. */
(function(){
 const logo=document.querySelector('.identity'),source=logo?.querySelector('img');if(!source)return;
 const canvas=document.createElement('canvas'),context=canvas.getContext('2d');if(!context)return;
 let frame=0,until=0,last='',stable=0;
 function schedule(){until=performance.now()+600;stable=0;if(!frame)frame=requestAnimationFrame(update)}
 function update(now){
  frame=0;if(!source.complete||!source.naturalWidth)return;
  const box=logo.getBoundingClientRect(),w=logo.clientWidth,h=logo.clientHeight;if(!box.width||!box.height)return;
  const sx=w/box.width,sy=h/box.height;
  const rects=[];
  for(const r of window.PortfolioImageBounds.get()){const x=Math.max(box.left,r.left),y=Math.max(box.top,r.top),right=Math.min(box.right,r.right),bottom=Math.min(box.bottom,r.bottom);if(right>x&&bottom>y)rects.push([(x-box.left)*sx,(y-box.top)*sy,(right-x)*sx,(bottom-y)*sy])}
  const dpr=Math.min(devicePixelRatio||1,3),key=JSON.stringify([w,h,dpr,rects.map(r=>r.map(v=>Math.round(v*100)/100))]);
  if(key!==last){last=key;stable=0;
   canvas.width=Math.ceil(w*dpr);canvas.height=Math.ceil(h*dpr);context.setTransform(dpr,0,0,dpr,0,0);
   // Eerst de unie van de foto-uitsneden; daarna uitsluitend logo-alfa behouden.
   context.fillStyle='#fff';for(const r of rects)context.fillRect(...r);
   context.globalCompositeOperation='destination-in';context.drawImage(source,0,0,w,h);
   logo.style.setProperty('--logo-photo-mask',`url("${canvas.toDataURL()}")`);
   context.globalCompositeOperation='source-over';context.clearRect(0,0,w,h);context.drawImage(source,0,0,w,h);
   // De zwarte laag krijgt precies de complementaire uitsnede.
   context.globalCompositeOperation='destination-out';for(const r of rects)context.fillRect(...r);
   logo.style.setProperty('--logo-page-mask',`url("${canvas.toDataURL()}")`);
   context.globalCompositeOperation='source-over';logo.classList.add('logo-masks-ready');
  }else stable++;
  if(now<until||stable<10||document.querySelector('.photo.is-zooming,.project-row figure.is-zooming,.project-color-overlay'))frame=requestAnimationFrame(update);
 }
 for(const event of ['scroll','resize','hashchange','pageshow','pointerover','pointerout','project-background-ready','portfolio-composition-change'])window.addEventListener(event,schedule,{passive:true});
 document.addEventListener('load',e=>{if(e.target.tagName==='IMG')schedule()},true);
 new MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.target.tagName==='IMG'||r.target.classList?.contains('project-color-overlay')))schedule()}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','hidden','class']});
 schedule();
})();

