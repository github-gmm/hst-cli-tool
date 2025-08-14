#! /usr/bin/env node

const OpenCC = require('opencc-js');
const { translate } = require('bing-translate-api');

const converter = OpenCC.Converter({ from: 'cn', to: 'hk' });
/**
 * 生成递增的key
 * @param {number} index 
 * @returns {string} common.field001格式的key
 */
function generateKey(prefix, index) {
  const paddedIndex = String(index).padStart(3, '0');
  return `${prefix}.field${paddedIndex}`;
}

// 生成key - value的数组
module.exports = async (chineseData = [], langMap = [], prefix) => {
  const result = [];

  for (const [_i, cn] of [...new Set(chineseData)].entries()) {
    const lang = {};

    for (const _lang of langMap) {
      if(_lang === 'zh_TW') {
        const text = cn?.trim() ? await converter(cn?.trim()) : cn?.trim();
        lang[_lang] = text;
      } else if(_lang === 'en_US') {
        const { translation: text } = cn?.trim() ? await translate(cn?.trim(), null, 'en') : { translation: cn?.trim() };
        lang[_lang] = text;
      } else {
        lang[_lang] = cn?.trim();
      }
    }

    result.push({
      code: generateKey(prefix, _i + 1),
      ...lang,
    });
  };

  return result;
};