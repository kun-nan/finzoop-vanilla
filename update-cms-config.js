/**
 * update-cms-config.js
 * Replaces the old Strapi CMS config block with the Contentful config block
 * in every HTML file across the project.
 * Run: node update-cms-config.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;

// ── Variant 1: old Strapi block (fully unreplaced pages)
const OLD_BLOCK_STRAPI = `  <script>
    window.CMS_URL = 'http://localhost:1337';
    window.CMS_TOKEN = '';
  </script>`;

// ── Variant 2: placeholder block — no preview token (most pages currently)
const OLD_BLOCK_PLACEHOLDER = `  <script>
    window.CONTENTFUL_SPACE_ID     = 'REPLACE_WITH_SPACE_ID';
    window.CONTENTFUL_ACCESS_TOKEN = 'REPLACE_WITH_ACCESS_TOKEN';
  </script>`;

// ── Variant 3: placeholder block with extra spaces (slight formatting differences)
const OLD_BLOCK_PLACEHOLDER_ALT = `  <script>
    window.CONTENTFUL_SPACE_ID      = 'REPLACE_WITH_SPACE_ID';
    window.CONTENTFUL_ACCESS_TOKEN  = 'REPLACE_WITH_ACCESS_TOKEN';
  </script>`;

const NEW_BLOCK = `  <script>
    window.CONTENTFUL_SPACE_ID       = 'tabc1qgaltm6';
    window.CONTENTFUL_ACCESS_TOKEN   = 'VCpSt0x-mm6pOncY1cYlkkuU5b9UsD_cs_mINwRgs6I';
    window.CONTENTFUL_PREVIEW_TOKEN  = 'Y3V82ept2t018xmuDJfyAf2Da86iZSsntizHFKwHmhk';
  </script>`;

// Also remove the now-unused publish-control.js script tag
const OLD_PUBLISH_CONTROL = `  <script src="/publish-control.js" defer></script>\n`;
const OLD_PUBLISH_CONTROL_REL = `  <script src="../publish-control.js" defer></script>\n`;

function collectHtmlFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', 'finzoop-cms'].includes(entry.name)) {
      collectHtmlFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = collectHtmlFiles(ROOT);
let updated = 0;

for (const filePath of files) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace whichever old block variant exists in this file
  if (content.includes(OLD_BLOCK_STRAPI)) {
    content = content.replace(OLD_BLOCK_STRAPI, NEW_BLOCK);
    changed = true;
  } else if (content.includes(OLD_BLOCK_PLACEHOLDER)) {
    content = content.replaceAll(OLD_BLOCK_PLACEHOLDER, NEW_BLOCK);
    changed = true;
  } else if (content.includes(OLD_BLOCK_PLACEHOLDER_ALT)) {
    content = content.replaceAll(OLD_BLOCK_PLACEHOLDER_ALT, NEW_BLOCK);
    changed = true;
  }

  // Remove publish-control.js references (no longer needed with Contentful)
  if (content.includes(OLD_PUBLISH_CONTROL)) {
    content = content.replace(OLD_PUBLISH_CONTROL, '');
    changed = true;
  }
  if (content.includes(OLD_PUBLISH_CONTROL_REL)) {
    content = content.replace(OLD_PUBLISH_CONTROL_REL, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Updated:', path.relative(ROOT, filePath));
    updated++;
  }
}

console.log(`\nDone. ${updated} file(s) updated.`);
console.log('\nNext step: replace REPLACE_WITH_SPACE_ID and REPLACE_WITH_ACCESS_TOKEN');
console.log('with your real Contentful credentials once you have them.');
