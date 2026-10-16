import { env } from 'cloudflare:workers';
type ContactEnv=Cloudflare.Env & {CONTACT_TO?:string;CONTACT_FROM?:string;RESEND_API_KEY?:string};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 const url=new URL(request.url);
 if(request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')return json({error:'dit verzoek is niet toegestaan.'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'ongeldig berichtformaat.'},415);
 if(Number(request.headers.get('content-length'))>24000)return json({error:'je bericht is te lang.'},413);
 let data:Record<string,unknown>;
 try{
  const reader=request.body?.getReader();if(!reader)return json({error:'het bericht ontbreekt.'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>24000){await reader.cancel();return json({error:'je bericht is te lang.'},413);}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}data=JSON.parse(new TextDecoder().decode(bytes));
 }catch{return json({error:'ongeldig berichtformaat.'},400);}
 if(!data||typeof data!=='object'||Array.isArray(data))return json({error:'ongeldig bericht.'},400);
 if(data.website)return json({error:'je bericht kon niet worden verstuurd.'},400);
 const text=(key:string)=>typeof data[key]==='string'?data[key].trim():'';
 const name=text('name'),email=text('email'),subject=text('subject'),message=text('message'),id=text('id');
 const errors:Record<string,string>={};
 if(!name||name.length>100)errors.name='vul je naam in (maximaal 100 tekens).';
 if(email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email))errors.email='vul een geldig e-mailadres in.';
 if(subject.length>160)errors.subject='gebruik maximaal 160 tekens.';
 if(!message||message.length>5000)errors.message='schrijf een bericht van maximaal 5000 tekens.';
 if(Object.keys(errors).length)return json({error:'controleer de gemarkeerde velden.',errors},422);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))return json({error:'herlaad de pagina en probeer opnieuw.'},400);
 const bindings=env as ContactEnv;
 if(!bindings.DB)return json({error:'het formulier is tijdelijk niet beschikbaar. probeer het later opnieuw.'},503);
 try{
  const existing=await bindings.DB.prepare('SELECT id FROM contact_messages WHERE id = ?').bind(id).first();
  if(existing)return json({received:true});
  const now=Date.now(),ip=request.headers.get('cf-connecting-ip')||request.headers.get('oai-authenticated-user-id')||'unknown';
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(url.host+'|'+ip+'|'+Math.floor(now/86400000)));
  const key=Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
  const configured=!!(bindings.CONTACT_TO&&bindings.CONTACT_FROM&&bindings.RESEND_API_KEY);
  const saved=await bindings.DB.prepare('INSERT INTO contact_messages (id,name,email,subject,message,created_at,client_key,notification) SELECT ?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM contact_messages WHERE client_key = ? AND created_at > ?) < 5 RETURNING id').bind(id,name,email,subject,message,now,key,configured?'pending':'disabled',key,now-3600000).first();
  if(!saved)return json({error:'je hebt meerdere berichten verstuurd. probeer het over een uur opnieuw.'},429);
  if(configured){
   // Storage is the receipt of record. Notification failure never loses a message.
   let delivered=false;
   try{const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+bindings.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({from:bindings.CONTACT_FROM,to:[bindings.CONTACT_TO],reply_to:email,subject:'219 / '+(subject||'nieuw bericht'),text:'naam: '+name+'\ne-mail: '+email+'\n\n'+message}),signal:AbortSignal.timeout(7000)});delivered=response.ok;}catch{console.warn('Contact notification unavailable; message retained.');}
   try{await bindings.DB.prepare('UPDATE contact_messages SET notification = ? WHERE id = ?').bind(delivered?'sent':'failed',id).run();}catch{console.warn('Contact notification status unavailable; message retained.');}
  }
  return json({received:true},201);
 }catch{console.error('Contact storage unavailable.');return json({error:'opslaan is niet gelukt. je bericht blijft ingevuld; probeer het opnieuw.'},503);}
}
