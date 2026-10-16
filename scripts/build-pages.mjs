import {cpSync,readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.resolve(process.env.PAGES_OUTPUT_DIR||path.join(root,'_site'));
if(existsSync(output))throw new Error('Use a fresh output directory for the Pages build.');
mkdirSync(output,{recursive:true});
cpSync(path.join(root,'public'),output,{recursive:true});
writeFileSync(path.join(output,'index.html'),readFileSync(path.join(root,'portfolio/index.html')));
writeFileSync(path.join(output,'.nojekyll'),'');
// Pages serves static files; the original Sites contact API remains unchanged.
writeFileSync(path.join(output,'contact76.js'),`(()=>{const form=document.querySelector('#contact-form'),status=document.querySelector('#contact-status');form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;status.dataset.state='error';status.textContent='Het contactformulier is op deze GitHub Pages-versie nog niet aangesloten.';status.focus({preventScroll:true})})})();`);
console.log('GitHub Pages website prepared at '+output);
