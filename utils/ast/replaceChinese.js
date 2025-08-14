#! /usr/bin/env node

const t = require('@babel/types');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

const { readFileContent, writeFileContent } = require('../file/oprationFile');

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
 * 检查节点是否已经被 lang.$T('key').$D('value') 包裹
 * @param {Object} path - AST 节点路径
 * @returns {boolean} - 是否已被包裹
 */
function isAlreadyWrapped(path) {
  // 检查父节点是否是 CallExpression 并且符合 lang.$T('key').$D('value') 模式
  const parent = path.parent;

  // 检查是否在 $D 函数调用中
  if (t.isCallExpression(parent)) {
    // 检查是否是 memberExpression 并且是 $D 调用
    const callee = parent.callee;
    if (t.isMemberExpression(callee) &&
      t.isIdentifier(callee.property) &&
      callee.property.name === '$D') {

      // 检查对象部分是否是 lang.$T('key') 调用
      const object = callee.object;
      if (t.isCallExpression(object) &&
        t.isMemberExpression(object.callee) &&
        t.isIdentifier(object.callee.object) &&
        object.callee.object.name === 'lang' &&
        t.isIdentifier(object.callee.property) &&
        object.callee.property.name === '$T') {
        return true;
      }
    }
  }

  return false;
}

/**
 * 验证
 * @param {Object} path - AST节点路径
 * @returns {boolean} - 是否为对象属性
 */
function validate(path) {
  // 对象属性不用提取
  const isObjectProperty = path.parentPath.isMemberExpression() && path.key === 'property' && path.parent.computed;

  if (isObjectProperty) {
    return true;
  }

  return false;
}

function testCode(props) {
  const { path, stringValue, type, data, quasiIndex } = props;
  const result = [];
  for (const { code, zh_CN } of data) {
    if (stringValue === zh_CN) {
      result.push({
        path,
        key: code,
        value: zh_CN,
        type,
        quasiIndex
      });
      break;
    }
  }
  return result;
}

function parseAst(ast, chineseData) {
  const result = [];
  try {
    traverse(ast, {
      StringLiteral(path) {
        if (isAlreadyWrapped(path)) return;
        if (validate(path)) return;

        const stringValue = path.node.value.trim();
        result.push(testCode({
          stringValue,
          path,
          type: 'StringLiteral',
          data: chineseData
        }))
      },

      JSXText(path) {
        if (isAlreadyWrapped(path)) return;
        const stringValue = path.node.value.trim();
        result.push(testCode({
          stringValue,
          path,
          type: 'JSXText',
          data: chineseData
        }))
      },

      TemplateLiteral(path) {
        const { node } = path;
        if (isAlreadyWrapped(path)) return;

        // 遍历模板字符串中的静态部分(quasis)
        node.quasis.forEach((quasi, index) => {
          const stringValue = quasi.value.raw;
          result.push(testCode({
            stringValue,
            path,
            type: 'TemplateLiteral',
            data: chineseData,
            quasiIndex: index
          }))
        });
      }
    });
  } catch (error) {}
  return result.flatMap(item => item);
}

function replaceAst(data) {
  // 执行替换
  data.forEach(({ path, key, value, type, quasiIndex }) => {
    // 创建 lang.$T('key').$D('value') 表达式
    const replacement = t.callExpression(
      t.memberExpression(
        t.callExpression(
          t.memberExpression(
            t.identifier('lang'),
            t.identifier('$T')
          ),
          [t.stringLiteral(key)]
        ),
        t.identifier('$D')
      ),
      [t.stringLiteral(value)]
    );

    // 根据类型执行替换
    if (type === 'StringLiteral') {
      // 判断上下文环境
      const parent = path.parent;
      // 如果在 JSXAttribute 中，需要用大括号包裹
      if (t.isJSXAttribute(parent)) {
        path.replaceWith(t.jsxExpressionContainer(replacement));
      }
      // 如果在 JSXElement 内容中，也需要用大括号包裹
      else if (t.isJSXElement(path.parentPath.parent) || t.isJSXFragment(path.parentPath.parent)) {
        path.replaceWith(t.jsxExpressionContainer(replacement));
      }
      // 其他情况直接替换
      else {
        path.replaceWith(replacement);
      }
    } else if (type === 'JSXText') {
      // JSX 文本节点替换为表达式容器
      path.replaceWith(t.jsxExpressionContainer(replacement));
    } else if (type === 'TemplateLiteral') {
      // 处理模板字符串中的中文
      const { node } = path;
      const quasi = node.quasis[quasiIndex];
      const quasiValue = quasi.value.raw;
      // 替换模板字符串中的中文
      const newValue = quasiValue.replace(value, `\${lang.$T('${key}').$D('${value}')}`);
      // 更新 quasi 节点
      node.quasis[quasiIndex].value.raw = newValue;
      node.quasis[quasiIndex].value.cooked = newValue;
    }
  });
}

module.exports = async function replaceChinese(chineseData, filePath) {
  try {
    const content = await readFileContent(filePath);
    const parserOptions = getParserOptions(filePath);
    const ast = parser.parse(content, parserOptions);
    const result = parseAst(ast, chineseData);
    if (result.length > 0) {

      replaceAst(result);

      const output = generate(ast, {
        retainLines: true,
        compact: false,
        jsescOption: {
          minimal: true
        }
      });
      writeFileContent(filePath, output.code, '替换文件');

      return filePath;
    } else {
      return '';
    }
  } catch (error) {}
}