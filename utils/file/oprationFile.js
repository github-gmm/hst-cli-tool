#! /usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 读取文件内容
 * @param {string} filePath 文件路径
 * @returns {string} 文件内容
 */
async function readFileContent(filePath) {
  const content = await fs.readFileSync(filePath, 'utf-8');
  return content;
}

/**
 * 写入文件内容
 * @param {string} filePath 文件路径
 * @param {string} content 文件内容
 * @returns {void}
 */
async function writeFileContent(filePath, content, msg = '生成文件') {
  await fs.writeFileSync(filePath, content, 'utf-8');
  const newFilePath = path.relative(process.cwd(), filePath);

  console.log(`${msg}: ${newFilePath} `);
}

/**
 * 判断文件是否存在
 * @param {string} filePath 文件路径
 * @returns {boolean} 文件是否存在
 */
function isExistFile(filePath) {
  if (fs.existsSync(filePath)) return true;

  return false;
}


module.exports = {
  readFileContent,
  writeFileContent,
  isExistFile,
}