<template>
  <div class="health-report">
    <!-- 顶部导航 -->
    <header class="report-header">
      <button class="back-btn" @click="backhome()">
        <el-icon><arrow-left /></el-icon>
      </button>
      <h1 class="report-title">报告详情</h1>
      <button class="share-btn">
        <el-icon><share /></el-icon>
      </button>
    </header>

    <!-- 主要内容区 -->
    <main class="report-content">
      <!-- 诊断结果和基本信息：左右布局，左文字右圆环 -->
      <section class="diagnosis-section">
        <div class="diagnosis-row">
          <div class="diagnosis-left">
            <div class="diagnosis-result">
              <h2>诊断结果: <span class="result-text">脚气，甲沟炎</span></h2>
            </div>
            <div class="basic-info">
              <div class="info-item">
                <span class="info-label">年龄:</span>
                <span class="info-value">30-40</span>
              </div>
              <div class="info-item">
                <span class="info-label">性别:</span>
                <span class="info-value">男</span>
              </div>
              <div class="info-item">
                <span class="info-label">风险指数:</span>
                <span class="info-value risk-level-7">7</span>
              </div>
              <div class="info-item">
                <!-- <span class="info-label" style="font-size: 10px">诊断时间:</span> -->
                <span class="info-value" style="font-size: 13px">2025-07-21 16:60:16</span>
              </div>
            </div>
          </div>

          <div class="diagnosis-right">
            <!-- 健康评分圆环区域 -->
            <div class="health-score">
              <div class="outer-circle"></div>
              <div class="score-circle semi-circle">
                <!-- 关键修改1：删除原进度条渐变配置，进度条颜色绑定计算属性scoreColor -->
                <svg class="score-ring" width="200px" height="200px" viewBox="0 0 200 200">
                  <!-- 底层灰色半圆（不变） -->
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.1)"
                    stroke-width="10"
                    stroke-dasharray="565.48"
                    stroke-dashoffset="0"
                    stroke-linecap="round"
                    transform="rotate(0 100 100)"
                  />
                  <!-- 进度条圆环：stroke绑定scoreColor（动态颜色） -->
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    :stroke="scoreColor"
                    stroke-width="10"
                    :stroke-dasharray="565.48"
                    :stroke-dashoffset="dashOffset"
                    stroke-linecap="round"
                    transform="rotate(-90 100 100)"
                    class="progress-circle"
                  />
                </svg>

                <!-- 分数显示：关键修改2：分数值绑定data中的score（原固定75） -->
                <div class="score-text">
                  <div class="score-bg"></div>
                  <div class="score-value">{{ score }}</div>
                  <!-- 动态显示分数 -->
                  <div class="score-status">亚健康</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 健康分析（无修改） -->
      <section class="analysis-section">
        <h2 class="section-title">健康分析</h2>
        <div class="analysis-tabs">
          <button class="tab-btn active">病原原因</button>
          <button class="tab-btn">具体症状</button>
          <button class="tab-btn">并发症风险</button>
          <button class="tab-btn">日常影响程度</button>
        </div>
        <div class="analysis-content">
          <p>
            足部长期处于潮湿环境，真菌大量滋生引发脚气；指甲修剪过短，导致甲沟受损，细菌侵入后引发甲沟炎。
          </p>
        </div>
      </section>

      <!-- 个性化调理建议（无修改） -->
      <section class="suggestion-section">
        <h2 class="section-title">个性化调理建议</h2>
        <div class="suggestion-tabs">
          <button class="tab-btn active">产品推荐</button>
          <button class="tab-btn">项目推荐</button>
          <button class="tab-btn">饮食调理</button>
          <button class="tab-btn">穴位保健</button>
        </div>
        <div class="products-container">
          <div class="product-card">
            <div class="product-img">
              <img
                src="https://p3-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/5fcf0982ba0c47c1b2ce46e73b0aae5e.png~tplv-a9rns2rl98-resize-jpeg-v1.png?rcl=20251104174748253A47700E396000E5E6&rk3s=8e244e95&rrcfp=8a172a1a&x-expires=1762854469&x-signature=r2E0oYwXJk8GHWeEnesLvbaiHiI%3D"
                alt="抗菌真菌护理液"
              />
            </div>
            <div class="product-info">
              <h3 class="product-name">抗菌真菌护理液</h3>
              <div class="product-price">¥68/瓶 (30ml)</div>
              <div class="product-desc">
                <p><strong>功效:</strong> 快速抑制足部真菌，缓解脱皮、瘙痒、异味</p>
                <p>
                  <strong>使用方法:</strong> 每日1-2次，连续使用2周为一周期，症状消失后再巩固1周
                </p>
              </div>
            </div>
          </div>
          <div class="product-card">
            <div class="product-img">
              <img
                src="https://p11-flow-imagex-download-sign.byteimg.com/tos-cn-i-a9rns2rl98/6ae8322679354804b9222fc66b8f7f27.png~tplv-a9rns2rl98-24:720:720.png?rcl=20251104174748253A47700E396000E5E6&rk3s=8e244e95&rrcfp=8a172a1a&x-expires=1762854468&x-signature=oupJE1Q6lIwZSfXkvcfn15yZE7Q%3D"
                alt="甲沟消炎软膏"
              />
            </div>
            <div class="product-info">
              <h3 class="product-name">甲沟消炎软膏</h3>
              <div class="product-price">¥45/支 (20g)</div>
              <div class="product-desc">
                <p><strong>功效:</strong> 减轻甲沟红肿、疼痛，预防感染加重</p>
                <p><strong>使用方法:</strong> 每日2次涂抹于甲沟部位，连续使用1-2周</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 病症发展解读（无修改） -->
      <section class="development-section">
        <h2 class="section-title">病症发展解读</h2>
        <div class="development-content">
          <div class="development-item">
            <h3 class="development-title">发展程度: 脚气（轻度）、甲沟炎（轻度）。</h3>
          </div>
          <div class="development-item">
            <h3 class="development-title">发展阶段:</h3>
            <p>脚气处于早期（仅脱皮，无皮肤糜烂）；甲沟炎处于早期（仅红肿，无流脓）。</p>
          </div>
          <div class="development-item">
            <h3 class="development-title">影响范围:</h3>
            <p>脚气累及足底部半段及1-3趾间皮肤；甲沟炎累及大脚趾甲沟部位。</p>
          </div>
          <div class="foot-illustration">
            <img src="https://picsum.photos/id/237/300/200" alt="足部图解" />
          </div>
        </div>
      </section>

      <!-- 底部提示（无修改） -->
      <div class="bottom-note">
        <p>
          初步判断为轻度脚气合并早期甲沟炎，建议以上述产品与项目方案调理2周。若调理期间脱皮加重、甲沟流脓或疼痛加剧，需及时前往医院皮肤科或外科就诊。
        </p>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'HealthReportDetail',
  data() {
    return {
      // 原有分数属性（用于进度条动画）
      score: 75,
      // 新增：从 JSON 提取的 data 数据，结构完全一致
      apiData: {
        overall_result: {
          health_score: '75（亚健康）',
          diagnosis: ['脚气', '轻度甲沟炎'],
          cause:
            '足部长期处于潮湿环境，真菌大量滋生引发脚气；指甲修剪过短，导致甲沟受损，细菌侵入后引发甲沟炎',
        },
        health_analysis: {
          symptoms: [
            '足底及趾间脱皮，伴随明显瘙痒',
            '大脚趾甲沟轻微红肿，按压时疼痛感明显',
            '长时间行走后足部酸胀不适',
            '趾间偶有异味散发',
          ],
          risks: {
            risk_index: '7（中度风险）',
            complication_risk:
              '轻度风险，脚气若未及时控制可能发展为足癣，甲沟炎可能加重为化脓性感染',
            daily_impact: '轻微影响，日常短时间行走无明显障碍，长时间运动后不适感加剧',
          },
        },
        disease_detail: {
          disease_stage: '脚气处于早期（仅脱皮，无皮肤糜烂）；甲沟炎处于早期（仅红肿，无流脓）',
          affected_range: '脚气累及足底前半段及1-3趾间皮肤；甲沟炎累及大脚趾甲沟部位',
          severity_level: '脚气（轻度）、甲沟炎（轻度）',
        },
        recommendations: {
          products: [
            {
              name: '抗真菌护理液（XX品牌）',
              image_url: '图片地址', // 保留原占位符，可后续替换为实际链接
              price: '68元/瓶（30ml）',
              efficacy: '快速抑制足部真菌，缓解脱皮、瘙痒、异味',
              use_cycle: '每日1-2次，连续使用2周为一周期，症状消失后再巩固1周',
            },
            {
              name: '甲沟消炎软膏（XX品牌）',
              image_url: '图片地址', // 保留原占位符
              price: '45元/支（20g）',
              efficacy: '减轻甲沟红肿、疼痛，预防感染加重',
              use_cycle: '每日2次涂抹于甲沟部位，连续使用1-2周',
            },
          ],
          projects: [
            {
              name: '足部抗菌舒缓理疗',
              image_url: '图片地址', // 保留原占位符
              service_time: '45分钟/次',
              price: '128元/次',
              efficacy: '深层清洁足部，抑制真菌滋生，缓解足部疲劳与瘙痒',
              suggest_cycle: '每周1次，连续4周为一疗程',
            },
            {
              name: '甲沟专项护理',
              image_url: '图片地址', // 保留原占位符
              service_time: '30分钟/次',
              price: '98元/次',
              efficacy: '清洁甲沟污垢，减轻红肿炎症，修复受损甲沟组织',
              suggest_cycle: '每10天1次，连续3次为一疗程',
            },
          ],
          diet: {
            recommended_food: '薏米、赤小豆、金银花、蒲公英',
            efficacy: '帮助健脾祛湿、抗菌消炎，辅助改善足部炎症问题',
          },
          acupoints: [
            {
              acupoint_name: '足三里',
              position: '膝盖外侧下方凹陷处',
              health_method: '每日按压1-2分钟',
            },
            {
              acupoint_name: '太冲',
              position: '足背第一、二跖骨间凹陷处',
              health_method: '每日按压1-2分钟',
            },
            {
              acupoint_name: '涌泉',
              position: '足底前1/3凹陷处',
              health_method: '每日按压1-2分钟',
            },
          ],
          daily_care: [
            '清洁要求：每日用温水洗脚，擦干后重点擦干趾间水分',
            '鞋袜选择：穿透气棉质袜子，每日更换，鞋子每周暴晒消毒1次',
            '指甲修剪：剪指甲避免过短，防止损伤甲沟',
            '日常注意：瘙痒时勿抓挠，避免皮肤破损加重感染',
          ],
        },
      },
    }
  },
  computed: {
    dashArray() {
      // 全圆周长（不变）
      return 2 * Math.PI * 90
    },
    dashOffset() {
      // 进度偏移量计算（不变）
      return this.dashArray * (1 - this.score / 100)
    },
    // 关键修改3：新增计算属性，按分数区间返回单一颜色
    scoreColor() {
      if (this.score < 30) {
        return '#FF4A4A' // <30%：红色
      } else if (this.score >= 30 && this.score < 60) {
        return '#FCCE36' // 30%-60%：橙色
      } else {
        return '#6AFF41' // 60%-100%：绿色
      }
    },
  },
  methods: {
    backhome() {
      this.$router.push('/zks')
    },
  },
}
</script>

