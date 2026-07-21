<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-100">云变量</h2>
      <p class="text-sm text-gray-400 mt-1">获取云端注入的变量值（核心功能）</p>
    </div>

    <div class="bg-[#0D1421] rounded-lg border border-gray-800 p-6 space-y-6">
      <!-- 变量键输入 -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          变量键 (var_key) <span class="text-red-400">*</span>
        </label>
        <input
          v-model="varKey"
          type="text"
          placeholder="如：notice_text / config_json / max_retry"
          class="w-full bg-[#0B1220] border border-gray-700 rounded-md px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      <!-- 卡密确认 -->
      <div v-if="!configStore.cardKey" class="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 text-yellow-400 text-sm">
        请先在「登录验证」页输入卡密
      </div>

      <!-- 获取按钮 -->
      <button
        @click="handleGetVar"
        :disabled="loading || !configStore.connected || !varKey || !configStore.cardKey"
        class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#0B1220] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? '获取中...' : '获取云变量' }}
      </button>

      <!-- 响应结果 -->
      <div v-if="result" class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-300">变量值</h3>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-xs font-medium" :class="typeClass">
              {{ result.var_type }}
            </span>
            <button
              @click="copyValue"
              class="text-xs text-gray-400 hover:text-cyan-400 transition-colors"
            >
              复制
            </button>
          </div>
        </div>

        <!-- 值展示 -->
        <div class="bg-[#0B1220] rounded-md border border-gray-700 p-4 overflow-x-auto">
          <pre v-if="result.var_type === 'json'" class="text-xs text-cyan-400 font-mono whitespace-pre-wrap">{{ formatJson(result.var_value) }}</pre>
          <pre v-else class="text-xs text-gray-300 font-mono whitespace-pre-wrap">{{ result.var_value }}</pre>
        </div>

        <!-- 元数据 -->
        <div class="flex items-center gap-4 text-xs text-gray-500">
          <span>更新时间：{{ formatDate(result.updated_at) }}</span>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-md p-4 text-red-400">
        {{ error }}
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="mt-6 bg-[#0D1421] rounded-lg border border-gray-800 p-4">
      <h3 class="text-sm font-medium text-gray-300 mb-2">使用说明</h3>
      <ol class="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
        <li>在 wlyz 后台「云变量」页创建变量并设置值</li>
        <li>在此页输入变量键（如 notice_text）</li>
        <li>点击「获取云变量」获取解密后的值</li>
        <li>值类型为 json 时会自动格式化显示</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useConfigStore } from '../stores/config';
import { useLogsStore } from '../stores/logs';

const configStore = useConfigStore();
const logsStore = useLogsStore();

const varKey = ref('');
const loading = ref(false);
const result = ref<any>(null);
const error = ref('');

const typeClass = computed(() => {
  if (!result.value) return '';
  switch (result.value.var_type) {
    case 'string': return 'bg-blue-500/20 text-blue-400';
    case 'number': return 'bg-green-500/20 text-green-400';
    case 'json': return 'bg-purple-500/20 text-purple-400';
    case 'bool': return 'bg-orange-500/20 text-orange-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
});

function formatJson(str: string): string {
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN');
}

async function copyValue() {
  if (!result.value) return;
  try {
    await navigator.clipboard.writeText(result.value.var_value);
  } catch (e) {
    // 忽略复制失败
  }
}

async function handleGetVar() {
  if (!varKey.value) {
    error.value = '请输入变量键';
    return;
  }

  if (!configStore.cardKey) {
    error.value = '请先输入卡密';
    return;
  }

  loading.value = true;
  error.value = '';
  result.value = null;

  const startTime = Date.now();

  try {
    const client = configStore.getClient();
    const data = await client.getVar(configStore.cardKey, varKey.value);
    
    const duration = Date.now() - startTime;
    result.value = data;
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'get_var',
      status: 'success',
      duration,
      request: `POST /api/v1/client/get_var\n{"var_key":"${varKey.value}"}`,
      response: JSON.stringify(data),
    });
  } catch (e: any) {
    const duration = Date.now() - startTime;
    error.value = e.message || '获取失败';
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'get_var',
      status: 'error',
      duration,
      request: `POST /api/v1/client/get_var\n{"var_key":"${varKey.value}"}`,
      response: e.message || '获取失败',
    });
  } finally {
    loading.value = false;
  }
}
</script>