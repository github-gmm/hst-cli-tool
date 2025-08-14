#! /usr/bin/env node

const path = require('path');

module.exports = (chineseData = [], langMap = []) => {
  const result = [];
  const globPath = process.cwd();

  langMap.forEach(_lang => {
    const newData = {}
    chineseData.forEach(item => {
      newData[item.code] = item[_lang]
    })

    result.push({
      outpath: path.resolve(globPath, `lang/${_lang}.json`),
      content: JSON.stringify(newData, null, 2)
    })
  });

  return result;
}