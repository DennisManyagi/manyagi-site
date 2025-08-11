// script.js — small animations + form UX
document.addEventListener('DOMContentLoaded', function() {
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
      // optional: show working state
      const btn = form.querySelector('button[type="submit"]')
      if (btn) { btn.disabled = true; btn.innerText = 'Sending…' }
      // allow native submit to Formspree / external; if you use fetch, adapt
      setTimeout(()=> {
        if (btn) { btn.innerText = 'Check your email'; }
      }, 1200)
    })
  })
})
