/* Comfy Stay — λογική ιστοσελίδας */
(() => {
  'use strict';
  const C = window.COMFY;
  // Κενά στοιχεία (null/false) δεν εμφανίζονται ποτέ ως κείμενο «null»
  const nativeReplace = Element.prototype.replaceChildren;
  Element.prototype.replaceChildren = function (...kids) {
    return nativeReplace.apply(this, kids.flat(Infinity).filter((k) => k != null && k !== false));
  };
  const T = window.I18N;
  const DEMO = !C.apiBase;
  // false: χωρίς online κρατήσεις — οι επισκέπτες κλείνουν σε Booking.com / Airbnb ή επικοινωνούν μαζί μας
  const DIRECT = C.directBooking === true;
  // Εμφάνιση τιμής «από … / νύχτα» (το config έχει showPrices: false)
  const PRICES = C.showPrices !== false;
  const qs = new URLSearchParams(location.search);
  const page = document.body.dataset.page;

  // ─── Γλώσσα ───
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };
  let lang = qs.get('lang') || store.get('cs_lang') || (navigator.language || 'el').slice(0, 2).toLowerCase();
  if (!C.languages.includes(lang)) lang = C.languages.includes('en') ? 'en' : C.languages[0];
  document.documentElement.lang = lang === 'sr' ? 'sr-Latn' : lang;
  const LOCALES = { el: 'el-GR', en: 'en-GB', de: 'de-DE', bg: 'bg-BG', sr: 'sr-Latn-RS', ru: 'ru-RU', ro: 'ro-RO', fr: 'fr-FR', it: 'it-IT', tr: 'tr-TR' };
  const locale = () => LOCALES[lang] || lang;

  function t(key, vars = {}) {
    let s = (T[lang] && T[lang][key]) ?? (T.en && T.en[key]) ?? key;
    if (s.includes('|') && 'n' in vars) {
      // 2 μορφές: ενικός|πληθυντικός. 3 μορφές (ρωσικά, σερβικά): one|few|many
      const forms = s.split('|');
      const n = Number(vars.n);
      if (forms.length >= 3) {
        const cat = new Intl.PluralRules(locale()).select(n);
        s = forms[cat === 'one' ? 0 : cat === 'few' ? 1 : 2];
      } else s = forms[n === 1 ? 0 : 1];
    }
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
    return s;
  }
  const L = (o) => (o == null ? '' : typeof o === 'string' ? o : o[lang] ?? o.en ?? o.el ?? '');
  const nightsLabel = (n) => t('nights', { n });

  // ─── Ημερομηνίες ───
  const parseD = (s) => new Date(s + 'T00:00:00Z');
  const iso = (d) => d.toISOString().slice(0, 10);
  const addDays = (s, n) => { const d = parseD(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
  const diff = (a, b) => Math.round((parseD(b) - parseD(a)) / 864e5);
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Athens' }).format(new Date());
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && !isNaN(parseD(s));
  const fmtDate = (s, opts = { day: 'numeric', month: 'short' }) => new Intl.DateTimeFormat(locale(), { ...opts, timeZone: 'UTC' }).format(parseD(s));
  const money = (n) => new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(n);

  // ─── Βοηθητικά DOM ───
  const $ = (sel, root = document) => root.querySelector(sel);
  function h(tag, attrs = {}, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : String(kid));
    return el;
  }
  const withLang = (href) => href + (href.includes('?') ? '&' : '?') + 'lang=' + lang;
  const propById = (id) => C.properties.find((p) => p.id === id);
  // Στη σελίδα εμφανίζονται μόνο τα καταλύματα που έχουν φωτογραφίες (ή show: true στο config)
  const visible = C.properties.filter((p) => p.show === true || (p.show !== false && p.photos && p.photos.length));
  const visibleCities = C.cities.filter((c) => visible.some((p) => p.city === c.id));

  // ─── API (ή δοκιμαστικά δεδομένα) ───
  async function api(path, opts) {
    const res = await fetch(C.apiBase.replace(/\/$/, '') + path, opts);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(body.error || 'error'); e.code = body.error; throw e; }
    return body;
  }

  function demoBlocked(id) {
    // Σταθερά "πιασμένα" διαστήματα για να φαίνεται πώς δουλεύει το ημερολόγιο
    let seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const out = [];
    let cursor = addDays(today(), 2 + (seed % 4));
    for (let i = 0; i < 8; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const len = 2 + (seed % 4);
      out.push({ start: cursor, end: addDays(cursor, len) });
      cursor = addDays(cursor, len + 3 + (seed % 7));
    }
    return out;
  }

  const availCache = new Map();
  async function getAvailability(id) {
    if (availCache.has(id)) return availCache.get(id);
    const p = propById(id);
    const promise = DEMO
      ? Promise.resolve({ blocked: demoBlocked(id), minNights: p.minNights || 2, maxGuests: p.maxGuests })
      : api(`/api/availability?property=${encodeURIComponent(id)}`);
    availCache.set(id, promise);
    promise.catch(() => availCache.delete(id));
    return promise;
  }

  async function getQuote(id, checkin, checkout, guests) {
    if (!DEMO) return api(`/api/quote?property=${encodeURIComponent(id)}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`);
    const p = propById(id);
    const nights = diff(checkin, checkout);
    const cleaning = p.cleaningFee ?? 25;
    let stay = 0;
    for (let i = 0; i < nights; i++) {
      const dow = parseD(addDays(checkin, i)).getUTCDay(); // Παρασκευή/Σάββατο βράδυ
      stay += (dow === 5 || dow === 6) && p.weekendPrice ? p.weekendPrice : p.fromPrice;
    }
    const lines = [{ type: 'stay', nights, amount: stay }];
    if (cleaning) lines.push({ type: 'cleaning', amount: cleaning });
    return { nights, lines, total: lines.reduce((s, l) => s + l.amount, 0) };
  }

  const overlaps = (blocked, a, b) => blocked.some((r) => r.start < b && a < r.end);
  const isTakenNight = (blocked, d) => blocked.some((r) => r.start <= d && d < r.end);

  function errText(e) {
    const k = 'err_' + (e && e.code);
    return T[lang] && T[lang][k] ? t(k) : t('err_generic');
  }

  // ─── Κοινά: header / footer ───
  function renderChrome() {
    const head = $('#site-head');
    if (head) {
      const dark = head.classList.contains('is-dark');
      head.classList.toggle('on-light', !dark);
      head.replaceChildren(
        h('div', { class: 'wrap' },
          h('a', { class: 'brand', href: withLang('index.html'), 'aria-label': C.brand }, C.logo ? h('img', { src: C.logo, alt: '', width: 56, height: 56 }) : null, h('span', { class: 'brand-text' }, 'ComfyStay')),
          h('nav', { 'aria-label': 'main' },
            h('a', { class: 'nav-link', href: withLang('index.html#stays') }, t('nav_stays')),
            C.termsPage ? h('a', { class: 'nav-link', href: withLang('terms.html') }, t('nav_terms')) : null,
            h('a', { class: 'nav-link', href: '#contact' }, t('nav_contact')),
            C.languages.length > 1
              ? h('div', { class: 'lang-switch', role: 'group', 'aria-label': 'Language' },
                  C.languages.map((l) => h('button', {
                    type: 'button', 'aria-pressed': String(l === lang), title: (T[l] && T[l].langName) || l,
                    onclick: () => { store.set('cs_lang', l); const u = new URL(location.href); u.searchParams.set('lang', l); location.href = u.toString(); },
                  }, h('span', {}, l.toUpperCase()))))
              : null,
          ),
        ),
      );
    }
    if (DIRECT && DEMO && page !== 'admin') document.body.prepend(h('div', { class: 'demo-banner', role: 'status' }, t('demo_banner')));

    const foot = $('#site-foot');
    if (foot) {
      const amas = visible.filter((p) => C.showAma && p.ama).map((p) => h('li', {}, `${p.name}: ${t('ama', { n: p.ama })}`));
      foot.id = 'contact';
      foot.replaceChildren(
        h('div', { class: 'wrap' },
          h('div', {}, C.logo ? h('img', { src: C.logo, alt: C.brand, width: 96, height: 96, style: 'border-radius:6px;margin-bottom:12px' }) : h('span', { class: 'brand' }, C.brand), h('p', {}, t('footer_note')), amas.length ? h('ul', {}, amas) : null),
          h('div', {}, h('h4', {}, t('nav_contact')),
            h('ul', {},
              phoneList().map((ph) => h('li', {}, phoneRow(ph, false))),
              C.contact.email ? h('li', {}, `${t('write_us')}: `, h('a', { href: 'mailto:' + C.contact.email }, C.contact.email)) : null,
              instagramLink(false) ? h('li', {}, instagramLink(false)) : null,
            )),
          h('div', {}, h('h4', {}, t('nav_stays')),
            h('ul', {}, visible.map((p) => h('li', {}, h('a', { href: withLang(`stay.html?id=${p.id}`) }, p.name)))),
            C.termsPage ? h('p', { style: 'margin-top:12px' }, h('a', { href: withLang('terms.html') }, t('terms_title'))) : null),
        ),
      );
    }
  }

  const thumb = (src) => src.replace(/\.jpg$/, '-s.jpg');

  function photoOrPlaceholder(p, i = 0, small = false) {
    const src = p.photos && p.photos[i];
    if (src) return h('img', { src: small ? thumb(src) : src, alt: `${p.name} — ${i + 1}`, loading: i === 0 ? 'eager' : 'lazy', decoding: 'async' });
    return h('div', { class: 'ph', 'aria-hidden': 'true' }, h('span', {}, p.name), i === 0 ? h('small', {}, t('no_photos')) : null);
  }

  const SOURCES = { airbnb: 'Airbnb', booking: 'Booking.com', google: 'Google Maps' };

  // ─── Τηλέφωνα με Viber / WhatsApp, Instagram ───
  const GR_FLAG = '<svg class="flag" viewBox="0 0 27 18" aria-hidden="true"><rect width="27" height="18" fill="#0d5eaf"/><g fill="#fff"><rect y="2" width="27" height="2"/><rect y="6" width="27" height="2"/><rect y="10" width="27" height="2"/><rect y="14" width="27" height="2"/></g><rect width="10" height="10" fill="#0d5eaf"/><rect x="4" width="2" height="10" fill="#fff"/><rect y="4" width="10" height="2" fill="#fff"/></svg>';
  const phoneList = () => [].concat(C.contact.phones || C.contact.phone || []).map((x) => (typeof x === 'string' ? { number: x, whatsapp: true, viber: true } : x));
  const digits = (n) => n.replace(/[^\d]/g, '');
  const ICON_FALLBACK = { viber: 'V', whatsapp: 'W', instagram: 'IG' };
  const icon = (name) => h('i', { class: `fa-brands fa-${name}`, 'aria-hidden': 'true', 'data-l': ICON_FALLBACK[name] || '' });
  function phoneRow(ph, big) {
    const d = digits(ph.number);
    return h('div', { class: `phone-row${big ? ' big' : ''}` },
      h('a', { class: big ? 'btn btn-ghost phone-call' : 'phone-call', href: 'tel:+' + d, 'aria-label': t('call', { n: ph.number }) },
        h('span', { class: 'flag-wrap', html: GR_FLAG }), h('span', { class: 'num' }, ph.number)),
      ph.viber !== false ? h('a', { class: 'app-icon viber', href: 'viber://chat?number=%2B' + d, title: 'Viber', 'aria-label': `Viber ${ph.number}` }, icon('viber')) : null,
      ph.whatsapp !== false ? h('a', { class: 'app-icon whatsapp', href: 'https://wa.me/' + d, target: '_blank', rel: 'noopener', title: 'WhatsApp', 'aria-label': `WhatsApp ${ph.number}` }, icon('whatsapp')) : null);
  }
  function instagramLink(big) {
    const ig = (C.contact.instagram || '').replace(/^@/, '');
    if (!ig) return null;
    return h('a', { class: `insta${big ? ' btn btn-ghost' : ''}`, href: 'https://www.instagram.com/' + encodeURIComponent(ig) + '/', target: '_blank', rel: 'noopener', 'aria-label': 'Instagram @' + ig },
      h('span', { class: 'app-icon instagram' }, icon('instagram')), h('span', {}, '@' + ig));
  }
  function ratingsList(p) {
    const list = (p.ratings || []).filter((r) => r && r.score && SOURCES[r.source]);
    if (!list.length) return null;
    const num = (n, d) => new Intl.NumberFormat(locale(), { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
    return h('ul', { class: 'ratings', 'aria-label': t('ratings_label') }, list.map((r) => {
      const src = SOURCES[r.source];
      const scoreText = r.scale === 10 ? `${num(r.score, r.score % 1 ? 1 : 0)}/10` : `${num(r.score, r.scale === 5 ? (r.score % 1 ? 2 : 1) : 1)} ★`;
      const inner = [h('b', {}, scoreText), h('span', { class: 'r-src' }, src), r.count ? h('span', { class: 'r-count' }, t('reviews', { n: r.count })) : null];
      return h('li', { class: `rating r-${r.source}` },
        r.url ? h('a', { href: r.url, target: '_blank', rel: 'noopener', title: t('see_reviews', { src }) }, inner) : h('span', {}, inner));
    }));
  }

  function factsList(p) {
    return h('ul', { class: 'facts' },
      h('li', {}, t('guests_up_to', { n: p.maxGuests })),
      p.bedrooms ? h('li', {}, t('bedrooms', { n: p.bedrooms })) : null,
      p.beds ? h('li', {}, t('beds', { n: p.beds })) : null,
      p.baths ? h('li', {}, t('baths', { n: p.baths })) : null,
      p.size ? h('li', {}, t('size', { n: p.size })) : null,
    );
  }

  // ─── Αρχική ───
  function initHome() {
    document.title = `${C.brand} — ${t('hero_title')}`;
    $('#hero-title').textContent = t('hero_title');
    $('#hero-lead').textContent = t('hero_lead');
    const heroPhotos = (C.heroPhotos || (C.heroPhoto ? [{ src: C.heroPhoto }] : [])).filter((x) => x && x.src);
    if (heroPhotos.length) {
      // Φωτογραφίες που κυλάνε: μία κάθε φορά, με «Μείνετε στη …» και κουμπί προς τα καταλύματα της πόλης
      $('#hero-title').classList.add('sr-only');
      $('#hero-title').textContent = C.brand;
      const cityOf = (ph) => C.cities.find((c) => c.id === ph.city);
      const slides = heroPhotos.map((ph, i) => {
        const city = cityOf(ph);
        return h('figure', { class: 'slide', 'aria-roledescription': 'slide', 'aria-label': `${i + 1} / ${heroPhotos.length}` },
          h('img', { src: ph.src, alt: L(ph.caption) || '', fetchpriority: i === 0 ? 'high' : 'auto', loading: i === 0 ? 'eager' : 'lazy', style: ph.position ? `object-position:${ph.position}` : null }),
          h('div', { class: 'slide-text' },
            city ? h('p', { class: 'slide-title' }, t('stay_in', { in: L(city.nameIn) })) : null,
            city ? h('a', { class: 'btn btn-ochre', href: `#stays-${city.id}` }, t('view_stays')) : null),
          ph.credit ? h('figcaption', { class: 'credit' }, ph.creditUrl ? h('a', { href: ph.creditUrl, target: '_blank', rel: 'noopener' }, ph.credit) : ph.credit) : null);
      });
      const track = h('div', { class: 'slider-track' }, slides);
      let idx = 0;
      const dots = heroPhotos.length > 1 ? h('div', { class: 'slider-dots' }, heroPhotos.map((ph, i) =>
        h('button', { type: 'button', 'aria-label': `${i + 1} / ${heroPhotos.length}`, onclick: () => { go(i); restart(); } }))) : null;
      function go(n) {
        idx = (n + slides.length) % slides.length;
        track.style.transform = `translateX(${-100 * idx}%)`;
        slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== idx)));
        slides.forEach((s, k) => s.querySelectorAll('a').forEach((x) => (x.tabIndex = k === idx ? 0 : -1)));
        if (dots) [...dots.children].forEach((d, k) => d.setAttribute('aria-current', String(k === idx)));
      }
      const many = slides.length > 1;
      const slider = h('section', { class: 'slider', 'aria-roledescription': 'carousel', 'aria-label': C.brand },
        track,
        many ? h('button', { type: 'button', class: 'slider-nav prev', 'aria-label': t('photo_prev'), onclick: () => { go(idx - 1); restart(); } }, '‹') : null,
        many ? h('button', { type: 'button', class: 'slider-nav next', 'aria-label': t('photo_next'), onclick: () => { go(idx + 1); restart(); } }, '›') : null,
        dots);
      // Σύρσιμο στο κινητό
      let x0 = null;
      slider.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      slider.addEventListener('touchend', (e) => {
        if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
      });
      // Αυτόματη εναλλαγή κάθε 5". Σταματά μόνο όσο ο επισκέπτης χρησιμοποιεί το πληκτρολόγιο μέσα στις φωτογραφίες
      // ή όσο η καρτέλα δεν φαίνεται. Με «λιγότερη κίνηση» αλλάζουν χωρίς κύλιση (CSS).
      let timer = null;
      const stop = () => { clearInterval(timer); timer = null; };
      const start = () => { if (!many || timer) return; timer = setInterval(() => go(idx + 1), 5000); };
      const restart = () => { stop(); start(); };
      slider.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) stop(); });
      slider.addEventListener('focusout', start);
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
      go(0); start();
      $('.hero').before(slider);
      $('.hero').classList.add('after-banner');
    }
    $('#why-title').textContent = t('why_title');
    for (const i of [1, 2, 3]) {
      $(`#why-${i}-t`).textContent = t(`why_${i}_t`);
      $(`#why-${i}`).textContent = t(`why_${i}`);
    }

    // Η πρόταση-αναζήτηση
    const maxG = Math.max(...visible.map((p) => p.maxGuests));
    const citySel = h('select', { id: 's-city', 'aria-label': t('s_in') },
      h('option', { value: '' }, t('s_anywhere')),
      visibleCities.map((c) => h('option', { value: c.id }, L(c.nameIn) || `${t('s_in')} ${L(c.name)}`)));
    const ciIn = h('input', { type: 'date', id: 's-in', min: today(), 'aria-label': t('checkin'), required: true });
    const coIn = h('input', { type: 'date', id: 's-out', min: addDays(today(), 1), 'aria-label': t('checkout'), required: true });
    const gSel = h('select', { id: 's-guests', 'aria-label': t('guests') },
      Array.from({ length: maxG }, (_, i) => h('option', { value: i + 1, selected: i === 1 }, t('s_guests', { n: i + 1 }))));
    // Προτεινόμενες ημερομηνίες: το επόμενο Σαββατοκύριακο (Παρασκευή → Κυριακή)
    {
      const td = today();
      const dow = parseD(td).getUTCDay();
      const fri = addDays(td, ((5 - dow + 7) % 7) || 7);
      ciIn.value = fri; coIn.value = addDays(fri, 2); coIn.min = addDays(fri, 1);
    }
    ciIn.addEventListener('change', () => {
      if (!ciIn.value) return;
      coIn.min = addDays(ciIn.value, 1);
      if (!coIn.value || coIn.value <= ciIn.value) coIn.value = addDays(ciIn.value, 2);
    });
    const status = h('p', { class: 'search-status', role: 'status', 'aria-live': 'polite' });
    const form = h('form', { class: 'sentence', novalidate: true },
      `${t('s_want')} `, citySel, ` ${t('s_from')} `, ciIn, ` ${t('s_to')} `, coIn, ` ${t('s_for')} `, gSel, '.',
      h('span', { class: 'go' }, h('button', { class: 'btn btn-ochre', type: 'submit' }, t('s_button'))),
    );
    if (DIRECT) $('#search').replaceChildren(form, status);
    else {
      $('#hero-lead').textContent = t('lead_contact');
      // Αν υπάρχουν φωτογραφίες, τα κουμπιά «Δες τα καταλύματα» είναι πάνω τους· αλλιώς ένα εδώ
      if (document.querySelector('.slider')) $('#search').replaceChildren(); else $('#search').replaceChildren(h('p', { class: 'hero-cta' }, h('a', { class: 'btn btn-ochre', href: '#stays' }, t('view_stays'))));
      $('#why-title').textContent = t('how_title');
      for (const i of [1, 2, 3]) {
        $(`#why-${i}-t`).textContent = t(`how_${i}_t`);
        $(`#why-${i}`).textContent = t(`how_${i}`);
      }
    }

    const results = new Map(); // id -> {state, quote}
    const renderList = () => renderStays(results, search);
    let search = null;

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!isDate(ciIn.value) || !isDate(coIn.value) || coIn.value <= ciIn.value) { status.textContent = t('s_pick_dates'); ciIn.focus(); return; }
      search = { city: citySel.value, checkin: ciIn.value, checkout: coIn.value, guests: Number(gSel.value) };
      status.textContent = t('s_checking');
      results.clear();
      const list = visible.filter((p) => !search.city || p.city === search.city);
      await Promise.all(list.map(async (p) => {
        if (p.maxGuests < search.guests) { results.set(p.id, { state: 'guests' }); return; }
        try {
          const av = await getAvailability(p.id);
          const n = diff(search.checkin, search.checkout);
          if (n < (av.minNights || 1) || overlaps(av.blocked, search.checkin, search.checkout)) { results.set(p.id, { state: 'no' }); return; }
          const q = await getQuote(p.id, search.checkin, search.checkout, search.guests);
          results.set(p.id, { state: 'ok', quote: q });
        } catch { results.set(p.id, { state: 'no' }); }
      }));
      const count = [...results.values()].filter((r) => r.state === 'ok').length;
      status.textContent = count
        ? t('s_found', { nights: nightsLabel(diff(search.checkin, search.checkout)), count, total: list.length })
        : t('s_none');
      renderList();
      $('#stays').scrollIntoView({ block: 'start' });
    });

    renderList();
  }

  function renderStays(results, search) {
    const root = $('#stays');
    // Χωρίς online κρατήσεις δείχνουμε όλες τις πόλεις· όσες δεν έχουν ακόμα καταλύματα δείχνουν «σύντομα»
    const cities = DIRECT ? visibleCities : C.cities;
    const sections = cities.map((c) => {
      let props = visible.filter((p) => p.city === c.id);
      if (search && search.city && search.city !== c.id) return null;
      if (search) props = [...props].sort((a, b) => (results.get(a.id)?.state === 'ok' ? 0 : 1) - (results.get(b.id)?.state === 'ok' ? 0 : 1));
      const phones = [].concat(C.contact.phones || C.contact.phone || []);
      const soon = !props.length ? h('div', { class: 'soon' },
        h('p', {}, t('coming_soon', { in: L(c.nameIn) })),
        h('p', { class: 'soon-links' },
          phoneList().map((ph) => phoneRow(ph, true)),
          C.contact.email ? h('a', { class: 'btn btn-ghost', href: 'mailto:' + C.contact.email }, t('email_us')) : null,
          instagramLink(true))) : null;
      return h('section', { class: 'city', id: `stays-${c.id}`, 'aria-labelledby': `city-${c.id}` },
        h('div', { class: 'wrap' },
          h('div', { class: 'city-head' }, h('h2', { id: `city-${c.id}` }, L(c.name)), h('p', {}, L(c.blurb))),
          soon || h('div', { class: 'stays' }, props.map((p) => stayRow(p, results.get(p.id), search))),
        ));
    });
    root.replaceChildren(...sections.filter(Boolean));
  }

  function stayRow(p, res, search) {
    let link = `stay.html?id=${p.id}`;
    if (search) link += `&ci=${search.checkin}&co=${search.checkout}&g=${search.guests}`;
    link = withLang(link);
    let note = null;
    if (res && res.state === 'ok') note = h('p', { class: 'avail-note ok' }, t('available_for', { nights: nightsLabel(res.quote.nights), total: money(res.quote.total) }));
    else if (res && res.state === 'no') note = h('p', { class: 'avail-note no' }, t('unavailable_for'));
    else if (res && res.state === 'guests') note = h('p', { class: 'avail-note no' }, t('too_many_guests', { n: p.maxGuests }));
    const mapImg = p.mapImageCard || p.mapImage;
    return h('article', { class: `stay stay-card reveal${res && res.state !== 'ok' ? ' is-unavailable' : ''}${mapImg ? ' has-map' : ''}` },
      h('div', { class: 'stay-visuals' },
        h('a', { class: 'stay-media', href: link, tabindex: '-1', 'aria-hidden': 'true' }, photoOrPlaceholder(p, 0, true)),
        mapImg ? mapTile(p, mapImg, p.mapImageCard ? p.mapPinCard : p.mapPin) : null),
      h('div', { class: 'stay-body' },
        h('div', { class: 'stay-head' },
          h('div', {},
            h('h3', {}, h('a', { href: link }, p.name)),
            h('p', { class: 'area' }, L(p.area))),
          h('a', { class: 'btn btn-ochre', href: link }, t('view_stay'))),
        h('p', { class: 'tagline' }, L(p.tagline)),
        factsList(p),
        note,
        !res && PRICES ? h('p', { class: 'price-from' }, t('from_price', { price: money(p.fromPrice) })) : null,
      ));
  }

  // ─── Σελίδα καταλύματος ───
  function initStay() {
    const p = propById(qs.get('id'));
    if (!p) { location.replace(withLang('index.html')); return; }
    document.title = `${p.name} — ${C.brand}`;
    const city = C.cities.find((c) => c.id === p.city);

    $('#prop-head').replaceChildren(
      h('a', { class: 'back', href: withLang('index.html#stays') }, '← ', t('back_all')),
      h('h1', {}, p.name),
      h('p', { class: 'area' }, L(p.area) || L(city && city.name)),
      ratingsList(p),
    );

    // Gallery + lightbox
    const total = (p.photos || []).length;
    const n = Math.max(1, Math.min(3, total));
    const gallery = h('div', { class: `gallery${n === 1 ? ' single' : ''}` });
    for (let i = 0; i < n; i++) {
      const fig = h('div', {}, photoOrPlaceholder(p, i, i > 0));
      const img = fig.querySelector('img');
      if (img) img.addEventListener('click', () => openLightbox(p, i));
      gallery.append(fig);
    }
    if (total > 1) {
      gallery.append(h('button', { type: 'button', class: 'all-photos', onclick: () => openLightbox(p, 0) }, t('all_photos', { n: total })));
    }
    $('#gallery').replaceChildren(gallery);

    $('#prop-main').replaceChildren(
      h('section', {}, h('h2', {}, t('about_stay')), factsList(p), h('p', { class: 'desc' }, L(p.description))),
      h('section', {}, h('h2', {}, t('amenities')),
        h('ul', { class: 'amenity-list' }, (p.amenities || []).map((a) => h('li', {}, t('amenity_' + a))))),
      reviewsSection(p),
      h('section', { class: 'practical' }, h('h2', {}, t('practical')),
        h('dl', {},
          h('dt', {}, t('checkin')), h('dd', {}, t('checkin_time', { t: p.checkin })),
          h('dt', {}, t('checkout')), h('dd', {}, t('checkout_time', { t: p.checkout })),
          p.parking ? [h('dt', {}, t('parking')), h('dd', {}, L(p.parking))] : null,
          C.policies && C.policies.house ? [h('dt', {}, t('house_rules')), h('dd', {}, L(C.policies.house))] : null,
          C.policies && C.policies.cancellation ? [h('dt', {}, t('terms_cancel')), h('dd', {}, L(C.policies.cancellation))] : null,
          C.showAma && p.ama ? [h('dt', {}, 'ΑΜΑ'), h('dd', {}, p.ama)] : null,
        )),
      locationSection(p),
    );

    if (DIRECT) initBooking(p); else initContact(p);

    // Μπάρα κράτησης στο κινητό: φαίνεται μέχρι να εμφανιστεί η φόρμα κράτησης
    const bar = h('div', { class: 'bookbar', role: 'region', 'aria-label': t('book_title') },
      h('div', {}, h('b', {}, PRICES ? t('from_price', { price: money(p.fromPrice) }) : p.name), DIRECT && C.policies && C.policies.cancellation ? h('small', {}, t('cancel_short')) : null),
      h('button', { type: 'button', class: 'btn btn-ochre', onclick: () => $('#book').scrollIntoView({ block: 'start' }) }, t('book_now')));
    document.body.append(bar);
    document.body.classList.add('has-bookbar');
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => bar.classList.toggle('is-hidden', e.isIntersecting), { threshold: 0 }).observe($('#book'));
    }
  }

  // Πάνελ κράτησης χωρίς online πληρωμή: Booking.com, Airbnb, τηλέφωνο, email
  function initContact(p) {
    const link = (src) => (p.bookingLinks && p.bookingLinks[src]) || ((p.ratings || []).find((r) => r.source === src) || {}).url;
    const platforms = ['booking', 'airbnb'].filter(link);
    const phones = [].concat(C.contact.phones || C.contact.phone || []);
    const mail = C.contact.email
      ? 'mailto:' + C.contact.email + '?subject=' + encodeURIComponent(t('email_subject', { name: p.name })) + '&body=' + encodeURIComponent(t('email_body', { name: p.name }))
      : null;
    $('#book').classList.add('book-contact');
    $('#book').replaceChildren(...[
      h('h2', {}, t('book_title')),
      PRICES ? h('p', { class: 'from' }, t('from_price', { price: money(p.fromPrice) })) : null,
      h('div', { class: 'book-links' }, platforms.map((src) =>
        h('a', { class: `btn btn-platform p-${src}`, href: link(src), target: '_blank', rel: 'noopener' }, t('book_on', { src: SOURCES[src] })))),
      h('p', { class: 'or-direct' }, h('span', {}, t('or_direct'))),
      h('div', { class: 'book-links' },
        phoneList().map((ph) => phoneRow(ph, true)),
        mail ? h('a', { class: 'btn btn-ghost', href: mail }, t('email_us')) : null,
        instagramLink(true)),
      C.contact.email ? h('p', { class: 'hint center' }, C.contact.email) : null,
      h('p', { class: 'hint' }, t('panel_note')),
      h('div', { class: 'pay-info' },
        h('h3', {}, t('terms_payment')),
        h('ul', {},
          h('li', {}, t('pay_platforms')),
          h('li', {}, t('pay_direct')),
          h('li', {}, t('price_final')),
          h('li', {}, t('receipt_note')))),
    ].filter(Boolean));
  }

  function reviewsSection(p) {
    if (!p.reviews || !p.reviews.length) return null;
    // Πρώτα οι κριτικές στη γλώσσα του επισκέπτη· μία κάθε φορά, αλλάζουν μόνες τους κάθε 8"
    const list = [...p.reviews].sort((x, y) => (y.lang === lang) - (x.lang === lang));
    const cards = list.map(reviewCard);
    const track = h('div', { class: 'review-track' }, cards);
    const viewport = h('div', { class: 'review-viewport' }, track);
    const counter = h('span', { class: 'review-count', 'aria-live': 'polite' });
    let idx = 0;
    const many = cards.length > 1;
    const fit = () => { viewport.style.height = cards[idx].offsetHeight + 'px'; };
    const go = (n) => {
      idx = (n + cards.length) % cards.length;
      track.style.transform = `translateX(${-100 * idx}%)`;
      cards.forEach((c, k) => c.setAttribute('aria-hidden', String(k !== idx)));
      counter.textContent = `${idx + 1} / ${cards.length}`;
      fit();
    };
    let timer = null;
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { if (!many || timer) return; timer = setInterval(() => go(idx + 1), 8000); };
    const restart = () => { stop(); start(); };
    const nav = many ? h('div', { class: 'review-nav' },
      h('button', { type: 'button', class: 'review-btn', 'aria-label': t('photo_prev'), onclick: () => { go(idx - 1); restart(); } }, '‹'),
      counter,
      h('button', { type: 'button', class: 'review-btn', 'aria-label': t('photo_next'), onclick: () => { go(idx + 1); restart(); } }, '›')) : null;
    const section = h('section', { class: 'reviews', 'aria-roledescription': 'carousel' }, h('h2', {}, t('guest_reviews')), viewport, nav);
    let x0 = null;
    viewport.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', (e) => {
      if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
    });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    window.addEventListener('resize', fit);
    requestAnimationFrame(() => { go(0); start(); });
    return section;
  }

  function reviewCard(r) {
    return (h('figure', { class: 'review' },
        h('div', { class: 'review-top' },
          h('span', { class: 'review-score' }, r.scale === 10 ? `${r.score}/10` : `${r.score} ★`),
          h('span', { class: 'review-src' }, SOURCES[r.source] || ''),
          r.date ? h('time', { datetime: r.date }, fmtDate(r.date.length === 7 ? r.date + '-01' : r.date, { month: 'long', year: 'numeric' })) : null),
        r.title ? h('p', { class: 'review-title', lang: r.lang }, r.title) : null,
        h('blockquote', { lang: r.lang }, r.text),
        h('figcaption', {}, h('b', {}, r.name), r.country ? ` · ${L(r.country)}` : ''),
      ));
  }

  const fmtDist = (m) => (m < 1000
    ? `${new Intl.NumberFormat(locale()).format(m)} ${t('unit_m')}`
    : `${new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(m / 1000)} ${t('unit_km')}`);

  function locationSection(p) {
    if (!p.address && !p.nearby) return null;
    const dest = p.mapsQuery || L(p.address);
    const dirUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(dest) +
      (p.placeId ? '&destination_place_id=' + encodeURIComponent(p.placeId) : '');
    const label = (n) => (n.metro ? t('metro', { s: L(n.metro) }) : t('place_' + n.place));
    return h('section', { class: 'location' }, h('h2', {}, t('location')),
      h('dl', {},
        p.address ? [h('dt', {}, t('address')), h('dd', {}, L(p.address))] : null,
        p.floor ? [h('dt', {}, t('floor')), h('dd', {}, t('floor_val', { n: p.floor }))] : null,
      ),
      p.address ? h('p', {}, h('a', { class: 'btn btn-ochre', href: dirUrl, target: '_blank', rel: 'noopener' }, t('directions'))) : null,
      staticMap(p, 'in-page') || mapEmbed(dest),
      p.nearby && p.nearby.length ? [
        h('ul', { class: 'nearby' }, p.nearby.map((n) => h('li', {}, h('span', {}, label(n)),
          h('span', { class: 'walk' }, [n.meters ? fmtDist(n.meters) : null, t('walk', { m: n.walk })].filter(Boolean).join(' · '))))),
        h('p', { class: 'hint' }, t('dist_note')),
      ] : null,
      p.airport ? h('div', { class: 'airport' }, h('h3', {}, t('airport_title')),
        h('ul', {}, h('li', {}, t('airport_taxi')), h('li', {}, t('airport_bus'))),
        h('p', {}, t('airport_tip')), h('p', { class: 'hint' }, t('airport_note'))) : null,
    );
  }

  // Χάρτης Google: μόνο στο κανονικό site (στην προεπισκόπηση δεν επιτρέπονται ενσωματωμένοι χάρτες)
  const mapsHref = (p) => {
    if (p.mapsUrl) return p.mapsUrl;
    const q = p.mapsQuery || L(p.address);
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q) + (p.placeId ? '&query_place_id=' + encodeURIComponent(p.placeId) : '');
  };
  const PIN = '<svg viewBox="0 0 30 40" aria-hidden="true"><path d="M15 39s13-13.2 13-23.5A13 13 0 0 0 2 15.5C2 25.8 15 39 15 39z" fill="#0f0e0c"/><circle cx="15" cy="15.5" r="9.5" fill="#c9a45c"/><circle cx="15" cy="15.5" r="4" fill="#0f0e0c"/></svg>';
  // Χάρτης με καρφίτσα πάνω (η καρφίτσα είναι ξεχωριστή, ώστε ο χάρτης να έχει ήπια χρώματα)
  function mapTile(p, src, pin) {
    const [px, py] = pin || [50, 50];
    return h('a', { class: 'map-tile', href: mapsHref(p), target: '_blank', rel: 'noopener', 'aria-label': t('open_in_maps') + ': ' + p.name },
      h('img', { src, alt: t('map_alt', { address: L(p.address) }), loading: 'lazy' }),
      h('span', { class: 'map-pin', style: `left:${px}%;top:${py}%`, html: PIN }),
      h('span', { class: 'map-label' }, h('b', {}, p.name), h('small', {}, L(p.address).split(',')[0]), h('span', {}, t('open_in_maps'))),
      h('small', { class: 'map-attr' }, '© OpenStreetMap'));
  }

  // Χάρτης-εικόνα με την ακριβή θέση (OpenStreetMap). Πάτημα → Google Maps
  function staticMap(p, where) {
    if (!p.mapImage) return null;
    return h('figure', { class: `static-map ${where}` }, mapTile(p, p.mapImage, p.mapPin));
  }

  function mapEmbed(q) {
    const host = location.hostname;
    const ok = /(^|\.)comfystay\.gr$/.test(host) || host.endsWith('github.io') || host === 'localhost' || host === '127.0.0.1';
    if (!ok || !q) return null;
    return h('div', { class: 'map' }, h('iframe', {
      title: t('map_title'), loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade',
      src: 'https://www.google.com/maps?q=' + encodeURIComponent(q) + '&z=15&hl=' + lang + '&output=embed',
    }));
  }

  function openLightbox(p, start) {
    const photos = p.photos;
    let i = start;
    const img = h('img', { alt: '' });
    const counter = h('span', { class: 'lb-count', 'aria-live': 'polite' });
    const show = (k) => {
      i = (k + photos.length) % photos.length;
      img.src = photos[i];
      img.alt = `${p.name} — ${i + 1} / ${photos.length}`;
      counter.textContent = `${i + 1} / ${photos.length}`;
      // προφόρτωση της επόμενης
      const next = new Image(); next.src = photos[(i + 1) % photos.length];
    };
    const many = photos.length > 1;
    const dlg = h('dialog', { class: 'lightbox', 'aria-label': p.name },
      h('div', { class: 'lb-top' }, counter,
        h('button', { type: 'button', class: 'lb-close', 'aria-label': t('close'), onclick: () => dlg.close() }, '✕')),
      h('div', { class: 'lb-stage' },
        many ? h('button', { type: 'button', class: 'lb-nav lb-prev', 'aria-label': t('photo_prev'), onclick: () => show(i - 1) }, '‹') : null,
        img,
        many ? h('button', { type: 'button', class: 'lb-nav lb-next', 'aria-label': t('photo_next'), onclick: () => show(i + 1) }, '›') : null));
    dlg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(i + 1);
      else if (e.key === 'ArrowLeft') show(i - 1);
    });
    let x0 = null;
    dlg.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    });
    dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.classList.contains('lb-stage')) dlg.close(); });
    dlg.addEventListener('close', () => { dlg.remove(); document.body.style.overflow = ''; });
    document.body.append(dlg);
    document.body.style.overflow = 'hidden';
    show(start);
    dlg.showModal();
  }

  function initBooking(p) {
    const panel = $('#book');
    const state = { checkin: null, checkout: null, guests: 2, blocked: [], minNights: p.minNights || 1, quote: null, month: null };
    const q0 = qs.get('ci'); const q1 = qs.get('co'); const g0 = Number(qs.get('g'));
    if (g0 >= 1 && g0 <= p.maxGuests) state.guests = g0;
    else state.guests = Math.min(2, p.maxGuests);

    const calBox = h('div', { class: 'cal' });
    const datesBox = h('div', { class: 'book-dates' });
    const guestsSel = h('select', { id: 'b-guests' },
      Array.from({ length: p.maxGuests }, (_, i) => h('option', { value: i + 1 }, String(i + 1))));
    guestsSel.value = String(state.guests);
    const quoteBox = h('div', { class: 'quote', hidden: true });
    const msg = h('p', { class: 'error', role: 'alert', hidden: true });
    const continueBtn = h('button', { class: 'btn btn-primary', type: 'button', disabled: true }, t('continue'));
    const formBox = h('div', { class: 'details-form', hidden: true });

    panel.replaceChildren(
      h('h2', {}, t('book_title')),
      PRICES ? h('p', { class: 'from' }, t('from_price', { price: money(p.fromPrice) })) : null,
      datesBox, calBox,
      h('label', { class: 'field', style: 'margin-top:14px' }, h('span', {}, t('guests')), guestsSel),
      quoteBox, msg, continueBtn, formBox,
    );

    const showError = (text) => { msg.textContent = text; msg.hidden = !text; };

    function renderDates() {
      datesBox.replaceChildren(
        h('div', {}, h('small', {}, t('checkin')), h('b', {}, state.checkin ? fmtDate(state.checkin, { weekday: 'short', day: 'numeric', month: 'short' }) : '—')),
        h('div', {}, h('small', {}, t('checkout')), h('b', {}, state.checkout ? fmtDate(state.checkout, { weekday: 'short', day: 'numeric', month: 'short' }) : '—')),
      );
    }

    function canCheckout(d) {
      if (!state.checkin || d <= state.checkin) return false;
      return !overlaps(state.blocked, state.checkin, d);
    }

    function renderCal() {
      const first = state.month; // 'YYYY-MM-01'
      const startMonth = today().slice(0, 7) + '-01';
      const y = Number(first.slice(0, 4)); const m = Number(first.slice(5, 7));
      const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
      const lead = (parseD(first).getUTCDay() + 6) % 7; // Δευτέρα πρώτη
      const tdy = today();
      const dows = Array.from({ length: 7 }, (_, i) => fmtDate(addDays('2024-01-01', i), { weekday: 'narrow' }));
      const grid = h('div', { class: 'cal-grid', role: 'grid' }, dows.map((d) => h('div', { class: 'cal-dow', 'aria-hidden': 'true' }, d)));
      for (let i = 0; i < lead; i++) grid.append(h('div'));
      for (let day = 1; day <= daysIn; day++) {
        const d = `${first.slice(0, 8)}${String(day).padStart(2, '0')}`;
        const taken = isTakenNight(state.blocked, d);
        const past = d < tdy;
        const picking = state.checkin && !state.checkout;
        const outOk = picking && canCheckout(d);
        const cls = ['cal-day'];
        if (taken) cls.push('taken');
        if (taken && outOk) cls.push('can-out');
        if (d === tdy) cls.push('today');
        if (state.checkin && d === state.checkin) cls.push('start');
        if (state.checkout && d === state.checkout) cls.push('end');
        if (state.checkin && state.checkout && d > state.checkin && d < state.checkout) cls.push('in-range');
        const disabled = past || (taken && !outOk);
        grid.append(h('button', {
          type: 'button', class: cls.join(' '), disabled,
          'aria-label': fmtDate(d, { weekday: 'long', day: 'numeric', month: 'long' }) + (taken ? ` — ${t('cal_legend_taken')}` : ''),
          'aria-pressed': d === state.checkin || d === state.checkout ? 'true' : null,
          onclick: () => pickDay(d),
        }, String(day)));
      }
      const label = new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parseD(first));
      const prevM = iso(new Date(Date.UTC(y, m - 2, 1)));
      const nextM = iso(new Date(Date.UTC(y, m, 1)));
      calBox.replaceChildren(
        h('div', { class: 'cal-top' },
          h('button', { class: 'cal-nav', type: 'button', 'aria-label': t('cal_prev'), disabled: first <= startMonth, onclick: () => { state.month = prevM; renderCal(); } }, '‹'),
          h('b', { 'aria-live': 'polite' }, label),
          h('button', { class: 'cal-nav', type: 'button', 'aria-label': t('cal_next'), disabled: diff(tdy, nextM) > 480, onclick: () => { state.month = nextM; renderCal(); } }, '›')),
        grid,
        h('div', { class: 'cal-foot' },
          h('span', {}, !state.checkin ? t('cal_pick_in') : !state.checkout ? t('cal_pick_out') : t('min_nights', { n: nightsLabel(state.minNights) })),
          state.checkin ? h('button', { type: 'button', onclick: () => { state.checkin = state.checkout = null; update(); } }, t('cal_clear')) : h('span', {}, h('s', {}, '12'), ' ' + t('cal_legend_taken'))),
      );
    }

    function pickDay(d) {
      showError('');
      if (!state.checkin || state.checkout || d <= state.checkin) {
        if (isTakenNight(state.blocked, d)) return;
        state.checkin = d; state.checkout = null;
      } else if (canCheckout(d)) {
        if (diff(state.checkin, d) < state.minNights) { showError(t('min_nights', { n: nightsLabel(state.minNights) })); return; }
        state.checkout = d;
      } else {
        if (isTakenNight(state.blocked, d)) return;
        state.checkin = d; state.checkout = null;
      }
      update();
    }

    let quoteSeq = 0;
    async function update() {
      renderDates(); renderCal();
      state.quote = null;
      continueBtn.disabled = true;
      quoteBox.hidden = true;
      formBox.hidden = true;
      if (!state.checkin || !state.checkout) return;
      const seq = ++quoteSeq;
      try {
        const q = await getQuote(p.id, state.checkin, state.checkout, state.guests);
        if (seq !== quoteSeq) return;
        state.quote = q;
        const label = (l) => (l.type === 'stay' ? t('line_stay', { nights: nightsLabel(l.nights) }) : l.type === 'cleaning' ? t('line_cleaning') : t('line_climate', { nights: nightsLabel(l.nights) }));
        quoteBox.replaceChildren(
          ...q.lines.map((l) => h('div', { class: 'row' }, h('span', {}, label(l)), h('span', {}, money(l.amount)))),
          h('div', { class: 'row total' }, h('span', {}, t('total')), h('span', {}, money(q.total))),
          h('p', { class: 'hint' }, t('price_final')),
          C.policies && C.policies.cancellation ? h('p', { class: 'perk' }, t('cancel_short')) : null,
        );
        quoteBox.hidden = false;
        continueBtn.disabled = false;
      } catch (e) { if (seq === quoteSeq) showError(errText(e)); }
    }

    guestsSel.addEventListener('change', () => { state.guests = Number(guestsSel.value); update(); });
    continueBtn.addEventListener('click', () => { renderForm(); formBox.hidden = false; continueBtn.hidden = true; formBox.querySelector('input').focus(); });

    function renderForm() {
      const termsLink = h('a', { href: withLang('terms.html'), target: '_blank', rel: 'noopener' }, t('f_terms_link'));
      const [before, after] = t('f_terms').split('{link}');
      const payBtn = h('button', { class: 'btn btn-primary', type: 'submit' }, t('pay', { total: money(state.quote.total) }));
      const err = h('p', { class: 'error', role: 'alert', hidden: true });
      const invoiceBox = h('input', { type: 'checkbox', name: 'invoice' });
      const invoiceFields = h('div', { class: 'invoice-fields', hidden: true },
        h('label', { class: 'field' }, h('span', {}, t('f_company')), h('input', { name: 'company', autocomplete: 'organization', maxlength: 120 })),
        h('label', { class: 'field' }, h('span', {}, t('f_vat')), h('input', { name: 'vat', maxlength: 30 })),
        h('label', { class: 'field' }, h('span', {}, t('f_company_address')), h('input', { name: 'company_address', autocomplete: 'street-address', maxlength: 200 })));
      const f = h('form', { novalidate: true },
        h('h3', {}, t('your_details')),
        h('label', { class: 'field' }, h('span', {}, t('f_name')), h('input', { name: 'name', autocomplete: 'name', required: true, maxlength: 100 })),
        h('label', { class: 'field' }, h('span', {}, t('f_email')), h('input', { name: 'email', type: 'email', autocomplete: 'email', required: true, maxlength: 150 })),
        h('label', { class: 'field' }, h('span', {}, t('f_phone')), h('input', { name: 'phone', type: 'tel', autocomplete: 'tel', required: true, maxlength: 30 })),
        h('label', { class: 'field' }, h('span', {}, t('f_country')), h('input', { name: 'country', autocomplete: 'country-name', maxlength: 60 })),
        h('label', { class: 'field' }, h('span', {}, t('f_arrival')), h('input', { name: 'arrival', type: 'time', step: 900 })),
        (p.amenities || []).some((x) => x === 'pets' || x === 'crib') ? h('fieldset', { class: 'extras' }, h('legend', {}, t('f_extras')),
          (p.amenities || []).includes('pets') ? h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'pets' }), h('span', {}, t('f_pets'))) : null,
          (p.amenities || []).includes('crib') ? h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'crib' }), h('span', {}, t('f_crib'))) : null) : null,
        h('label', { class: 'field' }, h('span', {}, t('f_message')), h('textarea', { name: 'message', maxlength: 1000 })),
        h('label', { class: 'check' }, invoiceBox, h('span', {}, t('f_invoice'))),
        invoiceFields,
        h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'terms', required: true }), h('span', {}, before, termsLink, after)),
        payBtn, err,
        h('p', { class: 'pay-methods' }, h('span', {}, t('pay_methods')), ['Visa', 'Mastercard', 'Apple Pay', 'Google Pay'].map((m) => h('span', { class: 'chip' }, m))),
        h('p', { class: 'hint' }, t('pay_note')),
        h('p', { class: 'hint' }, t('receipt_note')),
      );
      invoiceBox.addEventListener('change', () => { invoiceFields.hidden = !invoiceBox.checked; if (invoiceBox.checked) invoiceFields.querySelector('input').focus(); });
      f.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const fd = new FormData(f);
        const data = {
          property: p.id, checkin: state.checkin, checkout: state.checkout, guests: state.guests, lang,
          name: String(fd.get('name') || '').trim(), email: String(fd.get('email') || '').trim(), phone: String(fd.get('phone') || '').trim(),
          country: String(fd.get('country') || '').trim(), arrival: String(fd.get('arrival') || ''), message: String(fd.get('message') || '').trim(),
          acceptTerms: fd.get('terms') === 'on',
          pets: fd.get('pets') === 'on', crib: fd.get('crib') === 'on',
          invoice: fd.get('invoice') === 'on'
            ? { company: String(fd.get('company') || '').trim(), vat: String(fd.get('vat') || '').trim(), address: String(fd.get('company_address') || '').trim() }
            : null,
        };
        const fail = (code) => { err.textContent = errText({ code }); err.hidden = false; };
        err.hidden = true;
        if (!data.name || !data.email || !data.phone) return fail('missing_guest_details');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return fail('invalid_email');
        if (data.invoice && (!data.invoice.company || !data.invoice.vat || !data.invoice.address)) return fail('invoice_details');
        if (!data.acceptTerms) return fail('terms_not_accepted');
        payBtn.disabled = true; payBtn.textContent = t('paying');
        try {
          if (DEMO) {
            alert(t('demo_pay'));
            location.href = withLang(`booking-success.html?demo=1&id=${p.id}&ci=${data.checkin}&co=${data.checkout}&g=${data.guests}`);
            return;
          }
          const r = await api('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
          location.href = r.redirectUrl;
        } catch (e) {
          fail(e.code);
          payBtn.disabled = false; payBtn.textContent = t('pay', { total: money(state.quote.total) });
          if (e.code === 'dates_taken') { availCache.delete(p.id); load(); }
        }
      });
      formBox.replaceChildren(f);
    }

    async function load() {
      try {
        const av = await getAvailability(p.id);
        state.blocked = av.blocked || [];
        state.minNights = av.minNights || state.minNights;
        if (isDate(q0) && isDate(q1) && q0 >= today() && q1 > q0 && !overlaps(state.blocked, q0, q1) && diff(q0, q1) >= state.minNights && !state.checkin) {
          state.checkin = q0; state.checkout = q1;
        }
        if (state.checkout && overlaps(state.blocked, state.checkin, state.checkout)) state.checkin = state.checkout = null;
      } catch { showError(t('err_load')); }
      state.month = (state.checkin || today()).slice(0, 7) + '-01';
      update();
    }
    state.month = today().slice(0, 7) + '-01';
    renderDates(); renderCal();
    load();
  }

  // ─── Επιτυχία / αποτυχία πληρωμής ───
  async function initSuccess() {
    const box = $('#result');
    document.title = `${t('ok_title')} — ${C.brand}`;
    const summary = (b) => h('div', { class: 'summary' }, h('dl', {},
      h('dt', {}, t('ok_ref')), h('dd', {}, b.id || '—'),
      h('dt', {}, t('book_title')), h('dd', {}, b.propertyName),
      h('dt', {}, t('checkin')), h('dd', {}, fmtDate(b.checkin, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })),
      h('dt', {}, t('checkout')), h('dd', {}, fmtDate(b.checkout, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })),
      h('dt', {}, t('guests')), h('dd', {}, String(b.guests)),
      b.total != null ? [h('dt', {}, t('total')), h('dd', {}, money(b.total))] : null,
    ));
    if (qs.get('demo')) {
      const p = propById(qs.get('id')) || C.properties[0];
      box.replaceChildren(h('h1', {}, t('ok_title')), h('p', {}, t('ok_lead')),
        summary({ id: 'CS-DEMO', propertyName: p.name, checkin: qs.get('ci') || today(), checkout: qs.get('co') || addDays(today(), 2), guests: qs.get('g') || 2 }),
        h('p', { class: 'hint' }, t('demo_banner')));
      return;
    }
    const tx = qs.get('t'); const order = qs.get('s');
    if (!tx || !order) { location.replace(withLang('booking-failed.html')); return; }
    box.replaceChildren(h('p', {}, t('ok_checking')));
    try {
      const b = await api(`/api/confirm?t=${encodeURIComponent(tx)}&s=${encodeURIComponent(order)}`);
      if (b.status === 'confirmed') box.replaceChildren(h('h1', {}, t('ok_title')), h('p', {}, t('ok_lead')), summary(b));
      else box.replaceChildren(h('h1', {}, t('ok_checking')), h('p', {}, t('ok_pending')), summary(b));
    } catch {
      box.replaceChildren(h('h1', {}, t('ok_checking')), h('p', {}, t('ok_pending')));
    }
  }

  function initFailed() {
    document.title = `${t('fail_title')} — ${C.brand}`;
    $('#result').replaceChildren(
      h('h1', {}, t('fail_title')), h('p', {}, t('fail_lead')),
      h('a', { class: 'btn btn-ghost', href: withLang('index.html#stays') }, t('try_again')),
    );
  }

  // ─── Όροι ───
  function initTerms() {
    document.title = `${t('terms_title')} — ${C.brand}`;
    const P = C.policies;
    $('#terms').replaceChildren(
      h('h1', {}, t('terms_title')),
      P.cancellation ? [h('h2', {}, t('terms_cancel')), h('p', {}, L(P.cancellation))] : null,
      h('h2', {}, t('terms_payment')), h('p', {}, t('terms_payment_text')),
      h('h2', {}, t('terms_house')), h('p', {}, L(P.house)),
      C.showPrivacy ? [h('h2', {}, t('terms_privacy')), h('p', {}, t('terms_privacy_text'))] : null,
      P.owner ? [h('h2', {}, t('terms_owner')), h('p', {}, L(P.owner))] : null,
    );
  }

  // ─── Διαχείριση (μόνο για σένα) ───
  function initAdmin() {
    const box = $('#admin');
    const tokenIn = h('input', { type: 'password', autocomplete: 'current-password', placeholder: 'ADMIN_TOKEN' });
    tokenIn.value = store.get('cs_admin') || '';
    const out = h('div');
    const load = async () => {
      store.set('cs_admin', tokenIn.value);
      out.replaceChildren(h('p', {}, 'Φόρτωση…'));
      try {
        const r = await api('/api/admin/bookings', { headers: { Authorization: 'Bearer ' + tokenIn.value } });
        if (!r.bookings.length) { out.replaceChildren(h('p', {}, 'Δεν υπάρχουν απευθείας κρατήσεις ακόμη.')); return; }
        out.replaceChildren(h('div', { style: 'overflow-x:auto' }, h('table', { class: 'admin-table' },
          h('thead', {}, h('tr', {}, ['Κωδικός', 'Κατάλυμα', 'Άφιξη', 'Αναχώρηση', 'Άτομα', 'Πελάτης', 'Σύνολο', 'Σημείωση'].map((x) => h('th', {}, x)))),
          h('tbody', {}, r.bookings.map((b) => h('tr', {},
            h('td', {}, b.id), h('td', {}, b.propertyName), h('td', {}, b.checkin), h('td', {}, b.checkout), h('td', {}, String(b.guests)),
            h('td', {}, b.guest.name, h('br'), h('a', { href: 'mailto:' + b.guest.email }, b.guest.email), h('br'), b.guest.phone,
              b.guest.arrival ? [h('br'), `Άφιξη ~${b.guest.arrival}`] : null, b.guest.message ? [h('br'), h('i', {}, b.guest.message)] : null,
              b.extras && b.extras.pets ? [h('br'), 'Κατοικίδιο'] : null, b.extras && b.extras.crib ? [h('br'), 'Παρκοκρέβατο'] : null,
              b.invoice ? [h('br'), h('b', {}, 'Τιμολόγιο: '), `${b.invoice.company}, ΑΦΜ ${b.invoice.vat}, ${b.invoice.address}`] : null),
            h('td', {}, money(b.total)),
            h('td', { class: b.flag ? 'flag' : '' }, b.flag === 'calendar_conflict' ? 'Διπλοκράτηση με Airbnb/Booking!' : b.flag === 'amount_mismatch' ? 'Λάθος ποσό πληρωμής' : ''),
          ))))));
      } catch (e) {
        out.replaceChildren(h('p', { class: 'error' }, e.code === 'unauthorized' ? 'Λάθος κωδικός.' : 'Σφάλμα σύνδεσης με τον server.'));
      }
    };
    box.replaceChildren(
      h('h1', {}, 'Απευθείας κρατήσεις'),
      h('form', { onsubmit: (e) => { e.preventDefault(); load(); }, style: 'display:flex;gap:8px;margin:16px 0 24px;max-width:480px' },
        h('label', { class: 'field', style: 'flex:1;margin:0' }, h('span', { class: 'sr-only' }, 'Κωδικός διαχείρισης'), tokenIn),
        h('button', { class: 'btn btn-ochre', type: 'submit' }, 'Εμφάνιση')),
      out,
    );
    if (DEMO) out.replaceChildren(h('p', {}, 'Ο server κρατήσεων δεν έχει συνδεθεί ακόμη (apiBase στο config.js).'));
    else if (tokenIn.value) load();
  }

  renderChrome();
  ({ home: initHome, stay: initStay, success: initSuccess, failed: initFailed, terms: initTerms, admin: initAdmin })[page]?.();
})();
