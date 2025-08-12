// js/script.js — Manyagi small UI helpers + mobile nav + simple animations

document.addEventListener('DOMContentLoaded', function() {

  // Mobile nav toggle
  (function(){
    const toggle = document.getElementById('navToggle');
    const mobile = document.getElementById('mobileNav');
    if (!toggle || !mobile) return;
    toggle.style.display = 'inline-block';
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      mobile.style.display = expanded ? 'none' : 'block';
      mobile.setAttribute('aria-hidden', String(expanded));
    });
  })();

  // Intersection fade-in for cards
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('inview')
        obs.unobserve(e.target)
      }
    })
  }, {threshold:0.15})
  document.querySelectorAll('.card, .prod, .hero, .subscribe').forEach(n => obs.observe(n))

  // Simple form UX (shows success text when Formspree responds)
  const forms = document.querySelectorAll('form')
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const btn = form.querySelector('button[type="submit"]')
      if (btn) { btn.disabled = true; btn.innerText = 'Sending…' }
      setTimeout(()=> {
        if (btn) { btn.innerText = 'Check your email'; }
      }, 1200)
    })
  })
});
