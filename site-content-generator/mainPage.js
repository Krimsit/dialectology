const fs = require('fs');
const path = require('path');
const {OUTPUT_DIR} = require('./constants');

const generateMainPagePugMarkup = ({ pageTitle, cover, infoBlocks }) => {
  return `
extends ./layouts/default

block vars
  - const pageTitle = "${pageTitle}"
  - const coverData = ${JSON.stringify({
    ...cover,
    image: `/assets/${cover.image}`
  })}
  
block content
    include ./blocks/cover
    include ./blocks/infoBlock
    
    +cover(coverData.title, coverData.description, coverData.image)
    +infoBlock(${JSON.stringify(infoBlocks.map(item => ({ ...item, link: `/pages/${item.link}.html`, image: `/assets/${item.image}` })))})
`
}

const generateMainPage = async (mainPage) => {
  const mainPagePug = generateMainPagePugMarkup({
    pageTitle: 'Главная страница',
    cover: {
      title: mainPage.title,
      description: mainPage.description,
      image: mainPage.coverImage,
    },
    infoBlocks: mainPage.blocks
  })

  await fs.promises.writeFile(path.join(OUTPUT_DIR, 'index.pug'), mainPagePug);
}

module.exports = generateMainPage;