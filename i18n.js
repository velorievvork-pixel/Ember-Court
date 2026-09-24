window.EmberI18n = (function(){
  function apply(dict, lang){
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll('.langsw button').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    try { localStorage.setItem('ec-lang', lang); } catch(e) {}
  }

  function init(I18N){
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.langsw button'));
    function set(lang){
      apply(I18N[lang] || I18N.ru, lang);
    }
    buttons.forEach(function(b){
      b.addEventListener('click', function(){ set(b.getAttribute('data-lang')); });
    });
    var saved = 'ru';
    try { saved = localStorage.getItem('ec-lang') || 'ru'; } catch(e) {}
    set(I18N[saved] ? saved : 'ru');
  }

  return { init: init };
})();


(function(){
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e) {}
  document.addEventListener('DOMContentLoaded', function(){
    // drifting embers in the hero
    var host = document.querySelector('.hero-embers');
    if (host && !reduce){
      for (var i = 0; i < 14; i++){
        var s = document.createElement('i');
        s.style.left = (Math.random() * 100) + '%';
        s.style.setProperty('--d', (7 + Math.random() * 7).toFixed(1) + 's');
        s.style.setProperty('--delay', (-Math.random() * 12).toFixed(1) + 's');
        s.style.setProperty('--x', ((Math.random() - 0.5) * 80).toFixed(0) + 'px');
        host.appendChild(s);
      }
    }
  });
})();
