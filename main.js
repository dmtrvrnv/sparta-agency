// «Спарта»: появление при прокрутке, смена фото в принципах,
// подсветка девиза по словам, горизонтальный марш по шагам.
document.documentElement.classList.add('js');

(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Шапка: проявляется на тёмном фоне, прячется при прокрутке вниз */
  const top = document.querySelector('.top');
  let lastY = 0;

  /* Появление блоков */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { threshold: .2 });
  document.querySelectorAll('.reveal, .rank').forEach((n) => io.observe(n));
  document.querySelectorAll('.rank .role').forEach((r, i) => r.style.setProperty('--i', i));

  /* Принципы: активный пункт меняет фото */
  const tenets = [...document.querySelectorAll('.tenet')];
  const photos = [...document.querySelectorAll('.tenets__photo img')];
  function setTenet(i) {
    tenets.forEach((t, k) => t.classList.toggle('is-on', k === i));
    photos.forEach((p, k) => p.classList.toggle('is-on', k === i));
  }

  /* Девиз: слова загораются по мере прокрутки */
  const quote = document.querySelector('[data-words]');
  const words = quote.textContent.trim().split(/\s+/);
  quote.setAttribute('aria-label', quote.textContent.trim());
  quote.innerHTML = words.map((w) => `<span class="w${/\.$/.test(w) ? ' accent' : ''}" aria-hidden="true">${w}</span>`).join(' ');
  const wordEls = [...quote.querySelectorAll('.w')];

  /* Параллакс широких фото */
  const parallax = [...document.querySelectorAll('.band__media, .outro__media')];

  /* Путь */
  const path = document.querySelector('.path');
  const pin = path.querySelector('.path__pin');
  const track = path.querySelector('.track');
  const cards = [...track.children];
  const bar = path.querySelector('.path__bar i');
  const counter = path.querySelector('.path__count b');

  function frame() {
    const y = scrollY;
    const vh = innerHeight;

    top.classList.toggle('is-solid', y > 40);
    top.classList.toggle('is-hidden', y > lastY && y > vh * .8);
    lastY = y;

    // принципы
    let best = 0;
    let bestD = Infinity;
    tenets.forEach((t, i) => {
      const r = t.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - vh / 2);
      if (d < bestD) { bestD = d; best = i; }
    });
    setTenet(best);

    // девиз
    const qr = quote.getBoundingClientRect();
    const qp = Math.min(1, Math.max(0, (vh * .85 - qr.top) / (qr.height + vh * .45)));
    const lit = Math.round(qp * wordEls.length);
    wordEls.forEach((w, i) => w.classList.toggle('lit', i < lit));

    // параллакс
    if (!reduce) {
      for (const m of parallax) {
        const r = m.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        m.style.opacity = (1 - Math.min(.6, Math.abs(p) * .7)).toFixed(3);
      }
    }

    // путь
    const pr = path.getBoundingClientRect();
    const span = pr.height - pin.offsetHeight;
    const p = Math.min(1, Math.max(0, -pr.top / span));
    const pad = parseFloat(getComputedStyle(track).paddingLeft);
    const max = cards[cards.length - 1].offsetLeft - pad;
    const shift = p * Math.max(0, max);
    track.style.transform = `translate3d(${-shift}px,0,0)`;
    bar.style.transform = `scaleX(${p})`;
    let on = 0;
    let onD = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft - shift - pad);
      if (d < onD) { onD = d; on = i; }
    });
    cards.forEach((c, i) => c.classList.toggle('is-on', i === on));
    counter.textContent = String(on + 1).padStart(2, '0');
  }

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { frame(); ticking = false; });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  frame();
})();