<style lang="scss" scoped>
body {
  margin: 0;
}
/* 样式部分无任何修改，完全保留原逻辑 */
.health-report {
  min-height: 100vh;
  background-color: #f4f6fb;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(180deg, #f0f2fd 0%, #ffffff 100%);
}

.report-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #eff1fc;
  // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;

  .back-btn,
  .share-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    font-size: 25px;
    cursor: pointer;
    color: #000000;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f0f0f0;
    }
  }

  .report-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
}

.report-content {
  padding: 10px;
}

.diagnosis-section {
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 18px;
  // box-shadow: 0 6px 18px rgba(10, 22, 50, 0.06);
  position: relative;
  top: 10px;

  .diagnosis-result {
    margin-bottom: 10px;

    h2 {
      font-size: 18px;
      font-weight: 700;
      margin: 0;

      .result-text {
        color: #e74c3c;
        font-weight: 700;
        margin-left: 6px;
      }
    }
  }

  .diagnosis-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;

    .diagnosis-left {
      flex: 1 1 40%;

      .basic-info {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 12px;
        margin-top: 12px;

        .info-item {
          display: flex;
          align-items: center;
          width: 100%;

          .info-label {
            color: #7f8c8d;
            margin-right: 6px;
            font-size: 14px;
          }

          .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #2c3e50;
          }

          .risk-level-7 {
            color: #d35400;
          }
        }
      }
    }

    .diagnosis-right {
      flex: 0 0 42%;
      display: flex;
      justify-content: center;

      .health-score {
        position: relative;

        .outer-circle {
          position: absolute;
          width: 100%;
          height: 0;
          padding-top: 100%;
          border-radius: 50%;
          background-color: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          z-index: 1;
        }

        .score-circle.semi-circle {
          position: relative;
          width: 200px;
          height: auto;
          z-index: 2;

          .score-ring {
            .progress-circle {
              transition: stroke-dashoffset 1s ease-in-out;
              animation: progressAnimation 1s ease-in-out;
            }

            @keyframes progressAnimation {
              from {
                stroke-dashoffset: 565.48;
              }
              to {
                stroke-dashoffset: var(dashOffset);
              }
            }
          }

          .score-text {
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -30%);
            text-align: center;

            .score-bg {
              position: absolute;
              top: 45%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 100px;
              height: 100px;
              border-radius: 50%;
              background: url(#textBgGradient);
              z-index: -1;
            }

            .score-value {
              font-size: 44px;
              font-weight: 800;
              color: #2c3e50;
              line-height: 1;
              position: relative;
              z-index: 2;
            }

            .score-status {
              font-size: 14px;
              color: #95a5a6;
              margin-top: 6px;
              position: relative;
              z-index: 2;
            }
          }
        }
      }
    }
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #333;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    background-color: #3498db;
    border-radius: 2px;
    margin-right: 8px;
  }
}

