/* Projectuiterlijk staat bij de bestaande data; later rechtstreeks door CMS-data te vervangen. */
(function(root){
const projects=[
{id:'binnen-en-buiten',homeEnabled:false,workKind:'commissioned',year:2020,title:'Binnen en buiten',intro:'binnenruimtes, gevels en de details ertussen.',description:'een kleine selectie rond interieur en architectuur. van afbeeldingen aan een muur tot een entree tussen palmbomen: elk beeld laat een andere kant van een plek zien.',backgroundEnabled:false,backgroundColor:'#faf9f6',transitionEnabled:false,openingPhotoId:'foto-02',photoIds:['foto-01','foto-02']},
{id:'ontmoetingen',workKind:'free',year:2024,title:'Ontmoetingen',intro:'mensen, straatbeelden en momenten van nabijheid.',description:'een auto langs de straat, een portret op een wandelpad en twee mensen in een houten ruimte. deze selectie brengt mensen en hun omgeving samen, met aandacht voor wat zich tussen de grotere momenten afspeelt.',backgroundEnabled:true,backgroundColor:'#846C5B',transitionEnabled:true,backgroundCoverPhotoId:'foto-07',openingPhotoId:'foto-07',photoIds:['foto-03','foto-06','foto-07']},
{id:'langs-de-kust',workKind:'free',year:2022,title:'Langs de kust',intro:'mensen en sporen langs de rand van het water.',description:'van hout op het strand tot wandelaars langs een rotsachtige kust. een selectie waarin de kust steeds het decor vormt, en de mensen het ritme bepalen.',backgroundEnabled:true,backgroundColor:'#B8CDF8',transitionEnabled:true,backgroundCoverPhotoId:'foto-05',openingPhotoId:'foto-05',photoIds:['foto-04','foto-05']}
];
function projectAppearance(project,photoId){const enabled=project?.backgroundEnabled===true&&/^#[0-9a-f]{6}$/i.test(project.backgroundColor||'');return{enabled,color:enabled?project.backgroundColor:'#faf9f6',transitionEnabled:enabled&&project.transitionEnabled===true,coverEnabled:enabled&&(!photoId||!project.backgroundCoverPhotoId||project.backgroundCoverPhotoId===photoId)}}
function projectForPhoto(id){return projects.find(p=>p.photoIds.includes(id))}
function projectFromHash(hash){const match=/^#\/project\/([^/]+)$/.exec(hash);return match?projects.find(p=>p.id===match[1]):undefined}
function rowsFor(images){const rows=[];let portraits=[];function flush(){if(portraits.length){rows.push(portraits);portraits=[]}}for(const photo of images){if(photo.ratio>=1){flush();rows.push([photo])}else{portraits.push(photo);if(portraits.length===2)flush()}}flush();return rows}
function photosForProject(project,photos){const ids=project.photoIds||[],opening=ids.includes(project.openingPhotoId)?project.openingPhotoId:ids[0];return [opening,...ids.filter(id=>id!==opening)].map(id=>photos.find(p=>p.id===id)).filter(Boolean)}
function sortedProjects(order='newest',workKind='all'){const direction=order==='oldest'?1:-1;return projects.filter(project=>workKind==='all'||project.workKind===workKind).sort((a,b)=>direction*(a.year-b.year)||a.id.localeCompare(b.id))}
function sortedPhotos(photos,order='newest',workKind='all'){return sortedProjects(order,workKind).flatMap(project=>project.photoIds.map(id=>photos.find(photo=>photo.id===id))).filter(Boolean)}
root.PortfolioProjects={projects,projectAppearance,projectForPhoto,projectFromHash,rowsFor,photosForProject,sortedProjects,sortedPhotos};if(typeof module!=='undefined')module.exports=root.PortfolioProjects;
})(typeof window!=='undefined'?window:globalThis);






