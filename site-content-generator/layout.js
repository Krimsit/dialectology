const fs = require('fs');
const path = require('path');
const {OUTPUT_DIR} = require('./constants');

const generateLayoutHeaderLinksPugMarkup = (links) => {
  return `
.headerLinksContainer
    ${links.map(link => `a(href="pages/${link.href}.html").headerLink ${link.text}`)}
`
}

const generateLayout = async (layout) => {
  const layoutHeaderLinksPug = generateLayoutHeaderLinksPugMarkup(layout.header.links);

  await fs.promises.writeFile(path.join(OUTPUT_DIR, 'layouts/headerLinks.pug'), layoutHeaderLinksPug);
}

module.exports = generateLayout;