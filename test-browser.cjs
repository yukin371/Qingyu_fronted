const { chromium } = require('@playwright/test');

(async () => {
  console.log('🧪 Playwright 浏览器测试\n');
  
  try {
    const browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ 浏览器启动成功');
    
    const page = await browser.newPage();
    console.log('✅ 页面创建成功');
    
    await page.goto('https://www.example.com');
    console.log('✅ 访问 example.com 成功');
    
    const title = await page.title();
    console.log('✅ 页面标题:', title);
    
    await browser.close();
    console.log('\n🎉 Chromium 浏览器工作正常！\n');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
})();
