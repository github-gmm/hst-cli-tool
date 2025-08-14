#!/usr/bin/env node

const inquirer = require('inquirer');
const getLangJson = require('../utils/common/getLangJson');
const getJsonFiles = require('../utils/common/getJsonFiles');
const writeFiles = require('../utils/file/writeFiles');
const getChinese = require('../utils/ast/getChinese');
const chalk = require('chalk');

async function searchChinese(filePaths) {
  const chineseList = await Promise.all(filePaths.map(getChinese));
  const chineseData = chineseList?.flatMap((result) => result)?.sort((a, b) => b.length - a.length);

  return chineseData;
}

module.exports = async function (prefix, filePathMap = []) {
  if (!filePathMap.length) {
    console.log('该目录下没有需要检索的文件');
    return;
  }

  let answerOne = await inquirer.prompt([
    {
      type: 'list',
      massage: 'action',
      name: '确定开始检索么',
      choices: [
        { name: '否', value: false },
        { name: '是', value: true }
      ]
    }
  ])

  if (!answerOne.确定开始检索么) {
    console.log(chalk.red('已退出'))
    return;
  }

  console.log('\n');

  const data = await searchChinese(filePathMap);
  if (!data.length) {
    console.log(chalk.red('没有检索到中文'));
    return;
  }

  console.log([...new Set(data)]);
  console.log('检索出的中文');

  let answerTwo = await inquirer.prompt([
    {
      type: 'checkbox',
      massage: 'action',
      name: '需要的多语言',
      default: ['zh_CN', 'zh_TW'],
      choices: [
        { name: '中文简体', value: 'zh_CN' },
        { name: '中文繁体', value: 'zh_TW' },
        { name: '英文', value: 'en_US' },
        // { name: '沙特阿拉伯语', value: 'ar_SA' },
      ]
    },
    {
      type: 'list',
      massage: 'action',
      name: '确定生成多语言翻译文件么',
      choices: [
        { name: '否', value: false },
        { name: '是', value: true }
      ]
    }
  ])

  if (!answerTwo.确定生成多语言翻译文件么) {
    console.log(chalk.red('已退出'))
    return;
  }
  
  const langMap = answerTwo.需要的多语言 || [];
  const jsonData = await getLangJson([...new Set(data)], langMap, prefix);

  console.log('\n生成多语言翻译文件:');
  const jsonFilePath = getJsonFiles(jsonData, langMap);
  await writeFiles(jsonFilePath);
}