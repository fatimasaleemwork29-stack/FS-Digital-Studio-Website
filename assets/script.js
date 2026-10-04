const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuButton && mobileMenu) {
  const setMenuState = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  };

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    setMenuState(open);
  });

  mobileMenu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuState(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setMenuState(false);
  });
}

const currentPath = window.location.pathname.replace(/index\.html$/, '');
document.querySelectorAll('[data-nav-link]').forEach((link) => {
  const href = new URL(link.href).pathname.replace(/index\.html$/, '');
  if (href === currentPath || (currentPath === '/' && href === '/')) {
    link.setAttribute('aria-current', 'page');
  }
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function trackSiteEvent(name, detail = {}) {
  const payload = { event: name, ...detail };
  window.dispatchEvent(new CustomEvent('fs:analytics', { detail: payload }));
  if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a.button, a.text-link');
  if (!link) return;
  trackSiteEvent('site_action', {
    label: link.textContent.trim().replace(/\s+/g, ' '),
    destination: link.getAttribute('href')
  });
});
if (!reduceMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('has-js');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
}

const enquiryForm = document.querySelector('[data-enquiry-form]');
const enquiryResult = document.querySelector('[data-enquiry-result]');
const enquiryText = document.querySelector('[data-enquiry-text]');
const copyButton = document.querySelector('[data-copy-enquiry]');

if (enquiryForm && enquiryResult && enquiryText) {
  enquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!enquiryForm.reportValidity()) return;

    const data = new FormData(enquiryForm);
    const message = [
      'Hello FS Digital Studio,',
      '',
      `My name is ${data.get('name')} and I’m reaching out from ${data.get('business')}.`,
      `Business link: ${data.get('business-link') || 'Not provided'}`,
      `I’m interested in: ${data.get('service')}`,
      '',
      'The main challenge I would like to discuss:',
      data.get('challenge'),
      '',
      `Preferred reply method: ${data.get('reply-method')}`,
      `Reply details: ${data.get('reply-details')}`
    ].join('\n');

    enquiryText.value = message;
    enquiryResult.hidden = false;
    trackSiteEvent('enquiry_prepared', { service: data.get('service') });
    enquiryResult.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(enquiryText.value);
      trackSiteEvent('enquiry_copied');
      copyButton.textContent = 'Copied';
      setTimeout(() => { copyButton.textContent = 'Copy enquiry'; }, 1800);
    } catch {
      enquiryText.select();
      document.execCommand('copy');
      copyButton.textContent = 'Copied';
    }
  });
}

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});
