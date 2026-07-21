import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  status: 'success' | 'error';
  duration: number; // 毫秒
  request: string;
  response: string;
}

/**
 * 安全日志状态
 * 记录所有请求/响应（脱敏）
 */
export const useLogsStore = defineStore('logs', () => {
  const entries = ref<LogEntry[]>([]);

  /**
   * 添加日志
   */
  function addLog(entry: Omit<LogEntry, 'id'>) {
    const fullEntry: LogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    entries.value.unshift(fullEntry);
    // 保留最近 100 条
    if (entries.value.length > 100) {
      entries.value.pop();
    }
  }

  /**
   * 清除日志
   */
  function clear() {
    entries.value = [];
  }

  /**
   * 脱敏敏感信息
   */
  function maskSensitive(str: string): string {
    // 脱敏 AppKey（ak_ 开头）
    str = str.replace(/(ak_)[a-zA-Z0-9]+/g, '$1****');
    // 脱敏 SignSecret（较长字符串）
    str = str.replace(/"signSecret"\s*:\s*"[^"]+"/g, '"signSecret":"****"');
    // 脱敏卡密（32 字符）
    str = str.replace(/"card_key"\s*:\s*"[a-zA-Z0-9]{28}([a-zA-Z0-9]{4})"/g, '"card_key":"****$1"');
    return str;
  }

  return {
    entries,
    addLog,
    clear,
    maskSensitive,
  };
});