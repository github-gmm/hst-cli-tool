#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const { writeFileContent } = require('./oprationFile');

/**
 * 清空文件夹中的所有文件
 * @param {string} dirPath 文件夹路径
 * @returns {void}
 */
function clearDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      clearDirectory(filePath);
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  });
}

module.exports = async (outputPaths = [], clearDirs = true) => {
  if (!outputPaths.length) {
    return;
  }

  const dirName =  path.dirname(outputPaths[0].outpath);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }

  if (clearDirs) {
    const dirs = [...new Set(outputPaths.map(item => path.dirname(item.outpath)))];
    dirs.forEach(dir => {
      clearDirectory(dir);
    });
  }

  await Promise.all(outputPaths.map((item) => writeFileContent(item.outpath, item.content)));
}