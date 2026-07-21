import { defineStore } from 'pinia';
import { ref } from 'vue';
import { KeyAuthClient, type KeyAuthConfig } from '../api/KeyAuthClient';

/**
 * 连接配置状态
 * 敏感信息（signSecret）不持久化，仅存运行时内存
 */
export const useConfigStore = defineStore('config', () => {
  // 后端 API 地址
  const apiBase = ref('');
  // 应用 AppKey
  const appKey = ref('');
  // 应用 SignSecret（敏感，不持久化）
  const signSecret = ref('');
  // 卡密
  const cardKey = ref('');
  // 硬件指纹
  const hwid = ref('');
  // 是否已连接
  const connected = ref(false);
  // 客户端实例
  let client: KeyAuthClient | null = null;

  /**
   * 获取客户端实例
   */
  function getClient(): KeyAuthClient {
    if (!client) {
      client = new KeyAuthClient({
        apiBase: apiBase.value,
        appKey: appKey.value,
        signSecret: signSecret.value,
      });
    } else {
      client.updateConfig({
        apiBase: apiBase.value,
        appKey: appKey.value,
        signSecret: signSecret.value,
      });
    }
    return client;
  }

  /**
   * 测试连接
   */
  async function testConnection(): Promise<boolean> {
    try {
      const c = getClient();
      await c.version();
      connected.value = true;
      return true;
    } catch {
      connected.value = false;
      return false;
    }
  }

  /**
   * 生成随机 HWID（32 字符 hex）
   */
  function generateHwid(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 清除配置
   */
  function clear() {
    apiBase.value = '';
    appKey.value = '';
    signSecret.value = '';
    cardKey.value = '';
    hwid.value = '';
    connected.value = false;
    client = null;
  }

  return {
    apiBase,
    appKey,
    signSecret,
    cardKey,
    hwid,
    connected,
    getClient,
    testConnection,
    generateHwid,
    clear,
  };
});