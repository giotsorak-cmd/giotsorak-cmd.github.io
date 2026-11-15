#!/usr/bin/env node
/*
 * Ενημερώνει το assets/availability.json από τα ημερολόγια iCal του Airbnb και του Booking.
 * Τρέχει αυτόματα στο GitHub (.github/workflows/availability.yml) κάθε 2 ώρες.
 *
 * Οι σύνδεσμοι iCal ΔΕΝ είναι στο site (περιέχουν μυστικούς κωδικούς). Είναι στο GitHub secret ICAL_FEEDS, σε μορφή:
 *   {"panoramic": ["https://www.airbnb.gr/calendar/ical/....ics?t=...", "https://ical.booking.com/v1/export?t=..."], "gg": [...], ...}
 * Τα κλειδιά είναι τα id των καταλυμάτων στο assets/config.js.
 *
 * Στο αρχείο γράφονται ΜΟΝΟ οι κλεισμένες νύχτες (από–έως), χωρίς ονόματα ή άλλα στοιχεία κρατήσεων.
 * Δοκιμή τοπικά:  ICAL_FEEDS="$(cat feeds.json)" node _tools/sync-availability.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..', 'assets', 'availability.json');

function parseDate(v) {
  // 20261116 ή 20261116T140000Z → 2026-11-16
  const m = /^(\d{4})(\d{2})(\d{2})/.exec(v.trim());
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

function parseICal(text) {
  const lines = text.replace(/\r\n[ \t]/g, '').split(/\r?\n/); // ενώνει τις «διπλωμένες» γραμμές
  const out = [];
  let cur = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') cur = {};
    else if (line === 'END:VEVENT') { if (cur && cur.start && cur.end && cur.end > cur.start) out.push([cur.start, cur.end]); cur = null; }
    else if (cur) {
      const i = line.indexOf(':');
      if (i < 0) continue;
      const key = line.slice(0, i).split(';')[0];
      if (key === 'DTSTART') cur.start = parseDate(line.slice(i + 1));
      else if (key === 'DTEND') cur.end = parseDate(line.slice(i + 1));
    }
  }
  return out;
}

function merge(ranges) {
  const sorted = ranges.slice().sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const out = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r[0] <= last[1]) { if (r[1] > last[1]) last[1] = r[1]; } else out.push([r[0], r[1]]);
  }
  return out;
}

async function fetchText(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'comfystay.gr availability sync' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      if (!text.includes('BEGIN:VCALENDAR')) throw new Error('not an iCal file');
      return text;
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise((r) => setTimeout(r, 3000 * attempt));
    }
  }
}

(async () => {
  const raw = process.env.ICAL_FEEDS;
  if (!raw) { console.error('Λείπει το ICAL_FEEDS (GitHub secret). Δεν άλλαξε τίποτα.'); process.exit(0); }
  const feeds = JSON.parse(raw);
  let prev = {};
  try { prev = JSON.parse(fs.readFileSync(OUT, 'utf8')).properties || {}; } catch { /* πρώτη φορά */ }

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Athens' }).format(new Date());
  const properties = {};
  let failures = 0;
  for (const [id, urls] of Object.entries(feeds)) {
    try {
      const all = [];
      for (const url of [].concat(urls)) all.push(...parseICal(await fetchText(url)));
      properties[id] = merge(all).filter((r) => r[1] > today);
      console.log(`${id}: ${properties[id].length} κλεισμένα διαστήματα`);
    } catch (e) {
      failures++;
      console.error(`${id}: αποτυχία (${e.message}) — κρατάω τα προηγούμενα`);
      if (prev[id]) properties[id] = prev[id];
    }
  }
  const next = { updated: new Date().toISOString(), properties };
  // Αν δεν άλλαξε τίποτα στις κρατήσεις, δεν γράφουμε (για να μη γεμίζει το ιστορικό με commits)
  if (JSON.stringify(prev) === JSON.stringify(properties) && fs.existsSync(OUT)) {
    console.log('Καμία αλλαγή.');
  } else {
    fs.writeFileSync(OUT, JSON.stringify(next, null, 1) + '\n');
    console.log('Γράφτηκε το', path.relative(process.cwd(), OUT));
  }
  if (failures === Object.keys(feeds).length) process.exit(1);
})();
