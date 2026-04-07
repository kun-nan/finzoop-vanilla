/* ── page-sections.js
   Fetches and renders ALL page sections from Contentful.
   Every section has a data-cms attribute for targeting.   ── */

const SECTIONS = {
  spaceId: window.CONTENTFUL_SPACE_ID  || 'tabc1qgaltm6',
  token:   window.CONTENTFUL_ACCESS_TOKEN
         || 'VCpSt0x-mm6pOncY1cYlkkuU5b9UsD_cs_mINwRgs6I',

  get base() {
    return `https://cdn.contentful.com/spaces/${this.spaceId}`
         + `/environments/master/entries`;
  },

  resolveAsset(id, includes) {
    if (!id || !includes?.Asset) return null;
    const a = includes.Asset.find(x => x.sys.id === id);
    return a?.fields?.file?.url
      ? 'https:' + a.fields.file.url : null;
  },

  async fetch(params, cacheKey) {
    const cached = sessionStorage.getItem('pgs_' + cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch(e) {}
    }
    const p = new URLSearchParams({
      ...params, access_token: this.token });
    const res = await fetch(`${this.base}?${p}`);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();
    try {
      sessionStorage.setItem(
        'pgs_' + cacheKey,
        JSON.stringify(data)
      );
    } catch(e) {}
    return data;
  },

  // ── HERO SECTION ───────────────────────────────────────
  async renderHero(identifier) {
    const el = document.querySelector(
      `[data-cms="hero"][data-cms-id="${identifier}"]`);
    if (!el) return;

    try {
      const data = await this.fetch({
        content_type: 'heroBanner',
        'fields.identifier': identifier,
        limit: 1,
        include: 2
      }, `hero-${identifier}`);

      if (!data.items?.length) return;

      const f = data.items[0].fields;
      const bgImage = f.backgroundImage?.sys?.id
        ? this.resolveAsset(
            f.backgroundImage.sys.id, data.includes)
        : null;

      // Update hero heading
      const h1 = el.querySelector('[data-hero="heading"]');
      if (h1 && f.headingLine1) {
        h1.innerHTML = f.headingHighlightWord
          ? f.headingLine1.replace(
              f.headingHighlightWord,
              `<span class="text-gradient">
                 ${f.headingHighlightWord}
               </span>`)
          : f.headingLine1;
      }

      // Subheading
      const sub = el.querySelector('[data-hero="subheading"]');
      if (sub && f.subheading) sub.textContent = f.subheading;

      // Primary CTA
      const cta1 = el.querySelector('[data-hero="cta-primary"]');
      if (cta1) {
        if (f.ctaPrimaryLabel) cta1.textContent = f.ctaPrimaryLabel;
        if (f.ctaPrimaryUrl)   cta1.href = f.ctaPrimaryUrl;
      }

      // Secondary CTA
      const cta2 = el.querySelector('[data-hero="cta-secondary"]');
      if (cta2) {
        if (f.ctaSecondaryLabel)
          cta2.textContent = f.ctaSecondaryLabel;
        if (f.ctaSecondaryUrl)
          cta2.href = f.ctaSecondaryUrl;
      }

      // Background image
      if (bgImage && f.backgroundType === 'image') {
        el.style.backgroundImage = `url(${bgImage})`;
        el.style.backgroundSize  = 'cover';
        el.style.backgroundPosition = 'center';
      }

      // Trust bar
      const trustBar = el.querySelector('[data-hero="trust-bar"]');
      if (trustBar && f.trustBarItems?.length) {
        trustBar.innerHTML = f.trustBarItems.map(item => `
          <div class="trust-item">
            <i data-lucide="${item.icon}"
               style="width:20px;height:20px;
                      color:var(--secondary);"></i>
            <span>
              <strong>${item.value}</strong> ${item.label}
            </span>
          </div>`).join('');
        if (window.lucide) lucide.createIcons();
      }

      // Badge
      const badge = el.querySelector('[data-hero="badge"]');
      if (badge && f.badgeText) badge.textContent = f.badgeText;

    } catch(e) {
      console.warn(`[Sections] Hero ${identifier}:`, e.message);
    }
  },

  // ── TESTIMONIALS ───────────────────────────────────────
  async renderTestimonials() {
    const el = document.querySelector(
      '[data-cms="testimonials"]');
    if (!el) return;

    try {
      const data = await this.fetch({
        content_type:             'testimonial',
        'fields.isPublished':     'true',
        'fields.showOnHomepage':  'true',
        order:                    'fields.sortOrder',
        include:                  2
      }, 'testimonials');

      const items = data.items || [];
      if (!items.length) return;

      const container = el.querySelector(
        '[data-testimonials="grid"]');
      if (!container) return;

      container.innerHTML = items.map(item => {
        const f = item.fields;
        const photoUrl = f.avatar?.sys?.id
          ? this.resolveAsset(f.avatar.sys.id, data.includes)
          : null;
        const initials = f.initials
          || f.name?.split(' ')
               .map(n => n[0]).join('').toUpperCase()
          || 'U';
        const stars = '★'.repeat(f.rating || 5);

        return `
          <div class="testimonial-card card">
            <div style="color:#F59E0B;font-size:18px;
                        margin-bottom:12px;">
              ${stars}
            </div>
            <p style="font-size:15px;line-height:1.7;
                      color:var(--text-primary);
                      margin:0 0 20px;
                      font-style:italic;">
              "${f.reviewText}"
            </p>
            <div style="display:flex;align-items:center;
                        gap:12px;">
              ${photoUrl
                ? `<img src="${photoUrl}" alt="${f.name}"
                        style="width:44px;height:44px;
                               border-radius:50%;
                               object-fit:cover;">`
                : `<div style="width:44px;height:44px;
                                border-radius:50%;
                                background:var(--primary);
                                color:white;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-weight:700;
                                font-size:16px;">
                     ${initials}
                   </div>`}
              <div>
                <div style="font-weight:600;font-size:15px;">
                  ${f.name}
                </div>
                <div style="font-size:13px;
                             color:var(--text-secondary);">
                  ${f.productUsed || ''} 
                  ${f.city ? `· ${f.city}` : ''}
                </div>
              </div>
              ${f.verifiedBadge ? `
                <div style="margin-left:auto;">
                  <i data-lucide="badge-check"
                     style="width:20px;height:20px;
                            color:var(--secondary);"></i>
                </div>` : ''}
            </div>
          </div>`;
      }).join('');

      if (window.lucide) lucide.createIcons();
    } catch(e) {
      console.warn('[Sections] Testimonials:', e.message);
    }
  },

  // ── PARTNER LOGOS ──────────────────────────────────────
  async renderPartners() {
    const el = document.querySelector('[data-cms="partners"]');
    if (!el) return;

    try {
      const data = await this.fetch({
        content_type:            'partner',
        'fields.isPublished':    'true',
        'fields.showOnHomepage': 'true',
        order:                   'fields.sortOrder',
        include:                 2
      }, 'partners');

      const items = data.items || [];
      if (!items.length) return;

      const container = el.querySelector(
        '[data-partners="grid"]');
      if (!container) return;

      container.innerHTML = items.map(item => {
        const f = item.fields;
        const logoUrl = f.logo?.sys?.id
          ? this.resolveAsset(f.logo.sys.id, data.includes)
          : null;
        return logoUrl ? `
          <div class="partner-logo-item">
            <img src="${logoUrl}"
                 alt="${f.logoAlt || f.name}"
                 loading="lazy"
                 style="max-height:40px;max-width:120px;
                        object-fit:contain;
                        filter:grayscale(100%);
                        opacity:0.6;
                        transition:filter 0.2s,opacity 0.2s;"
                 onmouseover="this.style.filter='none';
                              this.style.opacity='1'"
                 onmouseout="this.style.filter=
                              'grayscale(100%)';
                             this.style.opacity='0.6'">
          </div>` : '';
      }).join('');
    } catch(e) {
      console.warn('[Sections] Partners:', e.message);
    }
  },

  // ── PAGE SEO ───────────────────────────────────────────
  async injectSEO(pageIdentifier) {
    try {
      const data = await this.fetch({
        content_type:           'pageSeo',
        'fields.pageIdentifier': pageIdentifier,
        limit: 1,
        include: 2
      }, `seo-${pageIdentifier}`);

      if (!data.items?.length) return;
      const f = data.items[0].fields;

      if (f.metaTitle) document.title = f.metaTitle;

      const setMeta = (name, content) => {
        if (!content) return;
        let el = document.querySelector(
          `meta[name="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.name = name;
          document.head.appendChild(el);
        }
        el.content = content;
      };
      const setOg = (prop, content) => {
        if (!content) return;
        let el = document.querySelector(
          `meta[property="${prop}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('property', prop);
          document.head.appendChild(el);
        }
        el.content = content;
      };

      setMeta('description', f.metaDescription);
      setMeta('keywords',    f.metaKeywords);
      setOg('og:title',       f.ogTitle || f.metaTitle);
      setOg('og:description', f.ogDescription);

      const ogImg = f.ogImage?.sys?.id
        ? this.resolveAsset(f.ogImage.sys.id, data.includes)
        : null;
      if (ogImg) setOg('og:image', ogImg);

      if (f.canonicalUrl) {
        let link = document.querySelector('link[rel="canonical"]');
        if (!link) {
          link = document.createElement('link');
          link.rel = 'canonical';
          document.head.appendChild(link);
        }
        link.href = f.canonicalUrl;
      }

      if (f.customJsonLd) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = f.customJsonLd;
        document.head.appendChild(script);
      }
    } catch(e) {
      console.warn('[Sections] SEO:', e.message);
    }
  },

  // ── FAQS ───────────────────────────────────────────────
  async renderFaqs(category) {
    const el = document.querySelector(
      `[data-cms="faqs"][data-cms-category="${category}"]`);
    if (!el) return;

    try {
      const data = await this.fetch({
        content_type:         'faq',
        'fields.category':    category,
        'fields.isPublished': 'true',
        order:                'fields.sortOrder',
        limit:                20
      }, `faqs-${category}`);

      const items = data.items || [];
      if (!items.length) return;

      const container = el.querySelector('[data-faqs="list"]');
      if (!container) return;

      container.innerHTML = items.map((item, i) => {
        const f = item.fields;
        const answer = typeof f.answer === 'object'
          && f.answer?.nodeType === 'document'
          ? extractPlainText(f.answer)
          : (f.answer || '');
        return `
          <div class="faq-item">
            <button class="faq-question"
                    onclick="toggleFaq(this)"
                    aria-expanded="false">
              ${f.question}
              <i data-lucide="chevron-down"
                 style="width:18px;height:18px;
                        transition:transform 0.2s;"></i>
            </button>
            <div class="faq-answer" style="display:none;">
              <p>${answer}</p>
            </div>
          </div>`;
      }).join('');

      if (window.lucide) lucide.createIcons();
    } catch(e) {
      console.warn('[Sections] FAQs:', e.message);
    }
  },

  // ── CALCULATOR META ────────────────────────────────────
  async renderCalculatorMeta(slug) {
    const el = document.querySelector(
      `[data-cms="calculator-meta"]`);
    if (!el) return;

    try {
      const data = await this.fetch({
        content_type: 'calculatorMeta',
        'fields.slug': slug,
        limit: 1, include: 2
      }, `calc-${slug}`);

      if (!data.items?.length) return;
      const f = data.items[0].fields;

      // Update article section if present
      const intro = el.querySelector('[data-calc="intro"]');
      if (intro && f.introContent) {
        if (typeof f.introContent === 'string') {
          intro.innerHTML = f.introContent;
        }
      }

      // Update FAQ section
      if (f.faqs?.length) {
        const faqEl = el.querySelector('[data-faqs="list"]');
        if (faqEl) {
          const faqEntries = f.faqs.map(ref =>
            (data.includes?.Entry || []).find(
              e => e.sys.id === ref.sys.id)
          ).filter(Boolean);

          faqEl.innerHTML = faqEntries.map(entry => {
            const q = entry.fields;
            const answer = typeof q.answer === 'object'
              ? extractPlainText(q.answer)
              : (q.answer || '');
            return `
              <div class="faq-item">
                <button class="faq-question"
                        onclick="toggleFaq(this)"
                        aria-expanded="false">
                  ${q.question}
                  <i data-lucide="chevron-down"
                     style="width:18px;height:18px;
                            transition:transform 0.2s;">
                  </i>
                </button>
                <div class="faq-answer" style="display:none;">
                  <p>${answer}</p>
                </div>
              </div>`;
          }).join('');
          if (window.lucide) lucide.createIcons();
        }
      }

      // Default values for calculator inputs
      if (f.defaultValues && typeof f.defaultValues === 'object') {
        Object.entries(f.defaultValues).forEach(([key, val]) => {
          const input = document.querySelector(
            `[data-sync="${key}"]`);
          if (input) {
            input.value = val;
            input.dispatchEvent(new Event('input'));
          }
        });
      }
    } catch(e) {
      console.warn('[Sections] Calc meta:', e.message);
    }
  },

  // ── MAIN INIT ──────────────────────────────────────────
  async init() {
    const body = document.body;
    const pageId = body.getAttribute('data-cms-page') || '';

    // Inject SEO for this page
    if (pageId) await this.injectSEO(pageId);

    // Hero sections — find all on page
    document.querySelectorAll('[data-cms="hero"]')
      .forEach(el => {
        const id = el.getAttribute('data-cms-id');
        if (id) this.renderHero(id);
      });

    // Testimonials
    if (document.querySelector('[data-cms="testimonials"]')) {
      this.renderTestimonials();
    }

    // Partners
    if (document.querySelector('[data-cms="partners"]')) {
      this.renderPartners();
    }

    // FAQs — find all FAQ sections
    document.querySelectorAll('[data-cms="faqs"]')
      .forEach(el => {
        const cat = el.getAttribute('data-cms-category');
        if (cat) this.renderFaqs(cat);
      });

    // Calculator meta
    const calcEl = document.querySelector(
      '[data-cms="calculator-meta"]');
    if (calcEl) {
      const slug = calcEl.getAttribute('data-cms-slug');
      if (slug) this.renderCalculatorMeta(slug);
    }
  }
};

// ── FAQ accordion helper ───────────────────────────────────
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', !isOpen);
  answer.style.display = isOpen ? 'none' : 'block';
  const icon = btn.querySelector('[data-lucide]');
  if (icon) {
    icon.style.transform = isOpen ? '' : 'rotate(180deg)';
  }
}

// ── Plain text extractor for rich text ────────────────────
function extractPlainText(node) {
  if (!node) return '';
  if (node.nodeType === 'text') return node.value || '';
  return (node.content || []).map(extractPlainText).join(' ');
}

document.addEventListener('DOMContentLoaded',
  () => SECTIONS.init());
