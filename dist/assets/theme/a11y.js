// Accessibility toolbar (Israeli Standard SI 5568 / WCAG 2.1 AA support tools).
// Loaded in <head> so saved preferences apply before the page paints. Preferences persist per visitor.
(function () {
  var d = document, root = d.documentElement, KEY = 'a11y-prefs';
  var prefs = {};
  try { prefs = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { prefs = {}; }

  var TOGGLES = [
    { id: 'contrast', label: 'High contrast', icon: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>' },
    { id: 'invert', label: 'Negative contrast', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 3l18 18"/>' },
    { id: 'gray', label: 'Grayscale', icon: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>' },
    { id: 'light', label: 'Light background', icon: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>' },
    { id: 'links', label: 'Highlight links', icon: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>' },
    { id: 'headings', label: 'Highlight headings', icon: '<path d="M6 4v16M18 4v16M6 12h12"/>' },
    { id: 'font', label: 'Readable font', icon: '<path d="M4 20 10 4h1l6 16M6.5 14h8"/>' },
    { id: 'spacing', label: 'Text spacing', icon: '<path d="M4 6h16M4 12h16M4 18h16"/><path d="M2 3v18M22 3v18"/>' },
    { id: 'cursor', label: 'Big cursor', icon: '<path d="M5 3l14 7-6 2-2 6z"/>' },
    { id: 'focus', label: 'Keyboard focus', icon: '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 11h.01M11 11h.01M15 11h.01M8 14h8"/>' },
    { id: 'stop', label: 'Stop animations', icon: '<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>' },
  ];
  var SIZES = [1, 1.12, 1.25, 1.4];

  function save() { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) {} }
  function apply() {
    TOGGLES.forEach(function (t) { root.classList.toggle('a11y-' + t.id, !!prefs[t.id]); });
    var s = SIZES[prefs.size || 0] || 1;
    root.style.setProperty('--a11y-zoom', s);
    root.classList.toggle('a11y-zoom', s !== 1);
    // "Stop animations" reuses the site's own motion switch (which also stops the 3D sea).
    try {
      var want = prefs.stop ? 'off' : (localStorage.getItem('motion-by-a11y') === '1' ? 'on' : null);
      if (prefs.stop) { if (localStorage.getItem('motion') !== 'off') { localStorage.setItem('motion', 'off'); localStorage.setItem('motion-by-a11y', '1'); } }
      else if (want === 'on') { localStorage.setItem('motion', 'on'); localStorage.removeItem('motion-by-a11y'); }
    } catch (e) {}
    if (prefs.stop) root.classList.add('no-motion');
  }
  apply();

  function build() {
    var wrap = d.createElement('div');
    wrap.className = 'a11y';
    wrap.setAttribute('dir', 'ltr');
    wrap.innerHTML =
      '<button type="button" class="a11y-fab" aria-expanded="false" aria-controls="a11y-panel">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4" r="2"/><path d="M4 8.5c2.6.8 5.3 1.2 8 1.2s5.4-.4 8-1.2M12 9.7V15m0 0-3 6.5M12 15l3 6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
        '<span class="sr-only">Accessibility menu</span></button>' +
      '<div class="a11y-panel" id="a11y-panel" role="dialog" aria-modal="false" aria-labelledby="a11y-title" hidden>' +
        '<div class="a11y-head"><h2 id="a11y-title">Accessibility</h2><button type="button" class="a11y-close" aria-label="Close accessibility menu">&times;</button></div>' +
        '<div class="a11y-size" role="group" aria-label="Text size">' +
          '<span>Text size</span>' +
          '<button type="button" data-size="-1" aria-label="Decrease text size">A&minus;</button>' +
          '<output aria-live="polite"></output>' +
          '<button type="button" data-size="1" aria-label="Increase text size">A+</button>' +
        '</div>' +
        '<div class="a11y-grid">' + TOGGLES.map(function (t) {
          return '<button type="button" class="a11y-opt" data-opt="' + t.id + '" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + t.icon + '</svg><span>' + t.label + '</span></button>';
        }).join('') + '</div>' +
        '<div class="a11y-foot"><button type="button" class="a11y-reset">Reset all settings</button><a href="/accessibility/">Accessibility statement</a></div>' +
      '</div>';
    d.body.appendChild(wrap);

    var fab = wrap.querySelector('.a11y-fab'), panel = wrap.querySelector('.a11y-panel'), out = wrap.querySelector('output');
    function sync() {
      wrap.querySelectorAll('[data-opt]').forEach(function (b) { b.setAttribute('aria-pressed', !!prefs[b.dataset.opt]); });
      out.textContent = Math.round((SIZES[prefs.size || 0] || 1) * 100) + '%';
    }
    function open(v) {
      fab.setAttribute('aria-expanded', v);
      panel.hidden = !v;
      if (v) panel.querySelector('button').focus(); else fab.focus();
    }
    fab.addEventListener('click', function () { open(panel.hidden); });
    wrap.querySelector('.a11y-close').addEventListener('click', function () { open(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) open(false); });
    d.addEventListener('click', function (e) { if (!panel.hidden && !wrap.contains(e.target)) { fab.setAttribute('aria-expanded', false); panel.hidden = true; } });
    wrap.querySelectorAll('[data-size]').forEach(function (b) {
      b.addEventListener('click', function () {
        prefs.size = Math.max(0, Math.min(SIZES.length - 1, (prefs.size || 0) + (+b.dataset.size)));
        save(); apply(); sync();
      });
    });
    wrap.querySelectorAll('[data-opt]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.opt;
        prefs[id] = !prefs[id];
        if (id === 'contrast' && prefs[id]) { prefs.invert = false; prefs.light = false; }
        if (id === 'invert' && prefs[id]) { prefs.contrast = false; prefs.light = false; }
        if (id === 'light' && prefs[id]) { prefs.contrast = false; prefs.invert = false; }
        save(); apply(); sync();
        if (id === 'stop') location.reload();
      });
    });
    wrap.querySelector('.a11y-reset').addEventListener('click', function () {
      var hadStop = prefs.stop; prefs = {}; save(); apply(); sync();
      if (hadStop) location.reload();
    });
    sync();
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', build); else build();
})();
