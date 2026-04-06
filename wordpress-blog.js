async function renderWordPressBlogListing(options = {}) {
  const container = document.querySelector('[data-cms="blog-list"]');
  if (!container) return;

  // Clear skeletons
  container.innerHTML = '';

  try {
    const res = await fetch('https://blog.finzoop.com/wp-json/wp/v2/posts?_embed&per_page=9');
    if (!res.ok) throw new Error('WP API error');
    const rawPosts = await res.json();
    const posts = window.filterPublished ? window.filterPublished(rawPosts) : rawPosts;
    
    if (posts.length === 0) {
      container.innerHTML = '<p>No posts available from WordPress.</p>';
      return;
    }

    let html = '';
    posts.forEach(post => {
      const coverUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
      const categoryName = post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog';
      const readTime = Math.max(1, Math.ceil((post.content?.rendered?.length || 0) / 1000));
      
      html += `
        <div class="card blog-card" style="padding: 0; overflow: hidden;">
          ${coverUrl ? `<img src="${coverUrl}" alt="" style="width:100%; height:200px; object-fit:cover;" />` : ''}
          <div style="padding: 24px;">
            <div style="font-size: 14px; color: var(--primary); margin-bottom: 8px; font-weight: 600;">
              <i data-lucide="tag" class="icon-sm"></i> ${categoryName}
            </div>
            <h3 style="margin-bottom: 12px; line-height: 1.4;"><a href="${post.link}" target="_blank">${post.title.rendered}</a></h3>
            <p style="color: var(--text-secondary); font-size: 14px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
              ${post.excerpt.rendered.replace(/(<([^>]+)>)/gi, "").substring(0, 100)}...
            </p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px; font-size:12px; color:var(--text-secondary); border-top:1px solid var(--border); padding-top:16px;">
              <span><i data-lucide="clock" class="icon-sm"></i> ${readTime} min read</span>
              <a href="${post.link}" target="_blank" style="font-weight: 600; display:flex; align-items:center; gap:4px;">Read on Blog <i data-lucide="external-link" class="icon-sm"></i></a>
            </div>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = `<div class="grid-3">${html}</div>`;
    if (window.renderLucideIcons) window.renderLucideIcons();
  } catch (err) {
    console.warn('[CMS] WordPress fallback failed:', err);
    container.innerHTML = '<p style="text-align:center; padding:40px;">No blog content available at the moment.</p>';
  }
}

// Export for blog.js fallback
window.renderWordPressBlogListing = renderWordPressBlogListing;
