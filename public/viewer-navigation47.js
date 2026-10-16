/* Hergebruik de fotonavigatie voor klikken en wiel-/trackpadgebaren. */
(function(){
 const dialog=document.querySelector('dialog'),image=document.querySelector('#full-image');
 if(!dialog||!image)return;
 const previous=document.querySelector('#prev'),next=document.querySelector('#next');
 const navigate=direction=>(direction<0?previous:next).click();
 let pointerStart=null;
 image.addEventListener('dragstart',event=>event.preventDefault());
 image.addEventListener('pointerdown',event=>{pointerStart={x:event.clientX,y:event.clientY}});
 image.addEventListener('pointercancel',()=>{pointerStart=null});
 image.addEventListener('click',event=>{
  if(!dialog.open||event.button!==0||event.defaultPrevented)return;
  if(pointerStart&&Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>8)return;
  const bounds=image.getBoundingClientRect();
  navigate(event.clientX<bounds.left+bounds.width/2?-1:1);
 });
 let lastWheel=-Infinity,total=0,used=false;
 function reset(){lastWheel=-Infinity;total=0;used=false;pointerStart=null}
 new MutationObserver(reset).observe(dialog,{attributes:true,attributeFilter:['open']});
 dialog.addEventListener('wheel',event=>{
  if(!dialog.open||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
  event.preventDefault();
  const now=performance.now();
  // Een gebaar toont één foto; trackpad-inertie slaat geen foto's over.
  if(now-lastWheel>180){total=0;used=false}
  lastWheel=now;
  if(used)return;
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?dialog.clientHeight:1);
  if(Math.sign(delta)!==Math.sign(total))total=0;
  total+=delta;
  if(Math.abs(total)>=30){navigate(Math.sign(total));used=true}
 },{passive:false});
})();
