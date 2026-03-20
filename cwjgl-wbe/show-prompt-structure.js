#!/usr/bin/env node
/**
 * 显示系统prompt结构
 * 验证是否按照AIchat.md方案一生成了详细业务数据
 */

// 模拟的业务数据结构
const mockBusinessContext = {
  devices: [
    { 
      id: 'dev_001', 
      name: '大悦城 - 睡眠舱 01',
      location: '北京朝阳区',
      status: 'online',
      usage_today: 12
    },
    { 
      id: 'dev_002', 
      name: '大悦城 - 艾灸仪 02',
      location: '北京朝阳区',
      status: 'online',
      usage_today: 8
    }
  ],
  stores: [
    {
      id: 'store_001',
      name: '大悦城',
      region: '中部大区',
      devices: 5,
      revenue_today: 2500.00
    },
    {
      id: 'store_002', 
      name: '南京新街口店',
      region: '东部大区',
      devices: 3,
      revenue_today: 1800.00
    }
  ],
  timestamp: new Date().toISOString()
};

// 构建System Prompt（按AIchat.md方案一）
async function buildSystemPrompt(sessionId, businessContext) {
  // 格式化设备数据
  let devicesData = '';
  if (businessContext.devices.length > 0) {
    devicesData = `## 📱 设备信息\n`;
    businessContext.devices.forEach((device, idx) => {
      devicesData += `${idx + 1}. ${device.name || device.id}\n`;
      devicesData += `   - 位置: ${device.location || device.store || '未指定'}\n`;
      devicesData += `   - 状态: ${device.status || '在线'}\n`;
      if (device.usage_today) devicesData += `   - 今日使用次数: ${device.usage_today}\n`;
    });
    devicesData += '\n';
  }

  // 格式化门店数据
  let storesData = '';
  if (businessContext.stores.length > 0) {
    storesData = `## 🏪 门店信息\n`;
    businessContext.stores.forEach((store, idx) => {
      storesData += `${idx + 1}. ${store.name || store.id}\n`;
      storesData += `   - 区域: ${store.region || '全国'}\n`;
      storesData += `   - 设备数: ${store.devices || 0}\n`;
      if (store.revenue_today) storesData += `   - 今日营收: ¥${store.revenue_today}\n`;
    });
    storesData += '\n';
  }

  // 构建完整的system prompt（按照AIchat.md方案一）
  const systemPrompt = `你是蔡文姬，一个专业的运营数据分析助手。

【专业能力定位】
1. 分析设备运营数据和性能指标
2. 提供门店业务优化建议  
3. 解读项目运营报告
4. 用户行为分析和趋势预测

【必须遵守的核心规则】
- ✅ 所有答案必须严格基于已提供的真实业务数据回答
- ✅ 禁止脱离数据凭空编造或猜测
- ✅ 如果数据不足以回答问题，明确说明："根据当前可用数据，暂时无法准确回答该问题"
- ✅ 数据答案要加粗显示，关键指标突出
- ✅ 保持专业、客观、实事求是的分析态度

【当前可用的真实业务数据】

📊 数据概览
- 数据更新时间: ${businessContext.timestamp}
- 设备总数: ${businessContext.devices.length} 台
- 门店总数: ${businessContext.stores.length} 家

${devicesData}${storesData}【使用说明】
- 用户提出的任何问题，都必须基于上述数据进行回答
- 遇到数据缺失的问题，直接告知"当前数据不足"
- 重要数据点用"**加粗**"标记以便突出关键信息`;

  return systemPrompt;
}

// 显示prompt结构
(async () => {
  console.log('\n' + '='.repeat(70));
  console.log('📋 AI Chat System - System Prompt Structure');
  console.log('✅ 按照 AIchat.md 方案一实现的业务数据拼接');
  console.log('='.repeat(70) + '\n');

  const prompt = await buildSystemPrompt('session_test', mockBusinessContext);
  
  console.log(prompt);
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 Prompt结构对比 (按AIchat.md要求)\n');
  
  console.log('✅ 包含内容：');
  console.log('   [1] 角色定位和专业能力（2-5行）');
  console.log('   [2] 必须遵守的核心规则（约束条件）');
  console.log('   [3] 当前可用的真实业务数据：');
  console.log('       - 📊 数据概览（设备数、门店数、时间）');
  console.log('       - 📱 设备详细信息（名称、位置、状态、使用情况）');
  console.log('       - 🏪 门店详细信息（名称、区域、设备数、营收）');
  console.log('   [4] 使用说明和强约束');
  
  console.log('\n❌ 防止的问题：');
  console.log('   ✓ 防止幻觉（凭空编造数据）');
  console.log('   ✓ 强制基于数据回答');
  console.log('   ✓ 数据不足时明确说明');
  console.log('   ✓ 重要数据加粗突出');
  
  console.log('\n' + '='.repeat(70));
  console.log('✨ 这是"方案一：后端直接拼接业务数据到Prompt"的完整实现！');
  console.log('='.repeat(70) + '\n');
})();
