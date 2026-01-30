/**
 * 批量修复未使用的导入和变量
 *
 * 这个脚本使用TypeScript编译器API来检测和修复未使用的导入和变量
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 从vue-tsc输出中提取TS6133错误
function getTS6133Errors() {
  try {
    const output = execSync('npx vue-tsc --noEmit 2>&1', {
      encoding: 'utf8',
      cwd: path.resolve(__dirname, '..')
    });

    const lines = output.split('\n');
    const errors = [];

    for (const line of lines) {
      if (line.includes('error TS6133')) {
        const match = line.match(/([^(]+)\((\d+),(\d+)\): error TS6133: (.+)/);
        if (match) {
          const [, file, line, col, message] = match;
          errors.push({
            file: file.trim(),
            line: parseInt(line),
            col: parseInt(col),
            message
          });
        }
      }
    }

    return errors;
  } catch (error) {
    console.error('Failed to run vue-tsc:', error.message);
    return [];
  }
}

// 主函数
async function main() {
  console.log('🔍 检测未使用的变量和导入...\n');

  const errors = getTS6133Errors();
  console.log(`找到 ${errors.length} 个TS6133错误\n`);

  // 按文件分组
  const errorsByFile = {};
  for (const error of errors) {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  }

  console.log(`涉及 ${Object.keys(errorsByFile).length} 个文件\n`);

  // 输出前20个错误示例
  console.log('前20个错误示例:');
  let count = 0;
  for (const [file, fileErrors] of Object.entries(errorsByFile)) {
    for (const error of fileErrors) {
      if (count >= 20) break;
      console.log(`  ${file}:${error.line} - ${error.message}`);
      count++;
    }
    if (count >= 20) break;
  }

  console.log('\n⚠️  注意：这个脚本只是分析工具，实际修复需要手动处理');
  console.log('建议使用IDE的"快速修复"功能或Serena的符号编辑工具\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { getTS6133Errors };
