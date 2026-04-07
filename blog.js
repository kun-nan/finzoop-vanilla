/* ── blog.js — Finzoop Blog Renderer (Contentful CDA) ── */

// ── Listing Page ─────────────────────────────────────────
async function renderBlogListing(options = {}) {
  const container = document.querySelector('[data-cms="blog-list"]');
  if (!container) return;

  container.innerHTML = `
    <div class="grid-3">
      ${[1,2,3].map(() => `
        <div class="card skeleton-card" style="height:320px;"></div>
      `).join('')}
    </div>`;

  try {
    const { items: posts, includes } = 
      await window.fetchBlogPosts(options);

    if (!posts || posts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:80px 20px; 
                    grid-column:span 3;">
          <i data-lucide="newspaper" 
             style="width:56px;height:56px;
                    color:var(--text-secondary);
                    margin-bottom:20px;"></i>
          <h3 style="color:var(--text-secondary);">
            No posts yet
          </h3>
          <p style="color:var(--text-secondary);">
            Blog posts published in Contentful will appear here.
          </p>
        </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const cards = posts.map(post => {
      const f = post.fields;
      const coverUrl = f.coverImage?.sys?.id
        ? window._resolveAssetUrl(f.coverImage.sys.id, includes)
        : null;

      // Category: handle both linked entry and plain string
      const categoryName = typeof f.category === 'string'
        ? f.category
        : (f.category?.fields?.name || 'Finance');

      const date = new Date(
        f.publishedAt || post.sys.createdAt
      ).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });

      const readTime = f.readTimeMinutes || 5;
      const slug = f.slug || post.sys.id;

      return `
        <article class="card blog-card" 
                 style="padding:0; overflow:hidden;">
          ${coverUrl ? `
            <a href="blog-post.html?slug=${slug}">
              <img src="${coverUrl}" 
                   alt="${f.title}" 
                   loading="lazy"
                   style="width:100%;height:200px;
                          object-fit:cover;display:block;" />
            </a>` : `
            <div style="width:100%;height:200px;
                        background:var(--light-bg);
                        display:flex;align-items:center;
                        justify-content:center;">
              <i data-lucide="image" 
                 style="width:40px;height:40px;
                        color:var(--text-secondary);"></i>
            </div>`}
          <div style="padding:24px;">
            <div style="font-size:12px;font-weight:600;
                        color:var(--primary);
                        margin-bottom:10px;
                        display:flex;align-items:center;
                        gap:6px;">
              <i data-lucide="tag" 
                 style="width:14px;height:14px;"></i>
              ${categoryName}
            </div>
            <h3 style="margin:0 0 12px;font-size:18px;
                       line-height:1.4;">
              <a href="blog-post.html?slug=${slug}" 
                 style="color:var(--text-primary);
                        text-decoration:none;">
                ${f.title}
              </a>
            </h3>
            <p style="color:var(--text-secondary);
                      font-size:14px;margin:0 0 20px;
                      display:-webkit-box;
                      -webkit-line-clamp:3;
                      -webkit-box-orient:vertical;
                      overflow:hidden;">
              ${f.excerpt || f.summary || ''}
            </p>
            <div style="display:flex;justify-content:space-between;
                        align-items:center;
                        padding-top:16px;
                        border-top:1px solid var(--border);
                        font-size:12px;
                        color:var(--text-secondary);">
              <span style="display:flex;align-items:center;gap:6px;">
                <i data-lucide="calendar" 
                   style="width:14px;height:14px;"></i>
                ${date}
              </span>
              <span style="display:flex;align-items:center;gap:6px;">
                <i data-lucide="clock" 
                   style="width:14px;height:14px;"></i>
                ${readTime} min
              </span>
              <a href="blog-post.html?slug=${slug}" 
                 style="font-weight:600;color:var(--primary);
                        display:flex;align-items:center;gap:4px;
                        text-decoration:none;">
                Read 
                <i data-lucide="arrow-right" 
                   style="width:14px;height:14px;"></i>
              </a>
            </div>
          </div>
        </article>`;
    }).join('');

    container.innerHTML = `<div class="grid-3">${cards}</div>`;

  } catch (err) {
    console.error('[Blog] Listing error:', err);
    container.innerHTML = `
      <div class="card" 
           style="grid-column:span 3;text-align:center;
                  padding:60px 20px;">
        <i data-lucide="alert-circle" 
           style="width:40px;height:40px;
                  color:var(--accent);
                  margin-bottom:16px;"></i>
        <h3>Could not load blog posts</h3>
        <p style="color:var(--text-secondary);margin:8px 0 0;">
          ${err.message}
        </p>
        <details style="margin-top:16px;font-size:12px;
                        color:var(--text-secondary);">
          <summary>Debug</summary>
          Space: ${window.CONTENTFUL_SPACE_ID || 'NOT SET'}<br>
          Token: ${window.CONTENTFUL_ACCESS_TOKEN 
                    ? 'SET ✓' : 'MISSING ✗'}
        </details>
      </div>`;
  }

  if (window.lucide) lucide.createIcons();
}

