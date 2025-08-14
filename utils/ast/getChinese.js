#! /usr/bin/env node

const parser = require('@babel/parser');
const chalk = require('chalk'); 
const traverse = require('@babel/traverse').default;

const { readFileContent } = require('../file/oprationFile');
/**
 * 根据文件扩展名确定解析选项
 * @param {string} filePath - 文件路径
 * @returns {Object} - 解析选项
 */
function getParserOptions(filePath) {
  const isTS = /\.(ts|tsx)$/.test(filePath);
  const isTSX = /\.(tsx|jsx)$/.test(filePath);

  const plugins = ['jsx'];
  
  if (isTS) {
    plugins.push('typescript');
    if (isTSX) {
      plugins.push('tsx');
    }
  }

  return {
    sourceType: 'module',
    plugins
  };
}

/**
 * 测试是否包含中文字符
 * @param {string} str - 字符串
 * @returns {boolean} - 是否包含中文字符
 */
function testChinese(str) {
  if (/[\u4e00-\u9fa5]/.test(str)) {
    return str;
  }

  return '';
}

/**
 * 验证
 * @param {Object} path - AST节点路径
 * @returns {boolean} - 是否为对象属性
 */
function validate(path) {
  // 对象属性不用提取
  const isObjectProperty = path.parentPath?.isMemberExpression() && path.key === 'property' && path.parent?.computed;

  if (isObjectProperty) {
    return true;
  }

  return false;
}

function parseAst(ast) {
  const result = [];
  try {
    traverse(ast, {
      StringLiteral(path) {
        if (validate(path)) return;

        const value = path.node.value?.trim();
        if (testChinese(value)) result.push(value);
      },

      JSXText(path) {
        const value = path.node.value?.trim();
        if (testChinese(value)) result.push(value);
      },

      TemplateLiteral(path) {
        path.node.quasis.forEach((templateElement) => {
          const value = templateElement.value.raw;
          if (testChinese(value)) result.push(value);
        });
      },
    });
  } catch (error) {}
  return result;
}

/**
 * 获取AST中文字符
 * @param {string} filePath - 文件路径
 * @param {string} content - 文件内容
 * @returns {Array} - 中文字符数组
 */
module.exports = async function (filePath) {
  try {
    const content = await readFileContent(filePath);
    const parserOptions = getParserOptions(filePath);
    const ast = parser.parse(content, parserOptions);
    return parseAst(ast);
  } catch (error) {
    console.log(chalk.red(`AST 解析: ${filePath} 文件失败`));
    return [];
  }
}