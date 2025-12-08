<template>
  <div class="page">
    <h1 class="page-title">
      fcurd Examples
    </h1>

    <section class="demo-section">
      <h2 class="demo-title">
        fcurd AutoCrud Naive 示例
      </h2>
      <NaiveDemo />
    </section>

    <section class="demo-section">
      <h2 class="demo-title">
        fcurd Lego + Naive 示例
      </h2>
      <NaiveLegoDemo />
    </section>
  </div>
</template>

<script setup lang="ts">
import NaiveDemo from './NaiveDemo.vue'
import NaiveLegoDemo from './NaiveLegoDemo.vue'
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 24px 40px;
}

.page-title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 600;
}

.demo-section {
  margin-top: 24px;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
}

.demo-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
}
</style>