#!/usr/bin/env node

const { Command } = require("commander");
const program = new Command();

const path = require('path');
const searchI18n = require("./searchI18n");
const getAllFiles = require("../utils/common/getAllFiles");
const replaceI18n = require("./replaceI18n");
const replaceJson = require("./replaceJson");
const { isExistFile } = require("../utils/file/oprationFile");
const chalk = require("chalk");

// 定义指令 i18n_s <prefix>
program
  .version('0.0.1')
  .usage('<command> [options]')
  .command('i18n_s <prefix>')
  .description('扫描项目中的中文文本并翻译成目标语言【prefix: 例commom.test】')
  .action((prefix) => {
    const globPath = process.cwd();
    const allFiles = getAllFiles(globPath);
    const newAllFiles = allFiles.map((filePath) => path.relative(globPath, filePath))
    console.log(newAllFiles);
    console.log(`在上面 ${newAllFiles.length} 个文件中查找中文`);
    searchI18n(prefix, allFiles)
  });

// 定义指令 i18n_r
program
  .command('i18n_r')
  .description('自动将中文文本替换为国际化函数调用(如 lang.$T("code").$D("中文") 等)')
  .action(() => {
    const globPath = process.cwd();
    const allFiles = getAllFiles(globPath);
    const newAllFiles = allFiles.map((filePath) => path.relative(globPath, filePath))
    console.log(newAllFiles);
    console.log(`在上面 ${newAllFiles.length} 个文件中替换中文, 通过zh_CN.json文件`);
    replaceI18n(allFiles)
  });

// 定义指令 excel_to_json <excelName>
program
  .command('excel_to_json <excelName>')
  .description('Excel翻译表格和项目JSON语言文件之间双向同步【excelName: 例lang_admin.xlsx】')
  .action((excelName) => {
    const globPath = process.cwd();
    const excelPath = path.resolve(globPath, excelName);
    if (!isExistFile(excelPath)) {
      console.log(chalk.red(`文件：${path.relative(globPath, excelPath)} 不存在`))
      return;
    }
    const allFiles = getAllFiles(globPath, '.json');
    const newAllFiles = allFiles.map((filePath) => path.relative(globPath, filePath))
    console.log(newAllFiles);
    console.log(`上面 ${newAllFiles.length} 个文件需替换翻译文案`);
    replaceJson(allFiles, excelPath)
  });

// 解析命令行参数
program.parse(process.argv);