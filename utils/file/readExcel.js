#! /usr/bin/env node

const XLSX = require('xlsx');
/**
 * 读取Excel文件并转换为JSON数据
 * @param {string} filePath Excel文件路径
 * @returns {Object} 以表头为key的JSON数据
 */
function readExcelToJson(filePath) {
  try {
    // 读取Excel文件
    const workbook = XLSX.readFile(filePath);

    // 初始化结果对象
    const result = {};

    // 遍历每个工作表
    workbook.SheetNames.forEach((sheetName) => {
      // 获取工作表数据
      const worksheet = workbook.Sheets[sheetName];

      // 将工作表转换为JSON格式（表头作为key）
      const sheetData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // 保持原始数据结构
        defval: '',  // 空单元格设置为'‘
        blankrows: false // 跳过空行
      });

      if (sheetData.length === 0) {
        result[sheetName] = [];
        return;
      }

      // 获取表头（第一行）
      const headers = sheetData[0];

      // 转换为以表头为key的对象数组
      const rows = [];
      for (let i = 1; i < sheetData.length; i++) {
        const row = {};
        const rowData = sheetData[i];

        headers.forEach((header, index) => {
          // 处理表头为空的情况
          const key = header || `column_${index}`;
          row[key] = (rowData[index] !== undefined && rowData[index] !== null) ? rowData[index] : '';
        });

        rows.push(row);
      }

      // 将当前工作表数据添加到结果中
      result[sheetName] = rows;
    });

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = async function (filePath) {
  const excelData = readExcelToJson(filePath);
  const allSheetData = Object.values(excelData).flatMap((sheetData) => sheetData);

  return allSheetData;
}