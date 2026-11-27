(function () {
  'use strict';
  var cfg = window.ABOUTBUZZ || { links: {} };

  // 1) Povezave na WordPress iz config.js
  document.querySelectorAll('[data-link]').forEach(function (el) {
    var url = cfg.links && cfg.links[el.getAttribute('data-link')];
    if (url) el.setAttribute('href', url);
  });

  // 1b) Video predvajalniki: video se naloži šele ob kliku na Play
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.player[data-video] .play');
    if (!btn) return;
    var pl = btn.closest('.player');
    document.querySelectorAll('.player video').forEach(function (v) { v.pause(); });
    var v = document.createElement('video');
    v.src = pl.getAttribute('data-video');
    v.controls = true; v.playsInline = true; v.setAttribute('playsinline', '');
    pl.insertBefore(v, pl.querySelector('.badge-img'));
    ['.poster', '.stars', '.lang-chip'].forEach(function (sel) { var el = pl.querySelector(sel); if (el) el.hidden = true; });
    btn.hidden = true;
    v.play().catch(function () {});
    v.focus();
  });

  // 2) Mobilni meni
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // 3) Kontaktni obrazec → WordPress
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var show = function (msg, ok) {
      status.hidden = false;
      status.textContent = msg;
      status.className = 'form-status ' + (ok ? 'form-status--ok' : 'form-status--err');
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.website && form.website.value) return; // past za robote
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {
        name: form.name.value.trim(),
        company: form.company.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim()
      };
      if (!cfg.contactEndpoint) {
        var body = data.message + '\n\n' + data.name + (data.company ? ', ' + data.company : '') + '\n' + data.email;
        window.location.href = 'mailto:' + cfg.contactEmail + '?subject=' + encodeURIComponent('aboutbuzz inquiry') + '&body=' + encodeURIComponent(body);
        show('Your email app should open with the message ready. If it does not, write to ' + cfg.contactEmail + '.', true);
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      var payload = data;
      if (cfg.contactFields) {
        payload = {};
        Object.keys(cfg.contactFields).forEach(function (k) { payload[cfg.contactFields[k]] = data[k]; });
      }
      fetch(cfg.contactEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || res.j.is_valid === false) throw new Error('invalid');
          form.reset();
          show('Thank you. We received your message and will reply within 24 hours.', true);
        })
        .catch(function () { show('The message could not be sent. Please try again, or write to ' + cfg.contactEmail + '.', false); })
        .then(function () { btn.disabled = false; });
    });
  }

  // 4) Stran z video ocenami
  var grid = document.getElementById('reviews-grid');
  if (grid) {
    var PAGE = 24;
    var moreBtn = document.getElementById('load-more');
    var state = { cat: 'All', lang: 'All', q: '', limit: PAGE };
    var all = [];
    var tones = ['#0E2A30', '#01798C', '#015566'];
    var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    var star = '<svg width="16" height="16" viewBox="0 0 24 24" fill="#E39B0B" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.9-4.7 4.5 1.2 6.4L12 17.4 6.3 20.5l1.2-6.4L2.8 9.6l6.4-.9z"/></svg>';

    // Uradni EU registrirani znački (obvezni po zakonu): Verified Tester / Verified Purchase
    var badgeImg = function (label) {
      var tester = /tester/i.test(label || '');
      return '<img class="badge-img" src="assets/img/badge-verified-' + (tester ? 'tester' : 'purchase') + '.png" alt="Authentic Verified ' + (tester ? 'Tester' : 'Purchase') + '" width="260" height="77">';
    };
    var card = function (r, i) {
      var media = r.video
        ? '<video src="' + esc(r.video) + '"' + (r.poster ? ' poster="' + esc(r.poster) + '"' : '') + ' controls preload="none" playsinline></video>'
        : '<span class="play" aria-hidden="true"><svg width="28" height="28" viewBox="0 0 24 24" fill="#01798C"><path d="M8 5.5v13l11-6.5z"/></svg></span>';
      var rating = Number(r.rating) || 5, stars = '';
      for (var s = 1; s <= 5; s++) {
        if (rating >= s) stars += star;
        else if (rating >= s - 0.5) stars += '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="h' + i + '"><stop offset="50%" stop-color="#E39B0B"/><stop offset="50%" stop-color="#C9D3D5"/></linearGradient></defs><path fill="url(#h' + i + ')" d="M12 2.8l2.8 5.9 6.4.9-4.7 4.5 1.2 6.4L12 17.4 6.3 20.5l1.2-6.4L2.8 9.6l6.4-.9z"/></svg>';
        else stars += star.replace('#E39B0B', '#C9D3D5');
      }
      var langChip = r.lang ? '<span class="lang-chip">' + esc(r.lang) + '</span>' : '';
      return '<article class="review">' +
        '<div class="player" style="background:' + tones[i % 3] + '">' + media + langChip + badgeImg(r.badge) + '</div>' +
        '<div class="review-body">' +
          '<div class="review-meta"><span class="stars" role="img" aria-label="' + (r.rating || 5) + ' out of 5 stars">' + stars + '</span>' + (r.useful ? '<span>' + esc(r.useful) + ' useful</span>' : '') + '</div>' +
          (r.transcript ? '<div><div class="review-label">Transcript</div><p style="font-size:15px;color:var(--muted)">' + esc(r.transcript) + '</p></div>' : '') +
          '<p>' + esc(r.text) + '</p>' +
          '<div class="review-brand">' + esc(r.brand) + '</div>' +
        '</div></article>';
    };

    var chipRow = function (id, key, values) {
      var row = document.getElementById(id);
      row.innerHTML = ['All'].concat(values).map(function (v) {
        return '<button type="button" class="chip" aria-pressed="' + (state[key] === v) + '" data-v="' + esc(v) + '">' + esc(v) + '</button>';
      }).join('');
      row.onclick = function (e) {
        var b = e.target.closest('button'); if (!b) return;
        state[key] = b.getAttribute('data-v'); state.limit = PAGE; render();
      };
    };

    var uniq = function (k) { return all.map(function (r) { return r[k]; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }); };

    var render = function () {
      chipRow('cat-chips', 'cat', uniq('category'));
      chipRow('lang-chips', 'lang', uniq('lang'));
      var q = state.q.trim().toLowerCase();
      var shown = all.filter(function (r) {
        return (state.cat === 'All' || r.category === state.cat) &&
          (state.lang === 'All' || r.lang === state.lang) &&
          (!q || [r.text, r.brand, r.transcript].join(' ').toLowerCase().indexOf(q) !== -1);
      });
      var visible = shown.slice(0, state.limit);
      grid.innerHTML = visible.map(card).join('');
      document.getElementById('reviews-empty').hidden = shown.length > 0;
      document.getElementById('reviews-count').textContent = 'Showing ' + visible.length + ' of ' + shown.length + ' reviews';
      if (moreBtn) moreBtn.hidden = shown.length <= visible.length;
    };

    document.getElementById('q-search').addEventListener('input', function (e) { state.q = e.target.value; state.limit = PAGE; render(); });
    if (moreBtn) moreBtn.addEventListener('click', function () {
      var first = state.limit;
      state.limit += PAGE; render();
      var next = grid.children[first]; if (next) { var b = next.querySelector('button, video'); if (b) b.focus({ preventScroll: true }); }
    });

    var src = cfg.reviewsEndpoint || 'assets/data/reviews.json';
    // Enotna imena jezikov (WordPress ima mešano slovenska/angleška imena)
    var langNames = { 'Slovenščina': 'Slovenian', 'Angleščina': 'English', 'Nemščina': 'German', 'Ruščina': 'Russian', 'Latvian': 'Latvian', 'Turkish': 'Turkish' };
    var toList = function (data) { return Array.isArray(data) ? data : ((data && data.reviews) || []); };
    var sample = function () { return fetch('assets/data/reviews.json').then(function (r) { return r.json(); }).then(toList).catch(function () { return []; }); };
    var getJSON = function (url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); };
    var withPage = function (url, n) { return url + (url.indexOf('?') === -1 ? '?' : '&') + 'page=' + n; };
    var loadAll = function () {
      if (!cfg.reviewsEndpoint) return getJSON(src);
      // WordPress vrne največ 100 na stran: naloži prvo, nato ostale vzporedno
      return getJSON(withPage(src, 1)).then(function (first) {
        var per = (first.reviews || []).length || 100;
        var pages = Math.ceil((first.total || 0) / per), rest = [];
        for (var n = 2; n <= pages && n <= 20; n++) rest.push(getJSON(withPage(src, n)).catch(function () { return { reviews: [] }; }));
        return Promise.all(rest).then(function (more) {
          return { reviews: more.reduce(function (acc, d) { return acc.concat(d.reviews || []); }, first.reviews || []) };
        });
      });
    };
    loadAll()
      .then(function (data) { var list = toList(data); if (!list.length) throw new Error('empty'); return list; })
      .catch(sample)
      .then(function (list) {
        var bad = function (v) { return !v || v === '0' || v === 'Array'; };
        all = list.map(function (r) {
          if (bad(r.category)) r.category = '';
          if (bad(r.brand)) r.brand = '';
          r.lang = (cfg.brandLanguage && cfg.brandLanguage[r.brand]) || langNames[r.lang] || r.lang || '';
          return r;
        });
        render();
      });
  }
})();
