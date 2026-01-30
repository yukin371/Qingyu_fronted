/**
 * 删除未使用的类型导入
 *
 * 这个脚本会：
 * 1. 查找所有未使用的类型导入
 * 2. 自动删除这些导入
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 运行类型检查并提取TS6196错误
console.log('正在提取TS6196错误...');

let errors;
try {
  const output = execSync('npx vue-tsc --noEmit 2>&1', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  errors = output.split('\n')
    .filter(line => line.includes('error TS6196'))
    .map(line => {
      const match = line.match(/^(.+)\((\d+),(\d+)\): error TS6196: (.+)$/);
      if (match) {
        return {
          file: match[1],
          line: parseInt(match[2]),
          col: parseInt(match[3]),
          message: match[4]
        };
      }
      return null;
    })
    .filter(e => e !== null);
} catch (e) {
  // vue-tsc 会返回非0退出码，但输出仍然有效
  const output = e.stdout || e.stderr || '';
  errors = output.split('\n')
    .filter(line => line.includes('error TS6196'))
    .map(line => {
      const match = line.match(/^(.+)\((\d+),(\d+)\): error TS6196: (.+)$/);
      if (match) {
        return {
          file: match[1],
          line: parseInt(match[2]),
          col: parseInt(match[3]),
          message: match[4]
        };
      }
      return null;
    })
    .filter(e => e !== null);
}

console.log(`找到 ${errors.length} 个TS6196错误`);

// 按文件分组错误
const errorsByFile = {};
for (const error of errors) {
  if (!errorsByFile[error.file]) {
    errorsByFile[error.file] = [];
  }
  errorsByFile[error.file].push(error);
}

let fixedCount = 0;

for (const [file, fileErrors] of Object.entries(errorsByFile)) {
  const filePath = path.join(__dirname, '..', file);

  console.log(`\n处理文件: ${file}`);
  console.log(`  错误数: ${fileErrors.length}`);

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.log(`  无法读取文件，跳过`);
    continue;
  }

  let newContent = content;
  let modified = false;

  for (const error of fileErrors) {
    const message = error.message;

    // 提取未使用的标识符名称
    const match = message.match(/'(.+)' is declared but never used/);
    if (!match) continue;

    const identifier = match[1];
    console.log(`  删除未使用的标识符: ${identifier}`);

    // 尝试删除导入语句
    // 情况1: type import { Identifier } from '...'
    const typeImportRegex = new RegExp(`type import\\s*{\\s*${identifier}\\s*[,}]}`, 'g');
    if (typeImportRegex.test(newContent)) {
      newContent = newContent.replace(typeImportRegex, (match) => {
        // 如果是唯一导入，删除整行
        if (match.trim() === `type import { ${identifier} }` || match.trim() === `type import{${identifier}}`) {
          return '';
        }
        // 如果有多个导入，只删除这一个
        return match.replace(new RegExp(`\\s*${identifier}\\s*,?`), '').replace(/{\s*,/, '{').replace(/,\s*}/, '}');
      });
      modified = true;
      continue;
    }

    // 情况2: import { Identifier } from '...'
    const importRegex = new RegExp(`import\\s*{[^}]*\\b${identifier}\\b[^}]*}\\s*from\\s*['"][^'"]+['"]`, 'g');
    const importMatch = newContent.match(importRegex);
    if (importMatch) {
      for (const fullImport of importMatch) {
        // 检查是否是类型导入
        const isTypeImport = fullImport.includes('type import') || fullImport.includes('import type');

        if (isTypeImport) {
          // 处理类型导入
          const newImport = fullImport
            .replace(new RegExp(`,?\\s*${identifier}\\s*,?`), '')
            .replace(/{\s*,/, '{')
            .replace(/,\s*}/, '}')
            .replace(/import\s*{\s*}\s*from/, 'import {} from'); // 处理空导入

          if (newImport !== fullImport) {
            newContent = newContent.replace(fullImport, newImport);
            modified = true;
          }
        } else {
          // 普通导入，可能需要保留
          console.log(`    跳过普通导入: ${identifier}`);
        }
      }
      continue;
    }

    // 情况3: import type { Identifier } from '...'
    const importTypeRegex = new RegExp(`import\\s+type\\s*{[^}]*\\b${identifier}\\b[^}]*}\\s*from\\s*['"][^'"]+['"]`, 'g');
    const importTypeMatch = newContent.match(importTypeRegex);
    if (importTypeMatch) {
      for (const fullImport of importTypeMatch) {
        const newImport = fullImport
          .replace(new RegExp(`,?\\s*${identifier}\\s*,?`), '')
          .replace(/{\s*,/, '{')
          .replace(/,\s*}/, '}')
          .replace(/import\s+type\s*{\s*}\s*from/, 'import type {} from'); // 处理空导入

        if (newImport !== fullImport) {
          newContent = newContent.replace(fullImport, newImport);
          modified = true;
        }
      }
      continue;
    }

    // 情况4: 变量声明 const identifier: Type = value
    const constRegex = new RegExp(`const\\s+${identifier}\\s*:\\s*[^=\\n]+\\s*=`, 'g');
    if (constRegex.test(newContent)) {
      newContent = newContent.replace(constRegex, (match) => {
        // 删除整行
        return match.replace(/const\s+[\w]+\s*:\s*[^=\n]+=\s*/, '');
      });
      modified = true;
      continue;
    }
  }

  if (modified) {
    // 清理空导入语句
    newContent = newContent.replace(/import\s*{\s*}\s*from\s+['"][^'"]+['"];\s*\n/g, '');
    newContent = newContent.replace(/import\s+type\s*{\s*}\s*from\s+['"][^'"]+['"];\s*\n/g, '');

    // 写回文件
    fs.writeFileSync(filePath, newContent, 'utf8');
    fixedCount++;
    console.log(`  已修复`);
  } else {
    console.log(`  未修改`);
  }
}

console.log(`\n修复完成!`);
console.log(`修复文件数: ${fixedCount}`);
