# 命令行工具 hst-cli-tool

**工具名称：国际化助手**

## 简介

`hst-cli-tool `是一个专为前端国际化(i18n)工作流程设计的命令行工具，旨在 `简化`和 `自动化`多语言项目的翻译管理过程。它提供了一系列命令行指令功能，帮助开发者高效处理代码中的多语言文本。

## 主要功能

### **1. 中文文本扫描与翻译**

- 全局扫描项目中的中文文本
- 支持自动翻译成多种目标语言(如 `中文繁体`、`英文` 等)
- 集成翻译引擎

### **2. 智能代码转换**

- 自动将中文文本替换为国际化函数调用(如 `lang.$T().$D()` 等)
- 保留原始代码结构和格式
- 目前只支持 React 前端框架的国际化方案

### **3. Excel 与 JSON 同步**

- 在 Excel 翻译表格和项目 JSON 语言文件之间双向同步
- 自动对比差异并更新翻译
- 支持增量更新

## 工作流程

<img src="./img/i18n_worker.png" />

## 目标用户

- 前端开发人员
- 需要管理多语言项目的团队
- 从单语言项目迁移到国际化项目的团队

## 安装指南

**安装**

```
npm install hst-cli-tool -g
```

**查看命令**

```
hst-cli-tool
```

<img src="./img/cli_1.png" />

## 示例

### 1. 中文文本扫描与翻译

```
npx hst-cli-tool i18n_s common.test
```

<img src="./img/cli_2.png" />

### 2. 智能代码转换

```
npx hst-cli-tool i18n_r
```

<img src="./img/cli_3.png" />

### 3. Excel 与 JSON 同步

```
npx hst-cli-tool excel_to_json lang.xlsx
```

<img src="./img/cli_4.png" />
