#!/usr/bin/env node

/**
 * 批量修复未使用的变量和导入
 * 这个脚本会读取ts6133-errors.txt文件，并尝试自动修复一些简单的情况
 */

const fs = require('fs');
const path = require('path');

// 读取错误文件
const errorsFile = path.join(__dirname, '..', 'ts6133-errors.txt');
const errors = fs.readFileSync(errorsFile, 'utf8').split('\n').filter(Boolean);

console.log(`📝 读取到 ${errors.length} 个TS6133错误\n`);

// 按文件分组
const errorsByFile = {};
for (const error of errors) {
  const match = error.match(/(.+)\(\d+,\d+\): error TS6133: '(.+)' is (.+)/);
  if (match) {
    const [, file, variable, message] = match;
    const lineNum = parseInt(error.match(/\((\d+),\d+\)/)[1]);

    if (!errorsByFile[file]) {
      errorsByFile[file] = [];
    }

    errorsByFile[file].push({ variable, message, lineNum });
  }
}

console.log(`📁 涉及 ${Object.keys(errorsByFile).length} 个文件\n`);

// 简单的修复规则
const fixPatterns = [
  // 未使用的导入
  {
    pattern: /import \{ (.+) \} from 'vue'/,
    action: (line, variable) => {
      const imports = line.match(/import \{ (.+) \} from 'vue'/)[1];
      const importList = imports.split(',').map(i => i.trim());
      const newImports = importList.filter(i => i !== variable && !i.startsWith(`type ${variable}`));

      if (newImports.length === 0) {
        return null; // 删除整行
      }

      return line.replace(/import \{ .+ \} from 'vue'/, `import { ${newImports.join(', ')} } from 'vue'`);
    }
  },
  // 未使用的type导入
  {
    pattern: /import type \{ (.+) \} from 'vue'/,
    action: (line, variable) => {
      const imports = line.match(/import type \{ (.+) \} from 'vue'/)[1];
      const importList = imports.split(',').map(i => i.trim());
      const newImports = importList.filter(i => i !== variable);

      if (newImports.length === 0) {
        return null; // 删除整行
      }

      return line.replace(/import type \{ .+ \} from 'vue'/, `import type { ${newImports.join(', ')} } from 'vue'`);
    }
  }
];

// 尝试修复单个文件
function tryFixFile(filePath, fileErrors) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;

  // 只处理简单的未使用导入
  for (const error of fileErrors) {
    if (error.message.includes("is declared but its value is never read")) {
      const line = lines[error.lineNum - 1];

      // 尝试从导入中移除
      for (const fix of fixPatterns) {
        if (fix.pattern.test(line)) {
          const newLine = fix.action(line, error.variable);
          if (newLine === null) {
            // 删除整行
            lines.splice(error.lineNum - 1, 1);
            modified = true;
            console.log(`  ✓ 删除行 ${error.lineNum}: ${line.trim()}`);
          } else if (newLine !== line) {
            lines[error.lineNum - 1] = newLine;
            modified = true;
            console.log(`  ✓ 修复行 ${error.lineNum}: ${error.variable}`);
          }
          break;
        }
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    return true;
  }

  return false;
}

// 处理前10个文件
let fixedCount = 0;
const maxFiles = 10;

console.log(`🔧 尝试修复前 ${maxFiles} 个文件...\n`);

for (const [filePath, fileErrors] of Object.entries(errorsByFile)) {
  if (fixedCount >= maxFiles) break;

  const fullPath = path.join(__dirname, '..', filePath);
  console.log(`处理: ${filePath}`);

  if (tryFixFile(fullPath, fileErrors)) {
    fixedCount++;
  }
}

console.log(`\n✅ 修复了 ${fixedCount} 个文件`);
console.log('\n⚠️  注意：这只是简单的自动修复，复杂的错误需要手动处理');
