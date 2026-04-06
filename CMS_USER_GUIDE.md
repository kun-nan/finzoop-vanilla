# Finzoop Content Writer Guide

Welcome to the Finzoop Content Management System. Because the Finzoop website utilizes a modern, lightning-fast "Headless" architecture, the frontend website code is completely decoupled from where you will write your content. 

You will use two distinct platforms depending on what you are actively editing.

---

## 🏗️ 1. Strapi CMS (Website Sections, Products, & SEO)
Strapi controls the massive structural content of Finzoop, such as the Homepage text, Loan details, Calculator SEO data, and FAQ Accordions.

### Where to Login
* **Local Staging**: [http://localhost:1337/admin](http://localhost:1337/admin)
* **Live Production**: `https://<YOUR-LIVE-STRAPI-URL>.com/admin` (Ask your admin for the live URL once deployed on Render/Railway).

### How to Edit Content
1. Login to the panel using your Writer/Editor credentials.
2. Click **Content Manager** on the left menu.
3. You will see Collection Types (e.g., `Product Pages`, `Calculator Metas`, `Testimonials`, `FAQs`) and Single Types (e.g., `Navigation`, `Global Settings`).
4. Select the specific page you want to alter.

### Draft vs Publish Controls
Every piece of content inside Strapi has robust publishing controls. 
* Clicking **Save** will save your changes as a **Draft**. The public website will *not* fetch or display drafting text.
* Clicking **Publish** makes it instantly live across the production `finzoop.com` website. 

### Advanced Trick: Live Previewing 
If you want to test how your draft layouts will look without exposing them to the public, navigate to any live un-editable calculator page (e.g., `finzoop.com/calculators/lumpsum.html`) and append `?preview=true` to your browser's URL:
**Example**: `https://finzoop.com/calculators/lumpsum.html?preview=true`
This renders visual yellow badges across the website that map directly to Strapi Content IDs so you know exactly which fields to edit!

---

## 📝 2. WordPress (Blog Posts Engine)
Because WordPress offers a familiar and robust rich-text writing environment, Finzoop uses a hidden WordPress backend solely for managing Blog Articles.

### Where to Login
* **Admin Login**: [https://blog.finzoop.com/wp-admin](https://blog.finzoop.com/wp-admin)

### How to Add Blogs
1. Log in to WordPress.
2. Go to **Posts -> Add New**.
3. Create your article using the Gutenberg Block Editor.
4. **Mandatory Configuration for Finzoop UI:**
   - **Featured Image**: Always set a Featured Image. The decoupled frontend uses this exactly for the thumbnail grid.
   - **Categories**: Select a proper Category (e.g., "Tax Updates", "Mutual Funds"). The UI dynamically extracts the top primary category and projects it onto the reading cards.
   - **Excerpt**: Write a custom Excerpt. The frontend homepage utilizes exactly the first 100 characters of the excerpt!
   
### WordPress Publishing Controls
The finzoop platform rigorously honors WordPress states. 
* Saving a post as "Draft" or "Pending Review" acts cleanly—the live site API drops the response.
* Using the **Publish Immediately** button pushes it to the grid. 
* **Scheduling**: If you schedule a WordPress post for a date in the future, the Finzoop decoupling engine specifically hides it until the real-world clock hits that exact timestamp!

---
*For Developers: You can dynamically swap whether Finzoop relies on Strapi or Wordpress for Blog generation by changing `<script src="blog.js">` to `<script src="wordpress-blog.js">` inside `blog.html`.*
