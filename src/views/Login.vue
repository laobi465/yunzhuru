<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-100">登录验证</h2>
      <p class="text-sm text-gray-400 mt-1">使用卡密进行登录和验证操作</p>
    </div>

    <div class="bg-[#0D1421] rounded-lg border border-gray-800 p-6 space-y-6">
      <!-- 卡密输入 -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          卡密 <span class="text-red-400">*</span>
        </label>
        <div class="flex gap-2">
          <input
            v-model="configStore.cardKey"
            type="text"
            placeholder="32 字符卡密"
            class="flex-1 bg-[#0B1220] border border-gray-700 rounded-md px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <button
            @click="pasteCardKey"
            class="px-3 py-2.5 border border-gray-700 text-gray-400 rounded-md hover:bg-gray-800 hover:text-gray-300 transition-colors"
            title="从剪贴板粘贴"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 硬件指纹 -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          硬件指纹 (HWID) <span class="text-red-400">*</span>
        </label>
        <div class="flex gap-2">
          <input
            v-model="configStore.hwid"
            type="text"
            placeholder="32 字符硬件指纹"
            class="flex-1 bg-[#0B1220] border border-gray-700 rounded-md px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <button
            @click="configStore.hwid = configStore.generateHwid()"
            class="px-3 py-2.5 border border-gray-700 text-gray-400 rounded-md hover:bg-gray-800 hover:text-gray-300 transition-colors"
            title="生成随机 HWID"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-1.5">首次登录将自动绑定此 HWID</p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex gap-3">
        <button
          @click="handleLogin"
          :disabled="loading || !configStore.connected"
          class="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#0B1220] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <button
          @click="handleVerify"
          :disabled="loading || !configStore.connected"
          class="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2.5 px-4 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#0B1220] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          验证
        </button>
        <button
          @click="handleLogout"
          :disabled="loading || !configStore.connected"
          class="px-4 py-2.5 border border-red-500/50 text-red-400 rounded-md hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#0B1220] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          登出
        </button>
      </div>

      <!-- 响应结果 -->
      <div v-if="result" class="mt-6">
        <h3 class="text-sm font-medium text-gray-300 mb-2">响应结果</h3>
        <div class="bg-[#0B1220] rounded-md border border-gray-700 p-4 overflow-x-auto">
          <pre class="text-xs text-gray-300 font-mono whitespace-pre-wrap">{{ JSON.stringify(result, null, 2) }}</pre>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="error" class="bg-red-500/10 border border-red-500/30 rounded-md p-4 text-red-400">
        {{ error }}
      </div>
    </div>

    <!-- 提示 -->
    <div v-if="!configStore.connected" class="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 text-yellow-400 text-sm">
      请先在「连接配置」页完成配置并测试连接
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useConfigStore } from '../stores/config';
import { useLogsStore } from '../stores/logs';

const configStore = useConfigStore();
const logsStore = useLogsStore();

const loading = ref(false);
const result = ref<any>(null);
const error = ref('');

async function pasteCardKey() {
  try {
    const text = await navigator.clipboard.readText();
    configStore.cardKey = text.trim();
  } catch (e) {
    // 忽略剪贴板读取失败
  }
}

async function handleLogin() {
  if (!configStore.cardKey || !configStore.hwid) {
    error.value = '请填写卡密和硬件指纹';
    return;
  }

  loading.value = true;
  error.value = '';
  result.value = null;

  const startTime = Date.now();

  try {
    const client = configStore.getClient();
    const data = await client.login(configStore.cardKey, configStore.hwid, {
      deviceName: 'Web Client',
      deviceType: 'web',
    });
    
    const duration = Date.now() - startTime;
    result.value = data;
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'login',
      status: 'success',
      duration,
      request: logsStore.maskSensitive(`POST /api/v1/client/login\n{"card_key":"${configStore.cardKey.slice(0, 8)}...","hwid":"${configStore.hwid.slice(0, 8)}..."}`),
      response: JSON.stringify(data),
    });
  } catch (e: any) {
    const duration = Date.now() - startTime;
    error.value = e.message || '登录失败';
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'login',
      status: 'error',
      duration,
      request: logsStore.maskSensitive(`POST /api/v1/client/login\n{"card_key":"${configStore.cardKey.slice(0, 8)}...","hwid":"${configStore.hwid.slice(0, 8)}..."}`),
      response: e.message || '登录失败',
    });
  } finally {
    loading.value = false;
  }
}

async function handleVerify() {
  if (!configStore.cardKey || !configStore.hwid) {
    error.value = '请填写卡密和硬件指纹';
    return;
  }

  loading.value = true;
  error.value = '';
  result.value = null;

  const startTime = Date.now();

  try {
    const client = configStore.getClient();
    const data = await client.verify(configStore.cardKey, configStore.hwid);
    
    const duration = Date.now() - startTime;
    result.value = data;
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'verify',
      status: 'success',
      duration,
      request: logsStore.maskSensitive(`POST /api/v1/client/verify\n{"card_key":"${configStore.cardKey.slice(0, 8)}...","hwid":"${configStore.hwid.slice(0, 8)}..."}`),
      response: JSON.stringify(data),
    });
  } catch (e: any) {
    const duration = Date.now() - startTime;
    error.value = e.message || '验证失败';
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'verify',
      status: 'error',
      duration,
      request: logsStore.maskSensitive(`POST /api/v1/client/verify\n{"card_key":"${configStore.cardKey.slice(0, 8)}...","hwid":"${configStore.hwid.slice(0, 8)}..."}`),
      response: e.message || '验证失败',
    });
  } finally {
    loading.value = false;
  }
}

async function handleLogout() {
  if (!configStore.cardKey || !configStore.hwid) {
    error.value = '请填写卡密和硬件指纹';
    return;
  }

  loading.value = true;
  error.value = '';
  result.value = null;

  const startTime = Date.now();

  try {
    const client = configStore.getClient();
    await client.logout(configStore.cardKey, configStore.hwid);
    
    const duration = Date.now() - startTime;
    result.value = { message: '登出成功' };
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'logout',
      status: 'success',
      duration,
      request: logsStore.maskSensitive(`POST /api/v1/client/logout\n{"card_key":"${configStore.cardKey.slice(0, 8)}...","hwid":"${configStore.hwid.slice(0, 8)}..."}`),
      response: '登出成功',
    });
  } catch (e: any) {
    const duration = Date.now() - startTime;
    error.value = e.message || '登出失败';
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'logout',
      status: 'error',
      duration,
      request: logsStore.maskSensitive(`POST /api/v1/client/logout\n{"card_key":"${configStore.cardKey.slice(0, 8)}...","hwid":"${configStore.hwid.slice(0, 8)}..."}`),
      response: e.message || '登出失败',
    });
  } finally {
    loading.value = false;
  }
}
</script>