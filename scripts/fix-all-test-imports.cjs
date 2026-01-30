/**
 * 批量添加测试工具导入 - 简化版
 *
 * 这个脚本会直接在所有测试文件中添加完整的测试工具导入
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// 获取所有测试文件
const testFiles = globSync('src/**/*.test.ts', { cwd: path.join(__dirname, '..') });

console.log(`找到 ${testFiles.length} 个测试文件`);

let fixedCount = 0;
let skippedCount = 0;

for (const file of testFiles) {
  const filePath = path.join(__dirname, '..', file);
  let content;

  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.log(`无法读取文件: ${file}`);
    skippedCount++;
    continue;
  }

  // 检查是否使用 @testing-library/vue
  if (!content.includes('@testing-library/vue')) {
    skippedCount++;
    continue;
  }

  // 检查是否已经有完整的导入（检查导入语句而不是整个文件内容）
  const hasFireEventImport = /\bimport\s*{[^}]*\bfireEvent\b[^}]*}\s+from\s+['"]@testing-library\/vue['"]/.test(content);
  const hasWaitForImport = /\bimport\s*{[^}]*\bwaitFor\b[^}]*}\s+from\s+['"]@testing-library\/vue['"]/.test(content);
  const hasScreenImport = /\bimport\s*{[^}]*\bscreen\b[^}]*}\s+from\s+['"]@testing-library\/vue['"]/.test(content);

  // 如果所有需要的导入都已存在，跳过
  if (hasFireEventImport && hasWaitForImport && hasScreenImport) {
    skippedCount++;
    continue;
  }

  console.log(`修复文件: ${file}`);

  // 替换现有的 @testing-library/vue 导入
  const importRegex = /import\s*{([^}]+)}\s*from\s*['"]@testing-library\/vue['"]/;
  const match = content.match(importRegex);

  let newContent;

  if (match) {
    // 替换现有导入为完整导入
    const newImport = "import { render, fireEvent, waitFor, screen } from '@testing-library/vue'";
    newContent = content.replace(importRegex, newImport);
  } else {
    // 在文件开头添加导入
    const newImport = "import { render, fireEvent, waitFor, screen } from '@testing-library/vue';\n";
    newContent = newImport + content;
  }

  // 写回文件
  fs.writeFileSync(filePath, newContent, 'utf8');
  fixedCount++;
}

console.log(`\n修复完成!`);
console.log(`修复文件数: ${fixedCount}`);
console.log(`跳过文件数: ${skippedCount}`);
console.log(`总文件数: ${testFiles.length}`);
