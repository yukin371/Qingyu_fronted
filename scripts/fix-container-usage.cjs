/**
 * 修复container的使用方式
 *
 * 这个脚本会：
 * 1. 找到所有使用container但没有从render中解构的文件
 * 2. 添加container的解构
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

  // 检查是否使用了container
  const hasContainerUsage = /\bcontainer\b/.test(content);
  if (!hasContainerUsage) {
    skippedCount++;
    continue;
  }

  // 检查是否已经有container的解构
  const hasContainerDestructuring = /\bconst\s*{\s*container\s*}\s*=\s*render/.test(content) ||
                                    /\bconst\s*{\s*[^}]*container[^}]*}\s*=\s*render/.test(content);
  if (hasContainerDestructuring) {
    skippedCount++;
    continue;
  }

  console.log(`修复文件: ${file}`);

  let newContent = content;
  let modified = false;

  // 找到所有的render调用，并添加container解构
  // 情况1: render(Component, { props })
  const renderRegex1 = /(\s+)render\(([\w\s.,{}[\]():'"]+),\s*{\s*props:\s*{([\s\S]*?)}\s*}\s*\)/g;
  newContent = newContent.replace(renderRegex1, (match, indent, component, propsContent) => {
    if (match.includes('container')) return match; // 已经处理过了
    return `${indent}const { container } = render(${component}, {\n${indent}  props: {${propsContent}}\n${indent}})`;
  });

  // 情况2: render(Component, options)
  const renderRegex2 = /(\s+)render\(([\w\s.,{}[\]():'"]+),\s*([\s\S]*?)\)(\s*;?)/g;
  newContent = newContent.replace(renderRegex2, (match, indent, component, options, end) => {
    // 跳过一些不需要修改的情况
    if (options.includes('const') || options.includes('=')) return match;
    if (match.includes('container')) return match;

    return `${indent}const { container } = render(${component}, ${options})${end}`;
  });

  if (newContent !== content) {
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    fixedCount++;
    console.log(`  已修复`);
  } else {
    console.log(`  未修改（可能需要手动处理）`);
  }
}

console.log(`\n修复完成!`);
console.log(`修复文件数: ${fixedCount}`);
console.log(`跳过文件数: ${skippedCount}`);
console.log(`总文件数: ${testFiles.length}`);
