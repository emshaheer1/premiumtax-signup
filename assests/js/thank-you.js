(function () {
  var LOGO_PATHS = ['assets/img/pta-logo.png', 'assets/img/logo.png', 'img/pta-logo.png', 'pta-logo.png'];
  var tyImg = document.getElementById('tyLogo');
  var tyFallback = document.getElementById('tyLogoFallback');
  if (tyImg) {
    var tried = 0;
    tyImg.onerror = function () {
      tried++;
      if (tried < LOGO_PATHS.length) tyImg.src = LOGO_PATHS[tried];
      else if (tyFallback) { tyImg.style.display = 'none'; tyFallback.hidden = false; }
    };
    tyImg.onload = function () { if (tyFallback) tyFallback.hidden = true; };
    if (tyFallback) tyFallback.hidden = true;
  }

  if (typeof gsap === 'undefined') return;

  var logoWrap = document.querySelector('.ty-logo-wrap');
  var iconWrap = document.querySelector('.ty-icon-wrap');
  var title = document.querySelector('.ty-title');
  var message = document.querySelector('.ty-message');
  var sub = document.querySelector('.ty-sub');
  var btn = document.querySelector('.btn-ty-back');

  gsap.set([logoWrap, title, message, sub, btn], { opacity: 0, y: 24, scale: 0.96 });
  gsap.set(iconWrap, { opacity: 0, scale: 0.5 });

  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.to(logoWrap, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, 0)
    .to(iconWrap, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)' }, 0.2)
    .add(function () { iconWrap.classList.add('done'); }, 0.5)
    .to(title, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, 0.6)
    .to(message, { opacity: 1, y: 0, scale: 1, duration: 0.45 }, 0.8)
    .to(sub, { opacity: 1, y: 0, scale: 1, duration: 0.45 }, 0.95)
    .to(btn, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.2)' }, 1.1);
})();
