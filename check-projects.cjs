const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');const {photos}=require('./dist/layout.js'),{projects,projectForPhoto,projectFromHash,rowsFor,projectAppearance}=require('./dist/projects.js');
assert.equal(new Set(projects.map(p=>p.id)).size,projects.length);for(const photo of photos){const matches=projects.filter(p=>p.photoIds.includes(photo.id));assert.equal(matches.length,1);assert.equal(projectFromHash('#/project/'+projectForPhoto(photo.id).id),matches[0])}
for(const p of projects){assert.ok(p.photoIds.length>1);assert.match(p.backgroundColor,/^#[0-9a-f]{6}$/i);for(const id of p.photoIds)assert.ok(photos.some(photo=>photo.id===id))}
assert.equal(projectFromHash('#/project/missing'),undefined);assert.equal(projectFromHash('#info'),undefined);
const portrait={ratio:.67},landscape={ratio:1.5};assert.deepEqual(rowsFor([landscape,portrait,portrait,landscape,portrait]),[[landscape],[portrait,portrait],[landscape],[portrait]]);
assert.equal(projectAppearance(projects[1],'foto-07').coverEnabled,true);assert.equal(projectAppearance(projects[1],'foto-03').coverEnabled,false);assert.equal(projectAppearance(projects[2],'foto-05').color,'#B8CDF8');assert.equal(projectAppearance({...projects[1],backgroundEnabled:false},'foto-07').coverEnabled,false);assert.equal(projectAppearance({...projects[1],backgroundColor:'invalid'}).enabled,false);assert.equal(projectAppearance({...projects[1],transitionEnabled:false}).transitionEnabled,false);
const store=new Map();function boot(hash){const properties={};const context={PortfolioProjects:require('./dist/projects.js'),location:{hash},localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},document:{documentElement:{style:{setProperty:(k,v)=>properties[k]=v}}}};context.window=context;vm.runInNewContext(fs.readFileSync('dist/theme.js','utf8'),context);return{theme:context.PortfolioTheme,properties}}
const a=boot('#/project/'+projects[0].id);assert.equal(a.properties['--page-bg'],projectAppearance(projects[0]).color);a.theme.apply(projects[1]);assert.equal(a.properties['--page-bg'],projectAppearance(projects[1]).color);a.theme.apply();assert.equal(a.properties['--page-bg'],'#faf9f6');assert.equal(a.theme.save,undefined);
store.set('219-project-backgrounds-v1',JSON.stringify({[projects[0].id]:'#000000'}));assert.equal(boot('#/project/'+projects[0].id).properties['--page-bg'],projectAppearance(projects[0]).color);
const html=fs.readFileSync('dist/index.html','utf8'),css=fs.readFileSync('dist/style-project-context45.css','utf8');const menu=html.match(/<nav aria-label="Hoofdnavigatie">(.*?)<\/nav>/s)[1];assert.ok(!/[A-Z]/.test(menu.replace(/<[^>]+>/g,'')));assert.ok(css.includes('.about{border-top:0}'));assert.ok(html.indexOf('theme.js')<html.indexOf('rel="stylesheet"'));assert.ok(css.includes('transition:background-color var(--page-bg-transition,1.2s) ease'));
console.log('PASS: all 7 covers map to one of 3 multi-image projects; landscape/portrait row grouping; routes; fixed project colours; obsolete browser overrides ignored; initial theme before paint; lowercase menu; removed info border.');










