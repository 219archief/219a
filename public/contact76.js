(()=>{
 'use strict';
 const form=document.querySelector('#contact-form'),status=document.querySelector('#contact-status'),button=form.querySelector('[type=submit]');
 let busy=false,requestId=crypto.randomUUID();
 const labels={name:'vul je naam in.',email:'vul een geldig e-mailadres in.',message:'schrijf een bericht.'};
 function error(name,text){const field=form.elements[name];field.setAttribute('aria-invalid',String(!!text));document.querySelector('#'+name+'-error').textContent=text||'';}
 function show(text,state){status.replaceChildren();status.dataset.state=state;if(state==='success'){const receipt=document.createElement('span');receipt.className='contact-receipt';receipt.setAttribute('aria-hidden','true');receipt.textContent='219 / ontvangen';status.append(receipt)}const message=document.createElement('span');message.textContent=text;status.append(message);}
 form.addEventListener('input',e=>{if(e.target.name in labels||e.target.name==='subject')error(e.target.name,'');requestId=crypto.randomUUID();});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;let first;
  for(const name of ['name','email','subject','message']){const field=form.elements[name];const valid=(name==='subject'||!!field.value.trim())&&field.checkValidity();error(name,valid?'':labels[name]||'dit onderwerp is te lang.');if(!valid)first??=field;}
  if(first){show('controleer de gemarkeerde velden.','error');first.focus();return;}
  busy=true;button.disabled=true;button.textContent='versturen…';form.setAttribute('aria-busy','true');show('je bericht wordt verstuurd…','sending');
  const data=Object.fromEntries(new FormData(form));data.id=requestId;
  try{
   const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(20000)});
   const result=await response.json();
   if(!response.ok||result.received!==true){for(const [name,message] of Object.entries(result.errors||{}))if(form.elements[name])error(name,message);throw new Error(result.error||'versturen is niet gelukt. probeer het nog eens.');}
   form.reset();requestId=crypto.randomUUID();show('bedankt. je bericht is ontvangen.','success');status.focus({preventScroll:true});
  }catch(err){show(err.name==='TimeoutError'?'het duurt langer dan verwacht. probeer opnieuw; hetzelfde bericht wordt maar één keer opgeslagen.':err.message==='Failed to fetch'?'geen verbinding. je bericht blijft hier staan; probeer het opnieuw.':err.message,'error');}
  finally{busy=false;button.disabled=false;button.innerHTML='verstuur bericht <span aria-hidden="true">↗</span>';PortfolioDetails.decorate(button);form.removeAttribute('aria-busy');}
 });
})();