#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const readExcel = require('../utils/file/readExcel');
const getAllFiles = require('../utils/common/getAllFiles');
const { readFileContent, writeFileContent } = require('../utils/file/oprationFile');
const getZhCnCode = require('../utils/common/getZhCnCode');

function compareJson(zhCNJson, excelData, replaceKey) {
  const result = [];
  zhCNJson.forEach(item => {
    const findData = excelData.find(i => i[replaceKey] === item[replaceKey]) || {};

    result.push({
      ...item,
      ...findData
    })
  });

  return result;
}

async function updateJson(allJsonPath = [], jsoData) {
  if (!allJsonPath.length) {
    console.log(chalk.red(`没有找到可替换的json文件`))
    return;
  }

  for (jsonPath of allJsonPath) {
    const jsonName = path.basename(jsonPath, '.json');
    const jsonContent = JSON.parse(await readFileContent(jsonPath));
    Object.keys(jsonContent).forEach(key => {
      const value = (jsoData.find(i => i.code === key) || {})[jsonName];
      if (value) jsonContent[key] = value;
    })

    await writeFileContent(jsonPath, JSON.stringify(jsonContent, null, 2), '替换文件')
  }
}

module.exports = async function (filePaths = [], excelPath) {
  if (filePaths.length === 0) {
    console.log(chalk.red(`没有找到可替换的json文件`))
    return;
  }

  let answerTwo = await inquirer.prompt([
    {
      type: 'list',
      massage: 'action',
      name: '开始替换么',
      choices: [
        { name: '否', value: false },
        { name: '是', value: true }
      ]
    }
  ])

  if (!answerTwo.开始替换么) {
    console.log('退出')
    return;
  }

  let answerOne = await inquirer.prompt([
    {
      type: 'list',
      massage: 'action',
      name: '选择key替换',
      choices: [
        { name: 'zh_CN', value: 'zh_CN' },
        { name: 'code', value: 'code' },
        // { name: 'en_US', value: 'en_US' },
        // { name: 'zh_TW', value: 'zh_TW' }
      ]
    }
  ])

  const replaceKey = answerOne.选择key替换;

  if (!replaceKey) {
    console.log('退出')
    return;
  }

  const excelData = await readExcel(excelPath);
  console.log(`\n获取到excel ${excelData.length} 条数据`)

  const allZhCNJson = await getZhCnCode();
  const result = compareJson(allZhCNJson, excelData, replaceKey);
  console.log(`替换了json ${excelData.length} 条数据`)

  await updateJson(filePaths, result);
}