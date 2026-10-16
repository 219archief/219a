import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';

/** Active HTML/CSS/JS assets, plus the data-driven responsive photo collection. */
export function collectSiteAssets(root){
 const publicRoot=path.join(root,'public'),assets=new Set();
 function add(reference,from=''){
  if(!reference||/^(?:#|[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)||reference.includes('${'))return;
  const filename=path.posix.normalize(path.posix.join(from,decodeURIComponent(reference.split(/[?#]/)[0])));
  const absolute=path.resolve(publicRoot,filename);
  if(!absolute.startsWith(publicRoot+path.sep))throw new Error('Asset outside public: '+filename);
  if(assets.has(filename))return;
  if(!existsSync(absolute))throw new Error('Missing website asset: '+filename);
  assets.add(filename);
  if(filename.endsWith('.css')){
   const css=readFileSync(absolute,'utf8');
   for(const match of css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g))add(match[1],path.posix.dirname(filename));
   for(const match of css.matchAll(/@import\s+['"]([^'"]+)['"]/g))add(match[1],path.posix.dirname(filename));
  }
  if(filename.endsWith('.js')){
   for(const match of readFileSync(absolute,'utf8').matchAll(/['"`](assets\/[^'"`]+)['"`]/g))add(match[1]);
  }
 }
 const html=readFileSync(path.join(root,'portfolio/index.html'),'utf8');
 for(const match of html.matchAll(/<(?:script|link|img)\b[^>]*?\b(?:src|href)="([^"]+)"/g))add(match[1]);
 for(const name of readdirSync(path.join(publicRoot,'assets/responsive')))if(name.endsWith('.webp'))add('assets/responsive/'+name);
 return [...assets].sort();
}
