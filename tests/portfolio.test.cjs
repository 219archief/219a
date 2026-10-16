const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function load(filename,extras={}){const context={module:{exports:{}},window:{innerHeight:1080,addEventListener(){}},document:{addEventListener(){}},...extras};vm.runInNewContext(fs.readFileSync(path.join(root,'public',filename),'utf8'),context);return context}
const layout=load('layout.js').module.exports,projects=load('projects70.js').module.exports;
const hover=load('hover-project60.js').window.PortfolioHover;

test('Each photo belongs to one valid project and all WebP sizes exist',()=>{
 assert.equal(new Set(projects.projects.map(p=>p.id)).size,projects.projects.length);
 for(const photo of layout.photos){const matches=projects.projects.filter(p=>p.photoIds.includes(photo.id));assert.equal(matches.length,1);assert.equal(projects.projectFromHash('#/project/'+matches[0].id),matches[0]);for(const width of [320,480,720,960,1440,2200])assert.ok(fs.existsSync(path.join(root,`public/assets/responsive/${photo.id}-${width}.webp`)))}
 assert.equal(projects.projectFromHash('#/project/missing'),undefined);
 for(const project of projects.projects){assert.ok(project.photoIds.includes(project.openingPhotoId));assert.equal(projects.photosForProject(project,layout.photos).length,project.photoIds.length)}
 assert.equal(projects.projectAppearance({...projects.projects[1],backgroundColor:'invalid'}).enabled,false);
});
test('Project sorting, home selection and portrait row grouping remain valid',()=>{
 assert.deepEqual(Array.from(projects.sortedProjects().map(p=>p.year)),[2024,2022,2020]);
 assert.deepEqual(Array.from(projects.sortedProjects('oldest').map(p=>p.year)),[2020,2022,2024]);
 const home=projects.sortedPhotos(layout.photos).filter(photo=>projects.projectForPhoto(photo.id).homeEnabled!==false);assert.equal(home.length,5);assert.ok(home.every(photo=>projects.projectForPhoto(photo.id).id!=='binnen-en-buiten'));
 const portrait={ratio:.67},wide={ratio:1.5};assert.deepEqual(Array.from(projects.rowsFor([wide,portrait,portrait,wide,portrait]),row=>Array.from(row)),[[wide],[portrait,portrait],[wide],[portrait]]);
});
test('Seeded compositions stay within bounds and avoid photos and text across 176 widths',()=>{
 for(let width=280;width<=2560;width+=13)for(const collection of [layout.photos,projects.sortedPhotos(layout.photos).filter(photo=>projects.projectForPhoto(photo.id).homeEnabled!==false)]){
  const result=layout.compose(width,undefined,collection);assert.deepEqual(result,layout.compose(width,undefined,collection));assert.equal(result.boxes.length,collection.length);
  for(const [i,box] of result.boxes.entries()){assert.ok(box.x>=0&&box.x+box.w<=width);assert.ok(box.y>=0&&box.y+box.h<=result.height);for(const other of [...result.boxes.slice(i+1),...result.reserved])assert.ok(!layout.collides(box,other),'collision at '+width)}
 }
});
test('Hover zoom keeps original centre when possible and moves only to fit screen edges',()=>{
 for(const viewport of [320,768,1440,1920,2560])for(const height of [360,600,1080])for(const fraction of [.15,.24,.35]){
  const width=viewport*fraction,photoHeight=width/1.5,margin=viewport*(viewport<600?.06:.04);
  for(const left of [margin,(viewport-width)/2,viewport-margin-width])for(const top of [24,100,height-photoHeight-20]){
   const rect={left,top,width,height:photoHeight},g=hover.zoomGeometry(rect,viewport,height);
   const x=left+width/2+g.shift-width*g.scale/2,y=top+photoHeight/2+g.shiftY-photoHeight*g.scale/2;
   assert.ok(Number.isFinite(g.scale));assert.ok(x>=margin-.001&&x+width*g.scale<=viewport-margin+.001);assert.ok(y>=24-.001&&y+photoHeight*g.scale<=height-70+.001);assert.ok(width*g.scale<=viewport*.5+.001);
  }
 }
 assert.equal(hover.zoomProgress(1000),.5);assert.equal(hover.zoomProgress(2000),1);assert.equal(hover.zoomProgress(9000),1);
 const centre=hover.zoomGeometry({left:400,top:250,width:200,height:150},1000,1000);assert.equal(centre.shift,0);assert.equal(centre.shiftY,0);
});
test('Asset graph resolves every active reference and Pages export excludes source originals',async()=>{
 const {collectSiteAssets}=await import('../scripts/site-assets.mjs');const assets=collectSiteAssets(root);
 assert.ok(assets.includes('image-bounds.js'));assert.ok(assets.includes('assets/Logo Wit.png'));assert.equal(assets.filter(p=>p.endsWith('.webp')).length,42);assert.ok(!assets.some(p=>p.endsWith('.jpg')));assert.ok(!assets.includes('living-home88.js'));
 for(const file of assets)assert.ok(fs.existsSync(path.join(root,'public',file)));
 const html=fs.readFileSync(path.join(root,'portfolio/index.html'),'utf8');assert.ok(html.indexOf('image-bounds.js')<html.indexOf('logo-images52.js'));
});
test('Pages build can be repeated and leaves the source and original photographs intact',()=>{
 const {execFileSync}=require('node:child_process'),env={...process.env};delete env.PAGES_OUTPUT_DIR;
 const html=fs.readFileSync(path.join(root,'portfolio/index.html'),'utf8');
 for(let i=0;i<2;i++)execFileSync(process.execPath,['scripts/build-pages.mjs'],{cwd:root,env});
 assert.equal(fs.readFileSync(path.join(root,'_site/index.html'),'utf8'),html);
 assert.ok(!fs.existsSync(path.join(root,'_site/assets/img401.jpg')));assert.ok(fs.existsSync(path.join(root,'public/assets/img401.jpg')));
 assert.ok(fs.readFileSync(path.join(root,'_site/contact76.js'),'utf8').includes('nog niet aangesloten'));
});