.analysis-section .section-title::before {
  background-color: #27ae60;
}

.suggestion-section .section-title::before {
  background-color: #8e44ad;
}

.analysis-section {
  background-color: #f0fff4;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
  box-shadow: 0 4px 10px rgba(20, 40, 10, 0.03);

  .analysis-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    overflow-x: auto;
    padding-bottom: 4px;

    .tab-btn {
      padding: 8px 16px;
      background: none;
      border: none;
      font-size: 14px;
      color: #666;
      cursor: pointer;
      white-space: nowrap;
      position: relative;
      transition: color 0.3s ease;

      &.active {
        color: #27ae60;
        font-weight: 700;
        background: rgba(39, 174, 96, 0.12);
        border-radius: 18px;
        padding: 6px 12px;
      }

      &:not(:last-child) {
        margin-right: 8px;
      }

      &:hover {
        color: #3498db;
      }
    }
  }

  .analysis-content {
    font-size: 15px;
    line-height: 1.6;
    color: #2c3e50;
    padding: 8px 0;
  }
}

.suggestion-section {
  background-color: #fbf5ff;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 16px;
  box-shadow: 0 4px 10px rgba(80, 0, 80, 0.03);

  .suggestion-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
    margin-bottom: 16px;
    overflow-x: auto;
    padding-bottom: 4px;

    .tab-btn {
      padding: 8px 16px;
      background: none;
      border: none;
      font-size: 14px;
      color: #666;
      cursor: pointer;
      white-space: nowrap;
      position: relative;
      transition: color 0.3s ease;

      &.active {
        color: #8e44ad;
        font-weight: 700;
        background: rgba(142, 68, 173, 0.08);
        border-radius: 18px;
        padding: 6px 12px;
      }

      &:not(:last-child) {
        margin-right: 8px;
      }

      &:hover {
        color: #9b59b6;
      }
    }
  }

  .products-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .product-card {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    background: linear-gradient(90deg, #f3fbff 0%, #f7fdff 100%);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(30, 100, 120, 0.06);
    }

    .product-img {
      width: 90px;
      height: 90px;
      border-radius: 8px;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: #fff;
        padding: 6px;
      }
    }

    .product-info {
      flex-grow: 1;

      .product-name {
        font-size: 16px;
        font-weight: 700;
        margin: 0 0 6px 0;
        color: #2c3e50;
      }

      .product-price {
        color: #e74c3c;
        font-weight: 800;
        margin-bottom: 8px;
        font-size: 15px;
      }

      .product-desc {
        font-size: 13px;
        color: #5b6b6b;
        line-height: 1.5;

        p {
          margin: 0 0 4px 0;
        }

        strong {
          color: #2c3e50;
        }
      }
    }
  }
}

.development-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  .development-content {
    .development-item {
      margin-bottom: 16px;

      .development-title {
        font-size: 15px;
        font-weight: 500;
        margin: 0 0 8px 0;
        color: #333;
      }

      p {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
        margin: 0;
      }
    }

    .foot-illustration {
      display: flex;
      justify-content: center;
      margin-top: 16px;

      img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        max-height: 200px;
        object-fit: contain;
      }
    }
  }
}

.bottom-note {
  background-color: #e8f4fd;
  border-left: 4px solid #3498db;
  border-radius: 0 8px 8px 0;
  padding: 16px;
  font-size: 14px;
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 30px;
}

@media (max-width: 375px) {
  .report-content {
    padding: 15px;
  }

  .product-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .basic-info {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}

@media (max-width: 420px) {
  .diagnosis-row {
    flex-direction: column;
    align-items: flex-start;

    .diagnosis-right {
      width: 100%;
      display: flex;
      justify-content: flex-start;

      .score-circle.large {
        width: 120px;
        height: 120px;

        .score-text .score-value {
          font-size: 28px;
        }
      }
    }
  }

  .product-card {
    width: 100%;
    box-sizing: border-box;
  }

  .basic-info .info-item {
    width: 100%;
  }
}
</style>
