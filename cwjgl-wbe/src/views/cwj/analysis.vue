<template>
  <div class="analysis-body">
    <div class="analysis-container">
      <!-- 报告头部 -->
      <header class="report-header">
        <div class="header-main">
          <h1>蔡文姬机器人智能理疗服务分析报告</h1>
          <div class="report-meta">
            <span class="meta-item">报告周期：{{ dateRange }}</span>
            <span class="meta-item">生成时间：{{ generateDate }}</span>
            <span class="meta-item">数据范围：{{ dataScope }}</span>
          </div>
        </div>
        <div class="header-actions no-print">
          <button class="btn-export" @click="exportReport">一键导出 PDF</button>
          <button class="btn-back" @click="$router.back()">返回</button>
        </div>
      </header>

      <!-- 一、 核心数据总览 -->
      <section class="analysis-section">
        <h2 class="section-title">一、 核心数据总览</h2>
        <div class="kpi-grid">
          <div class="kpi-item">
            <div class="kpi-label">理疗服务总次数</div>
            <div class="kpi-value">1,245 <small>次</small></div>
            <div class="kpi-desc">环比上周期增长 <span class="trend-up">12.4% ↑</span></div>
          </div>
          <div class="kpi-item">
            <div class="kpi-label">累计服务时长</div>
            <div class="kpi-value">871.5 <small>小时</small></div>
            <div class="kpi-desc">单次平均服务时长 42 分钟</div>
          </div>
          <div class="kpi-item">
            <div class="kpi-label">活跃设备数</div>
            <div class="kpi-value">150 <small>台</small></div>
            <div class="kpi-desc">平均设备日周转率 8.3 次/台</div>
          </div>
        </div>
      </section>

      <!-- 二、 项目与服务质量分析 -->
      <section class="analysis-section">
        <h2 class="section-title">二、 项目与服务质量分析</h2>
        <div class="content-row">
          <div class="project-ranking">
            <h3>项目偏好排行</h3>
            <ul class="ranking-list">
              <li v-for="(item, index) in rankings" :key="index">
                <span class="rank-num">{{ index + 1 }}</span>
                <span class="rank-name">{{ item.name }}</span>
                <div class="rank-bar-wrap">
                  <div class="rank-bar" :style="{ width: item.percent + '%' }"></div>
                </div>
                <span class="rank-percent">{{ item.percent }}%</span>
              </li>
            </ul>
          </div>
          <div class="parameter-insight">
            <h3>理疗参数洞察 (睡眠调理)</h3>
            <p class="insight-text">
              大数据表明，用户平均选用强度(intensity)为 <strong>65</strong>，速度(speed)为 <strong>6</strong>。
              设备通常在 <strong>8分钟</strong> 内攀升至峰值温度 <strong>40.3℃</strong>，并在黄金理疗区间平稳保持。
            </p>
            <div ref="tempChart" class="temp-chart-box"></div>
          </div>
        </div>
      </section>

      <!-- 三、 时间与空间分布 -->
      <section class="analysis-section">
        <h2 class="section-title">三、 时间与空间分布</h2>
        <div class="info-blocks">
          <div class="info-block">
            <h3>时间分布特征</h3>
            <p>每日设备使用高峰集中在 <strong>19:00 - 22:00</strong> 晚间时段，占全天服务总量的 <strong>55%</strong>。</p>
          </div>
          <div class="info-block">
            <h3>区域表现对比</h3>
            <div class="region-stats">
              <div class="region-card star">
                <span class="tag">明星区域</span>
                <h4>华南大区</h4>
                <p>深圳门店设备满载率达 <strong>92%</strong></p>
              </div>
              <div class="region-card potential">
                <span class="tag">潜力区域</span>
                <h4>华东大区</h4>
                <p>晚间时段仍有 <strong>30%</strong> 空置率</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 四、 设备运行与物流状态 -->
      <section class="analysis-section">
        <h2 class="section-title">四、 设备运行与物流状态</h2>
        <div class="status-summary">
          <div class="status-card">
            <div class="val">10 / 5</div>
            <div class="lab">本周新增 / 运输中</div>
          </div>
          <div class="status-card">
            <div class="val">1.2%</div>
            <div class="lab">设备故障/返修率</div>
          </div>
          <div class="status-card">
            <div class="val">99.5%</div>
            <div class="lab">热力图采集成功率</div>
          </div>
        </div>
        <p class="status-desc">服务热力图谱均显示理疗部位受热均匀，无异常高温灼伤风险。</p>
      </section>

      <!-- 五、 数据洞察与运营建议 -->
      <section class="analysis-section suggestion-section">
        <h2 class="section-title">五、 数据洞察与运营建议 (智能生成)</h2>
        <div class="suggestion-content">
          <div class="highlight-box">
            <h4>业务亮点</h4>
            <p>“睡眠调理”项目需求旺盛，且温度控制矩阵（39℃-40℃）获得了极佳的系统闭环验证，证明当前设备的导热性能处于最佳状态。</p>
          </div>
          <div class="advice-box">
            <h4>改进与调度建议</h4>
            <ul>
              <li><strong>资源调度：</strong> 晚间 20:00 华南区频繁出现设备排队现象，建议将仓库中或周边城市闲置的设备紧急调拨至深圳地区。</li>
              <li><strong>门店营销：</strong> 针对 14:00-16:00 闲置期，建议推出“午间肩颈极速放松”限时体验活动，以盘活产能。</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'AnalysisPage',
  data() {
    return {
      dateRange: '2026-03-01 至 2026-03-07（周报）',
      generateDate: '2026-03-08',
      dataScope: '全国门店',
      rankings: [
        { name: '睡眠调理（腹部穴位）', percent: 45 },
        { name: '肩颈深度放松', percent: 30 },
        { name: '腰背温灸理疗', percent: 15 },
        { name: '其他项目', percent: 10 }
      ],
      tempChart: null
    }
  },
  mounted() {
    this.initTempChart()
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize)
    this.tempChart?.dispose()
  },
  methods: {
    initTempChart() {
      this.tempChart = echarts.init(this.$refs.tempChart)
      this.tempChart.setOption({
        title: { text: '“睡眠调理”温度聚合曲线', left: 'center', textStyle: { fontSize: 14, color: '#333' } },
        tooltip: { trigger: 'axis', formatter: '{b}min: {c}℃' },
        grid: { left: '10%', right: '10%', bottom: '15%', top: '20%' },
        xAxis: { type: 'category', data: Array.from({length: 42}, (_, i) => i + 1), name: '时间(min)' },
        yAxis: { type: 'value', min: 25, max: 45, name: '温度(℃)' },
        visualMap: {
          show: false,
          pieces: [
            { gt: 0, lte: 39, color: '#ffde33' },
            { gt: 39, lte: 41, color: '#ff9933' },
            { gt: 41, color: '#cc0033' }
          ]
        },
        series: [{
          name: '平均温度',
          type: 'line',
          smooth: true,
          data: this.generateTempData(),
          markArea: {
            silent: true,
            itemStyle: { color: 'rgba(0, 255, 0, 0.1)' },
            data: [[{ yAxis: 39.7 }, { yAxis: 40.0 }]]
          }
        }]
      })
    },
    generateTempData() {
      const data = []
      let temp = 26
      for (let i = 0; i < 42; i++) {
        if (i < 8) {
          temp += (40.3 - 26) / 8
        } else {
          temp = 39.7 + Math.random() * 0.3
        }
        data.push(temp.toFixed(1))
      }
      return data
    },
    exportReport() {
      window.print()
    },
    handleResize() {
      this.tempChart?.resize()
    }
  }
}
</script>

