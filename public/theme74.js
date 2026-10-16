/* Keep the original dark text on every solid project background. */
(function(){
 const home='#faf9f6',dark='#161616';
 function resolve(project){return PortfolioProjects.projectAppearance(project).color}
 function inkFor(){return dark}
 function apply(project){const root=document.documentElement,color=resolve(project);root.style.setProperty('--page-bg-transition',project&&project.transitionEnabled===false?'0s':'1s');root.style.setProperty('--page-bg',color);root.style.setProperty('--page-ink',dark);root.style.setProperty('--footer-ink',dark)}
 window.PortfolioTheme={resolve,apply,home,inkFor};apply(PortfolioProjects.projectFromHash(location.hash));
})();
