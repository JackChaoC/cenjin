const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * 生成假数据 Excel 文件
 * 用于测试会员卡导入功能
 */

// 读取假数据
const dataPath = path.join(__dirname, 'data.json');
const outputPath = path.join(__dirname, 'data.xlsx');

try {
  console.log('📖 读取假数据...');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const jsonData = JSON.parse(rawData);

  console.log(`✅ 成功读取 ${jsonData.length} 条数据`);

  // 创建工作表
  console.log('📊 创建 Excel 工作表...');
  const worksheet = xlsx.utils.json_to_sheet(jsonData);

  // 创建工作簿
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, '会员卡数据');

  // 写入文件
  console.log('💾 生成 Excel 文件...');
  xlsx.writeFile(workbook, outputPath);

  console.log('✨ 成功生成文件:');
  console.log(`   文件路径: ${outputPath}`);
  console.log(`   数据条数: ${jsonData.length} 条`);
  console.log('');
  console.log('📋 数据预览:');
  jsonData.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item['商品名称']} - 卡号: ${item['卡号']}`);
  });
  console.log('');
  console.log('🎉 现在可以在系统中导入这个 Excel 文件了！');
  console.log('');

} catch (error) {
  console.error('❌ 生成失败:', error.message);
  process.exit(1);
}
