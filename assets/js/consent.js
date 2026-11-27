/*
 * aboutbuzz – obvestilo o piškotkih in nalaganje analitike po soglasju
 * - brez soglasja se NE naloži ne Google Analytics ne Meta Pixel
 * - izbira se hrani 12 mesecev v brskalniku obiskovalca (abz_consent)
 * - "Cookie settings" v nogi znova odpre nastavitve
 */
(function () {
  'use strict';
  var cfg = window.ABOUTBUZZ || {};
  var an = cfg.analytics || {};
  var KEY = 'abz_consent', VERSION = 1, MAX_AGE = 365 * 24 * 3600 * 1000;
  var loaded = { ga: false, meta: false };

  function read() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (c && c.v === VERSION && Date.now() - c.ts < MAX_AGE) return c;
    } catch (e) {}
    return null;
  }
  function save(stats, mkt) {
    var c = { v: VERSION, ts: Date.now(), statistics: !!stats, marketing: !!mkt };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    apply(c);
    return c;
  }

  function loadScript(src) { var s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); }

  function apply(c) {
    // Google Analytics 4 (z Google Consent Mode v2)
    if (an.ga4) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      var state = {
        analytics_storage: c.statistics ? 'granted' : 'denied',
        ad_storage: c.marketing ? 'granted' : 'denied',
        ad_user_data: c.marketing ? 'granted' : 'denied',
        ad_personalization: c.marketing ? 'granted' : 'denied'
      };
      if (!loaded.ga && c.statistics) {
        window.gtag('consent', 'default', state);
        window.gtag('js', new Date());
        window.gtag('config', an.ga4);
        loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(an.ga4));
        loaded.ga = true;
      } else if (loaded.ga) {
        window.gtag('consent', 'update', state);
      }
    }
    // Meta Pixel
    if (an.metaPixel && c.marketing && !loaded.meta) {
      /* eslint-disable */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      window.fbq('init', an.metaPixel);
      window.fbq('track', 'PageView');
      loaded.meta = true;
    } else if (loaded.meta && !c.marketing && window.fbq) {
      window.fbq('consent', 'revoke');
    }
  }

  // ---------- obvestilo ----------
  var bar;
  function build() {
    bar = document.createElement('section');
    bar.className = 'consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-labelledby', 'consent-title');
    bar.innerHTML =
      '<div class="consent-inner">' +
        '<div class="consent-text">' +
          '<h2 id="consent-title">Cookies on aboutbuzz</h2>' +
          '<p>We use necessary cookies to run this site. With your permission we also use statistics cookies (Google Analytics) to see how the site is used, and marketing cookies (Meta Pixel) to measure our ads. ' +
          (cfg.privacyUrl ? '<a href="' + cfg.privacyUrl + '">More information</a>' : '') + '</p>' +
          '<div class="consent-options" hidden>' +
            '<label><input type="checkbox" checked disabled> Necessary <span>always on</span></label>' +
            '<label><input type="checkbox" id="consent-stats"> Statistics <span>Google Analytics</span></label>' +
            '<label><input type="checkbox" id="consent-mkt"> Marketing <span>Meta Pixel</span></label>' +
          '</div>' +
        '</div>' +
        '<div class="consent-actions">' +
          '<button type="button" class="btn btn--primary" data-c="reject">Reject all</button>' +
          '<button type="button" class="btn btn--ghost" data-c="settings">Settings</button>' +
          '<button type="button" class="btn btn--ghost" data-c="save" hidden>Save choices</button>' +
          '<button type="button" class="btn btn--primary" data-c="accept">Accept all</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]'); if (!b) return;
      var a = b.getAttribute('data-c');
      if (a === 'accept') { save(true, true); close(); }
      if (a === 'reject') { save(false, false); close(); }
      if (a === 'settings') {
        bar.querySelector('.consent-options').hidden = false;
        b.hidden = true; bar.querySelector('[data-c="save"]').hidden = false;
        var c = read() || {};
        bar.querySelector('#consent-stats').checked = !!c.statistics;
        bar.querySelector('#consent-mkt').checked = !!c.marketing;
        bar.querySelector('#consent-stats').focus();
      }
      if (a === 'save') { save(bar.querySelector('#consent-stats').checked, bar.querySelector('#consent-mkt').checked); close(); }
    });
  }
  function open(withSettings) {
    if (!bar) build();
    bar.hidden = false;
    if (withSettings) bar.querySelector('[data-c="settings"]').click();
    else bar.querySelector('[data-c="accept"]').focus({ preventScroll: true });
  }
  function close() { if (bar) bar.hidden = true; }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cookie-settings]')) { e.preventDefault(); open(true); }
  });

  var existing = read();
  if (existing) apply(existing);
  else if (an.ga4 || an.metaPixel) open(false);
})();
