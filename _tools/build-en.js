#!/usr/bin/env node
/*
 * Φτιάχνει τις αγγλικές σελίδες (/en/) από τις ελληνικές και το config.js,
 * βάζει hreflang σε όλες τις σελίδες και ενημερώνει το sitemap.xml.
 *
 * Τρέξε το από τον φάκελο του site, κάθε φορά που αλλάζεις κείμενα στο config.js ή στις ελληνικές σελίδες:
 *     node _tools/build-en.js
 *
 * Τίτλοι και περιγραφές για το Google (αγγλικά): στο SEO πιο κάτω.
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
const EN = sandbox.window.I18N.en;
const stayPage = (p) => p.name.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.html';
const L = (o) => (o == null ? '' : typeof o === 'string' ? o : o.en ?? o.el ?? '');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function t(key, vars = {}) {
  let s = EN[key] ?? key;
  if (s.includes('|') && 'n' in vars) s = s.split('|')[Number(vars.n) === 1 ? 0 : 1];
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
}

// ── Τίτλοι & περιγραφές Google στα αγγλικά (τίτλος έως ~60, περιγραφή έως ~155 χαρακτήρες) ──
const SEO = {
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
};
const PAGES = Object.keys(SEO);
for (const f of PAGES) if (SEO[f].title.length > 65 || SEO[f].desc.length > 160) console.warn('Μεγάλο κείμενο:', f);

const urlEl = (f) => SITE + (f === 'index.html' ? '' : f);
const urlEn = (f) => SITE + 'en/' + (f === 'index.html' ? '' : f);
const propOf = (f) => C.properties.find((p) => stayPage(p) === f);

const REGION = { 'Κεντρική Μακεδονία': 'Central Macedonia', 'Δυτική Μακεδονία': 'Western Macedonia' };
const LOCALITY = { 'Θεσσαλονίκη': 'Thessaloniki', 'Πυλαία': 'Pylaia', 'Σιάτιστα': 'Siatista' };

function hreflangLinks(f) {
  return [
    `<link rel="alternate" hreflang="el" href="${urlEl(f)}">`,
    `<link rel="alternate" hreflang="en" href="${urlEn(f)}">`,
    `<link rel="alternate" hreflang="x-default" href="${urlEn(f)}">`,
  ].map((x) => '  ' + x).join('\n');
}
// Βάζει (ή ξαναβάζει) τα hreflang αμέσως μετά το canonical
function withHreflang(html, f) {
  html = html.replace(/\n\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, '');
  return html.replace(/(<link rel="canonical"[^>]*>)/, `$1\n${hreflangLinks(f)}`);
}
const setMeta = (html, attr, name, value) =>
  html.replace(new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`), `$1${esc(value)}$2`);

function facts(p) {
  return [
    t('guests_up_to', { n: p.maxGuests }),
    p.bedrooms ? t('bedrooms', { n: p.bedrooms }) : null,
    p.beds ? t('beds', { n: p.beds }) : null,
    p.sofaBeds ? t('sofa_beds', { n: p.sofaBeds }) : null,
    p.baths ? t('baths', { n: p.baths }) : null,
    p.size ? t('size', { n: p.size }) : null,
  ].filter(Boolean).join(' · ');
}

// ── JSON-LD στα αγγλικά ──
function translateLd(json, f) {
  const d = JSON.parse(json);
  for (const node of d['@graph'] || []) {
    if (node['@type'] === 'LodgingBusiness') {
      const file = node.url.replace(SITE, '');
      const p = propOf(file);
      node.url = urlEn(file);
      if (SEO[file]) node.description = SEO[file].desc;
      delete node.keywords;
      if (p && p.amenities) node.amenityFeature = p.amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: t('amenity_' + a), value: true }));
      if (node.address && p && p.address && p.address.en) {
        node.address.streetAddress = p.address.en.split(',')[0].trim();
        node.address.addressLocality = LOCALITY[node.address.addressLocality] || node.address.addressLocality;
        node.address.addressRegion = REGION[node.address.addressRegion] || node.address.addressRegion;
      }
    }
    if (node['@type'] === 'BreadcrumbList') {
      for (const it of node.itemListElement) it.item = urlEn(it.item.replace(SITE, '') || 'index.html');
    }
  }
  return JSON.stringify(d);
}

const footer = () => `  <footer id="site-foot" class="site-foot">
    <div class="wrap"><p><strong>${esc(C.brand)}</strong>: ${esc(t('footer_note'))}</p>
    <p>${C.contact.phones.map((ph) => `<a href="tel:+${ph.number.replace(/\D/g, '')}">${esc(ph.number)}</a>`).join(' · ')} · <a href="mailto:${C.contact.email}">${C.contact.email}</a></p>
    <ul>${C.properties.map((p) => `<li><a href="${stayPage(p)}">${esc(p.name)}</a></li>`).join('')}</ul></div>
  </footer>`;

function homeBody() {
  const cities = C.cities.map((c) => {
    const ps = C.properties.filter((p) => p.city === c.id);
    if (!ps.length) return '';
    const cards = ps.map((p) => `<article class="stay">
        <h3><a href="${stayPage(p)}">${esc(p.name)}</a></h3>
        <p>${esc(L(p.area))}. ${esc(L(p.tagline))}</p>
        <p>${esc(facts(p))}</p>
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
        <h1 id="hero-title">${esc(SEO['index.html'].h1)}</h1>
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
${footer()}
`;
}

function stayBody(p, elHtml) {
  const area = L(p.area);
  const gallery = (p.photos || []).slice(0, 5).map((src, i) =>
    `<img src="../${src.replace(/\.jpg$/, '-s.jpg')}" alt="${esc(`${p.name}, ${area}, photo ${i + 1}`)}" loading="lazy" width="400">`).join('');
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
          <section><h2>${esc(t('about_stay'))}</h2><p>${esc(facts(p))}</p>${desc}</section>
          <section><h2>${esc(t('amenities'))}</h2><ul>${amen}</ul></section>
          <section><h2>${esc(t('location'))}</h2><p>${esc(L(p.address))}</p></section>
        </div>
        ${aside}
      </div>
    </div>
  </main>
${footer()}
`;
}

function buildEn(f, elHtml) {
  const s = SEO[f];
  let h = elHtml;
  h = h.replace(/<html[^>]*>/, '<html lang="en" data-lang="en">');
  h = h.replace(/(href|src)="(assets|img)\//g, '$1="../$2/');
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${esc(s.title)}</title>`);
  h = h.replace(/\n\s*<meta name="keywords"[^>]*>/, '');
  for (const [a, n, v] of [
    ['name', 'description', s.desc], ['property', 'og:title', s.title], ['property', 'og:description', s.desc],
    ['property', 'og:url', urlEn(f)], ['property', 'og:image:alt', s.title],
    ['name', 'twitter:title', s.title], ['name', 'twitter:description', s.desc],
  ]) h = setMeta(h, a, n, v);
  h = h.replace(/<meta property="og:locale" content="el_GR">/, '<meta property="og:locale" content="en_GB">')
       .replace(/<meta property="og:locale:alternate" content="en_GB">/, '<meta property="og:locale:alternate" content="el_GR">');
  const p = propOf(f);
  h = setMeta(h, 'name', 'geo.placename', s.place || L(p && p.area));
  h = h.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${urlEn(f)}">`);
  h = withHreflang(h, f);
  h = h.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (_, a, j, b) => a + translateLd(j, f) + b);
  // Σώμα σελίδας: από το <body> μέχρι πριν τα scripts
  const body = f === 'index.html' ? homeBody() : stayBody(p, elHtml);
  h = h.replace(/<body[\s\S]*?(?=\s*<script defer)/, body.trimEnd());
  return h;
}

// ── Εκτέλεση ──
for (const f of PAGES) {
  let el = rd(f);
  el = el.replace(/<html[^>]*>/, '<html lang="el" data-lang="el">');
  el = withHreflang(el, f);
  wr(f, el);
  wr('en/' + f, buildEn(f, el));
  console.log('✓', f, '→ en/' + f);
}

// sitemap.xml: ελληνικές + αγγλικές διευθύνσεις, με hreflang
let sm = rd('sitemap.xml');
if (!sm.includes('xmlns:xhtml')) sm = sm.replace('<urlset ', '<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml" ');
sm = sm.replace(/\s*<xhtml:link [^>]*\/>/g, '');
sm = sm.replace(/\s*<url>\s*<loc>https:\/\/comfystay\.gr\/en\/[\s\S]*?<\/url>/g, '');
const alt = (f) => ['el', 'en', 'x-default'].map((l) =>
  `\n    <xhtml:link rel="alternate" hreflang="${l}" href="${l === 'el' ? urlEl(f) : urlEn(f)}"/>`).join('');
const added = [];
sm = sm.replace(/<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g, (block, loc) => {
  const f = loc.replace(SITE, '') || 'index.html';
  if (!PAGES.includes(f)) return block;
  const elBlock = block.replace(/(<\/loc>)/, '$1' + alt(f));
  added.push(elBlock.replace(`<loc>${loc}</loc>`, `<loc>${urlEn(f)}</loc>`).replace(/(<priority>)[\d.]+/, (m, a) => a + (f === 'index.html' ? '0.9' : '0.7')));
  return elBlock;
});
sm = sm.replace(/\s*<\/urlset>/, '\n  ' + added.join('\n  ') + '\n</urlset>');
wr('sitemap.xml', sm);
console.log('✓ sitemap.xml');
