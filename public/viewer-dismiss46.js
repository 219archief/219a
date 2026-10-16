/* Klikken in de lege ruimte sluit de bestaande fotoweergave. */
(function(){
 const dialog=document.querySelector('dialog');if(!dialog)return;
 const protectedContent='img,button,a,input,select,textarea,#full-caption,#image-error';
 let startedOutside=false;
 dialog.addEventListener('pointerdown',event=>{startedOutside=!event.target.closest(protectedContent)});
 dialog.addEventListener('click',event=>{
  if(!dialog.open||event.defaultPrevented||event.button!==0||event.target.closest(protectedContent))return;
  if(event.detail>0&&!startedOutside)return;
  dialog.close();
 });
})();
