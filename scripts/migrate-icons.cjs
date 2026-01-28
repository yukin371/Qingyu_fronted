#!/usr/bin/env node

/**
 * 批量迁移 Element Plus 图标到 QyIcon
 *
 * 使用方法：
 * node scripts/migrate-icons.js
 */

const fs = require('fs');
const path = require('path');

// 项目根目录
const ROOT_DIR = path.join(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// 统计信息
const stats = {
  total: 0,
  success: 0,
  skipped: 0,
  errors: 0,
  files: []
};

/**
 * 递归查找所有 .vue 文件
 */
function findVueFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findVueFiles(filePath, fileList);
    } else if (file.endsWith('.vue')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * 检查文件是否使用 Element Plus 图标
 */
function usesElementPlusIcons(content) {
  return content.includes("@element-plus/icons-vue");
}

/**
 * 迁移单个文件
 */
function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // 检查是否需要迁移
    if (!usesElementPlusIcons(content)) {
      stats.skipped++;
      return;
    }

    stats.total++;

    // 模式1: 替换导入语句
    // import { Search, Plus } from '@element-plus/icons-vue'
    // → import { QyIcon } from '@/design-system/components'
    content = content.replace(
      /import\s*\{[^}]*\}\s*from\s*['"]@element-plus\/icons-vue['"]\s*/g,
      "import { QyIcon } from '@/design-system/components'\n"
    );

    // 模式2: 替换 el-icon 标签
    // <el-icon><Search :size="16" /></el-icon>
    // → <QyIcon name="Search" :size="16" />
    content = content.replace(
      /<el-icon><\s*(\w+)(\s+[^>]*)?\s*\/><\/el-icon>/g,
      '<QyIcon name="$1"$2 />'
    );
    content = content.replace(
      /<el-icon>\s*<(\w+)(\s+[^>]*)?\s*\/>\s*<\/el-icon>/g,
      '<QyIcon name="$1"$2 />'
    );

    // 模式3: 替换直接使用的图标组件
    // <Search :size="16" />
    // → <QyIcon name="Search" :size="16" />
    // 需要匹配常见的图标组件名
    const commonIcons = [
      'Search', 'Plus', 'Minus', 'Close', 'Edit', 'Delete', 'Check',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'User', 'UserFilled', 'Lock', 'Unlock',
      'Star', 'StarFilled', 'View', 'Picture',
      'Document', 'Folder', 'FolderOpened', 'Files',
      'Refresh', 'Setting', 'Filter',
      'Bell', 'Clock', 'Timer', 'Calendar',
      'Upload', 'Download', 'Share', 'Copy',
      'Trophy', 'Medal', 'Crown', 'Present',
      'ChatDotRound', 'ChatLineSquare',
      'Grid', 'List', 'More', 'MoreFilled',
      'SuccessFilled', 'WarningFilled', 'InfoFilled', 'CircleCheck',
      'CircleClose', 'CircleCheckFilled', 'CircleCloseFilled'
    ];

    commonIcons.forEach(iconName => {
      // 匹配 <IconName ... />
      const regex = new RegExp(`<${iconName}(\\s+[^>]*)?\\s*/>`, 'g');
      content = content.replace(regex, `<QyIcon name="${iconName}"$1 />`);
    });

    // 模式4: 替换动态图标（简化版）
    // 这个模式比较复杂，暂时跳过，后续手动处理
    // <component :is="Icons[name]" />
    // → <QyIcon :name="name" />

    // 如果内容有变化，写入文件
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.success++;
      stats.files.push({
        file: path.relative(ROOT_DIR, filePath),
        status: 'success'
      });
      console.log(`✅ ${path.relative(ROOT_DIR, filePath)}`);
    } else {
      stats.skipped++;
    }

  } catch (error) {
    stats.errors++;
    stats.files.push({
      file: path.relative(ROOT_DIR, filePath),
      status: 'error',
      error: error.message
    });
    console.error(`❌ ${path.relative(ROOT_DIR, filePath)}: ${error.message}`);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始批量迁移 Element Plus 图标到 QyIcon...\n');

  // 查找所有 .vue 文件
  console.log('📂 扫描 .vue 文件...');
  const vueFiles = findVueFiles(SRC_DIR);
  console.log(`找到 ${vueFiles.length} 个 .vue 文件\n`);

  // 迁移每个文件
  vueFiles.forEach(migrateFile);

  // 输出统计
  console.log('\n📊 迁移统计：');
  console.log(`   总文件数: ${stats.total}`);
  console.log(`   ✅ 成功: ${stats.success}`);
  console.log(`   ⏭️  跳过: ${stats.skipped}`);
  console.log(`   ❌ 错误: ${stats.errors}`);

  // 保存详细报告
  const reportPath = path.join(ROOT_DIR, 'icon-migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
  console.log(`\n📄 详细报告已保存到: ${path.relative(ROOT_DIR, reportPath)}`);

  if (stats.success > 0) {
    console.log('\n✨ 迁移完成！请运行以下命令验证：');
    console.log('   npm run build');
  }
}

// 执行
main();
