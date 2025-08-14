#! /usr/bin/env node

const fs = require('fs');
const path = require('path');
const readFiles = require('../file/readFiles');

function findAllZhCNFiles(startPath) {
  let results = [];
  
  try {
    const files = fs.readdirSync(startPath);
    
    for (let i = 0; i < files.length; i++) {
      const filename = path.join(startPath, files[i]);
      const stat = fs.lstatSync(filename);
      
      if (stat.isDirectory()) {
        // 递归查找子目录
        const subResults = findAllZhCNFiles(filename);
        results = results.concat(subResults);
      } else if (['zh_CN.json', 'zh-CN.json', 'zh_cn.json', 'zh-cn.json'].includes(path.basename(filename))) {
        results.push(filename);
      }
    }
  } catch (error) {
    console.error(`读取目录 ${startPath} 时出错:`, error.message);
  }
  return results;
}

async function readJsonFiles(filePaths) {
  const jsonList = await readFiles(filePaths);
  const jsonData = jsonList?.flatMap((result) => JSON.parse(result));
  const result = jsonData?.reduce((acc, cur) => {
    Object.keys(cur).forEach((key) => {
      acc[key] = cur[key];
    });
    return acc;
  })

  return result;
}

function generateKeyValue(data = []) {
  const newData = [...new Set(Object.values(data))]?.sort((a, b) => b.length - a.length);
  const result = []
  newData.forEach((val) => {
    result.push({
      code:  Object.keys(data).find(key => data[key] === val),
      zh_CN: val
    })
  })

  return result;
}


module.exports = async function () {
  const globPath = process.cwd();
  const jsonPathMap = findAllZhCNFiles(globPath);

  if (!jsonPathMap.length) {
    return [];
  }

  const jsonData = generateKeyValue(await readJsonFiles(jsonPathMap));

  return jsonData;
}