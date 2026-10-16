/* Knip de contrastlaag uitsluitend uit waar het vaste logo echte foto's raakt. */
(function(){
 const logo=document.querySelector('.identity');if(!logo)return;
 let frame=0,until=0,last='',stable=0;
 function schedule(){until=performance.now()+600;stable=0;if(!frame)frame=requestAnimationFrame(update)}
 function update(now){
  frame=0;const box=logo.getBoundingClientRect(),sx=logo.clientWidth/box.width,sy=logo.clientHeight/box.height;
  const overlay=document.querySelector('.project-color-overlay');
  const images=overlay?overlay.querySelectorAll('.project-transition-photo'):document.querySelectorAll('.photo img,.project-row img');
  const rects=[];
  for(const img of images){if(!img.getClientRects().length||!img.complete||!img.naturalWidth)continue;const r=img.getBoundingClientRect();const x=Math.max(box.left,r.left),y=Math.max(box.top,r.top),right=Math.min(box.right,r.right),bottom=Math.min(box.bottom,r.bottom);if(right>x&&bottom>y)rects.push({x:(x-box.left)*sx,y:(y-box.top)*sy,r:(right-box.left)*sx,b:(bottom-box.top)*sy})}
  // Maak een unie van losse stroken, ook wanneer twee foto's elkaar overlappen.
  const ys=[...new Set(rects.flatMap(r=>[r.y,r.b]))].sort((a,b)=>a-b),parts=[];
  const n=v=>Number(v.toFixed(3));const rect=(x,y,r,b)=>`M${n(x)} ${n(y)}H${n(r)}V${n(b)}H${n(x)}Z`;
  for(let i=0;i<ys.length-1;i++){const y=ys[i],b=ys[i+1];const spans=rects.filter(r=>r.y<=y&&r.b>=b).map(r=>[r.x,r.r]).sort((a,b)=>a[0]-b[0]);let merged;for(const span of spans){if(merged&&span[0]<=merged[1])merged[1]=Math.max(merged[1],span[1]);else{if(merged)parts.push(rect(merged[0],y,merged[1],b));merged=[...span]}}if(merged)parts.push(rect(merged[0],y,merged[1],b))}
  const path=parts.join(''),key=path+'|'+n(box.width)+'|'+n(box.height);
  if(key!==last){last=key;stable=0;logo.style.setProperty('--logo-image-clip',path?`path('${path}')`:'inset(50%)');logo.style.setProperty('--logo-background-clip',path?`path(evenodd, '${rect(0,0,logo.clientWidth,logo.clientHeight)+path}')`:'inset(0)')}else stable++;
  if(now<until||stable<10)frame=requestAnimationFrame(update);
 }
 for(const event of ['scroll','resize','hashchange','pageshow','pointerover','pointerout'])window.addEventListener(event,schedule,{passive:true});
 document.addEventListener('load',e=>{if(e.target.tagName==='IMG')schedule()},true);
 new MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.target.tagName==='IMG'||r.target.classList?.contains('project-color-overlay')))schedule()}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','hidden','class']});
 schedule();
})();
