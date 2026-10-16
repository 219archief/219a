import {cpSync,readFileSync,writeFileSync,mkdirSync,existsSync,lstatSync,realpathSync,rmSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectSiteAssets} from './site-assets.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.resolve(process.env.PAGES_OUTPUT_DIR||path.join(root,'_site'));
if(existsSync(output)){
 const canonical=value=>process.platform==='win32'?value.toLowerCase():value;
 const expected=path.join(realpathSync(root),'_site');
 if(lstatSync(output).isSymbolicLink()||canonical(realpathSync(output))!==canonical(expected))throw new Error('Only the generated project _site directory may be replaced. Use a fresh custom output directory.');
 rmSync(output,{recursive:true,force:true});
}
mkdirSync(output,{recursive:true});
const assets=collectSiteAssets(root);
for(const asset of assets){const destination=path.join(output,asset);mkdirSync(path.dirname(destination),{recursive:true});cpSync(path.join(root,'public',asset),destination);}
writeFileSync(path.join(output,'index.html'),readFileSync(path.join(root,'portfolio/index.html')));
writeFileSync(path.join(output,'.nojekyll'),'');
// Pages serves static files; the original Sites contact API remains unchanged.
writeFileSync(path.join(output,'contact76.js'),`(()=>{const form=document.querySelector('#contact-form'),status=document.querySelector('#contact-status');form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;status.dataset.state='error';status.textContent='Het contactformulier is op deze GitHub Pages-versie nog niet aangesloten.';status.focus({preventScroll:true})})})();`);
console.log('GitHub Pages website prepared at '+output+' ('+assets.length+' active assets)');
