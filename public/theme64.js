/* Thema voor de eerste paint, directe project-URL's en alle hash-navigatie. */
(function(){const home='#faf9f6';function resolve(project){return PortfolioProjects.projectAppearance(project).color}function apply(project){const root=document.documentElement;root.style.setProperty('--page-bg-transition',project&&project.transitionEnabled===false?'0s':'0.5s');root.style.setProperty('--page-bg',resolve(project))}window.PortfolioTheme={resolve,apply,home};apply(PortfolioProjects.projectFromHash(location.hash));})();


