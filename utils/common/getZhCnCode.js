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
      } else if (path.basename(filename) === 'zh_CN.json') {
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
  const result = jsonData.reduce((acc, cur) => {
    Object.keys(cur).forEach((key) => {
      acc[key] = cur[key];
    });
    return acc;
  })

  return result;
}

function generateKeyValue(data = []) {
  const result = []
  Object.keys(data).forEach((key) => {
    result.push({
      code:  key,
      zh_CN: data[key]
    })
  })

  return result;
}


module.exports = async function () {
  const globPath = process.cwd();
  const jsonPathMap = findAllZhCNFiles(globPath);
  const jsonData = generateKeyValue(await readJsonFiles(jsonPathMap));

  return jsonData;
}