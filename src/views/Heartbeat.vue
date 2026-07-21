<template>
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-100">心跳管理</h2>
      <p class="text-sm text-gray-400 mt-1">保持设备在线状态，防止会话过期</p>
    </div>

    <div class="bg-[#0D1421] rounded-lg border border-gray-800 p-6 space-y-6">
      <!-- 心跳间隔 -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">心跳间隔（秒）</label>
        <input
          v-model.number="interval"
          type="number"
          min="30"
          max="300"
          class="w-32 bg-[#0B1220] border border-gray-700 rounded-md px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      <!-- 状态指示 -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full" :class="running ? 'bg-green-400 animate-pulse' : 'bg-gray-500'"></span>
          <span class="text-sm" :class="running ? 'text-green-400' : 'text-gray-400'">
            {{ running ? '心跳中' : '已停止' }}
          </span>
        </div>
        <span v-if="lastHeartbeat" class="text-xs text-gray-500">
          上次心跳：{{ formatDate(lastHeartbeat) }}
        </span>
      </div>

      <!-- 控制按钮 -->
      <div class="flex gap-3">
        <button
          @click="startHeartbeat"
          :disabled="running || !configStore.connected || !configStore.cardKey || !configStore.hwid"
          class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2.5 px-4 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#0B1220] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          启动心跳
        </button>
        <button
          @click="stopHeartbeat"
          :disabled="!running"
          class="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-2.5 px-4 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#0B1220] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          停止心跳
        </button>
      </div>

      <!-- 心跳日志 -->
      <div v-if="heartbeatLogs.length > 0" class="mt-6">
        <h3 class="text-sm font-medium text-gray-300 mb-2">心跳日志</h3>
        <div class="bg-[#0B1220] rounded-md border border-gray-700 max-h-48 overflow-y-auto">
          <div
            v-for="log in heartbeatLogs"
            :key="log.time"
            class="px-3 py-2 border-b border-gray-800 last:border-0 flex items-center justify-between text-xs"
          >
            <span class="text-gray-500">{{ formatDate(log.time) }}</span>
            <span :class="log.success ? 'text-green-400' : 'text-red-400'">
              {{ log.success ? '成功' : '失败' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 提示 -->
      <div v-if="!configStore.connected" class="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 text-yellow-400 text-sm">
        请先在「连接配置」页完成配置
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useConfigStore } from '../stores/config';
import { useLogsStore } from '../stores/logs';

const configStore = useConfigStore();
const logsStore = useLogsStore();

const interval = ref(60);
const running = ref(false);
const lastHeartbeat = ref<number | null>(null);
const heartbeatLogs = ref<{ time: number; success: boolean }[]>([]);

let timer: ReturnType<typeof setInterval> | null = null;

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN');
}

async function sendHeartbeat() {
  if (!configStore.cardKey || !configStore.hwid) return;

  const startTime = Date.now();

  try {
    const client = configStore.getClient();
    await client.heartbeat(configStore.cardKey, configStore.hwid);
    
    lastHeartbeat.value = Date.now();
    heartbeatLogs.value.unshift({ time: Date.now(), success: true });
    
    // 保留最近 20 条
    if (heartbeatLogs.value.length > 20) {
      heartbeatLogs.value.pop();
    }
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'heartbeat',
      status: 'success',
      duration: Date.now() - startTime,
      request: logsStore.maskSensitive(`POST /api/v1/client/heartbeat\n{"card_key":"${configStore.cardKey.slice(0, 8)}...","hwid":"${configStore.hwid.slice(0, 8)}..."}`),
      response: '成功',
    });
  } catch (e: any) {
    heartbeatLogs.value.unshift({ time: Date.now(), success: false });
    
    logsStore.addLog({
      timestamp: new Date().toISOString(),
      action: 'heartbeat',
      status: 'error',
      duration: Date.now() - startTime,
      request: logsStore.maskSensitive(`POST /api/v1/client/heartbeat\n{"card_key":"${configStore.cardKey.slice(0, 8)}...","hwid":"${configStore.hwid.slice(0, 8)}..."}`),
      response: e.message || '失败',
    });
  }
}

function startHeartbeat() {
  if (running.value) return;
  running.value = true;
  
  // 立即发送一次
  sendHeartbeat();
  
  // 设置定时器
  timer = setInterval(sendHeartbeat, interval.value * 1000);
}

function stopHeartbeat() {
  if (!running.value) return;
  running.value = false;
  
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>