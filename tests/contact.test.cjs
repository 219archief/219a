const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const source=fs.readFileSync(path.join(__dirname,'../app/api/contact/route.ts'),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function boot(env={},fetch=async()=>new Response('',{status:200})){const record={exports:{}};vm.runInNewContext(compiled,{module:record,exports:record.exports,require:name=>{assert.equal(name,'cloudflare:workers');return{env}},URL,Request,Response,Uint8Array,TextDecoder,TextEncoder,crypto:require('node:crypto').webcrypto,AbortSignal,fetch,console:{warn(){},error(){}}});return record.exports.POST}
const data={id:'12345678-1234-4234-8234-123456789012',name:'Test',email:'test@example.com',subject:'Vraag',message:'Een testbericht.'};
const request=(value=data,origin='https://portfolio.example')=>new Request('https://portfolio.example/api/contact',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(value)});
test('Contact API rejects cross-origin requests and invalid or oversized input before database access',async()=>{
 const POST=boot({DB:{prepare(){throw Error('Invalid request reached the database')}}});
 assert.equal((await POST(request(data,'https://other.example'))).status,403);
 assert.equal((await POST(request({...data,email:'invalid'}))).status,422);
 assert.equal((await POST(request({...data,id:'invalid'}))).status,400);
 assert.equal((await POST(request({...data,message:'a'.repeat(25000)}))).status,413);
 assert.equal((await POST(request({...data,website:'spam'}))).status,400);
});
test('A stored contact remains successful when notification status cannot be updated',async()=>{
 let stored=false,notified=false;
 const env={CONTACT_TO:'owner@example.com',CONTACT_FROM:'portfolio@example.com',RESEND_API_KEY:'test-only',DB:{prepare(sql){return{bind(){return this},async first(){if(sql.startsWith('SELECT'))return null;stored=true;return{id:data.id}},async run(){throw Error('Simulated status update failure')}}}}};
 const POST=boot(env,async()=>{notified=true;return new Response('',{status:200})});const response=await POST(request());assert.equal(response.status,201);assert.equal((await response.json()).received,true);assert.ok(stored&&notified);
});
test('An already received contact is acknowledged without another insert or notification',async()=>{
 let queries=0,notified=false;const POST=boot({DB:{prepare(){queries++;return{bind(){return this},first:async()=>({id:data.id})}}}},async()=>{notified=true});
 const response=await POST(request());assert.equal(response.status,200);assert.equal((await response.json()).received,true);assert.equal(queries,1);assert.equal(notified,false);
});