// ── Single Post Page ──────────────────────────────────────
async function renderBlogPost(slug) {
  const container = document.querySelector('[data-cms="blog-post"]');
  if (!container || !slug) return;

  // Update page title while loading
  document.title = 'Loading... | Finzoop';

  container.innerHTML = `
    <div style="max-width:780px;margin:0 auto;">
      <div class="skeleton-heading" 
           style="height:48px;margin-bottom:24px;"></div>
      <div class="skeleton-text" 
           style="height:20px;margin-bottom:12px;"></div>
      <div class="skeleton-text" 
           style="height:20px;margin-bottom:12px;"></div>
      <div class="skeleton-image" 
           style="height:400px;margin-bottom:32px;"></div>
      <div class="skeleton-text"></div>
    </div>`;

  try {
    // Fetch single post by slug
    const SPACE  = window.CONTENTFUL_SPACE_ID;
    const TOKEN  = window.CONTENTFUL_ACCESS_TOKEN;
    const BASE   = `https://cdn.contentful.com/spaces/${SPACE}`
                 + `/environments/master/entries`;

    const params = new URLSearchParams({
      content_type: 'blogPost',
      'fields.slug': slug,
      include: 3,
      access_token: TOKEN
    });

    const res = await fetch(`${BASE}?${params}`);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:80px 20px;">
          <i data-lucide="file-x" 
             style="width:56px;height:56px;
                    color:var(--text-secondary);
                    margin-bottom:20px;"></i>
          <h2>Post Not Found</h2>
          <p>The article you're looking for doesn't exist.</p>
          <a href="blog.html" 
             class="btn btn-primary" 
             style="margin-top:24px;">
            Back to Blog
          </a>
        </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const post     = data.items[0];
    const f        = post.fields;
    const includes = data.includes || {};

    // Resolve cover image
    const coverUrl = f.coverImage?.sys?.id
      ? window._resolveAssetUrl(f.coverImage.sys.id, includes)
      : null;

    // Resolve author
    const authorEntry = f.author?.sys?.id
      ? (includes.Entry || []).find(
          e => e.sys.id === f.author.sys.id)
      : null;
    const authorName  = authorEntry?.fields?.name 
                      || 'Finzoop Team';
    const authorPhotoId = authorEntry?.fields?.photo?.sys?.id;
    const authorPhotoUrl = authorPhotoId
      ? window._resolveAssetUrl(authorPhotoId, includes)
      : null;

    // Resolve category
    const catEntry = f.category?.sys?.id
      ? (includes.Entry || []).find(
          e => e.sys.id === f.category.sys.id)
      : null;
    const categoryName = catEntry?.fields?.name
                       || f.category
                       || 'Finance';

    // Render rich text content
    let bodyHtml = '';
    if (f.content && typeof f.content === 'object' 
        && f.content.nodeType === 'document') {
      // Use rich text renderer if available
      if (window.richTextHtmlRenderer) {
        bodyHtml = window.richTextHtmlRenderer
                         .documentToHtmlString(f.content);
      } else if (window.documentToHtmlString) {
        bodyHtml = window.documentToHtmlString(f.content);
      } else {
        // Fallback: extract plain text from nodes
        bodyHtml = extractRichText(f.content);
      }
    } else if (typeof f.content === 'string') {
      bodyHtml = f.content;
    } else if (f.body) {
      bodyHtml = typeof f.body === 'string' 
                 ? f.body 
                 : extractRichText(f.body);
    }

    const date = new Date(
      f.publishedAt || post.sys.createdAt
    ).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    // Update page meta
    document.title = `${f.title} | Finzoop`;
    const metaDesc = document.querySelector(
      'meta[name="description"]');
    if (metaDesc) metaDesc.content = f.excerpt || f.summary || '';

    // Build HTML
    container.innerHTML = `
      <article style="max-width:780px;margin:0 auto;">

        <!-- Breadcrumb -->
        <nav style="font-size:14px;color:var(--text-secondary);
                    margin-bottom:32px;
                    display:flex;align-items:center;gap:8px;">
          <a href="index.html" 
             style="color:var(--text-secondary);">Home</a>
          <i data-lucide="chevron-right" 
             style="width:14px;height:14px;"></i>
          <a href="blog.html" 
             style="color:var(--text-secondary);">Blog</a>
          <i data-lucide="chevron-right" 
             style="width:14px;height:14px;"></i>
          <span style="color:var(--text-primary);">
            ${f.title}
          </span>
        </nav>

        <!-- Category Badge -->
        <div style="margin-bottom:16px;">
          <span style="background:var(--light-bg);
                       color:var(--primary);
                       font-size:12px;font-weight:600;
                       padding:4px 12px;border-radius:20px;
                       display:inline-flex;align-items:center;
                       gap:6px;">
            <i data-lucide="tag" 
               style="width:12px;height:12px;"></i>
            ${categoryName}
          </span>
        </div>

        <!-- Title -->
        <h1 style="font-size:clamp(28px,4vw,42px);
                   line-height:1.3;margin:0 0 24px;">
          ${f.title}
        </h1>

        <!-- Author + Meta -->
        <div style="display:flex;align-items:center;gap:16px;
                    padding-bottom:24px;
                    border-bottom:1px solid var(--border);
                    margin-bottom:32px;flex-wrap:wrap;">
          ${authorPhotoUrl 
            ? `<img src="${authorPhotoUrl}" 
                    alt="${authorName}"
                    style="width:44px;height:44px;
                           border-radius:50%;object-fit:cover;">`
            : `<div style="width:44px;height:44px;
                            border-radius:50%;
                            background:var(--primary);
                            color:white;
                            display:flex;align-items:center;
                            justify-content:center;
                            font-weight:700;font-size:18px;">
                 ${authorName.charAt(0)}
               </div>`}
          <div>
            <div style="font-weight:600;font-size:15px;">
              ${authorName}
            </div>
            <div style="font-size:13px;
                        color:var(--text-secondary);
                        display:flex;align-items:center;
                        gap:12px;margin-top:2px;">
              <span style="display:flex;align-items:center;
                           gap:4px;">
                <i data-lucide="calendar" 
                   style="width:13px;height:13px;"></i>
                ${date}
              </span>
              <span style="display:flex;align-items:center;
                           gap:4px;">
                <i data-lucide="clock" 
                   style="width:13px;height:13px;"></i>
                ${f.readTimeMinutes || 5} min read
              </span>
            </div>
          </div>
          <!-- Share buttons -->
          <div style="margin-left:auto;display:flex;gap:8px;">
            <button onclick="sharePost('twitter')" 
                    title="Share on Twitter"
                    style="background:none;border:1px solid 
                           var(--border);border-radius:8px;
                           padding:8px;cursor:pointer;
                           display:flex;align-items:center;">
              <i data-lucide="twitter" 
                 style="width:16px;height:16px;"></i>
            </button>
            <button onclick="sharePost('linkedin')" 
                    title="Share on LinkedIn"
                    style="background:none;border:1px solid 
                           var(--border);border-radius:8px;
                           padding:8px;cursor:pointer;
                           display:flex;align-items:center;">
              <i data-lucide="linkedin" 
                 style="width:16px;height:16px;"></i>
            </button>
            <button onclick="sharePost('whatsapp')" 
                    title="Share on WhatsApp"
                    style="background:none;border:1px solid 
                           var(--border);border-radius:8px;
                           padding:8px;cursor:pointer;
                           display:flex;align-items:center;">
              <i data-lucide="message-circle" 
                 style="width:16px;height:16px;"></i>
            </button>
            <button onclick="copyLink()" 
                    title="Copy link"
                    style="background:none;border:1px solid 
                           var(--border);border-radius:8px;
                           padding:8px;cursor:pointer;
                           display:flex;align-items:center;">
              <i data-lucide="link" 
                 style="width:16px;height:16px;"></i>
            </button>
          </div>
        </div>

        <!-- Cover Image -->
        ${coverUrl ? `
          <img src="${coverUrl}" 
               alt="${f.title}"
               style="width:100%;border-radius:16px;
                      margin-bottom:40px;
                      max-height:480px;object-fit:cover;" />
        ` : ''}

        <!-- Article Body -->
        <div class="article-content blog-body">
          ${bodyHtml || '<p>Content coming soon.</p>'}
        </div>

        <!-- Tags -->
        ${f.tags && f.tags.length ? `
          <div style="margin-top:40px;padding-top:24px;
                      border-top:1px solid var(--border);">
            <span style="font-size:14px;font-weight:600;
                         margin-right:12px;">Tags:</span>
            ${f.tags.map(tag => `
              <span style="background:var(--light-bg);
                           color:var(--primary);
                           font-size:12px;padding:4px 12px;
                           border-radius:20px;margin:4px;
                           display:inline-block;">
                ${tag}
              </span>`).join('')}
          </div>
        ` : ''}

        <!-- Back link -->
        <div style="margin-top:48px;padding-top:32px;
                    border-top:1px solid var(--border);">
          <a href="blog.html" 
             style="display:inline-flex;align-items:center;
                    gap:8px;color:var(--primary);
                    font-weight:600;text-decoration:none;">
            <i data-lucide="arrow-left" 
               style="width:18px;height:18px;"></i>
            Back to all articles
          </a>
        </div>

      </article>`;

  } catch (err) {
    console.error('[Blog] Post error:', err);
    container.innerHTML = `
      <div style="text-align:center;padding:80px 20px;">
        <i data-lucide="alert-circle" 
           style="width:48px;height:48px;
                  color:var(--accent);
                  margin-bottom:20px;"></i>
        <h2>Could not load post</h2>
        <p style="color:var(--text-secondary);">
          ${err.message}
        </p>
        <a href="blog.html" 
           class="btn btn-primary" 
           style="margin-top:24px;">
          Back to Blog
        </a>
      </div>`;
  }

  if (window.lucide) lucide.createIcons();
}

// ── Rich Text Fallback Extractor ──────────────────────────
function extractRichText(node) {
  if (!node) return '';
  if (node.nodeType === 'text') {
    return node.value || '';
  }
  const children = (node.content || [])
    .map(extractRichText).join('');
  
  const marks = node.marks || [];
  let text = children;
  marks.forEach(mark => {
    if (mark.type === 'bold') text = `<strong>${text}</strong>`;
    if (mark.type === 'italic') text = `<em>${text}</em>`;
    if (mark.type === 'code') text = `<code>${text}</code>`;
  });

  switch (node.nodeType) {
    case 'document':         return children;
    case 'paragraph':        return `<p>${text}</p>`;
    case 'heading-1':        return `<h1>${text}</h1>`;
    case 'heading-2':        return `<h2>${text}</h2>`;
    case 'heading-3':        return `<h3>${text}</h3>`;
    case 'heading-4':        return `<h4>${text}</h4>`;
    case 'unordered-list':   return `<ul>${children}</ul>`;
    case 'ordered-list':     return `<ol>${children}</ol>`;
    case 'list-item':        return `<li>${children}</li>`;
    case 'blockquote':       return `<blockquote>${children}</blockquote>`;
    case 'hr':               return `<hr>`;
    case 'hyperlink':
      return `<a href="${node.data?.uri || '#'}" 
                 target="_blank" rel="noopener">
               ${children}
             </a>`;
    case 'embedded-asset-block': {
      const assetId = node.data?.target?.sys?.id;
      return assetId 
        ? `<figure>
             <img data-asset-id="${assetId}" 
                  alt="Article image" 
                  style="max-width:100%;border-radius:8px;" />
           </figure>` 
        : '';
    }
    default: return children;
  }
}

// ── Share Helpers ─────────────────────────────────────────
function sharePost(platform) {
  const url   = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  const links = {
    twitter:  `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    whatsapp: `https://wa.me/?text=${title}%20${url}`
  };
  if (links[platform]) window.open(links[platform], '_blank');
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => alert('Link copied!'))
    .catch(() => {});
}

// ── Router ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const slug = new URLSearchParams(
    window.location.search).get('slug');
  if (slug) {
    renderBlogPost(slug);
  } else {
    renderBlogListing();
  }
});
