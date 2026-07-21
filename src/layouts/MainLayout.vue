<template>
  <div class="min-h-screen bg-[#0B1220] text-gray-100 flex flex-col">
    <!-- 顶部导航 -->
    <header class="border-b border-gray-800 bg-[#0D1421]">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 class="text-lg font-semibold">云注入客户端</h1>
        </div>
        <div class="flex items-center gap-2">
          <span 
            :class="configStore.connected ? 'text-green-400' : 'text-gray-500'" 
            class="flex items-center gap-1.5 text-sm"
          >
            <span class="w-2 h-2 rounded-full" :class="configStore.connected ? 'bg-green-400' : 'bg-gray-500'"></span>
            {{ configStore.connected ? '已连接' : '未连接' }}
          </span>
        </div>
      </div>
    </header>

    <!-- 标签页导航 -->
    <nav class="border-b border-gray-800 bg-[#0D1421]/50">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex gap-1 overflow-x-auto">
          <router-link 
            v-for="tab in tabs" 
            :key="tab.path"
            :to="tab.path"
            class="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px"
            :class="[
              $route.path === tab.path 
                ? 'text-cyan-400 border-cyan-400' 
                : 'text-gray-400 border-transparent hover:text-gray-200'
            ]"
          >
            {{ tab.name }}
          </router-link>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-auto">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <router-view />
      </div>
    </main>

    <!-- 底部 -->
    <footer class="border-t border-gray-800 bg-[#0D1421] py-3">
      <div class="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
        KeyAuth SaaS 云注入客户端 · 对齐 wlyz v0.6.6 SDK 规范 · HMAC-SHA512/256 签名
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useConfigStore } from '../stores/config';

const configStore = useConfigStore();

const tabs = [
  { name: '连接配置', path: '/config' },
  { name: '登录验证', path: '/login' },
  { name: '云变量', path: '/cloud-vars' },
  { name: '心跳', path: '/heartbeat' },
  { name: '公告', path: '/notice' },
  { name: '日志', path: '/logs' },
];
</script>