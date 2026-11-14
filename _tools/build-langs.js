#!/usr/bin/env node
/*
 * Φτιάχνει τις σελίδες σε άλλες γλώσσες (/en/, /bg/, /sr/) από τις ελληνικές και το config.js,
 * βάζει hreflang σε όλες τις σελίδες και ενημερώνει το sitemap.xml.
 *
 * Τρέξε το από τον φάκελο του site, κάθε φορά που αλλάζεις κείμενα στο config.js ή στις ελληνικές σελίδες:
 *     node _tools/build-langs.js
 *
 * Τίτλοι και περιγραφές για το Google ανά γλώσσα: στο SEO πιο κάτω.
 * Για νέα γλώσσα: πρόσθεσε μπλοκ στο LANGS και στο SEO, και τη γλώσσα στο LANG_DIRS του assets/app.js.
 * Ο φάκελος _tools δεν ανεβαίνει στο site (το GitHub Pages αγνοεί φακέλους που ξεκινούν με _).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://comfystay.gr/';
const rd = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const wr = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); };

// ── config.js και i18n.js ──
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(rd('assets/config.js'), sandbox);
vm.runInContext(rd('assets/i18n.js'), sandbox);
const C = sandbox.window.COMFY;
const I18N = sandbox.window.I18N;
const stayPage = (p) => p.name.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.html';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── Γλώσσες με δικές τους σελίδες ──
const LANGS = {
  en: {
    htmlLang: 'en', hreflang: 'en', ogLocale: 'en_GB', intl: 'en-GB', photo: 'photo',
    locality: { 'Θεσσαλονίκη': 'Thessaloniki', 'Πυλαία': 'Pylaia', 'Σιάτιστα': 'Siatista' },
    region: { 'Κεντρική Μακεδονία': 'Central Macedonia', 'Δυτική Μακεδονία': 'Western Macedonia' },
  },
  bg: {
    htmlLang: 'bg', hreflang: 'bg', ogLocale: 'bg_BG', intl: 'bg-BG', photo: 'снимка',
    locality: { 'Θεσσαλονίκη': 'Солун', 'Πυλαία': 'Пилея', 'Σιάτιστα': 'Сятища' },
    region: { 'Κεντρική Μακεδονία': 'Централна Македония', 'Δυτική Μακεδονία': 'Западна Македония' },
  },
  sr: {
    htmlLang: 'sr-Latn', hreflang: 'sr-Latn', ogLocale: 'sr_RS', intl: 'sr-Latn-RS', photo: 'fotografija',
    locality: { 'Θεσσαλονίκη': 'Solun', 'Πυλαία': 'Pilea', 'Σιάτιστα': 'Sjatista' },
    region: { 'Κεντρική Μακεδονία': 'Centralna Makedonija', 'Δυτική Μακεδονία': 'Zapadna Makedonija' },
  },
};

// ── Τίτλοι & περιγραφές Google (τίτλος έως ~60, περιγραφή έως ~160 χαρακτήρες) ──
const SEO = {
  en: {
    'index.html': {
      title: 'Apartments in Thessaloniki & Siatista | ComfyStay in Greece',
      desc: 'Apartments with a view in Thessaloniki, near the White Tower, the Fair and the seafront, and homes in Siatista by the old mansions. Wi-Fi, air conditioning.',
      h1: 'ComfyStay in Greece: apartments for your stay in Thessaloniki and Siatista',
      place: 'Thessaloniki; Siatista',
    },
    'panoramic-view-apartment.html': {
      title: 'City-View Apartment in Thessaloniki | Panoramic View',
      desc: 'Renovated 60 m² apartment with views from the White Tower to Seich Sou. 8 min walk to the seafront, 10 to the Fair, 17 to the White Tower. Sleeps 6.',
    },
    'gg-apartment.html': {
      title: 'Thessaloniki Apartment near the Seafront | G&G Apartment',
      desc: 'Modern 78 m² apartment on Vasilissis Olgas Avenue, minutes from the seafront and the Folklife Museum, close to the metro. 2 bedrooms, sleeps 6.',
    },
    'pilea-comfy-home.html': {
      title: 'Apartment with Free Parking in Pylaia | Pilea Comfy Home',
      desc: '87 m² apartment in Pylaia, Thessaloniki, in a quiet area by the ring road, with easy access to the centre, the airport and Halkidiki. Free private parking.',
    },
    'suite-apartment-siatista.html': {
      title: 'Siatista Apartment with a Large Terrace | Suite Apartment',
      desc: 'Modern apartment in Siatista with 2 bedrooms and a large terrace, near the old mansions. 25 min from Kozani, 36 from Kastoria. Sleeps 6, free parking.',
    },
    'guest-house-siatista.html': {
      title: 'Family Guest House in Siatista, Sleeps 8 | Guest House',
      desc: 'Spacious 110 m² house on Tria Pigadia square in Siatista, next to tavernas and the old mansions. 3 bedrooms, sleeps 8. 25 min from Kozani, 36 from Kastoria.',
    },
  },
  bg: {
    'index.html': {
      title: 'Апартаменти в Солун и Сятища | ComfyStay in Greece',
      desc: 'Апартаменти с гледка в Солун, близо до Бялата кула, Панаира и крайбрежието, и къщи в Сятища до старите имения. Wi-Fi, климатик.',
      h1: 'ComfyStay in Greece: апартаменти за престой в Солун и Сятища',
      place: 'Солун; Сятища',
    },
    'panoramic-view-apartment.html': {
      title: 'Апартамент с панорамна гледка в Солун | Panoramic View',
      desc: 'Ремонтиран апартамент 60 м² с гледка от Бялата кула до Сейх Су. 8 мин пеша до крайбрежието, 10 до Панаира, 17 до Бялата кула. До 6 души.',
    },
    'gg-apartment.html': {
      title: 'Апартамент в Солун близо до морето | G&G Apartment',
      desc: 'Модерен апартамент 78 м² на бул. Василисис Олгас, на минути от крайбрежието и Фолклорния музей, близо до метрото. 2 спални, до 6 души.',
    },
    'pilea-comfy-home.html': {
      title: 'Апартамент в Пилея с безплатен паркинг | Pilea Comfy Home',
      desc: 'Апартамент 87 м² в Пилея, Солун, в тих квартал до околовръстния път, с лесен достъп до центъра, летището и Халкидики. Безплатен частен паркинг.',
    },
    'suite-apartment-siatista.html': {
      title: 'Апартамент с голяма тераса в Сятища | Suite Apartment',
      desc: 'Модерен апартамент в Сятища с 2 спални и голяма тераса, близо до старите имения. 25 мин от Козани, 36 от Костур. До 6 души, безплатен паркинг.',
    },
    'guest-house-siatista.html': {
      title: 'Къща за семейства в Сятища, до 8 души | Guest House',
      desc: 'Просторна къща 110 м² на площад Триа Пигадия в Сятища, до таверни и старите имения. 3 спални, до 8 души. 25 мин от Козани, 36 от Костур.',
    },
  },
  sr: {
    'index.html': {
      title: 'Apartmani u Solunu i Sjatisti | ComfyStay in Greece',
      desc: 'Apartmani s pogledom u Solunu, blizu Bele kule, Sajma i keja, i kuće u Sjatisti pored starih vila. Wi-Fi, klima-uređaj.',
      h1: 'ComfyStay in Greece: apartmani za boravak u Solunu i Sjatisti',
      place: 'Solun; Sjatista',
    },
    'panoramic-view-apartment.html': {
      title: 'Apartman s panoramskim pogledom u Solunu | Panoramic View',
      desc: 'Renoviran apartman od 60 m² s pogledom od Bele kule do Sejh Sua. 8 min peške do keja, 10 do Sajma, 17 do Bele kule. Do 6 osoba.',
    },
    'gg-apartment.html': {
      title: 'Apartman u Solunu blizu mora | G&G Apartment',
      desc: 'Moderan apartman od 78 m² na bulevaru Vasilisis Olgas, nekoliko minuta od keja i Etnografskog muzeja, blizu metroa. 2 spavaće sobe, do 6 osoba.',
    },
    'pilea-comfy-home.html': {
      title: 'Apartman u Pilei s besplatnim parkingom | Pilea Comfy Home',
      desc: 'Apartman od 87 m² u Pilei, Solun, u mirnom kraju kod obilaznice, s lakim pristupom centru, aerodromu i Halkidikiju. Besplatan privatni parking.',
    },
    'suite-apartment-siatista.html': {
      title: 'Apartman s velikom terasom u Sjatisti | Suite Apartment',
      desc: 'Moderan apartman u Sjatisti sa 2 spavaće sobe i velikom terasom, blizu starih vila. 25 min od Kozanija, 36 od Kastorije. Do 6 osoba, besplatan parking.',
    },
    'guest-house-siatista.html': {
      title: 'Kuća za porodice u Sjatisti, do 8 osoba | Guest House',
      desc: 'Prostrana kuća od 110 m² na trgu Tria Pigadja u Sjatisti, pored taverni i starih vila. 3 spavaće sobe, do 8 osoba. 25 min od Kozanija, 36 od Kastorije.',
    },
  },
};
const PAGES = Object.keys(SEO.en);
for (const [l, pages] of Object.entries(SEO)) {
  for (const f of PAGES) {
    if (!pages[f]) throw new Error(`Λείπει SEO για ${l}/${f}`);
    if (pages[f].title.length > 65 || pages[f].desc.length > 165) console.warn('Μεγάλο κείμενο:', l, f);
  }
}

const urlEl = (f) => SITE + (f === 'index.html' ? '' : f);
const urlOf = (l, f) => (l === 'el' ? urlEl(f) : SITE + l + '/' + (f === 'index.html' ? '' : f));
const propOf = (f) => C.properties.find((p) => stayPage(p) === f);

// Κείμενα της γλώσσας l (με πληθυντικό όπως στο app.js)
function makeT(l) {
  const T = I18N[l], EN = I18N.en;
  const plural = new Intl.PluralRules(LANGS[l].intl);
  const t = (key, vars = {}) => {
    let s = (T && T[key]) ?? EN[key] ?? key;
    if (s.includes('|') && 'n' in vars) {
      const forms = s.split('|');
      const n = Number(vars.n);
      if (forms.length >= 3) { const c = plural.select(n); s = forms[c === 'one' ? 0 : c === 'few' ? 1 : 2]; }
      else s = forms[n === 1 ? 0 : 1];
    }
    for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
    return s;
  };
  const L = (o) => (o == null ? '' : typeof o === 'string' ? o : o[l] ?? o.en ?? o.el ?? '');
  return { t, L };
}

function hreflangLinks(f) {
  return [
    `<link rel="alternate" hreflang="el" href="${urlEl(f)}">`,
    ...Object.entries(LANGS).map(([l, x]) => `<link rel="alternate" hreflang="${x.hreflang}" href="${urlOf(l, f)}">`),
    `<link rel="alternate" hreflang="x-default" href="${urlOf('en', f)}">`,
  ].map((x) => '  ' + x).join('\n');
}
// Βάζει (ή ξαναβάζει) τα hreflang αμέσως μετά το canonical
function withHreflang(html, f) {
  html = html.replace(/\n\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, '');
  return html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n${hreflangLinks(f)}`);
}
const setMeta = (html, attr, name, value) =>
  html.replace(new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`), `$1${esc(value)}$2`);

function facts(p, t) {
  return [
    t('guests_up_to', { n: p.maxGuests }),
    p.bedrooms ? t('bedrooms', { n: p.bedrooms }) : null,
    p.beds ? t('beds', { n: p.beds }) : null,
    p.sofaBeds ? t('sofa_beds', { n: p.sofaBeds }) : null,
    p.baths ? t('baths', { n: p.baths }) : null,
    p.size ? t('size', { n: p.size }) : null,
  ].filter(Boolean).join(' · ');
}

// ── JSON-LD στη γλώσσα l ──
function translateLd(json, l, t) {
  const d = JSON.parse(json);
  for (const node of d['@graph'] || []) {
    if (node['@type'] === 'LodgingBusiness') {
      const file = node.url.replace(SITE, '');
      const p = propOf(file);
      node.url = urlOf(l, file);
      if (SEO[l][file]) node.description = SEO[l][file].desc;
      delete node.keywords;
      if (p && p.amenities) node.amenityFeature = p.amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: t('amenity_' + a), value: true }));
      if (node.address && p && p.address && p.address.en) {
        node.address.streetAddress = p.address.en.split(',')[0].trim();
        node.address.addressLocality = LANGS[l].locality[node.address.addressLocality] || node.address.addressLocality;
        node.address.addressRegion = LANGS[l].region[node.address.addressRegion] || node.address.addressRegion;
      }
    }
    if (node['@type'] === 'BreadcrumbList') {
      for (const it of node.itemListElement) it.item = urlOf(l, it.item.replace(SITE, '') || 'index.html');
    }
  }
  return JSON.stringify(d);
}

const footer = (t) => `  <footer id="site-foot" class="site-foot">
    <div class="wrap"><p><strong>${esc(C.brand)}</strong>: ${esc(t('footer_note'))}</p>
    <p>${C.contact.phones.map((ph) => `<a href="tel:+${ph.number.replace(/\D/g, '')}">${esc(ph.number)}</a>`).join(' · ')} · <a href="mailto:${C.contact.email}">${C.contact.email}</a></p>
    <ul>${C.properties.map((p) => `<li><a href="${stayPage(p)}">${esc(p.name)}</a></li>`).join('')}</ul></div>
  </footer>`;

function homeBody(l, t, L) {
  const cities = C.cities.map((c) => {
    const ps = C.properties.filter((p) => p.city === c.id);
    if (!ps.length) return '';
    const cards = ps.map((p) => `<article class="stay">
        <h3><a href="${stayPage(p)}">${esc(p.name)}</a></h3>
        <p>${esc(L(p.area))}. ${esc(L(p.tagline))}</p>
        <p>${esc(facts(p, t))}</p>
        <img src="../${p.photos[0].replace(/\.jpg$/, '-s.jpg')}" alt="${esc(p.name + ', ' + L(p.area))}" loading="lazy" width="400">
      </article>`).join('');
    return `    <section class="city" id="stays-${c.id}"><div class="wrap">
      <h2>${esc(t('stay_in', { in: L(c.nameIn) }))}</h2>
      <p>${esc(L(c.blurb))}</p>
      ${cards}
    </div></section>`;
  }).join('\n');
  return `<body data-page="home">
  <div class="is-dark">
    <header id="site-head" class="site-head is-dark"></header>
    <section class="hero">
      <div class="wrap">
        <h1 id="hero-title">${esc(SEO[l]['index.html'].h1)}</h1>
        <p class="lead" id="hero-lead">${esc(t('lead_contact'))}</p>
        <div id="search"></div>
      </div>
    </section>
  </div>
  <main id="stays">
${cities}
  </main>
  <section class="why">
    <div class="wrap">
      <h2 id="why-title"></h2>
      <div class="why-grid">
        <div><h3 id="why-1-t"></h3><p id="why-1"></p></div>
        <div><h3 id="why-2-t"></h3><p id="why-2"></p></div>
        <div><h3 id="why-3-t"></h3><p id="why-3"></p></div>
      </div>
    </div>
  </section>
${footer(t)}
`;
}

function stayBody(p, elHtml, l, t, L) {
  const area = L(p.area);
  const gallery = (p.photos || []).slice(0, 5).map((src, i) =>
    `<img src="../${src.replace(/\.jpg$/, '-s.jpg')}" alt="${esc(`${p.name}, ${area}, ${LANGS[l].photo} ${i + 1}`)}" loading="lazy" width="400">`).join('');
  const desc = L(p.description).split(/\n\n+/).map((x) => `<p>${esc(x)}</p>`).join('');
  const amen = (p.amenities || []).map((a) => `<li>${esc(t('amenity_' + a))}</li>`).join('');
  // Κουμπιά κράτησης: ίδιοι σύνδεσμοι με την ελληνική σελίδα
  const aside = (elHtml.match(/<aside class="book"[\s\S]*?<\/aside>/) || [''])[0]
    .replace('<h2>Κράτηση</h2>', `<h2>${esc(t('book_title'))}</h2>`)
    .replace(/>Κράτηση στο ([^<]+)</g, (_, src) => `>${esc(t('book_on', { src }))}<`);
  return `<body data-page="stay" data-stay="${p.id}">
  <header id="site-head" class="site-head"></header>
  <main>
    <div class="wrap">
      <div class="prop-head" id="prop-head"><a href="./">← ${esc(t('back_all'))}</a><h1>${esc(p.name)}</h1><p>${esc(area)}</p></div>
      <div id="gallery">${gallery}</div>
      <div class="prop-body">
        <div class="prop-main" id="prop-main">
          <section><h2>${esc(t('about_stay'))}</h2><p>${esc(facts(p, t))}</p>${desc}</section>
          <section><h2>${esc(t('amenities'))}</h2><ul>${amen}</ul></section>
          <section><h2>${esc(t('location'))}</h2><p>${esc(L(p.address))}</p></section>
        </div>
        ${aside}
      </div>
    </div>
  </main>
${footer(t)}
`;
}

function buildLang(l, f, elHtml) {
  const s = SEO[l][f], x = LANGS[l];
  const { t, L } = makeT(l);
  let h = elHtml;
  h = h.replace(/<html[^>]*>/, `<html lang="${x.htmlLang}" data-lang="${l}">`);
  h = h.replace(/(href|src)="(assets|img)\//g, '$1="../$2/');
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(s.title)}</title>`);
  h = h.replace(/\n\s*<meta name="keywords"[^>]*>/, '');
  for (const [a, n, v] of [
    ['name', 'description', s.desc], ['property', 'og:title', s.title], ['property', 'og:description', s.desc],
    ['property', 'og:url', urlOf(l, f)], ['property', 'og:image:alt', s.title],
    ['name', 'twitter:title', s.title], ['name', 'twitter:description', s.desc],
  ]) h = setMeta(h, a, n, v);
  // og:locale: η γλώσσα της σελίδας, οι υπόλοιπες ως alternate
  h = h.replace(/(\s*<meta property="og:locale(:alternate)?" content="[^"]*">)+/, (m) => {
    const ind = m.match(/^\s*/)[0];
    const all = ['el_GR', 'en_GB', 'de_DE', 'bg_BG', 'sr_RS', 'ru_RU'].filter((z) => z !== x.ogLocale);
    return `${ind}<meta property="og:locale" content="${x.ogLocale}">` + all.map((z) => `${ind}<meta property="og:locale:alternate" content="${z}">`).join('');
  });
  const p = propOf(f);
  h = setMeta(h, 'name', 'geo.placename', s.place || L(p && p.area));
  h = h.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${urlOf(l, f)}">`);
  h = withHreflang(h, f);
  h = h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (_, a, j, b) => a + translateLd(j, l, t) + b);
  // Σώμα σελίδας: από το <body> μέχρι πριν τα scripts
  const body = f === 'index.html' ? homeBody(l, t, L) : stayBody(p, elHtml, l, t, L);
  h = h.replace(/<body[\s\S]*?(?=\s*<script defer)/, body.trimEnd());
  return h;
}

