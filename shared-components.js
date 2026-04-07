/* ── shared-components.js
   Injects consistent header + footer on every page.
   Fetches content from Contentful navigationMenu entry.
   Falls back to static defaults if CMS unavailable.    ── */

(function() {

const SPACE  = window.CONTENTFUL_SPACE_ID  || 'tabc1qgaltm6';
const TOKEN  = window.CONTENTFUL_ACCESS_TOKEN
             || 'VCpSt0x-mm6pOncY1cYlkkuU5b9UsD_cs_mINwRgs6I';
const CDN    = `https://cdn.contentful.com/spaces/${SPACE}`
             + `/environments/master/entries`;

// ── Detect active page ────────────────────────────────────
function getActivePage() {
  const path = window.location.pathname;
  if (path.includes('loans'))          return 'loans';
  if (path.includes('credit-cards'))   return 'credit-cards';
  if (path.includes('insurance'))      return 'insurance';
  if (path.includes('mutual-funds'))   return 'mutual-funds';
  if (path.includes('nps'))            return 'nps';
  if (path.includes('investments'))    return 'investments';
  if (path.includes('calculators'))    return 'calculators';
  if (path.includes('blog'))           return 'blog';
  if (path.includes('about'))          return 'about';
  if (path.includes('contact'))        return 'contact';
  return 'home';
}

// ── Resolve root path (handles /calculators/ subfolder) ──
function rootPath(file) {
  const depth = window.location.pathname
    .split('/').filter(Boolean).length;
  const inSubfolder = depth >= 2 
    && !window.location.pathname.endsWith('.html') === false
    && window.location.pathname.includes('/calculators/');
  return inSubfolder ? '../' + file : file;
}

// ── Default nav structure (fallback) ─────────────────────
const DEFAULT_NAV = {
  ctaLabel: 'Check Eligibility',
  ctaUrl:   'loans.html',
  mainItems: [
    { label: 'Home',        url: 'index.html',      key: 'home' },
    { label: 'Products',    url: '#',               key: 'products',
      children: [
        { label: 'Personal Loans',   url: 'loans.html',
          icon: 'banknote',
          desc: 'Quick approval, best rates' },
        { label: 'Credit Cards',     url: 'credit-cards.html',
          icon: 'credit-card',
          desc: 'Rewards, cashback & travel' },
        { label: 'Insurance',        url: 'insurance.html',
          icon: 'shield-check',
          desc: 'Life, health & motor' },
        { label: 'Mutual Funds',     url: 'mutual-funds.html',
          icon: 'trending-up',
          desc: 'SIP from ₹500/month' },
        { label: 'NPS',              url: 'nps.html',
          icon: 'landmark',
          desc: 'Build your retirement corpus' },
        { label: 'Investments',      url: 'investments.html',
          icon: 'piggy-bank',
          desc: 'FDs, bonds & more' },
      ]
    },
    { label: 'Calculators', url: 'calculators.html', key: 'calculators',
      children: [
        { label: 'SIP Calculator',       url: 'calculators/sip.html' },
        { label: 'Lumpsum Calculator',   url: 'calculators/lumpsum.html' },
        { label: 'EMI Calculator',       url: 'calculators/emi.html' },
        { label: 'FD Calculator',        url: 'calculators/fd.html' },
        { label: 'PPF Calculator',       url: 'calculators/ppf.html' },
        { label: 'Income Tax Calculator',url: 'calculators/income-tax.html' },
        { label: 'EPF Calculator',       url: 'calculators/epf.html' },
        { label: 'RD Calculator',        url: 'calculators/rd.html' },
        { label: 'SWP Calculator',       url: 'calculators/swp.html' },
        { label: 'ELSS Calculator',      url: 'calculators/elss.html' },
        { label: 'SSY Calculator',       url: 'calculators/sukanya-samriddhi-yojana.html' },
        { label: 'MF Returns',           url: 'calculators/mutual-fund-returns.html' },
        { label: 'GST Calculator',       url: 'calculators/gst.html' },
        { label: 'XIRR Calculator',      url: 'calculators/xirr.html' },
      ]
    },
    { label: 'About',    url: 'about.html',   key: 'about' },
    { label: 'Blog',     url: 'blog.html',    key: 'blog' },
    { label: 'Contact',  url: 'contact.html', key: 'contact' },
  ],
  footerTagline: 'Your Financial Journey, Simplified.',
  footerDisclaimer: 'Finzoop is a registered financial services '
    + 'distribution platform. Mutual fund investments are subject '
    + 'to market risks. Read all scheme-related documents carefully. '
    + 'Insurance is the subject matter of solicitation. '
    + 'Finzoop is an AMFI-registered Mutual Fund Distributor '
    + 'and IRDAI-registered Corporate Agent.',
  col2Label: 'Quick Links',
  col2Links: [
    { label: 'Personal Loans',  url: 'loans.html' },
    { label: 'Credit Cards',    url: 'credit-cards.html' },
    { label: 'Insurance',       url: 'insurance.html' },
    { label: 'Mutual Funds',    url: 'mutual-funds.html' },
    { label: 'NPS',             url: 'nps.html' },
    { label: 'About Us',        url: 'about.html' },
    { label: 'Contact',         url: 'contact.html' },
  ],
  col3Label: 'Calculators',
  col3Links: [
    { label: 'SIP Calculator',  url: 'calculators/sip.html' },
    { label: 'EMI Calculator',  url: 'calculators/emi.html' },
    { label: 'FD Calculator',   url: 'calculators/fd.html' },
    { label: 'PPF Calculator',  url: 'calculators/ppf.html' },
    { label: 'Tax Calculator',  url: 'calculators/income-tax.html' },
    { label: 'EPF Calculator',  url: 'calculators/epf.html' },
    { label: 'ELSS Calculator', url: 'calculators/elss.html' },
  ],
  social: {
    linkedin:  'https://linkedin.com/company/finzoop',
    twitter:   'https://twitter.com/finzoop',
    instagram: 'https://instagram.com/finzoop',
    youtube:   'https://youtube.com/@finzoop',
  }
};

// ── Build Header HTML ─────────────────────────────────────
function buildHeader(nav, activePage, rp) {
  const items = nav.mainItems || DEFAULT_NAV.mainItems;

  const navLinks = items.map(item => {
    const isActive = item.key === activePage;
    const activeClass = isActive ? ' active' : '';

    if (item.children) {
      const dropdownItems = item.children.map(child => {
        if (child.icon) {
          return `
            <a href="${rp}${child.url}" class="dropdown-item">
              <span class="dropdown-icon">
                <i data-lucide="${child.icon}" 
                   style="width:18px;height:18px;"></i>
              </span>
              <span>
                <strong>${child.label}</strong>
                ${child.desc 
                  ? `<span class="dropdown-desc">
                       ${child.desc}
                     </span>` 
                  : ''}
              </span>
            </a>`;
        }
        return `<a href="${rp}${child.url}" 
                   class="dropdown-item">${child.label}</a>`;
      }).join('');

      return `
        <div class="dropdown">
          <a href="${rp}${item.url}" 
             class="nav-link${activeClass}">
            ${item.label}
            <i data-lucide="chevron-down" 
               style="width:14px;height:14px;"></i>
          </a>
          <div class="dropdown-menu">${dropdownItems}</div>
        </div>`;
    }

    return `<a href="${rp}${item.url}" 
               class="nav-link${activeClass}">
               ${item.label}
             </a>`;
  }).join('');

  return `
  <header class="header" id="main-header">
    <div class="container nav-container">
      <a href="${rp}index.html" class="logo">
        Fin<span>zoop</span>
      </a>
      <button class="hamburger" 
              aria-label="Toggle Navigation"
              id="hamburger-btn">
        <i data-lucide="menu" 
           style="width:22px;height:22px;"></i>
      </button>
      <nav class="nav-links" id="main-nav">
        ${navLinks}
      </nav>
      <a href="${rp}${nav.ctaUrl || DEFAULT_NAV.ctaUrl}" 
         class="btn btn-primary nav-cta">
        ${nav.ctaLabel || DEFAULT_NAV.ctaLabel}
      </a>
    </div>
  </header>`;
}

// ── Build Footer HTML ─────────────────────────────────────
function buildFooter(nav, settings, rp) {
  const col2 = nav.col2Links || DEFAULT_NAV.col2Links;
  const col3 = nav.col3Links || DEFAULT_NAV.col3Links;
  const social = nav.social  || DEFAULT_NAV.social;

  const col2Html = col2.map(l =>
    `<li><a href="${rp}${l.url}">${l.label}</a></li>`
  ).join('');

  const col3Html = col3.map(l =>
    `<li><a href="${rp}${l.url}">${l.label}</a></li>`
  ).join('');

  const logoUrl = settings?.logoUrl || '';

  return `
  <footer class="footer">
    <div class="container footer-grid">
      <div class="footer-col">
        ${logoUrl 
          ? `<img src="${logoUrl}" alt="Finzoop" 
                 style="height:40px;margin-bottom:16px;">`
          : `<div class="logo" style="font-size:28px;
                margin-bottom:16px;">
               Fin<span>zoop</span>
             </div>`}
        <p style="color:#94A3B8;font-size:14px;
                  line-height:1.7;margin:0 0 24px;">
          ${nav.footerTagline || DEFAULT_NAV.footerTagline}
        </p>
        <div class="social-links">
          <a href="${social.linkedin || '#'}" 
             target="_blank" rel="noopener"
             aria-label="LinkedIn">
            <i data-lucide="linkedin" 
               style="width:20px;height:20px;"></i>
          </a>
          <a href="${social.twitter || '#'}" 
             target="_blank" rel="noopener"
             aria-label="Twitter">
            <i data-lucide="twitter" 
               style="width:20px;height:20px;"></i>
          </a>
          <a href="${social.instagram || '#'}" 
             target="_blank" rel="noopener"
             aria-label="Instagram">
            <i data-lucide="instagram" 
               style="width:20px;height:20px;"></i>
          </a>
          <a href="${social.youtube || '#'}" 
             target="_blank" rel="noopener"
             aria-label="YouTube">
            <i data-lucide="youtube" 
               style="width:20px;height:20px;"></i>
          </a>
        </div>
      </div>

      <div class="footer-col">
        <h4>${nav.col2Label || DEFAULT_NAV.col2Label}</h4>
        <ul class="footer-links">${col2Html}</ul>
      </div>

      <div class="footer-col">
        <h4>${nav.col3Label || DEFAULT_NAV.col3Label}</h4>
        <ul class="footer-links">${col3Html}</ul>
      </div>

      <div class="footer-col">
        <h4>Contact Us</h4>
        <ul class="footer-links">
          <li style="color:#94A3B8;display:flex;
                     align-items:flex-start;gap:8px;">
            <i data-lucide="mail" 
               style="width:16px;height:16px;
                      margin-top:3px;flex-shrink:0;"></i>
            ${settings?.email || 'hello@finzoop.com'}
          </li>
          <li style="color:#94A3B8;display:flex;
                     align-items:flex-start;gap:8px;">
            <i data-lucide="phone" 
               style="width:16px;height:16px;
                      margin-top:3px;flex-shrink:0;"></i>
            ${settings?.phone || '+91 98765 43210'}
          </li>
          <li style="color:#94A3B8;display:flex;
                     align-items:flex-start;gap:8px;">
            <i data-lucide="map-pin" 
               style="width:16px;height:16px;
                      margin-top:3px;flex-shrink:0;"></i>
            ${settings?.address 
              || 'Mumbai, Maharashtra, India'}
          </li>
        </ul>
        <div style="margin-top:20px;">
          <span class="reg-badge">AMFI Registered</span>
          <span class="reg-badge">IRDAI Agent</span>
          <span class="reg-badge">PFRDA PoP</span>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="container">
        <p class="footer-disclaimer">
          ${nav.footerDisclaimer || DEFAULT_NAV.footerDisclaimer}
        </p>
        <div class="footer-bottom-row">
          <span>
            © ${new Date().getFullYear()} Finzoop. 
            All rights reserved.
          </span>
          <div style="display:flex;gap:20px;">
            <a href="${rp}privacy-policy.html">
              Privacy Policy
            </a>
            <a href="${rp}terms.html">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </div>
  </footer>`;
}

// ── Fetch from Contentful ─────────────────────────────────
async function fetchNav() {
  try {
    const params = new URLSearchParams({
      content_type: 'navigationMenu',
      'fields.identifier': 'main-nav',
      limit: 1,
      access_token: TOKEN
    });
    const res = await fetch(`${CDN}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items?.length) return null;
    const f = data.items[0].fields;
    return {
      ctaLabel:        f.ctaButtonLabel,
      ctaUrl:          f.ctaButtonUrl,
      mainItems:       f.mainMenuItems || DEFAULT_NAV.mainItems,
      footerTagline:   f.footerTagline,
      footerDisclaimer:f.footerDisclaimer,
      col2Label:       f.footerCol2Label,
      col2Links:       f.footerCol2Links || DEFAULT_NAV.col2Links,
      col3Label:       f.footerCol3Label,
      col3Links:       f.footerCol3Links || DEFAULT_NAV.col3Links,
      social: {
        linkedin:  f.linkedinUrl,
        twitter:   f.twitterUrl,
        instagram: f.instagramUrl,
        youtube:   f.youtubeUrl,
      }
    };
  } catch (e) {
    console.warn('[Nav] Using static fallback:', e.message);
    return null;
  }
}

async function fetchGlobalSettings() {
  try {
    const params = new URLSearchParams({
      content_type: 'globalSetting',
      limit: 1,
      access_token: TOKEN
    });
    const res = await fetch(`${CDN}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items?.length) return null;
    const f = data.items[0].fields;
    const logoAsset = data.includes?.Asset?.find(
      a => a.sys.id === f.logo?.sys?.id);
    return {
      logoUrl: logoAsset 
        ? 'https:' + logoAsset.fields.file.url : null,
      phone:   f.phone,
      email:   f.email,
      address: f.address,
      primaryColor:   f.primaryColor,
      secondaryColor: f.secondaryColor,
      accentColor:    f.accentColor,
      announcementBar: f.announcementBar,
      announcementBarLink: f.announcementBarLink,
    };
  } catch(e) {
    return null;
  }
}

// ── Apply brand colours from Contentful ──────────────────
function applyBrandColors(settings) {
  if (!settings) return;
  const root = document.documentElement;
  if (settings.primaryColor)
    root.style.setProperty('--primary',   settings.primaryColor);
  if (settings.secondaryColor)
    root.style.setProperty('--secondary', settings.secondaryColor);
  if (settings.accentColor)
    root.style.setProperty('--accent',    settings.accentColor);
}

// ── Inject announcement bar ───────────────────────────────
function injectAnnouncementBar(settings) {
  if (!settings?.announcementBar) return;
  const bar = document.createElement('div');
  bar.id = 'announcement-bar';
  bar.style.cssText = `
    background: var(--primary);
    color: white;
    text-align: center;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    position: relative;
  `;
  bar.innerHTML = settings.announcementBarLink
    ? `<a href="${settings.announcementBarLink}" 
          style="color:white;text-decoration:underline;">
         ${settings.announcementBar}
       </a>
       <button onclick="this.parentElement.remove()"
               style="position:absolute;right:16px;top:50%;
                      transform:translateY(-50%);
                      background:none;border:none;
                      color:white;cursor:pointer;font-size:18px;">
         ×
       </button>`
    : `${settings.announcementBar}
       <button onclick="this.parentElement.remove()"
               style="position:absolute;right:16px;top:50%;
                      transform:translateY(-50%);
                      background:none;border:none;
                      color:white;cursor:pointer;font-size:18px;">
         ×
       </button>`;
  document.body.insertBefore(bar, document.body.firstChild);
}

// ── Main Init ─────────────────────────────────────────────
async function initSharedComponents() {
  const activePage = getActivePage();
  const rp = window.location.pathname.includes('/calculators/')
    ? '../' : '';

  // Inject header immediately with defaults
  // (no layout shift — shows instantly)
  const headerEl = document.createElement('div');
  headerEl.innerHTML = buildHeader(DEFAULT_NAV, activePage, rp);
  document.body.insertBefore(
    headerEl.firstElementChild,
    document.body.firstChild
  );

  // Inject footer immediately with defaults
  const footerEl = document.createElement('div');
  footerEl.innerHTML = buildFooter(DEFAULT_NAV, null, rp);
  document.body.appendChild(footerEl.firstElementChild);

  // Init Lucide on static defaults
  if (window.lucide) lucide.createIcons();

  // Hamburger toggle
  const hamburger = document.getElementById('hamburger-btn');
  const mainNav   = document.getElementById('main-nav');
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      mainNav.classList.toggle('nav-open');
      const icon = hamburger.querySelector('[data-lucide]');
      if (icon) {
        icon.setAttribute('data-lucide',
          mainNav.classList.contains('nav-open') ? 'x' : 'menu');
        lucide.createIcons();
      }
    });
  }

  // Sticky header scroll effect
  const header = document.getElementById('main-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // Now fetch from Contentful and UPDATE if data available
  const [nav, settings] = await Promise.all([
    fetchNav(),
    fetchGlobalSettings()
  ]);

  if (nav || settings) {
    applyBrandColors(settings);
    injectAnnouncementBar(settings);

    // Replace header with CMS version
    const existingHeader = document.getElementById('main-header');
    if (existingHeader && nav) {
      const newHeaderEl = document.createElement('div');
      newHeaderEl.innerHTML = 
        buildHeader(nav, activePage, rp);
      existingHeader.replaceWith(newHeaderEl.firstElementChild);
    }

    // Replace footer with CMS version
    const existingFooter = document.querySelector('footer.footer');
    if (existingFooter) {
      const newFooterEl = document.createElement('div');
      newFooterEl.innerHTML = 
        buildFooter(nav || DEFAULT_NAV, settings, rp);
      existingFooter.replaceWith(newFooterEl.firstElementChild);
    }

    // Re-init hamburger after replace
    const h2   = document.getElementById('hamburger-btn');
    const nav2 = document.getElementById('main-nav');
    if (h2 && nav2) {
      h2.addEventListener('click', () => {
        nav2.classList.toggle('nav-open');
        const icon = h2.querySelector('[data-lucide]');
        if (icon) {
          icon.setAttribute('data-lucide',
            nav2.classList.contains('nav-open') ? 'x' : 'menu');
          lucide.createIcons();
        }
      });
    }

    if (window.lucide) lucide.createIcons();
  }
}

// ── Run when DOM is ready ─────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded',
    initSharedComponents);
} else {
  initSharedComponents();
}

})(); // end IIFE
