/* Read photo geometry once per animation frame, shared by all contrast layers. */
window.PortfolioImageBounds=(()=>{
 let timestamp,boxes=[];
 function get(){
  const frame=document.timeline.currentTime??performance.now();if(frame===timestamp)return boxes;timestamp=frame;boxes=[];
  const overlay=document.querySelector('.project-color-overlay');
  const images=overlay?overlay.querySelectorAll('.project-transition-photo'):document.querySelectorAll('.photo img,.project-row img');
  for(const image of images){
   if(!image.complete||!image.naturalWidth||!image.getClientRects().length)continue;
   let opacity=1;for(let element=image;element&&element!==document.body;element=element.parentElement){const style=getComputedStyle(element);if(style.display==='none'||style.visibility==='hidden'){opacity=0;break}opacity*=Number(style.opacity)}
   if(opacity<.001)continue;
   const actual=image.getBoundingClientRect(),clip=image.closest('.project-row button')?.getBoundingClientRect();
   const rect=clip?{left:Math.max(actual.left,clip.left),top:Math.max(actual.top,clip.top),right:Math.min(actual.right,clip.right),bottom:Math.min(actual.bottom,clip.bottom)}:actual;
   boxes.push(rect);
  }
  return boxes;
 }
 return{get};
})();
