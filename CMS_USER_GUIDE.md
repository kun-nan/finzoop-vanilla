# Finzoop CMS & Website Administration Guide
## 🚀 Modern Headless Content Management (Contentful + WordPress)

This guide provides operational instructions for managing the Finzoop platform. It is divided by user roles to ensure smooth content publishing and technical stability.

---

## 🏢 1. Superadmin Guide
**Tools:** Contentful Settings, API Keys, Domain Management

### 🔑 Security & API Tokens
Superadmins manage the connection between the website and Contentful.
- **Space ID**: Unique identifier for the Finzoop environment.
- **Delivery Token (CDA)**: Used to fetch live content.
- **Preview Token (CPA)**: Used to fetch draft content (when `?preview=true` is used).

> [!CAUTION]
> **Credential Security**: Never share Access Tokens in public repositories. If a token is compromised, regenerate it immediately in Contentful under **Settings > API keys** and update the website configuration using the `update-cms-config.js` script.

### 🌐 Environment Management
- **Master**: The production environment. All live changes should be made here.
- **Staging/Develop**: Use these for testing new Content Models before rolling them out to the Master environment.

---

## 🏗️ 2. Administrator Guide
**Tools:** Content Models, User Permissions, Global Settings

### 👥 Managing Users & Roles
1. Go to **Settings > Users**.
2. **Superadmins**: Can access everything (limit to 1-2 people).
3. **Editors (Admins)**: Can create, edit, and publish any content.
4. **Authors (Publishers)**: Can create content but cannot "Publish" (must request review).

### 🌍 Global Site Settings
To update site-wide branding:
1. Open the **Global Setting** entry in Contentful.
2. Update **Primary/Secondary Colors** (use HEX codes).
3. Update the **Footer Disclaimer** or **Site Logo**.
4. **Publish** to see changes across all 22+ pages instantly.

---

## ✍️ 3. Publisher & Author Guide
**Tools:** Content Entries, Media, Blog, SEO

### 📰 Blog Publishing (Hybrid Workflow)
Finzoop uses a **Hybrid Blog System**. Contentful is the primary source; WordPress is the fail-safe.

| Scenario | What Happens |
|----------|--------------|
| **Posts in Contentful** | The site displays Contentful posts automatically. |
| **Contentful is Empty** | The site automatically pulls from the **WordPress** feed (`blog.finzoop.com`). |

#### Creating a New Post in Contentful:
1. **Content > Add entry > Blog Post**.
2. **Title & Slug**: Keep slugs short (e.g., `best-sip-plans`).
3. **Cover Image**: Upload to **Media** first, then link it to the post.
4. **Body**: Use the Rich Text editor. Avoid pasting directly from Word to prevent formatting bugs.
5. **Publish**: Changes are live within seconds.

### 🔍 Search Engine Optimization (SEO)
Manage SEO for every page individually:
1. Create a **Page SEO** entry.
2. Use a **Slug** that matches the page (e.g., `loans-page`).
3. Fill in **Meta Title** and **Description**.

> [!TIP]
> **SEO Best Practice**: Keep Meta Titles under 60 characters and Descriptions under 160 characters to ensure they display correctly in Google search results.

---

## 🔍 4. Content Preview Mode
**For:** Internal Review before going live.

The website includes a **Live Preview** feature. To see how a "Draft" post looks on the actual site:
1. Open the website (e.g., `finzoop.com/blog.html`).
2. Add **`?preview=true`** to the end of the URL.
3. **Visual Cues**: 
   - Sections editable via CMS will have a **Dashed blue border**.
   - **"Edit in CMS"** buttons will appear, linking directly to that entry's editor.

---

## 🛠️ 5. Troubleshooting & FAQ

#### Q: I published a change but it's not showing up.
**A:** Contentful uses a Global CDN. It usually takes 5-10 seconds. If it's still not showing, check if the entry has any missing "Required" fields that prevented the publish.

#### Q: Why is the blog showing my old WordPress posts?
**A:** This is the automatic **Fallback Mode**. If your Contentful "Blog Post" list is empty, the site displays WordPress content so the page never looks broken. Once you publish your first post in Contentful, it will take over.

#### Q: Icons are missing in the footer.
**A:** Ensure Lucide icons are correctly typed (e.g., `linkedin`, `twitter-x`) in the Global Settings.

---
> [!NOTE]
> **Support**: For technical architecture changes or API failures, contact the Lead Developer. For content updates, contact the Chief Editor.

*Document Version: 1.2 | Last Updated: April 06, 2026*

