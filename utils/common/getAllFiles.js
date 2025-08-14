#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 递归获取目录下所有文件
 * @param {string} dir 目录路径
 * @param {string[]} [extensions] 文件扩展名过滤
 * @param {string[]} [ignoreDirs] 忽略的目录
 * @returns {string[]} 文件路径数组
 */
module.exports = function getAllFiles(dir, extensions = ['.ts', '.js', '.jsx', '.tsx'], ignoreDirs = ['node_modules', 'build', 'dist']) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat && stat.isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        results = results.concat(getAllFiles(fullPath, extensions, ignoreDirs));
      }
    } else if (extensions.length === 0 || extensions.includes(path.extname(file).toLowerCase())) {
      results.push(fullPath);
    }
  });

  return results;
}