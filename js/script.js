// Manyagi — global scripts: lazy fade-in, smooth-scroll, form UX
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const id=a.getAttribute('href').slice(1);
      const el=document.getElementById(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth',block:'start'}); }
    });
  });

  // Intersection fade-in
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('inview'); obs.unobserve(e.target); }
    });
  },{threshold:.15});
  document.querySelectorAll('.card,.hero').forEach(n=>obs.observe(n));

  // Basic form feedback (you’ll use ConvertKit/Stripe actual flows)
  document.querySelectorAll('form[data-feedback]').forEach(form=>{
    form.addEventListener('submit',()=>{
      const btn=form.querySelector('button[type="submit"]');
      if(btn){ btn.disabled=true; btn.innerText='Sending…'; }
      setTimeout(()=>{ if(btn){ btn.innerText='Sent! Check your email'; } },1200);
    });
  });
});
