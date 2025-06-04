const { convertToHtml } = require('mammoth')
const { JSDOM } = require('jsdom')
const fs = require('fs');
const path = require('path');
const {OUTPUT_DIR} = require('./constants');

const generatePageLinksPugMarkup = (links) => {
  return `
section.container
    +links(${JSON.stringify(links)})
`.trim()
}

const generatePageDocxPugMarkup = (title, contentHTML, links) => {
  const escapedContent = contentHTML.replace(/"/g, '\\"');

  return `
extends ../layouts/default

block vars
  - const pageTitle = "${title}"
  - const sectionContent = "${escapedContent}"

block content
  include ../blocks/cover
  include ../blocks/links

  +cover("${title}")

  section.container.content
    != sectionContent
  ${links ? generatePageLinksPugMarkup(links) : ''}
`.trim();
}

const generatePagePdfPugMarkup = (title, pdfUrl, links) => {
  return `
extends ../layouts/default

block vars
  - const pageTitle = "${title}"

block content
  include ../blocks/cover
  include ../blocks/links
  include ../blocks/pdfView

  +cover("${title}")

  section.container
      +pdfView("/assets/${pdfUrl}")
  ${links ? generatePageLinksPugMarkup(links) : ''}

  script(src="/scripts/pdf.js")
`
}

const generateDocx = async ({ findHeader, pagePath, pageTitle, docxPath, links }) => {
  const result = await convertToHtml({ path: path.join(__dirname, `../site-content/${docxPath}`) });
  const dom = new JSDOM(result.value);
  const document = dom.window.document
  const headings = Array.from(document.querySelectorAll(`h${findHeader.level}`));
  const targetHeading = headings.find(h => h.textContent?.trim() === findHeader.text);

  if (!targetHeading) {
    throw new Error(`Заголовок "${findHeader.text}" не найден`);
  }

  const allNodes = Array.from(document.body.childNodes);
  const startIndex = allNodes.indexOf(targetHeading);
  let nextHeadingIndex = -1;

  for (let i = startIndex + 1; i < allNodes.length; i++) {
    const node = allNodes[i];
    if (node.nodeType === 1 && /^H[1-6]$/i.test(node.tagName)) {
      nextHeadingIndex = i;
      break;
    }
  }

  const contentNodes = nextHeadingIndex !== -1
      ? allNodes.slice(startIndex + 1, nextHeadingIndex)
      : allNodes.slice(startIndex + 1);
  const container = document.createElement('div');

  for (const node of contentNodes) {
    if (node.nodeType === 1 || node.nodeType === 3) {
      container.appendChild(node.cloneNode(true));
    }
  }

  const docxPug = generatePageDocxPugMarkup(pageTitle, container.innerHTML, links);

  await fs.promises.writeFile(path.join(OUTPUT_DIR, `./pages/${pagePath}.pug`), docxPug);
}

const generatePagePdf = async ({ pageTitle, pdfPath, links, pagePath }) => {
  const pdfPug = generatePagePdfPugMarkup(pageTitle, pdfPath, links)

  await fs.promises.writeFile(path.join(OUTPUT_DIR, `./pages/${pagePath}.pug`), pdfPug);
}

const generatePages = async (pages) => {
  for (const page of pages) {
    if (page.type === 'docx') {
      await generateDocx(page);
    } else if (page.type === 'pdf') {
      await generatePagePdf(page)
    }
  }
}

module.exports = generatePages