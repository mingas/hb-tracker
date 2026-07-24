/* nav/test.js — jsdom regression for nbar_menu_v4
   Verifies desktop dropdowns, mobile accordion, and the MENU MODEL contents. */
const { JSDOM } = require('jsdom');
const fs = require('fs');

const SCRIPT = fs.readFileSync(__dirname + '/nbar-menu.js', 'utf8');

const PAGE = `<!DOCTYPE html><html><head></head><body>
<div class="nbar-row">
  <a class="nbar-brand" href="/"><span class="nbar-name">The Testosterone Blueprint</span></a>
  <div class="nbar-mid">
    <a class="nbar-ghost" href="/resources">Resources</a>
    <a class="nbar-ghost" href="/womens-hormone-health">Women</a>
    <a class="nbar-ghost" href="/testosterone-test">T Quiz</a>
    <a class="nbar-ghost" href="/hormone-quiz">Hormone Quiz</a>
    <a class="nbar-ghost" href="/free-guide">Free Guide</a>
    <a class="nbar-ghost" href="/contact">Contact</a>
  </div>
  <a class="nbar-red" href="/#book">Get the book &rarr;</a>
</div>
</body></html>`;

let pass = 0, fail = 0;
const t = (name, cond, extra) => {
  if (cond) { pass++; console.log('ok   ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
};

const dom = new JSDOM(PAGE, { runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window, d = w.document;
w.eval(SCRIPT);

setTimeout(() => {
  // ---------- desktop ----------
  const top = d.querySelector('.nbm-top');
  t('desktop .nbm-top built', !!top);

  const dds = d.querySelectorAll('.nbm-dd');
  t('4 dropdowns built', dds.length === 4, 'got ' + dds.length);

  const labels = Array.from(dds).map(dd =>
    dd.querySelector('.nbm-dd-btn').textContent.replace(/\u25BE/g, '').trim());
  t('dropdown order Resources/Nutrition/Men/Women',
    labels.join('|') === "Resources|Nutrition|Men's Health|Women's Health", labels.join('|'));

  t('Start Here top-level link', !!d.querySelector('.nbm-start'));

  // ---------- Women's model ----------
  const women = Array.from(dds).find(dd =>
    dd.querySelector('.nbm-dd-btn').textContent.indexOf("Women's Health") > -1);
  const wl = Array.from(women.querySelectorAll('.nbm-dd-link'));
  t("Women's has 11 items", wl.length === 11, 'got ' + wl.length);
  t('item 1 = Menopause Stage Check', wl[0].textContent === 'Menopause Stage Check', wl[0].textContent);
  t('item 2 = Hot Flash Duration (NEW)', wl[1].textContent === 'Hot Flash Duration', wl[1].textContent);
  t('item 2 href = /hot-flash-duration', wl[1].getAttribute('href') === '/hot-flash-duration', wl[1].getAttribute('href'));
  t('item 3 = HRT Checker', wl[2].textContent === 'HRT Checker', wl[2].textContent);
  t('last item = Book', wl[wl.length - 1].textContent === 'Book');
  t('no duplicate hrefs in Women', new Set(wl.map(a => a.getAttribute('href'))).size === wl.length);

  // ---------- Men's model unchanged ----------
  const men = Array.from(dds).find(dd =>
    dd.querySelector('.nbm-dd-btn').textContent.indexOf("Men's Health") > -1);
  t("Men's still 11 items", men.querySelectorAll('.nbm-dd-link').length === 11);

  // ---------- Resources / Nutrition ----------
  const res = Array.from(dds).find(dd => dd.querySelector('.nbm-dd-btn').textContent.indexOf('Resources') > -1);
  t('Resources 4 items', res.querySelectorAll('.nbm-dd-link').length === 4);
  const nut = Array.from(dds).find(dd => dd.querySelector('.nbm-dd-btn').textContent.indexOf('Nutrition') > -1);
  t('Nutrition 2 items', nut.querySelectorAll('.nbm-dd-link').length === 2);

  // ---------- folded ghosts hidden, Contact kept ----------
  const ghosts = d.querySelectorAll('.nbar-row .nbar-ghost:not(.nbm-dd-btn):not(.nbm-start)');
  let hidden = 0; const kept = [];
  ghosts.forEach(g => {
    if (g.classList.contains('nbm-hide')) hidden++;
    else kept.push(g.getAttribute('href'));
  });
  t('folded ghosts hidden', hidden === 5, 'hidden=' + hidden);
  t('Contact kept top-level', kept.length === 1 && kept[0] === '/contact', kept.join(','));

  // ---------- mobile ----------
  t('hamburger button built', !!d.querySelector('.nbm-btn'));
  const ov = d.querySelector('.nbm-ov');
  t('mobile overlay built', !!ov);
  const grps = ov.querySelectorAll('.nbm-grp');
  t('mobile has 4 groups', grps.length === 4, 'got ' + grps.length);
  const mWomen = Array.from(grps).find(g => g.querySelector('.nbm-grp-h').textContent.indexOf("Women's Health") > -1);
  const mwl = Array.from(mWomen.querySelectorAll('.nbm-sub a'));
  t('mobile Women 11 items', mwl.length === 11, 'got ' + mwl.length);
  t('mobile item 2 = Hot Flash Duration', mwl[1].textContent === 'Hot Flash Duration', mwl[1].textContent);
  t('mobile Home link', !!ov.querySelector('.nbm-ov-link'));
  t('mobile CTA present', !!ov.querySelector('.nbm-ov-cta'));

  const h = mWomen.querySelector('.nbm-grp-h');
  h.dispatchEvent(new w.Event('click'));
  t('accordion opens', mWomen.classList.contains('open'));
  h.dispatchEvent(new w.Event('click'));
  t('accordion closes', !mWomen.classList.contains('open'));

  // ---------- dropdown interaction ----------
  const wbtn = women.querySelector('.nbm-dd-btn');
  wbtn.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
  t('dropdown opens on click', women.classList.contains('open'));
  wbtn.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
  t('dropdown closes on second click', !women.classList.contains('open'));

  // ---------- misc ----------
  t('CSS injected', !!d.getElementById('nbm-css'));
  t('brand renamed', (d.querySelector('.nbar-name') || {}).textContent === 'The Hormone Blueprint');
  t('idempotent flag set', w.__nbarMenuV4 === true);

  console.log('\nPASS ' + pass + ' FAIL ' + fail);
  process.exit(fail ? 1 : 0);
}, 900);
