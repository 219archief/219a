/* Bewaar de normale tekstmaat, zodat de hovertekst geen links verplaatst. */
(function () {
  const selector = 'header nav a,.back-link,.project-navigation a,footer a,.colophon a';
  function prepareLinks() {
    document.querySelectorAll(selector).forEach(link => {
      if (link.classList.contains('honk-link')) return;
      if(link.matches('.footer-action')){const label=link.querySelector('.footer-action-label'),text=label.textContent,copy=document.createElement('span');copy.className='honk-original';copy.textContent=text;label.replaceChildren(copy);label.classList.add('honk-label');label.dataset.text=text;link.classList.add('honk-link');return;}
      const part = link.matches('.back-link,.project-navigation a,footer a') ? PortfolioDetails.split(link.textContent) : {text:link.textContent};
      const text = part.text;
      const label = document.createElement('span');
      label.className = 'honk-label';
      label.dataset.text = text;
      const original = document.createElement('span');
      original.className = 'honk-original';
      original.textContent = text;
      label.append(original);
      link.replaceChildren();
      if(part.name){link.classList.add('pixel-control');if(part.leading)link.append(PortfolioDetails.icon(part.name));}
      link.append(label);
      if(part.name&&!part.leading)link.append(PortfolioDetails.icon(part.name));
      link.classList.add('honk-link');
    });
  }
  prepareLinks();
  const navigation = document.querySelector('#project-navigation');
  if (navigation) new MutationObserver(prepareLinks).observe(navigation, { childList: true });
})();

