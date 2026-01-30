/**
 * 批量添加Anchor组件导入
 *
 * 这个脚本会：
 * 1. 找到所有使用Anchor但没有导入的文件
 * 2. 自动添加Anchor组件导入
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

// 获取所有Vue和TS文件
const files = [
  ...globSync('src/**/*.vue', { cwd: path.join(__dirname, '..') }),
  ...globSync('src/**/*.ts', { cwd: path.join(__dirname, '..') })
];

console.log(`找到 ${files.length} 个文件`);

let fixedCount = 0;
let skippedCount = 0;

for (const file of files) {
  // 排除测试文件和node_modules
  if (file.includes('.test.') || file.includes('node_modules')) {
    skippedCount++;
    continue;
  }

  const filePath = path.join(__dirname, '..', file);
  let content;

  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    skippedCount++;
    continue;
  }

  // 检查是否使用了Anchor但没有导入
  const hasAnchorUsage = /<Anchor|Anchor\s*\(/.test(content);

  if (!hasAnchorUsage) {
    skippedCount++;
    continue;
  }

  // 检查是否已经导入了Anchor
  const hasAnchorImport = content.includes("import") && content.includes("Anchor") && (
    content.includes("from '@/design-system/other/Anchor'") ||
    content.includes('from "@/design-system/other/Anchor"')
  );

  if (hasAnchorImport) {
    skippedCount++;
    continue;
  }

  console.log(`修复文件: ${file}`);

  // 添加Anchor导入
  let newContent = content;

  // 找到最后一个import语句
  const importRegex = /import\s+.*from\s+['"][^'"]+['"];?\s*\n/g;
  const matches = [...content.matchAll(importRegex)];

  if (matches.length > 0) {
    // 在最后一个import后添加
    const lastMatch = matches[matches.length - 1];
    const insertPosition = lastMatch.index + lastMatch[0].length;
    const anchorImport = "import { Anchor } from '@/design-system/other/Anchor';\n";
    newContent = content.slice(0, insertPosition) + anchorImport + content.slice(insertPosition);
  } else {
    // 在文件开头添加
    const anchorImport = "import { Anchor } from '@/design-system/other/Anchor';\n";
    newContent = anchorImport + content;
  }

  // 写回文件
  fs.writeFileSync(filePath, newContent, 'utf8');
  fixedCount++;
}

console.log(`\n修复完成!`);
console.log(`修复文件数: ${fixedCount}`);
console.log(`跳过文件数: ${skippedCount}`);
console.log(`总文件数: ${files.length}`);
