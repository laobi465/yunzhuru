<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-100">公告与版本</h2>
      <p class="text-sm text-gray-400 mt-1">获取应用公告和检查版本更新</p>
    </div>

    <!-- 公告 -->
    <div class="bg-[#0D1421] rounded-lg border border-gray-800 p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-100">应用公告</h3>
        <button
          @click="handleNotice"
          :disabled="loadingNotice"
          class="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {{ loadingNotice ? '获取中...' : '获取公告' }}
        </button>
      </div>

      <div v-if="notices.length > 0" class="space-y-4">
        <div
          v-for="notice in notices"
          :key="notice.title"
          class="bg-[#0B1220] rounded-md border border-gray-700 p-4"
        >
          <h4 class="text-sm font-medium text-gray-200 mb-2">{{ notice.title }}</h4>
          <p class="text-xs text-gray-400 whitespace-pre-wrap">{{ notice.content }}</p>
          <p class="text-xs text-gray-500 mt-2">{{ formatDate(notice.created_at) }}</p>
        </div>
      </div>
      <div v-else-if="!loadingNotice" class="text-sm text-gray-500">
        点击「获取公告」查看应用公告
      </div>
    </div>

    <!-- 版本 -->
    <div class="bg-[#0D1421] rounded-lg border border-gray-800 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-medium text-gray-100">版本检查</h3>
        <button
          @click="handleVersion"
          :disabled="loadingVersion"
          class="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {{ loadingVersion ? '检查中...' : '检查更新' }}
        </button>
      </div>

      <div v-if="versionResult" class="space-y-3">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-400">当前版本：</span>
          <span class="text-sm text-gray-200 font-mono">{{ versionResult.current_version || '-' }}</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-400">最新版本：</span>
          <span class="text-sm text-gray-200 font-mono">{{ versionResult.latest_version }}</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-400">更新状态：</span>
          <span
            class="px-2 py-0.5 rounded text-xs font-medium"
            :class="versionResult.has_update ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'"
          >
            {{ versionResult.has_update ? '有更新' : '已是最新' }}
          </span>
        </div>
        <div v-if="versionResult.download_url" class="mt-2">
          <a
            :href="versionResult.download_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-cyan-400 hover:text-cyan-300"
          >
            下载地址 →
          </a>
        </div>
      </div>
      <div v-else-if="!loadingVersion" class="text-sm text-gray-500">
        点击「检查更新」检查新版本
      </div>
    </div>

    <!-- 错误 -->
    <div v-if="error" class="mt-4 bg-red-500/10 border border-red-500/30 rounded-md p-4 text-red-400">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useConfigStore } from '../stores/config';
import { useLogsStore } from '../stores/logs';

const configStore = useConfigStore();
const logsStore = useLogsStore();

const notices = ref<any[]>([]);
const versionResult = ref<any>(null);
const loadingNotice = ref(false);
const loadingVersion = ref(false);
const error = ref('');

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('zh-CN');
}

async function handleNotice() {
  if (!configStore.connected) {
    error.value = '请先连接后端';
    return;
  }

  loadingNotice.value = true;
  error.value = '';

  const startTime = Date.now();

  try {
    const client = configStore.getClient();
    const data = await client.notice();
    
    notices.value = Array.isArray(data) ? data : [data];
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'notice',
      status: 'success',
      duration: Date.now() - startTime,
      request: 'POST /api/v1/client/notice',
      response: JSON.stringify(data),
    });
  } catch (e: any) {
    error.value = e.message || '获取公告失败';
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'notice',
      status: 'error',
      duration: Date.now() - startTime,
      request: 'POST /api/v1/client/notice',
      response: e.message || '获取公告失败',
    });
  } finally {
    loadingNotice.value = false;
  }
}

async function handleVersion() {
  if (!configStore.connected) {
    error.value = '请先连接后端';
    return;
  }

  loadingVersion.value = true;
  error.value = '';

  const startTime = Date.now();

  try {
    const client = configStore.getClient();
    const data = await client.version();
    
    versionResult.value = data;
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'version',
      status: 'success',
      duration: Date.now() - startTime,
      request: 'POST /api/v1/client/version',
      response: JSON.stringify(data),
    });
  } catch (e: any) {
    error.value = e.message || '检查版本失败';
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'version',
      status: 'error',
      duration: Date.now() - startTime,
      request: 'POST /api/v1/client/version',
      response: e.message || '检查版本失败',
    });
  } finally {
    loadingVersion.value = false;
  }
}
</script>