// ── Εκτέλεση ──
for (const f of PAGES) {
  let el = rd(f);
  el = el.replace(/<html[^>]*>/, '<html lang="el" data-lang="el">');
  el = withHreflang(el, f);
  wr(f, el);
  for (const l of Object.keys(LANGS)) wr(`${l}/${f}`, buildLang(l, f, el));
  console.log('✓', f, '→', Object.keys(LANGS).map((l) => `${l}/${f}`).join(', '));
}

// sitemap.xml: ελληνικές + σελίδες κάθε γλώσσας, με hreflang
let sm = rd('sitemap.xml');
if (!sm.includes('xmlns:xhtml')) sm = sm.replace('<urlset ', '<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" ');
sm = sm.replace(/\s*<xhtml:link [^>]*\/>/g, '');
const dirs = Object.keys(LANGS).join('|');
sm = sm.replace(new RegExp(`\\s*<url>\\s*<loc>https://comfystay\\.gr/(${dirs})/[\\s\\S]*?</url>`, 'g'), '');
const alt = (f) => [['el', 'el'], ...Object.entries(LANGS).map(([l, x]) => [l, x.hreflang]), ['en', 'x-default']]
  .map(([l, hl]) => `\n    <xhtml:link rel="alternate" hreflang="${hl}" href="${urlOf(l, f)}"/>`).join('');
const added = [];
sm = sm.replace(/<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g, (block, loc) => {
  const f = loc.replace(SITE, '') || 'index.html';
  if (!PAGES.includes(f)) return block;
  const elBlock = block.replace(/(<\/loc>)/, '$1' + alt(f));
  for (const l of Object.keys(LANGS)) {
    added.push(elBlock.replace(`<loc>${loc}</loc>`, `<loc>${urlOf(l, f)}</loc>`)
      .replace(/(<priority>)[\d.]+/, (m, a) => a + (f === 'index.html' ? '0.9' : '0.7')));
  }
  return elBlock;
});
sm = sm.replace(/\s*<\/urlset>/, '\n  ' + added.join('\n  ') + '\n</urlset>');
wr('sitemap.xml', sm);
console.log('✓ sitemap.xml');
