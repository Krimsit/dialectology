const generateLayout = require('./layout');
const generateMainPage = require('./mainPage');
const generatePages = require('./pages');
const siteContent = require('../site-content/site-config.json');

const generateSiteContent = async () => {
  try {
    await generateLayout(siteContent.layout)
    await generateMainPage(siteContent.mainPage)
    await generatePages(siteContent.pages)
  } catch (err) {
    console.error(err);
  }
}

module.exports = generateSiteContent