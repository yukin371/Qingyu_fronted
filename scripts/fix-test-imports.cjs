/**
 * 批量添加测试工具导入
 *
 * 这个脚本会：
 * 1. 找到所有使用 @testing-library/vue 的测试文件
 * 2. 检查是否缺少 fireEvent、waitFor 等导入
 * 3. 自动添加缺失的导入
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// 需要添加的测试工具导入
const requiredImports = {
  fireEvent: "fireEvent",
  waitFor: "waitFor",
  screen: "screen"
};

// 获取所有测试文件
const testFiles = globSync('src/**/*.test.ts', { cwd: path.join(__dirname, '..') });

console.log(`找到 ${testFiles.length} 个测试文件`);

let fixedCount = 0;
let skippedCount = 0;

for (const file of testFiles) {
  const filePath = path.join(__dirname, '..', file);
  const content = fs.readFileSync(filePath, 'utf8');

  // 检查是否使用 @testing-library/vue
  if (!content.includes('@testing-library/vue')) {
    skippedCount++;
    continue;
  }

  // 检查文件中使用了哪些测试工具（使用更精确的正则表达式）
  const missingImports = [];
  const hasFireEvent = /\bfireEvent\s*\(/.test(content);
  const hasWaitFor = /\bwaitFor\s*\(/.test(content);
  const hasScreen = /\bscreen\s*\./.test(content);
  const hasRender = /\brender\s*\(/.test(content);

  // 检查导入情况（使用更精确的正则表达式）
  const hasFireEventImport = /\bimport\s*{[^}]*\bfireEvent\b[^}]*}\s+from\s+['"]@testing-library\/vue['"]/.test(content);
  const hasWaitForImport = /\bimport\s*{[^}]*\bwaitFor\b[^}]*}\s+from\s+['"]@testing-library\/vue['"]/.test(content);
  const hasScreenImport = /\bimport\s*{[^}]*\bscreen\b[^}]*}\s+from\s+['"]@testing-library\/vue['"]/.test(content);

  // 收集缺失的导入
  if (hasFireEvent && !hasFireEventImport) {
    missingImports.push('fireEvent');
  }
  if (hasWaitFor && !hasWaitForImport) {
    missingImports.push('waitFor');
  }
  if (hasScreen && !hasScreenImport) {
    missingImports.push('screen');
  }

  if (missingImports.length === 0) {
    skippedCount++;
    continue;
  }

  console.log(`修复文件: ${file} (缺失: ${missingImports.join(', ')})`);

  // 修改导入语句
  let newContent = content;

  // 找到现有的 @testing-library/vue 导入语句
  const importRegex = /import\s*{([^}]+)}\s*from\s*['"]@testing-library\/vue['"]/;
  const match = content.match(importRegex);

  if (match) {
    // 在现有导入中添加缺失的导入
    const existingImports = match[1]
      .split(',')
      .map(s => s.trim())
      .filter(s => s);

    // 合并导入
    const allImports = [...new Set([...existingImports, ...missingImports])];

    // 构建新的导入语句
    const newImport = `import { ${allImports.join(', ')} } from '@testing-library/vue'`;
    newContent = content.replace(importRegex, newImport);
  } else if (hasRender && content.includes("from '@testing-library/vue'")) {
    // 尝试处理可能的单行导入
    const singleLineRegex = /import\s+(\w+)\s+from\s*['"]@testing-library\/vue['"]/;
    const singleMatch = content.match(singleLineRegex);

    if (singleMatch) {
      // 将单行导入改为多行导入
      const allImports = [singleMatch[1], ...missingImports];
      const newImport = `import { ${allImports.join(', ')} } from '@testing-library/vue'`;
      newContent = content.replace(singleLineRegex, newImport);
    }
  } else {
    // 没有找到导入语句，添加新的导入
    const importsToAdd = [];
    if (hasRender) importsToAdd.push('render');
    importsToAdd.push(...missingImports);

    const newImport = `import { ${importsToAdd.join(', ')} } from '@testing-library/vue';\n`;
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
