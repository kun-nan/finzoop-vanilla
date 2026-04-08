const _BLOG_SPACE = window.CONTENTFUL_SPACE_ID
                  || 'tabc1qgaltm6';
const _BLOG_TOKEN = window.CONTENTFUL_ACCESS_TOKEN
                  || 'VCpSt0x-mm6pOncY1cYlkkuU5b9UsD_cs_mINwRgs6I';
const _BLOG_BASE  =
  `https://cdn.contentful.com/spaces/${_BLOG_SPACE}`
  + `/environments/master/entries`;

async function _blogFetch(params) {
  const p = new URLSearchParams({
    ...params,
    access_token: _BLOG_TOKEN,
  });
  const res = await fetch(`${_BLOG_BASE}?${p}`);
  if (!res.ok) throw new Error(`Contentful ${res.status}`);
  return res.json();
}

function _resolveUrl(assetId, includes) {
  if (!assetId || !includes?.Asset) return null;
  const a = includes.Asset.find(x => x.sys.id === assetId);
  return a?.fields?.file?.url
    ? 'https:' + a.fields.file.url : null;
}

async function renderBlogListing(options = {}) {
  const container = document.querySelector(
    '[data-cms="blog-list"]');
  if (!container) return;

  // Show skeleton
  container.innerHTML = `
    <div class="grid-3">
      ${[1,2,3].map(() =>
        `<div class="card"
              style="height:340px;
                     background:linear-gradient(
                       90deg,#f0f4f8 25%,#e2e8f0 50%,
                       #f0f4f8 75%);
                     background-size:200% 100%;
                     animation:shimmer 1.5s infinite;
                     border-radius:16px;">
         </div>`
      ).join('')}
    </div>`;

  try {
    const data = await _blogFetch({
      content_type: 'blogPost',
      order: '-sys.createdAt',
      limit: 9,
      include: 2,
    });

    const posts = data.items || [];

    if (!posts.length) {
      container.innerHTML = `
        <div style="grid-column:span 3;text-align:center;
                    padding:80px 20px;">
          <i data-lucide="file-text"
             style="width:56px;height:56px;
                    color:#94A3B8;margin-bottom:20px;
                    display:block;margin-left:auto;
                    margin-right:auto;"></i>
          <h3 style="color:#64748B;">No posts yet</h3>
          <p style="color:#94A3B8;font-size:14px;">
            Publish your first blog post in Contentful
            and it will appear here automatically.
          </p>
        </div>`;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const cards = posts.map(post => {
      const f = post.fields;
      const coverId = f.coverImage?.sys?.id;
      const coverUrl = _resolveUrl(coverId, data.includes);

      // Category: linked entry or plain string
      const catId = f.category?.sys?.id;
      const catEntry = catId
        ? (data.includes?.Entry || []).find(
            e => e.sys.id === catId)
        : null;
      const catName = catEntry?.fields?.name
                   || f.category
                   || 'Finance';
      const catColor = catEntry?.fields?.color || '#1B4FD8';

      const date = new Date(
        f.publishedAt || post.sys.createdAt
      ).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });

      const slug = f.slug || post.sys.id;
      const mins = f.readTimeMinutes || 5;

      return `
        <article class="card"
                 style="padding:0;overflow:hidden;
                        display:flex;flex-direction:column;">
          <a href="blog-post.html?slug=${slug}"
             style="display:block;text-decoration:none;">
            ${coverUrl
              ? `<img src="${coverUrl}" alt="${f.title}"
                      loading="lazy"
                      style="width:100%;height:200px;
                             object-fit:cover;display:block;">`
              : `<div style="width:100%;height:200px;
                              background:#EBF3FB;
                              display:flex;align-items:center;
                              justify-content:center;">
                   <i data-lucide="image"
                      style="width:40px;height:40px;
                             color:#94A3B8;"></i>
                 </div>`}
          </a>
          <div style="padding:20px;display:flex;
                      flex-direction:column;flex:1;">
            <span style="display:inline-flex;
                         align-items:center;gap:5px;
                         background:${catColor}18;
                         color:${catColor};
                         font-size:11px;font-weight:700;
                         padding:3px 10px;border-radius:20px;
                         margin-bottom:10px;width:fit-content;">
              <i data-lucide="tag"
                 style="width:11px;height:11px;"></i>
              ${catName}
            </span>
            <h3 style="font-size:16px;margin:0 0 10px;
                       line-height:1.45;">
              <a href="blog-post.html?slug=${slug}"
                 style="color:#1E293B;text-decoration:none;">
                ${f.title}
              </a>
            </h3>
            <p style="font-size:13px;color:#64748B;
                      margin:0 0 16px;flex:1;
                      display:-webkit-box;
                      -webkit-line-clamp:3;
                      -webkit-box-orient:vertical;
                      overflow:hidden;">
              ${f.excerpt || f.summary || ''}
            </p>
            <div style="display:flex;
                        justify-content:space-between;
                        align-items:center;
                        padding-top:14px;
                        border-top:1px solid #E2E8F0;
                        font-size:12px;color:#94A3B8;">
              <span style="display:flex;align-items:center;
                           gap:5px;">
                <i data-lucide="calendar"
                   style="width:13px;height:13px;"></i>
                ${date}
              </span>
              <span style="display:flex;align-items:center;
                           gap:5px;">
                <i data-lucide="clock"
                   style="width:13px;height:13px;"></i>
                ${mins} min read
              </span>
              <a href="blog-post.html?slug=${slug}"
                 style="display:flex;align-items:center;
                        gap:4px;color:#1B4FD8;
                        font-weight:600;font-size:12px;
                        text-decoration:none;">
                Read
                <i data-lucide="arrow-right"
                   style="width:13px;height:13px;"></i>
              </a>
            </div>
          </div>
        </article>`;
    }).join('');

    container.innerHTML =
      `<div class="grid-3">${cards}</div>`;

  } catch (err) {
    console.error('[Blog] Error:', err);
    container.innerHTML = `
      <div style="grid-column:span 3;text-align:center;
                  padding:60px 20px;">
        <i data-lucide="alert-circle"
           style="width:40px;height:40px;
                  color:#EF4444;margin-bottom:16px;
                  display:block;margin-left:auto;
                  margin-right:auto;"></i>
        <h3 style="color:#1E293B;">
          Could not load blog posts
        </h3>
        <p style="color:#64748B;margin:8px 0;">
          ${err.message}
        </p>
        <details style="margin-top:12px;font-size:12px;
                        color:#94A3B8;">
          <summary style="cursor:pointer;">Debug info</summary>
          <p>Space: ${_BLOG_SPACE ? '✓' : '✗ not set'}</p>
          <p>Token: ${_BLOG_TOKEN ? '✓' : '✗ not set'}</p>
          <p>Check browser console for full error.</p>
        </details>
      </div>`;
  }

  if (window.lucide) lucide.createIcons();
}

document.addEventListener('DOMContentLoaded',
  () => renderBlogListing());
