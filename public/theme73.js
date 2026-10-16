/* Set background and readable ink before first paint, also for direct project links. */
(function(){
 const home='#faf9f6',dark='#161616',light='#ffffff';
 function resolve(project){return PortfolioProjects.projectAppearance(project).color}
 function luminance(hex){const values=hex.replace('#','').match(/.{2}/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return values.reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)}
 function inkFor(color){const background=luminance(color),ink=luminance(dark);return 1.05/(background+.05)>(background+.05)/(ink+.05)?light:dark}
 function apply(project){const root=document.documentElement,color=resolve(project);root.style.setProperty('--page-bg-transition',project&&project.transitionEnabled===false?'0s':'1.2s');root.style.setProperty('--page-bg',color);root.style.setProperty('--page-ink',inkFor(color));root.style.setProperty('--footer-ink',inkFor(color))}
 window.PortfolioTheme={resolve,apply,home,inkFor};apply(PortfolioProjects.projectFromHash(location.hash));
})();