<style scoped>
.analysis-body {
  background: #f4f7f9;
  min-height: 100vh;
  padding: 40px 20px;
  color: #333;
}

.analysis-container {
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  padding: 50px;
  box-shadow: 0 0 20px rgba(0,0,0,0.1);
  border-radius: 4px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #333;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.header-main h1 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #1a1a1a;
}

.report-meta {
  font-size: 14px;
  color: #666;
}

.meta-item {
  margin-right: 20px;
}

.btn-export, .btn-back {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  margin-left: 10px;
  font-weight: bold;
}

.btn-export { background: #007bff; color: #fff; }
.btn-back { background: #6c757d; color: #fff; }

.section-title {
  font-size: 18px;
  border-left: 4px solid #007bff;
  padding-left: 10px;
  margin: 30px 0 20px;
  color: #1a1a1a;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.kpi-item {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.kpi-label { font-size: 14px; color: #666; margin-bottom: 8px; }
.kpi-value { font-size: 24px; font-weight: bold; color: #007bff; }
.kpi-desc { font-size: 12px; color: #999; margin-top: 8px; }
.trend-up { color: #28a745; font-weight: bold; }

.content-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 40px;
}

.ranking-list { list-style: none; padding: 0; }
.ranking-list li {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
}

.rank-num { width: 24px; font-weight: bold; color: #007bff; }
.rank-name { width: 140px; }
.rank-bar-wrap { flex: 1; height: 12px; background: #eee; border-radius: 6px; margin: 0 10px; overflow: hidden; }
.rank-bar { height: 100%; background: linear-gradient(90deg, #007bff, #00c6ff); border-radius: 6px; }
.rank-percent { width: 40px; font-weight: bold; }

.insight-text { font-size: 14px; line-height: 1.6; color: #444; margin-bottom: 15px; }
.temp-chart-box { height: 250px; border: 1px solid #eee; border-radius: 4px; }

.info-blocks { display: grid; grid-template-columns: 1fr 1.5fr; gap: 30px; }
.info-block h3 { font-size: 16px; margin-bottom: 10px; }
.info-block p { font-size: 14px; color: #555; }

.region-stats { display: flex; gap: 15px; margin-top: 10px; }
.region-card { flex: 1; padding: 15px; border-radius: 6px; position: relative; }
.region-card.star { background: #e7f3ff; border: 1px solid #b8daff; }
.region-card.potential { background: #fff3cd; border: 1px solid #ffeeba; }
.tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; position: absolute; top: -10px; left: 10px; }
.star .tag { background: #007bff; color: #fff; }
.potential .tag { background: #856404; color: #fff; }
.region-card h4 { font-size: 15px; margin-bottom: 5px; }
.region-card p { font-size: 12px; margin: 0; }

.status-summary { display: flex; gap: 20px; margin-bottom: 15px; }
.status-card { flex: 1; border: 1px solid #eee; padding: 15px; border-radius: 6px; text-align: center; }
.status-card .val { font-size: 18px; font-weight: bold; color: #333; }
.status-card .lab { font-size: 12px; color: #777; }
.status-desc { font-size: 13px; color: #888; font-style: italic; }

.suggestion-content { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.highlight-box, .advice-box { background: #fdfdfd; padding: 20px; border: 1px dashed #ccc; border-radius: 8px; }
.highlight-box h4, .advice-box h4 { font-size: 15px; color: #d9534f; margin-bottom: 10px; }
.advice-box ul { padding-left: 20px; font-size: 13px; line-height: 1.8; }

@media print {
  .no-print { display: none; }
  .analysis-body { padding: 0; background: #fff; }
  .analysis-container { box-shadow: none; width: 100%; max-width: none; padding: 20px; }
}
</style>
