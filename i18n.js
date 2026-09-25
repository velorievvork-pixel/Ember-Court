window.EmberI18n = (function(){
  function apply(dict, lang){
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll('.langsw button').forEach(function(b){
      b.setAttribute('aria-current', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    document.documentElement.lang = lang;
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


