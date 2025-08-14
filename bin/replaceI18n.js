#!/usr/bin/env node

const inquirer = require('inquirer');
const getZhCnJson = require('../utils/common/getZhCnJson');
const replaceChinese = require('../utils/ast/replaceChinese');
const chalk = require('chalk');

module.exports = async function (filePathMap = []) {
  if (!filePathMap.length) {
    console.log('该目录下没有需要替换的文件');
    return;
  }

  const allZhCNJson = await getZhCnJson();
  if (!allZhCNJson.length) {
    console.log(chalk.red('\n该目录下没有zh_CN.json文件'))
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
    },
  ])

  if (!answerTwo.开始替换么) {
    console.log('退出')
    return;
  }
  
  console.log('\n存在的中文文案')
  console.log(allZhCNJson)

  const replacePath = await Promise.all(filePathMap.map((filePath) => replaceChinese(allZhCNJson, filePath)))
  const len = replacePath.filter(item => item)?.length;
  if (len === 0) {
    console.log(chalk.red('\n没有文本可替换'))
  }
}