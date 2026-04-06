# Contentful Space Setup Guide
## For Finzoop Admin — One-Time Setup

> [!NOTE]
> **MIGRATION STATUS: COMPLETED**
> The frontend has been successfully migrated to Contentful. All HTML files are now configured with the provided Space ID and Access Token.

This guide walks you through creating all the required Content Types
in your Contentful space. Do this once, then invite your content writers.

---

## Step 1: Create Your Space

1. Log into [app.contentful.com](https://app.contentful.com)
2. Click **"Add space"** → **"Create an empty space"**
3. Name: **Finzoop** → **"Proceed to confirmation"** → **"Confirm"**

---

## Step 2: Get Your API Keys

1. **Settings** (top nav) → **API Keys**
2. Click **"Add API Key"**
3. Name: `Finzoop Frontend`
4. Copy and save:
   - **Space ID** → goes into `window.CONTENTFUL_SPACE_ID`
   - **Content Delivery API - access token** → goes into `window.CONTENTFUL_ACCESS_TOKEN`

---

## Step 3: Create Content Types

Go to **Content model** (top nav) → **"Add content type"** for each below.

---

### 3.1 — Global Setting
**Content type ID:** `globalSetting`

| Field Name | Field ID | Type | Notes |
|---|---|---|---|
| Site Name | `siteName` | Short text | e.g. Finzoop |
| Primary Color | `primaryColor` | Short text | Hex e.g. #1B4FD8 |
| Secondary Color | `secondaryColor` | Short text | Hex e.g. #00C896 |
| Accent Color | `accentColor` | Short text | Hex e.g. #FF6B35 |
| Footer Disclaimer | `footerDisclaimer` | Long text | Regulatory text |
| Logo | `logo` | Media | Site logo image |

---

### 3.2 — Page SEO
**Content type ID:** `pageSeo`

| Field Name | Field ID | Type | Notes |
|---|---|---|---|
| Slug | `slug` | Short text | **Required. Unique.** e.g. `loans-page` |
| Meta Title | `metaTitle` | Short text | 50–60 chars |
| Meta Description | `metaDescription` | Long text | 150–160 chars |
| Meta Keywords | `metaKeywords` | Short text | Comma-separated |
| OG Title | `ogTitle` | Short text | Social share title |
| OG Description | `ogDescription` | Long text | Social share description |
| Canonical URL | `canonicalUrl` | Short text | Full URL |

> Set `slug` as the **Entry title** field. Mark it as required and unique.

---

### 3.3 — Blog Post
**Content type ID:** `blogPost`

| Field Name | Field ID | Type | Notes |
|---|---|---|---|
| Title | `title` | Short text | **Required** |
| Slug | `slug` | Short text | **Required. Unique.** |
| Body | `body` | Rich text | Main article content |
| Category | `category` | Short text | e.g. `Tax Planning` |
| Author | `author` | Short text | Writer's name |
| Cover Image | `coverImage` | Media | Featured image |
| Published At | `publishedAt` | Date & time | Publication date |
| Summary | `summary` | Long text | 2–3 sentence excerpt |

---

### 3.4 — Calculator Meta
**Content type ID:** `calculatorMeta`

| Field Name | Field ID | Type | Notes |
|---|---|---|---|
| Slug | `slug` | Short text | **Required. Unique.** e.g. `sip-calculator` |
| Title | `title` | Short text | Calculator heading |
| Description | `description` | Long text | Intro paragraph |
| How It Works | `howItWorks` | Rich text | Explanation text |

> **Slug values must match exactly:**
> `sip-calculator`, `lumpsum-calculator`, `emi-calculator`,
> `income-tax-calculator`, `fd-calculator`, `ppf-calculator`,
> `epf-calculator`, `rd-calculator`, `elss-calculator`,
> `swp-calculator`, `mf-returns-calculator`, `xirr-calculator`,
> `gst-calculator`, `ssy-calculator`

---

### 3.5 — Hero Banner
**Content type ID:** `heroBanner`

| Field Name | Field ID | Type | Notes |
|---|---|---|---|
| Identifier | `identifier` | Short text | **Required. Unique.** e.g. `homepage-hero` |
| Headline | `headline` | Short text | Main heading |
| Subtext | `subtext` | Long text | Supporting text |
| CTA Text | `ctaText` | Short text | Button label |
| CTA URL | `ctaUrl` | Short text | Button link |
| Background Image | `backgroundImage` | Media | Optional |

---

### 3.6 — Testimonial
**Content type ID:** `testimonial`

| Field Name | Field ID | Type | Notes |
|---|---|---|---|
| Name | `name` | Short text | Customer name |
| Role | `role` | Short text | e.g. `Software Engineer, Mumbai` |
| Quote | `quote` | Long text | Review text |
| Rating | `rating` | Integer | 1–5 |
| Avatar | `avatar` | Media | Profile photo |

---

### 3.7 — FAQ
**Content type ID:** `faq`

| Field Name | Field ID | Type | Notes |
|---|---|---|---|
| Question | `question` | Short text | **Required** |
| Answer | `answer` | Rich text | Detailed answer |
| Category | `category` | Short text | e.g. `loans`, `sip-calculator` |
| Sort Order | `sortOrder` | Integer | For ordering FAQs |

---

### 3.8 — Partner
**Content type ID:** `partner`

| Field Name | Field ID | Type | Notes |
|---|---|---|---|
| Name | `name` | Short text | Partner company name |
| Logo | `logo` | Media | Partner logo image |
| Website | `website` | Short text | Partner URL |
| Category | `category` | Short text | e.g. `bank`, `insurer`, `amc` |

---

## Step 4: Publish Your First Entry

1. Go to **Content** → **"Add entry"** → **Global Setting**
2. Set Site Name = `Finzoop`, Primary Color = `#1B4FD8`
3. Click **"Publish"**
4. Open your browser DevTools on finzoop.com → Network tab
5. You should see a request to `cdn.contentful.com` returning your data ✅

---

## Step 5: Invite Content Writers

1. **Settings** → **Users & Teams** → **"Invite users"**
2. Enter their email
3. Assign role: **Editor**
4. They receive an invite email and can start writing immediately

---

## Slug Reference Card

| Page | Slug for `pageSeo` |
|------|--------------------|
| Home | `home-page` |
| About | `about-page` |
| Blog | `blog-page` |
| Calculators | `calculators-page` |
| Contact | `contact-page` |
| Loans | `loans-page` |
| Credit Cards | `credit-cards-page` |
| Insurance | `insurance-page` |
| Mutual Funds | `mutual-funds-page` |
| Investments | `investments-page` |
| NPS | `nps-page` |

---
*Setup time: ~30 minutes | Contentful Free Tier: 25,000 records, 2 users*
