/**
 * 删除无效的导入（TS2305错误）
 *
 * 这个脚本会：
 * 1. 查找所有TS2305错误
 * 2. 删除无效的导入
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 运行类型检查并提取TS2305错误
console.log('正在提取TS2305错误...');

let errors;
try {
  const output = execSync('npx vue-tsc --noEmit 2>&1', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  errors = output.split('\n')
    .filter(line => line.includes('error TS2305'))
    .map(line => {
      const match = line.match(/^(.+)\((\d+),(\d+)\): error TS2305: (.+)$/);
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
  const output = e.stdout || e.stderr || '';
  errors = output.split('\n')
    .filter(line => line.includes('error TS2305'))
    .map(line => {
      const match = line.match(/^(.+)\((\d+),(\d+)\): error TS2305: (.+)$/);
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

console.log(`找到 ${errors.length} 个TS2305错误`);

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

    // 提取无效的导入成员名称和模块路径
    // 例如: Module '"@/utils/format"' has no exported member 'formatRelativeTime'.
    const match = message.match(/Module '(.+)' has no exported member '(.+)'\./);
    if (!match) continue;

    const modulePath = match[1];
    const memberName = match[2];
    console.log(`  删除无效导入: ${memberName} from ${modulePath}`);

    // 删除导入语句
    // 情况1: import { Member } from 'module'
    const importRegex1 = new RegExp(`import\\s*{\\s*${memberName}\\s*}\\s*from\\s*['"]${modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*;?\\s*\\n`, 'g');
    let match1 = newContent.match(importRegex1);
    if (match1) {
      for (const m of match1) {
        newContent = newContent.replace(m, '');
        modified = true;
      }
      continue;
    }

    // 情况2: import { Member, Other } from 'module'
    const importRegex2 = new RegExp(`import\\s*{([^}]*)}\\s*from\\s*['"]${modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    match1 = newContent.match(importRegex2);
    if (match1) {
      for (const m of match1) {
        // 提取导入列表
        const innerMatch = m.match(/import\s*{([^}]+)}/);
        if (innerMatch) {
          const imports = innerMatch[1]
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== memberName);

          if (imports.length > 0) {
            const newImport = `import { ${imports.join(', ')} } from '${modulePath}'`;
            newContent = newContent.replace(m, newImport);
          } else {
            // 如果没有其他导入了，删除整行
            newContent = newContent.replace(m, '');
          }
          modified = true;
        }
      }
      continue;
    }

    // 情况3: import type { Member } from 'module'
    const typeImportRegex = new RegExp(`import\\s+type\\s*{\\s*${memberName}\\s*}\\s*from\\s*['"]${modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*;?\\s*\\n`, 'g');
    match1 = newContent.match(typeImportRegex);
    if (match1) {
      for (const m of match1) {
        newContent = newContent.replace(m, '');
        modified = true;
      }
      continue;
    }

    // 情况4: import type { Member, Other } from 'module'
    const typeImportRegex2 = new RegExp(`import\\s+type\\s*{([^}]+)}\\s*from\\s*['"]${modulePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
    match1 = newContent.match(typeImportRegex2);
    if (match1) {
      for (const m of match1) {
        // 提取导入列表
        const innerMatch = m.match(/import\s+type\s*{([^}]+)}/);
        if (innerMatch) {
          const imports = innerMatch[1]
            .split(',')
            .map(s => s.trim())
            .filter(s => s !== memberName);

          if (imports.length > 0) {
            const newImport = `import type { ${imports.join(', ')} } from '${modulePath}'`;
            newContent = newContent.replace(m, newImport);
          } else {
            // 如果没有其他导入了，删除整行
            newContent = newContent.replace(m, '');
          }
          modified = true;
        }
      }
      continue;
    }
  }

  if (modified) {
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
