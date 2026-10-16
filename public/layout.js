(function(root){
const photos=[{"place":"Binnenruimte","ratio":1.596169193934557,"y":90,"id":"foto-01","size":0.24,"alt":"Kruisbeeld en kleine afbeeldingen aan een lichtblauwe muur","year":null,"x":0.43},{"place":"Architectuur","ratio":1.607,"y":280,"id":"foto-02","size":0.19,"alt":"Stenen gebouw met palmbomen en een versierde entree","year":null,"x":0.76},{"place":"Straatbeeld","ratio":1.550914876690533,"y":520,"id":"foto-03","size":0.29,"alt":"Roze auto langs een straat in de stad","year":null,"x":0.05},{"place":"Aan zee","ratio":1.5825914935707222,"y":780,"id":"foto-04","size":0.21,"alt":"Mensen bij een verzameling hout op het strand","year":null,"x":0.52},{"place":"Kustlijn","ratio":1.553851516207738,"y":1100,"id":"foto-05","size":0.36,"alt":"Zwart-witfoto van wandelaars aan een rotsachtige kust","year":null,"x":0.09},{"place":"Ismael","ratio":1.508,"y":1370,"id":"foto-06","size":0.21,"alt":"Portret van Ismael op een wandelpad in de stad","year":null,"x":0.7},{"place":"Een ontmoeting","ratio":1.5,"y":1670,"id":"foto-07","size":0.3,"alt":"Twee mensen in rood-wit geblokte kleding in een houten gebouw","year":null,"x":0.33}];
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function collides(a,b,gap=0){return a.x<b.x+b.w+gap&&a.x+a.w+gap>b.x&&a.y<b.y+b.h+gap&&a.y+a.h+gap>b.y}
function compose(width,measuredIntro,orderedPhotos=photos,measuredToolbar){const rand=rng(219),mobile=width<600,margin=width*(mobile?.06:.04),gap=mobile?28:32,placed=[],scale=width/1440;
 const reserved=mobile?[]:[{x:margin,y:0,w:width*.25,h:width*.29+50},{x:width*.70,y:0,w:width*.26,h:80},(measuredIntro||{x:width*.35,y:width*.25-20,w:width*.33,h:Math.max(160,width*.12)}),...(measuredToolbar?[measuredToolbar]:[])];
 orderedPhotos.forEach((p,i)=>{const slot=photos[i]||p;const w=Math.round(width*(mobile?.52+rand()*.22:slot.size*(width<950?1.12:1))*(mobile?1:.93+rand()*.14));const h=Math.ceil(w/p.ratio)+56;let x=Math.round(Math.max(margin,Math.min(width-margin-w,mobile?(i%2?width-margin-w:margin):width*slot.x+(rand()-.5)*width*.025)));let y=mobile?(i?placed[i-1].y+placed[i-1].h+40+Math.round(rand()*60):10):Math.max(0,Math.round((slot.y+(rand()-.5)*40)*scale));if(orderedPhotos!==photos&&i)y=Math.max(y,placed[i-1].y+gap);const box={x,y,w,h};
 // Keep the first selected photograph above the introduction when the upper canvas has room.
 if(!mobile&&i===0&&measuredIntro){
  const photoRoom=measuredIntro.y-gap-24-56;
  const safeLeft=margin+width*.25+gap,safeRight=Math.min(width*.70,measuredToolbar?.x??width)-gap;
  if(photoRoom>=90&&safeRight-safeLeft>=90){
   box.w=Math.min(box.w,Math.floor(photoRoom*p.ratio),Math.floor(safeRight-safeLeft));
   box.h=Math.ceil(box.w/p.ratio)+56;
   box.x=Math.max(Math.ceil(safeLeft),Math.min(box.x,Math.floor(safeRight-box.w)));
   box.y=Math.max(0,Math.min(box.y,Math.floor(measuredIntro.y-gap-box.h)));
  }
 }
 for(let attempt=0;attempt<photos.length+reserved.length+1;attempt++){const blockers=[...reserved,...placed].filter(b=>collides(box,b,gap));if(!blockers.length)break;box.y=Math.max(...blockers.map(b=>b.y+b.h))+gap+Math.round(rand()*25)}placed.push(box)});return{boxes:placed,reserved,height:Math.ceil(Math.max(0,...placed.map(b=>b.y+b.h),...(placed.length?[]:reserved.map(b=>b.y+b.h)))+50)}}
root.PortfolioLayout={photos,compose,collides};if(typeof module!=='undefined')module.exports=root.PortfolioLayout;
})(typeof window!=='undefined'?window:globalThis);





