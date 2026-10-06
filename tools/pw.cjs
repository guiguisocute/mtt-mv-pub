// Resolve Playwright from this project or a global install.
const path = require('path');
try {
  module.exports = require('playwright');
} catch (_) {
  try {
    module.exports = require(path.resolve(__dirname, '../node_modules/playwright'));
  } catch (e) {
    throw new Error('Playwright is required for check / frames / render. Run: npm install playwright && npx playwright install chromium');
  }
}
// file:// URL of index.html with query (forward slashes on Windows)
module.exports.pageUrl = (query) => 'file:///' + path.resolve(__dirname, '../index.html').replace(/\\/g, '/').replace(/^\//, '') + query;
module.exports.SWIFT = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'];
