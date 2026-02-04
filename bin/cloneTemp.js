#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 递归复制
function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
// 递归删除
function rmrf(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

const cloneMicroApp = ({gitUrl, branch, projectFolder}) => {
  const cloneCmd = `git clone --branch ${branch} --single-branch ${gitUrl} "${projectFolder}"`;

  try {
    execSync(cloneCmd, { stdio: 'inherit' });
  } catch (err) {
    console.error('仓库克隆失败', err.message);
    process.exit(1);
  }
}

module.exports = async function (info) {
  const { gitUrl, branch = 'micro-app1.0.0' } = info;

  const cwd = process.cwd();

  const LOCAL_PROJECT_DIR = path.resolve(cwd,'temp');

  if (fs.existsSync(LOCAL_PROJECT_DIR)) {
    console.error('模板文件已存在');
    return;
  }

  // 1. 下载模板文件
  cloneMicroApp({gitUrl, branch, projectFolder: LOCAL_PROJECT_DIR});

  // 2. 复制模板文件
  copyDir(LOCAL_PROJECT_DIR, cwd);

  //; 3. 删除模板文件
  rmrf(LOCAL_PROJECT_DIR);
}