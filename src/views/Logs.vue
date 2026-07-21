<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-100">安全日志</h2>
        <p class="text-sm text-gray-400 mt-1">记录所有请求和响应（脱敏）</p>
      </div>
      <button
        @click="logsStore.clear()"
        class="px-3 py-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
      >
        清除日志
      </button>
    </div>

    <div v-if="logsStore.entries.length === 0" class="bg-[#0D1421] rounded-lg border border-gray-800 p-12 text-center">
      <svg class="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-500">暂无日志记录</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="log in logsStore.entries"
        :key="log.id"
        class="bg-[#0D1421] rounded-lg border border-gray-800 overflow-hidden"
      >
        <!-- 日志头部 -->
        <div
          class="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#0B1220]"
          @click="toggleExpand(log.id)"
        >
          <div class="flex items-center gap-3">
            <span
              class="w-2 h-2 rounded-full"
              :class="log.status === 'success' ? 'bg-green-400' : 'bg-red-400'"
            ></span>
            <span class="text-sm font-medium text-gray-200">{{ log.action }}</span>
            <span class="text-xs text-gray-500">{{ formatDate(log.timestamp) }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-500">{{ log.duration }}ms</span>
            <svg
              class="w-4 h-4 text-gray-500 transition-transform"
              :class="expandedLogs.includes(log.id) ? 'rotate-180' : ''"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <!-- 日志详情 -->
        <div v-if="expandedLogs.includes(log.id)" class="px-4 pb-4 space-y-3 border-t border-gray-800">
          <div>
            <h4 class="text-xs font-medium text-gray-400 mb-1">请求</h4>
            <pre class="text-xs text-gray-300 font-mono bg-[#0B1220] rounded p-3 overflow-x-auto whitespace-pre-wrap">{{ logsStore.maskSensitive(log.request) }}</pre>
          </div>
          <div>
            <h4 class="text-xs font-medium text-gray-400 mb-1">响应</h4>
            <pre class="text-xs text-gray-300 font-mono bg-[#0B1220] rounded p-3 overflow-x-auto whitespace-pre-wrap">{{ logsStore.maskSensitive(log.response) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLogsStore } from '../stores/logs';

const logsStore = useLogsStore();

const expandedLogs = ref<string[]>([]);

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('zh-CN');
}

function toggleExpand(id: string) {
  const index = expandedLogs.value.indexOf(id);
  if (index === -1) {
    expandedLogs.value.push(id);
  } else {
    expandedLogs.value.splice(index, 1);
  }
}
</script>