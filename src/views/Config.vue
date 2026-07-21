<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-100">连接配置</h2>
      <p class="text-sm text-gray-400 mt-1">配置 wlyz 后端地址和应用认证信息</p>
    </div>

    <!-- 配置表单 -->
    <div class="bg-[#0D1421] rounded-lg border border-gray-800 p-6 space-y-6">
      <!-- API 地址 -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          后端 API 地址 <span class="text-red-400">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">https://</span>
          <input
            v-model="apiBaseInput"
            type="text"
            placeholder="your-server.com"
            class="w-full bg-[#0B1220] border border-gray-700 rounded-md pl-20 pr-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      <!-- AppKey -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          AppKey <span class="text-red-400">*</span>
        </label>
        <input
          v-model="configStore.appKey"
          type="text"
          placeholder="ak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          class="w-full bg-[#0B1220] border border-gray-700 rounded-md px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      <!-- SignSecret -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          SignSecret <span class="text-red-400">*</span>
        </label>
        <div class="relative">
          <input
            v-model="configStore.signSecret"
            :type="showSecret ? 'text' : 'password'"
            placeholder="从 wlyz 后台复制"
            class="w-full bg-[#0B1220] border border-gray-700 rounded-md px-3 pr-12 py-2.5 text-sm text-gray-100 placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <button
            @click="showSecret = !showSecret"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <svg v-if="showSecret" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1.5">敏感信息，仅存储在内存中，不会持久化</p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3 pt-2">
        <button
          @click="handleTest"
          :disabled="testing"
          class="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#0B1220] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ testing ? '测试中...' : '测试连接' }}
        </button>
        <button
          @click="handleClear"
          class="px-4 py-2.5 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-[#0B1220]"
        >
          清除
        </button>
      </div>

      <!-- 连接状态 -->
      <div v-if="connectionStatus" :class="[
        'p-4 rounded-md border flex items-center gap-3',
        connectionStatus.type === 'success' 
          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
          : 'bg-red-500/10 border-red-500/30 text-red-400'
      ]">
        <svg v-if="connectionStatus.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ connectionStatus.message }}</span>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="mt-6 bg-[#0D1421] rounded-lg border border-gray-800 p-4">
      <h3 class="text-sm font-medium text-gray-300 mb-2">使用说明</h3>
      <ol class="text-xs text-gray-400 space-y-1.5 list-decimal list-inside">
        <li>在 wlyz 后台「应用管理」中创建应用并复制 AppKey 和 SignSecret</li>
        <li>输入后端地址（如 your-domain.com）和应用认证信息</li>
        <li>点击「测试连接」验证配置正确性</li>
        <li>连接成功后切换到「登录验证」页进行卡密验证</li>
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

const showSecret = ref(false);
const testing = ref(false);
const connectionStatus = ref<{ type: 'success' | 'error'; message: string } | null>(null);

const apiBaseInput = computed({
  get: () => configStore.apiBase.replace(/^https?:\/\//, ''),
  set: (val) => {
    configStore.apiBase = val ? `https://${val}` : '';
  },
});

async function handleTest() {
  if (!configStore.apiBase || !configStore.appKey || !configStore.signSecret) {
    connectionStatus.value = { type: 'error', message: '请填写完整的配置信息' };
    return;
  }

  testing.value = true;
  connectionStatus.value = null;
  
  const startTime = Date.now();
  
  try {
    const client = configStore.getClient();
    const result = await client.version();
    
    const duration = Date.now() - startTime;
    connectionStatus.value = { type: 'success', message: `连接成功 (${duration}ms)` };
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'test_connection',
      status: 'success',
      duration,
      request: 'GET /api/v1/client/version',
      response: JSON.stringify(result),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    connectionStatus.value = { 
      type: 'error', 
      message: `连接失败: ${error.message || '未知错误'}` 
    };
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'test_connection',
      status: 'error',
      duration,
      request: 'GET /api/v1/client/version',
      response: error.message || '未知错误',
    });
  } finally {
    testing.value = false;
  }
}

function handleClear() {
  configStore.clear();
  connectionStatus.value = null;
}
</script>