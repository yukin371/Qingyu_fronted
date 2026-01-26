#!/usr/bin/env node

/**
 * 批量替换 Element Plus 服务到 Qingyu 服务
 *
 * 使用方法：
 * node scripts/replace-element-plus-services.cjs
 */

const fs = require('fs');
const path = require('path');

// 项目根目录
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// 统计信息
const stats = {
  total: 0,
  modified: 0,
  skipped: 0,
  errors: 0,
  replacements: {
    ElMessage: 0,
    ElMessageBox: 0,
    ElNotification: 0
  }
};

/**
 * 递归查找所有 .vue 和 .ts 文件
 */
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findFiles(filePath, fileList);
    } else if ((file.endsWith('.vue') || file.endsWith('.ts') || file.endsWith('.js')) && file !== 'main.ts') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * 替换单个文件
 */
function replaceFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    let fileReplacements = { ElMessage: 0, ElMessageBox: 0, ElNotification: 0 };

    // 模式1: 替换 ElMessage 导入
    // import { ElMessage } from 'element-plus'
    // → import { message } from '@/design-system/services'
    if (content.includes("import { ElMessage } from 'element-plus'")) {
      content = content.replace(
        /import\s*\{\s*ElMessage\s*\}\s*from\s*['"]element-plus['"]\s*/g,
        "import { message } from '@/design-system/services'\n"
      );
      modified = true;
      fileReplacements.ElMessage++;
    }

    // 模式2: 替换 ElMessageBox 导入
    if (content.includes("import { ElMessageBox } from 'element-plus'")) {
      content = content.replace(
        /import\s*\{\s*ElMessageBox\s*\}\s*from\s*['"]element-plus['"]\s*/g,
        "import { messageBox } from '@/design-system/services'\n"
      );
      modified = true;
      fileReplacements.ElMessageBox++;
    }

    // 模式3: 替换 ElNotification 导入
    if (content.includes("import { ElNotification } from 'element-plus'")) {
      content = content.replace(
        /import\s*\{\s*ElNotification\s*\}\s*from\s*['"]element-plus['"]\s*/g,
        "import { notification } from '@/design-system/services'\n"
      );
      modified = true;
      fileReplacements.ElNotification++;
    }

    // 模式4: 替换混合导入
    // import { ElMessage, ElMessageBox } from 'element-plus'
    // → import { message, messageBox } from '@/design-system/services'
    content = content.replace(
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]element-plus['"]\s*/g,
      (match, imports) => {
        const importList = imports.split(',').map(s => s.trim());
        const newImports = [];

        importList.forEach(imp => {
          if (imp === 'ElMessage') {
            newImports.push('message');
            stats.replacements.ElMessage++;
            fileReplacements.ElMessage++;
          } else if (imp === 'ElMessageBox') {
            newImports.push('messageBox');
            stats.replacements.ElMessageBox++;
            fileReplacements.ElMessageBox++;
          } else if (imp === 'ElNotification') {
            newImports.push('notification');
            stats.replacements.ElNotification++;
            fileReplacements.ElNotification++;
          } else if (imp.startsWith('type ')) {
            // 保留类型导入
            newImports.push(imp);
          } else if (imp.startsWith('FormInstance') || imp.startsWith('FormRules') || imp.startsWith('Upload')) {
            // 保留类型导入
            newImports.push(imp);
          }
        });

        if (newImports.length > 0) {
          modified = true;
          return `import { ${newImports.join(', ')} } from '@/design-system/services'\n`;
        }
        return match; // 保留原样（只有类型导入的情况）
      }
    );

    // 模式5: 替换使用中的 ElMessage
    // ElMessage.success() → message.success()
    if (content.includes('ElMessage.')) {
      content = content.replace(/ElMessage\./g, 'message.');
      modified = true;
    }

    // 模式6: 替换使用中的 ElMessageBox
    // ElMessageBox.confirm() → messageBox.confirm()
    if (content.includes('ElMessageBox.')) {
      content = content.replace(/ElMessageBox\./g, 'messageBox.');
      modified = true;
    }

    // 模式7: 替换使用中的 ElNotification
    // ElNotification() → notification()
    if (content.includes('ElNotification.')) {
      content = content.replace(/ElNotification\./g, 'notification.');
      modified = true;
    }

    // 如果内容有变化，写入文件
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.modified++;
      console.log(`✅ ${path.relative(ROOT_DIR, filePath)}`);
      console.log(`   替换: ElMessage×${fileReplacements.ElMessage} ElMessageBox×${fileReplacements.ElMessageBox} ElNotification×${fileReplacements.ElNotification}`);
    } else {
      stats.skipped++;
    }

  } catch (error) {
    stats.errors++;
    console.error(`❌ ${path.relative(ROOT_DIR, filePath)}: ${error.message}`);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始批量替换 Element Plus 服务到 Qingyu 服务...\n');

  // 查找所有文件
  console.log('📂 扫描文件...');
  const files = findFiles(SRC_DIR);
  console.log(`找到 ${files.length} 个文件\n`);

  // 替换每个文件
  files.forEach(replaceFile);

  // 输出统计
  console.log('\n📊 替换统计：');
  console.log(`   总文件数: ${stats.total}`);
  console.log(`   ✅ 修改: ${stats.modified}`);
  console.log(`   ⏭️  跳过: ${stats.skipped}`);
  console.log(`   ❌ 错误: ${stats.errors}`);
  console.log('\n📦 替换详情：');
  console.log(`   ElMessage → message: ${stats.replacements.ElMessage} 次`);
  console.log(`   ElMessageBox → messageBox: ${stats.replacements.ElMessageBox} 次`);
  console.log(`   ElNotification → notification: ${stats.replacements.ElNotification} 次`);

  console.log('\n⚠️  注意：');
  console.log('   1. 类型导入已保留（FormInstance, FormRules 等）');
  console.log('   2. ElTree 组件需要手动处理');
  console.log('   3. main.ts 需要手动检查');
  console.log('\n✨ 替换完成！请运行以下命令验证：');
  console.log('   npm run build');
}

// 执行
main();
