<template>
  <div class="not-found-page">
    <!-- error area -->
    <div class="error-area py-120" style="margin-top: 120px">
      <div class="container">
        <div class="col-md-6 mx-auto">
          <div class="error-wrapper">
            <div class="error-img">
              <img src="/src/assets/static/error/404.png" alt="错误图标" />
            </div>
            <h2>Opos... Page Not Found!</h2>
            <p>您查找的未找到的页面可能是不存在或已删除。</p>
            <p>The page you looking for not found may be it not exist or removed.</p>
            <a href="/meeting/cwj/purchase" class="theme-btn"
              >Go Back Home <i class="far fa-home"></i
            ></a>
          </div>
        </div>
      </div>
    </div>
    <!-- error area end -->
  </div>
</template>

<script>
export default {
  name: 'NotFound',
}
</script>

<style scoped>
.not-found-page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #0a0e27 0%, #151932 100%);
  min-height: 100vh;
  color: #e0e6ed;
  overflow-x: hidden;
}

.error-area {
  padding: 120px 0;
  margin-top: 0 !important;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

.col-md-6 {
  flex: 0 0 auto;
  width: 50%;
  max-width: 50%;
  margin: 0 auto;
}

.mx-auto {
  margin-left: auto !important;
  margin-right: auto !important;
}

.error-wrapper {
  text-align: center;
  padding: 30px;
  background: rgba(25, 30, 50, 0.9);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.error-img img {
  max-width: 100%;
  height: auto;
}

.error-wrapper h2 {
  font-size: 2rem;
  color: #00ffff;
  margin: 20px 0;
}

.error-wrapper p {
  margin: 10px 0;
  color: #8b92a9;
}

.theme-btn {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #00ffff, #0080ff);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  margin-top: 20px;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.theme-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .col-md-6 {
    width: 100%;
    max-width: 100%;
  }

  .error-area {
    padding: 60px 0;
  }
}
</style>
