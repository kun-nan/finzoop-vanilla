// Use built-in fetch

const TOKEN   = process.env.CONTENTFUL_CMA_TOKEN || 'YOUR_CMA_TOKEN';
const SPACE   = 'tabc1qgaltm6';
const ENV     = 'master';
const BASE    = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function createOrSkip(id, config) {
  try {
    const check = await fetch(`${BASE}/content_types/${id}`,
      { headers });
    if (check.ok) {
      console.log(`⏭  ${id} already exists`);
      return;
    }
  } catch(e) {}

  const res = await fetch(`${BASE}/content_types/${id}`, {
    method: 'PUT',
    headers: { ...headers, 'X-Contentful-Version': '0' },
    body: JSON.stringify(config)
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`✗ ${id}:`, data.message);
    return;
  }
  // Publish
  await fetch(`${BASE}/content_types/${id}/published`, {
    method: 'PUT',
    headers: { ...headers,
      'X-Contentful-Version': data.sys.version }
  });
  console.log(`✓ Created: ${id}`);
}

async function createEntry(contentType, fields, entryId) {
  const checkRes = await fetch(`${BASE}/entries/${entryId}`,
    { headers });
  if (checkRes.ok) {
    console.log(`⏭  Entry ${entryId} exists`);
    return;
  }
  const res = await fetch(`${BASE}/entries/${entryId}`, {
    method: 'PUT',
    headers: {
      ...headers,
      'X-Contentful-Content-Type': contentType,
      'X-Contentful-Version': '0'
    },
    body: JSON.stringify({ fields })
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Entry error:', data.message, fields);
    return null;
  }
  // Publish entry
  await fetch(`${BASE}/entries/${entryId}/published`, {
    method: 'PUT',
    headers: { ...headers,
      'X-Contentful-Version': data.sys.version }
  });
  console.log(`✓ Entry: ${entryId}`);
  return data;
}

function tf(val) { return { 'en-US': val }; }

async function main() {
  console.log('Setting up Finzoop product content types...\n');

  // ── Content Type 1: productCategory ──
  await createOrSkip('productCategory', {
    name: 'Product Category',
    description: 'Tab categories on product pages',
    displayField: 'name',
    fields: [
      { id: 'name',        name: 'Category Name',
        type: 'Symbol',    required: true },
      { id: 'slug',        name: 'Slug',
        type: 'Symbol',    required: true },
      { id: 'pageType',    name: 'Page Type',
        type: 'Symbol',    required: true,
        validations: [{ in: ['loans','credit-cards',
          'insurance','mutual-funds','nps','investments'] }] },
      { id: 'icon',        name: 'Lucide Icon Name',
        type: 'Symbol' },
      { id: 'color',       name: 'Color Hex',
        type: 'Symbol' },
      { id: 'sortOrder',   name: 'Sort Order',
        type: 'Integer' },
      { id: 'isDefault',   name: 'Default Tab',
        type: 'Boolean' },
      { id: 'isPublished', name: 'Published',
        type: 'Boolean' },
    ]
  });

  // ── Content Type 2: productItem ──
  await createOrSkip('productItem', {
    name: 'Product Item',
    description: 'Individual product cards on each page',
    displayField: 'name',
    fields: [
      { id: 'name',         name: 'Product Name',
        type: 'Symbol',     required: true },
      { id: 'pageType',     name: 'Page Type',
        type: 'Symbol',     required: true,
        validations: [{ in: ['loans','credit-cards',
          'insurance','mutual-funds','nps','investments'] }] },
      { id: 'category',     name: 'Category',
        type: 'Link',       linkType: 'Entry',
        validations: [{
          linkContentType: ['productCategory']
        }] },
      { id: 'logo',         name: 'Logo / Image',
        type: 'Link',       linkType: 'Asset' },
      { id: 'badge',        name: 'Badge Text',
        type: 'Symbol' },
      { id: 'badgeColor',   name: 'Badge Color',
        type: 'Symbol' },
      { id: 'tagline',      name: 'Tagline',
        type: 'Symbol' },
      { id: 'description',  name: 'Short Description',
        type: 'Text' },
      { id: 'highlights',   name: 'Key Highlights',
        type: 'Array',
        items: { type: 'Symbol' } },
      { id: 'rate',         name: 'Rate / Return',
        type: 'Symbol' },
      { id: 'rateLabel',    name: 'Rate Label',
        type: 'Symbol' },
      { id: 'minAmount',    name: 'Min Amount',
        type: 'Symbol' },
      { id: 'tenure',       name: 'Tenure',
        type: 'Symbol' },
      { id: 'applyUrl',     name: 'Apply / Invest URL',
        type: 'Symbol' },
      { id: 'applyLabel',   name: 'CTA Button Label',
        type: 'Symbol' },
      { id: 'isFeatured',   name: 'Featured',
        type: 'Boolean' },
      { id: 'sortOrder',    name: 'Sort Order',
        type: 'Integer' },
      { id: 'isPublished',  name: 'Published',
        type: 'Boolean' },
    ]
  });

  // ── Seed categories ───────────────────────────────────
  const cats = [
    // Loans
    { id:'cat-loan-personal', name:'Personal Loan',
      slug:'personal-loan', pageType:'loans',
      icon:'user',     color:'#1B4FD8', sort:1, def:true },
    { id:'cat-loan-home',     name:'Home Loan',
      slug:'home-loan', pageType:'loans',
      icon:'house',    color:'#059669', sort:2, def:false },
    { id:'cat-loan-business', name:'Business Loan',
      slug:'business-loan', pageType:'loans',
      icon:'briefcase',color:'#7C3AED', sort:3, def:false },
    { id:'cat-loan-lap',      name:'Loan Against Property',
      slug:'lap', pageType:'loans',
      icon:'building', color:'#D97706', sort:4, def:false },
    // Credit Cards
    { id:'cat-cc-cashback',  name:'Cashback',
      slug:'cashback', pageType:'credit-cards',
      icon:'percent',  color:'#1B4FD8', sort:1, def:true },
    { id:'cat-cc-travel',    name:'Travel',
      slug:'travel',   pageType:'credit-cards',
      icon:'plane',    color:'#059669', sort:2, def:false },
    { id:'cat-cc-shopping',  name:'Shopping',
      slug:'shopping', pageType:'credit-cards',
      icon:'shopping-bag', color:'#7C3AED', sort:3, def:false },
    { id:'cat-cc-premium',   name:'Premium',
      slug:'premium',  pageType:'credit-cards',
      icon:'crown',    color:'#D97706', sort:4, def:false },
    // Insurance
    { id:'cat-ins-health',   name:'Health Insurance',
      slug:'health',   pageType:'insurance',
      icon:'heart-pulse', color:'#DC2626', sort:1, def:true },
    { id:'cat-ins-life',     name:'Life Insurance',
      slug:'life',     pageType:'insurance',
      icon:'shield-check', color:'#059669', sort:2, def:false },
    { id:'cat-ins-motor',    name:'Motor Insurance',
      slug:'motor',    pageType:'insurance',
      icon:'car',      color:'#D97706', sort:3, def:false },
    // Mutual Funds
    { id:'cat-mf-equity',    name:'Equity Funds',
      slug:'equity',   pageType:'mutual-funds',
      icon:'trending-up', color:'#1B4FD8', sort:1, def:true },
    { id:'cat-mf-debt',      name:'Debt Funds',
      slug:'debt',     pageType:'mutual-funds',
      icon:'shield',   color:'#059669', sort:2, def:false },
    { id:'cat-mf-hybrid',    name:'Hybrid Funds',
      slug:'hybrid',   pageType:'mutual-funds',
      icon:'git-merge',color:'#7C3AED', sort:3, def:false },
    { id:'cat-mf-elss',      name:'ELSS / Tax Saver',
      slug:'elss',     pageType:'mutual-funds',
      icon:'leaf',     color:'#D97706', sort:4, def:false },
    { id:'cat-mf-index',     name:'Index Funds',
      slug:'index',    pageType:'mutual-funds',
      icon:'bar-chart-2', color:'#DC2626', sort:5, def:false },
  ];

  for (const c of cats) {
    await createEntry('productCategory', {
      name:        tf(c.name),
      slug:        tf(c.slug),
      pageType:    tf(c.pageType),
      icon:        tf(c.icon),
      color:       tf(c.color),
      sortOrder:   tf(c.sort),
      isDefault:   tf(c.def),
      isPublished: tf(true),
    }, c.id);
  }

  // ── Seed product items (6 per page type) ─────────────
  // [Full seed data for all products across all page types]
  // Loans
  const loanProducts = [
    { id:'prod-loan-1', cat:'cat-loan-personal',
      name:'HDFC Personal Loan',
      badge:'Most Popular', badgeColor:'#1B4FD8',
      tagline:'Get funds in 4 hours',
      desc:'Instant personal loans with minimal documentation. '
         + 'No collateral required.',
      highlights:['Interest rate from 10.5%',
                  'Loan up to ₹40 Lakhs',
                  'Flexible tenure 12-60 months',
                  'Zero prepayment charges'],
      rate:'10.50% p.a.', rateLabel:'Interest Rate',
      minAmount:'₹50,000', tenure:'12-60 months',
      applyUrl:'loans.html', applyLabel:'Apply Now',
      sort:1 },
    { id:'prod-loan-2', cat:'cat-loan-personal',
      name:'ICICI Personal Loan',
      badge:'Fast Approval', badgeColor:'#059669',
      tagline:'Approval in 3 seconds',
      desc:'Digital personal loans with instant approval '
         + 'for salaried professionals.',
      highlights:['Rate from 10.75%',
                  'Up to ₹50 Lakhs',
                  'Online application',
                  'Salary account not required'],
      rate:'10.75% p.a.', rateLabel:'Interest Rate',
      minAmount:'₹1,00,000', tenure:'12-72 months',
      applyUrl:'loans.html', applyLabel:'Apply Now',
      sort:2 },
    { id:'prod-loan-3', cat:'cat-loan-personal',
      name:'Bajaj Finserv Personal Loan',
      badge:'No Collateral', badgeColor:'#7C3AED',
      tagline:'Flexi loan with part-withdrawal',
      desc:'Unique flexi loan facility — withdraw as needed, '
         + 'pay interest only on used amount.',
      highlights:['Rate from 13%',
                  'Up to ₹35 Lakhs',
                  'Part-withdrawal facility',
                  'Online account management'],
      rate:'13.00% p.a.', rateLabel:'Interest Rate',
      minAmount:'₹1,00,000', tenure:'12-60 months',
      applyUrl:'loans.html', applyLabel:'Apply Now',
      sort:3 },
    { id:'prod-loan-4', cat:'cat-loan-home',
      name:'SBI Home Loan',
      badge:'Lowest Rate', badgeColor:'#059669',
      tagline:"India's most trusted home loan",
      desc:'Lowest interest rates with government bank safety. '
         + 'Ideal for first-time home buyers.',
      highlights:['Rate from 8.50% p.a.',
                  'Up to ₹10 Crore',
                  'Up to 30 year tenure',
                  'Tax benefits u/s 80C & 24B'],
      rate:'8.50% p.a.', rateLabel:'Interest Rate',
      minAmount:'₹10,00,000', tenure:'5-30 years',
      applyUrl:'loans.html', applyLabel:'Apply Now',
      sort:4 },
    { id:'prod-loan-5', cat:'cat-loan-business',
      name:'Lendingkart Business Loan',
      badge:'MSME Friendly', badgeColor:'#D97706',
      tagline:'Business loans in 72 hours',
      desc:'Collateral-free business loans for SMEs. '
         + 'Minimal documentation, fast disbursal.',
      highlights:['Rate from 1.5% per month',
                  'Up to ₹2 Crore',
                  'No collateral needed',
                  'Bank statement analysis'],
      rate:'1.5% / month', rateLabel:'Interest Rate',
      minAmount:'₹50,000', tenure:'1-36 months',
      applyUrl:'loans.html', applyLabel:'Apply Now',
      sort:5 },
    { id:'prod-loan-6', cat:'cat-loan-lap',
      name:'HDFC Loan Against Property',
      badge:'High Value', badgeColor:'#1B4FD8',
      tagline:'Unlock value from your property',
      desc:'Get up to 70% of property value as loan '
         + 'at low interest rates.',
      highlights:['Rate from 9.50% p.a.',
                  'Up to ₹10 Crore',
                  'Residential & commercial',
                  'Overdraft facility available'],
      rate:'9.50% p.a.', rateLabel:'Interest Rate',
      minAmount:'₹10,00,000', tenure:'2-20 years',
      applyUrl:'loans.html', applyLabel:'Apply Now',
      sort:6 },
  ];

  for (const p of loanProducts) {
    await createEntry('productItem', {
      name:        tf(p.name),
      pageType:    tf('loans'),
      category:    tf({ sys: { type: 'Link',
                               linkType: 'Entry',
                               id: p.cat } }),
      badge:       tf(p.badge),
      badgeColor:  tf(p.badgeColor),
      tagline:     tf(p.tagline),
      description: tf(p.desc),
      highlights:  tf(p.highlights),
      rate:        tf(p.rate),
      rateLabel:   tf(p.rateLabel),
      minAmount:   tf(p.minAmount),
      tenure:      tf(p.tenure),
      applyUrl:    tf(p.applyUrl),
      applyLabel:  tf(p.applyLabel),
      isFeatured:  tf(p.sort === 1),
      sortOrder:   tf(p.sort),
      isPublished: tf(true),
    }, p.id);
  }

  // Mutual Fund products
  const mfProducts = [
    { id:'prod-mf-1', cat:'cat-mf-equity',
      name:'Mirae Asset Large Cap Fund',
      badge:'5★ Rated', badgeColor:'#1B4FD8',
      tagline:'Consistent large cap performer',
      desc:'Top-rated large cap equity fund with consistent '
         + 'long-term returns.',
      highlights:['1Y Return: 18.2%',
                  '3Y Return: 14.6%',
                  '5Y Return: 16.1%',
                  'Min SIP: ₹1,000'],
      rate:'16.1% (5Y)', rateLabel:'Returns',
      minAmount:'₹1,000/month', tenure:'3+ years',
      applyUrl:'mutual-funds.html', applyLabel:'Invest Now',
      sort:1 },
    { id:'prod-mf-2', cat:'cat-mf-equity',
      name:'Parag Parikh Flexi Cap Fund',
      badge:'Top Rated', badgeColor:'#059669',
      tagline:'Diversified across global markets',
      desc:'Unique flexi cap fund investing in India and '
         + 'global stocks including Google, Amazon.',
      highlights:['1Y Return: 21.4%',
                  '3Y Return: 18.2%',
                  '5Y Return: 19.8%',
                  'Min SIP: ₹1,000'],
      rate:'19.8% (5Y)', rateLabel:'Returns',
      minAmount:'₹1,00,000/month', tenure:'3+ years',
      applyUrl:'mutual-funds.html', applyLabel:'Invest Now',
      sort:2 },
    { id:'prod-mf-3', cat:'cat-mf-elss',
      name:'Axis Long Term Equity Fund',
      badge:'Tax Saver', badgeColor:'#D97706',
      tagline:'Save tax + grow wealth',
      desc:'ELSS fund with 3-year lock-in. Best for tax '
         + 'saving under Section 80C.',
      highlights:['1Y Return: 14.8%',
                  '3Y Return: 12.4%',
                  'Tax saving up to ₹46,800',
                  'Min SIP: ₹500'],
      rate:'12.4% (3Y)', rateLabel:'Returns',
      minAmount:'₹500/month', tenure:'3 years (lock-in)',
      applyUrl:'mutual-funds.html', applyLabel:'Invest Now',
      sort:3 },
    { id:'prod-mf-4', cat:'cat-mf-debt',
      name:'HDFC Short Duration Fund',
      badge:'Low Risk', badgeColor:'#059669',
      tagline:'Stable debt fund',
      desc:'Short duration debt fund suitable for investors '
         + 'with 1-3 year investment horizon.',
      highlights:['1Y Return: 7.8%',
                  '3Y Return: 6.9%',
                  'Low volatility',
                  'Min SIP: ₹500'],
      rate:'7.8% (1Y)', rateLabel:'Returns',
      minAmount:'₹500/month', tenure:'1-3 years',
      applyUrl:'mutual-funds.html', applyLabel:'Invest Now',
      sort:4 },
    { id:'prod-mf-5', cat:'cat-mf-index',
      name:'UTI Nifty 50 Index Fund',
      badge:'Lowest Cost', badgeColor:'#1B4FD8',
      tagline:'Track Nifty 50 at minimal cost',
      desc:'Low-cost passive index fund tracking '
         + 'the Nifty 50. Expense ratio: 0.20%.',
      highlights:['1Y Return: 17.1%',
                  '3Y Return: 13.8%',
                  'Expense ratio: 0.20%',
                  'Min SIP: ₹500'],
      rate:'13.8% (3Y)', rateLabel:'Returns',
      minAmount:'₹500/month', tenure:'3+ years',
      applyUrl:'mutual-funds.html', applyLabel:'Invest Now',
      sort:5 },
    { id:'prod-mf-6', cat:'cat-mf-hybrid',
      name:'ICICI Balanced Advantage Fund',
      badge:'Dynamic', badgeColor:'#7C3AED',
      tagline:'Auto-adjusts equity/debt ratio',
      desc:'Dynamic asset allocation fund that shifts between '
         + 'equity and debt based on market valuations.',
      highlights:['1Y Return: 12.4%',
                  '3Y Return: 11.6%',
                  'Auto rebalancing',
                  'Min SIP: ₹1,000'],
      rate:'11.6% (3Y)', rateLabel:'Returns',
      minAmount:'₹1,000/month', tenure:'2+ years',
      applyUrl:'mutual-funds.html', applyLabel:'Invest Now',
      sort:6 },
  ];

  for (const p of mfProducts) {
    await createEntry('productItem', {
      name:        tf(p.name),
      pageType:    tf('mutual-funds'),
      category:    tf({ sys: { type: 'Link',
                               linkType: 'Entry',
                               id: p.cat } }),
      badge:       tf(p.badge),
      badgeColor:  tf(p.badgeColor),
      tagline:     tf(p.tagline),
      description: tf(p.desc),
      highlights:  tf(p.highlights),
      rate:        tf(p.rate),
      rateLabel:   tf(p.rateLabel),
      minAmount:   tf(p.minAmount),
      tenure:      tf(p.tenure),
      applyUrl:    tf(p.applyUrl),
      applyLabel:  tf(p.applyLabel),
      isFeatured:  tf(p.sort === 1),
      sortOrder:   tf(p.sort),
      isPublished: tf(true),
    }, p.id);
  }

  console.log('\n✅ Product setup complete!');
}

main().catch(console.error);
